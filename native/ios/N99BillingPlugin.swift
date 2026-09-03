import Foundation
import Capacitor
import StoreKit

@objc(N99BillingPlugin)
public class N99BillingPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "N99BillingPlugin"
    public let jsName = "N99Billing"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getEntitlements", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise)
    ]
    private let productID = "remove_ads_forever"

    private func ownsProduct() async -> Bool {
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else { continue }
            if transaction.productID == productID && transaction.revocationDate == nil { return true }
        }
        return false
    }

    private func resolve(_ call: CAPPluginCall) async {
        let owned = await ownsProduct()
        call.resolve(["entitlements": owned ? [productID] : []])
    }

    @objc func getEntitlements(_ call: CAPPluginCall) {
        Task { await resolve(call) }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        Task {
            do {
                guard call.getString("productId") == productID else { call.reject("Unknown product"); return }
                guard let product = try await Product.products(for: [productID]).first else { call.reject("Product unavailable"); return }
                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    guard case .verified(let transaction) = verification else { call.reject("Transaction verification failed"); return }
                    await transaction.finish()
                    await resolve(call)
                case .pending: call.reject("Purchase pending")
                case .userCancelled: call.reject("Purchase cancelled")
                @unknown default: call.reject("Unknown purchase result")
                }
            } catch { call.reject("Purchase failed: \(error.localizedDescription)") }
        }
    }

    @objc func restorePurchases(_ call: CAPPluginCall) {
        Task {
            do { try await AppStore.sync(); await resolve(call) }
            catch { call.reject("Restore failed: \(error.localizedDescription)") }
        }
    }
}
