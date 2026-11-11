import Capacitor
import StoreKit

@available(iOS 15.0, *)
@objc(N99StoreKitPlugin)
public class N99StoreKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "N99StoreKitPlugin"
    public let jsName = "N99StoreKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "catalog", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "entitlements", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise)
    ]
    private let aliases: Set<String> = ["daisy", "mick", "cyberpunk", "goldonly", "synthwave", "ragepass"]
    private var updates: Task<Void, Never>?
    private var mapping: [String: String] {
        Bundle.main.object(forInfoDictionaryKey: "N99StoreKitProducts") as? [String: String] ?? [:]
    }
    private var configured: Bool {
        Set(mapping.keys) == aliases && Set(mapping.values).count == aliases.count && mapping.values.allSatisfy { !$0.isEmpty }
    }
    public override func load() {
        updates = Task { [weak self] in
            for await result in Transaction.updates {
                guard let self = self else { return }
                guard case .verified(let transaction) = result,
                      self.mapping.values.contains(transaction.productID) else { continue }
                let owned = await self.owned()
                await transaction.finish()
                self.notifyListeners("entitlementsChanged", data: ["owned": owned])
            }
        }
    }
    deinit { updates?.cancel() }
    private func owned() async -> [String] {
        var result = Set<String>()
        for await entry in Transaction.currentEntitlements {
            guard case .verified(let transaction) = entry,
                  transaction.revocationDate == nil, !transaction.isUpgraded,
                  let item = mapping.first(where: { $0.value == transaction.productID })?.key else { continue }
            result.insert(item)
        }
        return result.sorted()
    }
    @objc func catalog(_ call: CAPPluginCall) {
        Task {
            guard configured else { call.resolve(["available": false, "products": []]); return }
            do {
                let products = try await Product.products(for: Array(mapping.values))
                let valid = products.filter { $0.type == .nonConsumable }
                let rows: [[String: Any]] = valid.compactMap { product in
                    guard let item = mapping.first(where: { $0.value == product.id })?.key else { return nil }
                    return ["item": item, "id": product.id, "displayPrice": product.displayPrice]
                }
                call.resolve(["available": rows.count == aliases.count && AppStore.canMakePayments, "products": rows])
            } catch { call.reject("Apple products are unavailable. Please try again.", nil, error) }
        }
    }
    @objc func entitlements(_ call: CAPPluginCall) {
        Task { call.resolve(["owned": await owned()]) }
    }
    @objc func restore(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
                call.resolve(["owned": await owned()])
            } catch { call.reject("Purchase restoration failed. Please try again.", nil, error) }
        }
    }
    @objc func purchase(_ call: CAPPluginCall) {
        guard configured, let item = call.getString("item"), let id = mapping[item] else {
            call.reject("This Apple product is not configured."); return
        }
        Task {
            do {
                guard let product = try await Product.products(for: [id]).first,
                      product.type == .nonConsumable else {
                    call.reject("This Apple product is unavailable."); return
                }
                switch try await product.purchase() {
                case .success(let verification):
                    guard case .verified(let transaction) = verification,
                          transaction.productID == id, transaction.revocationDate == nil else {
                        call.reject("Apple could not verify this purchase."); return
                    }
                    let current = await owned()
                    await transaction.finish()
                    call.resolve(["status": "purchased", "owned": current])
                case .pending: call.resolve(["status": "pending"])
                case .userCancelled: call.resolve(["status": "cancelled"])
                @unknown default: call.reject("Unknown Apple purchase result.")
                }
            } catch { call.reject("Purchase failed. Please try again.", nil, error) }
        }
    }
}
