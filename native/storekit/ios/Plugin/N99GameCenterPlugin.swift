import Capacitor
import GameKit

@available(iOS 15.0, *)
@objc(N99GameCenterPlugin)
public class N99GameCenterPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "N99GameCenterPlugin"
    public let jsName = "N99GameCenter"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authenticate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "standings", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "submit", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "resetRun", returnType: CAPPluginReturnPromise)
    ]
    private var counts: [String: Int] = [:]
    private var lastAttempt: [String: Int] = [:]
    private var loginController: UIViewController?
    private var authStarted = false
    private let base = 60_000_001
    private func boardID(_ game: String) -> String? {
        guard ["timer", "stop", "reaction"].contains(game) else { return nil }
        return "com.pettygamesstudios.ninetynineimpossible.\(game).v1"
    }
    private func identity() -> [String: Any] {
        let player = GKLocalPlayer.local
        return ["authenticated": player.isAuthenticated,
                "alias": player.isAuthenticated ? player.displayName : "",
                "playerID": player.isAuthenticated ? player.gamePlayerID : "",
                "needsSignIn": !player.isAuthenticated]
    }
    @objc func authenticate(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if GKLocalPlayer.local.isAuthenticated { call.resolve(self.identity()); return }
            let interactive = call.getBool("interactive") ?? false
            if interactive, let controller = self.loginController {
                self.bridge?.viewController?.present(controller, animated: true)
                call.resolve(self.identity()); return
            }
            if self.authStarted { call.resolve(self.identity()); return }
            self.authStarted = true
            var resolved = false
            GKLocalPlayer.local.authenticateHandler = { controller, error in
                DispatchQueue.main.async {
                    self.loginController = controller
                    if interactive, let controller = controller {
                        self.bridge?.viewController?.present(controller, animated: true)
                    }
                    let data = self.identity()
                    self.notifyListeners("authenticationChanged", data: data)
                    if !resolved { resolved = true; call.resolve(data) }
                    if error != nil { self.authStarted = false }
                }
            }
        }
    }
    @objc func resetRun(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.counts.removeAll()
            call.resolve()
        }
    }
    private func pendingKey(_ game: String) -> String {
        // Never carry an offline score into a later weekly competition.
        let day = Int(Date().timeIntervalSince1970 / 86400)
        return "N99PendingGC:\(GKLocalPlayer.local.gamePlayerID):\(game):\(day)"
    }
    private func load(_ game: String, _ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated, let id = boardID(game) else {
            call.resolve(identity()); return
        }
        let key = pendingKey(game)
        let score = UserDefaults.standard.integer(forKey: key)
        guard score > 0 else { fetch(game, call); return }
        GKLeaderboard.submitScore(score, context: 0, player: GKLocalPlayer.local, leaderboardIDs: [id]) { error in
            guard error == nil else { call.reject("Score waiting to sync. Reconnect and refresh."); return }
            if UserDefaults.standard.integer(forKey: key) == score { UserDefaults.standard.removeObject(forKey: key) }
            self.fetch(game, call)
        }
    }
    private func fetch(_ game: String, _ call: CAPPluginCall) {
        guard let id = boardID(game) else { call.reject("Unknown game"); return }
        guard GKLocalPlayer.local.isAuthenticated else { call.resolve(identity()); return }
        GKLeaderboard.loadLeaderboards(IDs: [id]) { boards, error in
            guard let board = boards?.first, error == nil else {
                call.reject("Standings are unavailable. Try again shortly."); return
            }
            board.loadEntries(for: .global, timeScope: .week, range: NSRange(location: 1, length: 100)) {
                local, entries, total, error in
                guard error == nil else { call.reject("Standings could not be refreshed."); return }
                func row(_ entry: GKLeaderboard.Entry) -> [String: Any] {
                    return ["rank": entry.rank, "score": entry.score,
                            "alias": entry.player.displayName,
                            "isYou": entry.player.gamePlayerID == GKLocalPlayer.local.gamePlayerID]
                }
                var data = self.identity()
                data["game"] = game
                data["totalPlayers"] = total
                data["entries"] = (entries ?? []).map(row)
                if let local = local { data["local"] = row(local) }
                call.resolve(data)
            }
        }
    }
    @objc func standings(_ call: CAPPluginCall) {
        load(call.getString("game") ?? "timer", call)
    }
    @objc func submit(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let game = call.getString("game") ?? ""
            guard self.boardID(game) != nil, let raw = call.getDouble("rawScore"), raw.isFinite,
                  let attempt = call.getInt("attempt"), attempt > (self.lastAttempt[game] ?? -1),
                  call.getBool("isSuspicious") != true else { call.reject("Unranked attempt"); return }
            guard GKLocalPlayer.local.isAuthenticated else {
                self.counts.removeAll(); call.resolve(self.identity()); return
            }
            var score: Int
            if game == "reaction" {
                guard raw >= 100 && raw <= 60000 else { call.reject("Unranked reaction"); return }
                score = Int(raw.rounded())
            } else {
                guard raw >= 0, raw <= (game == "timer" ? 60 : 100) else { call.reject("Unranked attempt"); return }
                let perfect = game == "timer" ? abs(raw - 1) < 0.0005 : raw >= 99.95
                let count = self.counts[game] ?? 0
                if perfect {
                    let next = min(count + 1, 999999)
                    self.counts[game] = next
                    score = next * self.base
                } else {
                    self.counts[game] = 0
                    guard count > 0 else {
                        self.lastAttempt[game] = attempt
                        self.load(game, call); return
                    }
                    let distance = game == "timer" ? abs(raw - 1) * 1_000_000 : (100 - raw) * 10000
                    score = count * self.base + max(0, 60_000_000 - min(60_000_000, Int(distance.rounded())))
                }
            }
            self.lastAttempt[game] = attempt
            let key = self.pendingKey(game)
            let existing = UserDefaults.standard.integer(forKey: key)
            let best = existing == 0 ? score : game == "reaction" ? min(score, existing) : max(score, existing)
            UserDefaults.standard.set(best, forKey: key)
            self.load(game, call)

        }
    }
}
