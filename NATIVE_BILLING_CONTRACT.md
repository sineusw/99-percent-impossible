# 99% Impossible — native billing contract

Permanent app ID: `com.pettygamesstudios.ninetynineimpossible`

Lifetime non-consumable product ID: `remove_ads_forever`
Launch price: **$7.99 USD** (storefront may localize the displayed price).

The web game calls `window.N99NativeBilling` with exactly three async methods:
- `getEntitlements()`
- `purchase('remove_ads_forever')`
- `restorePurchases()`

Preferred result: `{ entitlements: ['remove_ads_forever'] }`.

No web/localStorage flag may grant this entitlement. StoreKit / Google Play is authoritative. Rage Pass and palettes remain separate cosmetic products and do not suppress ads.

## Generate native projects

```sh
npm install
npm run native:prepare
npx cap add ios
npx cap add android
npx cap sync
```

The generated iOS and Android projects must implement the billing contract above. Configure `remove_ads_forever` as a non-consumable / one-time product in App Store Connect and Google Play Console, then verify purchase and restore on physical iPhone and Android devices before merging PR #20.
