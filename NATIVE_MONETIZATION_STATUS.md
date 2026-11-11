# Native monetization integration status

This branch adds the Capacitor 7 AdMob SDK dependency and uses Google's official iOS **test interstitial unit** on native retry boundaries. The browser still does not run real ads.

## Required before an iPhone test build
- Retrieve the existing AdMob **iOS app ID** from the previously created AdMob account (format `ca-app-pub-...~...`); put it in the generated iOS app's `Info.plist` under `GADApplicationIdentifier`. An ad **unit ID** (with `/`) cannot replace the app ID (with `~`).
- Run `npm install`, `npm run stage:web`, `npx cap add ios` (only if the iOS project does not exist), `npx cap sync ios`; build and test on a physical iPhone. Do not merge the branch or submit to App Review before validation.
- The native retry boundary currently requests Google's test interstitial ID `ca-app-pub-3940256099942544/4411468910`. Confirm the ad displays, closes, and retry resumes. On failure, retry must resume without blocking.
- Switch to the user's existing production ad unit ID **only in a separate release change**, with testing flags disabled and a physical device verification pass.

## Native digital purchases
The six existing web Stripe products are not Apple StoreKit product identifiers. The current `voice-payments.js` deliberately disables native checkout; native premium offers remain hidden. Connect the **existing** App Store Connect in-app purchase identifiers to a native StoreKit 2 purchase-and-restore bridge and validate transaction ownership before enabling them. Do not route native purchases to Stripe.

## Important
No production AdMob app ID, Apple IAP product IDs, iOS device test results, or App Store release authorization are claimed in this branch.