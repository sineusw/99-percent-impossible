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
        XCTAssertTrue(app.buttons.matching(NSPredicate(format: "label CONTAINS[c] 'TRY AGAIN'")).firstMatch.waitForExistence(timeout: 10))
        capture("03-timer-result")
    }

    func testStop() {
        press("Perfect Stop")
        press("START")
        capture("04-stop-gameplay")
        press("STOP")
        XCTAssertTrue(app.buttons.matching(NSPredicate(format: "label CONTAINS[c] 'TRY AGAIN'")).firstMatch.waitForExistence(timeout: 10))
        capture("05-stop-result")
    }

    func testReaction() {
        press("Reaction Test")
        press("START")
        let go = app.staticTexts["GO!"].firstMatch
        XCTAssertTrue(go.waitForExistence(timeout: 10))
        capture("06-reaction-gameplay")
        go.tap()
        XCTAssertTrue(app.buttons.matching(NSPredicate(format: "label CONTAINS[c] 'TRY AGAIN'")).firstMatch.waitForExistence(timeout: 10))
        capture("07-reaction-result")
    }
}
