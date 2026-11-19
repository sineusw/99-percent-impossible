import XCTest
import StoreKitTest

final class ScreenshotCapture: XCTestCase {
    let app = XCUIApplication(bundleIdentifier: "com.pettygamesstudios.ninetynineimpossible")

    private var store: SKTestSession!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app.terminate()
        if name.contains("testApple") {
            store = try SKTestSession(configurationFileNamed: "Monetization")
            store.disableDialogs = true
            store.clearTransactions()
        }
        app.launch()
        // HTML accessibility can appear before the unbundled scripts finish.
        // The cast picker is installed after the core game's event handlers.
        let ready = app.buttons["Change game voice"]
        XCTAssertTrue(ready.waitForExistence(timeout: 45), "App controls did not finish loading")
        let privacyFinished = XCTNSPredicateExpectation(predicate: NSPredicate { _, _ in
            !self.app.staticTexts["Checking ad privacy…"].exists
        }, object: nil)
        XCTAssertEqual(XCTWaiter.wait(for: [privacyFinished], timeout: 25), .completed,
                       "Privacy startup did not release gameplay")
    }

    func press(_ text: String) {
        let button = visibleButton(text)
        XCTAssertTrue(button.isHittable, "Inaccessible button: \(text)")
        if text.hasPrefix("Perfect") || text == "Reaction Test" || text == "Change color palette" || text == "Change game voice" {
            // Cold WebKit/font layout can move a card after accessibility first
            // exposes it. Require stable geometry, then make exactly one tap.
            var previous = CGRect.null
            var stableSince = Date()
            let stable = XCTNSPredicateExpectation(predicate: NSPredicate { _, _ in
                let frame = button.frame
                guard button.exists && button.isHittable && !frame.isEmpty else {
                    stableSince = Date(); return false
                }
                if frame != previous { previous = frame; stableSince = Date(); return false }
                return Date().timeIntervalSince(stableSince) >= 1.0
            }, object: nil)
            XCTAssertEqual(XCTWaiter.wait(for: [stable], timeout: 20), .completed,
                           "Menu card layout did not stabilize: \(text)")
        }
        // Use the physical center: WebKit's suggested accessibility hit point
        // can be stale on the first interaction after a cold simulator launch.
        button.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    }

    func visibleButton(_ text: String, timeout: TimeInterval = 20) -> XCUIElement {
        let query = app.buttons.matching(NSPredicate(format: "label CONTAINS[c] %@", text))
        let visible = XCTNSPredicateExpectation(predicate: NSPredicate { _, _ in
            query.allElementsBoundByIndex.contains { $0.exists && $0.isHittable && $0.isEnabled }
        }, object: nil)
        XCTAssertEqual(XCTWaiter.wait(for: [visible], timeout: timeout), .completed,
                       "No visible, tappable button: \(text)")
        return query.allElementsBoundByIndex.first { $0.exists && $0.isHittable && $0.isEnabled } ?? query.firstMatch
    }

    func retryAndVerify() {
        visibleButton("TRY AGAIN").tap()
        XCTAssertTrue(visibleButton("START").isEnabled)
    }

    func capture(_ name: String) {
        let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }

    func testMenu() {
        XCTAssertTrue(app.buttons.matching(NSPredicate(format: "label CONTAINS[c] 'Perfect Timer'")).firstMatch.waitForExistence(timeout: 20))
        capture("01-menu")
    }

    func testTimer() {
        press("Perfect Timer")
        press("START")
        capture("02-timer-gameplay")
        press("STOP")
        _ = visibleButton("TRY AGAIN")
        capture("03-timer-result")
        retryAndVerify()
    }

    func testStop() {
        press("Perfect Stop")
        press("START")
        capture("04-stop-gameplay")
        press("STOP")
        _ = visibleButton("TRY AGAIN")
        capture("05-stop-result")
        retryAndVerify()
    }

    func testReaction() {
        press("Reaction Test")
        press("START")
        let go = app.staticTexts["GO!"].firstMatch
        XCTAssertTrue(go.waitForExistence(timeout: 10))
        capture("06-reaction-gameplay")
        go.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
        _ = visibleButton("TRY AGAIN")
        capture("07-reaction-result")
        retryAndVerify()
    }

    func testBackgroundResume() {
        capture("08-background-before-menu-tap")
        press("Perfect Timer")
        capture("09-background-after-menu-tap")
        press("START")
        XCUIDevice.shared.press(.home)
        app.activate()
        XCTAssertTrue(visibleButton("START").isEnabled)
    }

    func testNativeAppleRestoreControl() {
        press("Change color palette")
        XCTAssertTrue(visibleButton("RESTORE APPLE PURCHASES").isEnabled)
        XCTAssertTrue(visibleButton("ACTIVE").isEnabled)
    }

    func testNativeVoiceSelection() {
        press("Change game voice")
        XCTAssertTrue(visibleButton("PETTY").isEnabled)
        // Paid catalog availability requires Apple sandbox/device verification;
        // the DOM suite separately checks purchase gating and all six mappings.
    }

    func testNativePrivacyControl() {
        let privacy = app.buttons["Ad privacy options"]
        XCTAssertTrue(privacy.waitForExistence(timeout: 20))
        XCTAssertTrue(privacy.isHittable)
        capture("12-native-privacy-control")
    }

    func voiceOwned(_ voice: String) -> XCUIElement {
        return app.buttons.matching(NSPredicate(format: "label CONTAINS[c] %@ AND label CONTAINS[c] 'OWNED'", voice)).firstMatch
    }

    func waitForAppleTransaction(_ item: String) {
        let product = "com.pettygamesstudios.ninetynineimpossible." + item
        let purchased = XCTNSPredicateExpectation(predicate: NSPredicate { _, _ in
            guard let transactions = try? self.store.allTransactions() else { return false }
            return transactions.contains { $0.productIdentifier == product && $0.state == .purchased }
        }, object: nil)
        let result = XCTWaiter.wait(for: [purchased], timeout: 30)
        if result != .completed {
            capture("purchase-transaction-missing-" + item)
            let rows = (try? store.allTransactions()) ?? []
            let detail = rows.map { "\($0.productIdentifier): \($0.state.rawValue)" }.joined(separator: "\n")
            let attachment = XCTAttachment(string: detail.isEmpty ? "No StoreKit transactions" : detail)
            attachment.name = "StoreKit transactions after " + item
            attachment.lifetime = .keepAlways
            add(attachment)
        }
        XCTAssertEqual(result, .completed, "Apple did not complete the single purchase tap: \(item)")
    }

    func testAppleVoicePurchasesAndRestore() {
        press("Change game voice")
        _ = visibleButton("DAISY", timeout: 60)
        _ = visibleButton("MICK")
        capture("10-native-voice-products")
        press("DAISY")
        waitForAppleTransaction("daisy")
        press("Change game voice")
        XCTAssertTrue(voiceOwned("DAISY").waitForExistence(timeout: 20))
        press("MICK")
        waitForAppleTransaction("mick")
        press("Change game voice")
        XCTAssertTrue(voiceOwned("MICK").waitForExistence(timeout: 20))
        press("PETTY")
        // A fresh JS process must recover ownership from StoreKit, without web tokens.
        app.terminate(); app.launch()
        press("Change game voice")
        XCTAssertTrue(voiceOwned("DAISY").waitForExistence(timeout: 20))
        XCTAssertTrue(voiceOwned("MICK").waitForExistence(timeout: 20))
        press("PETTY")
        press("Change color palette")
        press("RESTORE APPLE PURCHASES")
        let restored = app.alerts.staticTexts["Apple purchases restored."]
        XCTAssertTrue(restored.waitForExistence(timeout: 20))
        // XCTest may already dismiss a WebKit alert while taking its snapshot.
        // The restored message and both owned voices were asserted above.
        let ok = app.buttons.matching(NSPredicate(format: "label == 'OK'")).firstMatch
        if ok.exists && ok.isHittable { ok.tap() }
    }

    func testAppleIndividualPalettePurchases() {
        press("Change color palette")
        _ = visibleButton("Buy CYBERPUNK", timeout: 60)
        _ = visibleButton("Buy GOLD ONLY")
        _ = visibleButton("Buy SYNTHWAVE")
        capture("11-native-palette-products")
        for name in ["CYBERPUNK", "GOLD ONLY", "SYNTHWAVE"] {
            press("Buy " + name)
            press("Use " + name)
            XCTAssertTrue(visibleButton(name + " ACTIVE").isEnabled)
        }
    }

    func testAppleRagePassUnlocksAllPalettes() {
        press("Change color palette")
        press("Buy RAGE PASS")
        _ = visibleButton("RAGE PASS OWNED")
        for name in ["CYBERPUNK", "GOLD ONLY", "SYNTHWAVE"] {
            press("Use " + name)
            XCTAssertTrue(visibleButton(name + " ACTIVE").isEnabled)
        }
    }

}
