import XCTest

final class ScreenshotCapture: XCTestCase {
    let app = XCUIApplication(bundleIdentifier: "com.pettygamesstudios.ninetynineimpossible")

    override func setUpWithError() throws {
        continueAfterFailure = false
        app.terminate()
        app.launch()
    }

    func press(_ text: String) {
        let button = app.buttons.matching(NSPredicate(format: "label CONTAINS[c] %@", text)).firstMatch
        XCTAssertTrue(button.waitForExistence(timeout: 20), "Missing button: \(text)")
        XCTAssertTrue(button.isHittable, "Inaccessible button: \(text)")
        button.tap()
    }

    func visibleButton(_ text: String) -> XCUIElement {
        let query = app.buttons.matching(NSPredicate(format: "label CONTAINS[c] %@", text))
        let visible = XCTNSPredicateExpectation(predicate: NSPredicate { _, _ in
            query.allElementsBoundByIndex.contains { $0.exists && $0.isHittable }
        }, object: nil)
        XCTAssertEqual(XCTWaiter.wait(for: [visible], timeout: 20), .completed,
                       "No visible, tappable button: \(text)")
        return query.allElementsBoundByIndex.first { $0.exists && $0.isHittable } ?? query.firstMatch
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
        press("Perfect Timer")
        press("START")
        XCUIDevice.shared.press(.home)
        app.activate()
        XCTAssertTrue(visibleButton("START").isEnabled)
    }

    func testNativePaletteOffers() {
        press("Change color palette")
        let paidButtons = app.buttons.matching(NSPredicate(format: "label CONTAINS '$'"))
        XCTAssertFalse(paidButtons.allElementsBoundByIndex.contains { $0.isHittable })
        XCTAssertTrue(visibleButton("ACTIVE").isEnabled)
    }

    func testNativeVoiceOffers() {
        press("Change game voice")
        XCTAssertFalse(app.buttons.matching(NSPredicate(format: "label CONTAINS[c] 'DAISY'")).firstMatch.exists)
        XCTAssertFalse(app.buttons.matching(NSPredicate(format: "label CONTAINS[c] 'MICK'")).firstMatch.exists)
        XCTAssertTrue(visibleButton("PETTY").isEnabled)
    }

}
