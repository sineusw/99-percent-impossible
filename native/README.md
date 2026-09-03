# 99% Impossible native billing

App/package ID: `com.pettygamesstudios.ninetynineimpossible`

Lifetime ad-removal product: `remove_ads_forever` (durable one-time product, launch price $7.99 USD).

## Android

The Play Console requires an uploaded build containing the Google Play BILLING permission before it unlocks One-time products. `scripts/configure-android-billing.mjs` adds:

- `com.android.vending.BILLING` permission
- Google Play Billing Library 9.1.0
- the `N99Billing` Capacitor plugin
- release-signing hooks driven only by environment variables

`capacitor.config.ts` uses `webDir: 'www'`. `npm run native:prepare` populates that directory directly from the existing web game before Capacitor generates/syncs the Android shell.

The `Build Android Billing AAB` GitHub Action creates a signed `.aab` when these repository secrets exist:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Never commit the upload keystore or its passwords to the repository.

A signed AAB build completed successfully on 2026-09-02. The built bundle was inspected and confirmed to use `com.pettygamesstudios.ninetynineimpossible` and to include `com.android.vending.BILLING`.

After uploading the AAB to an internal testing release in the fresh matching Play Console app, return to Monetize with Play → Products → One-time products and create `remove_ads_forever` as a durable Buy product.

## iOS

`native/ios/N99BillingPlugin.swift` implements StoreKit 2 entitlement lookup, purchase, and restore for the same product ID. Apple setup remains blocked until the Developer Program membership issue is resolved.
