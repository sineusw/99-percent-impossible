package com.pettygamesstudios.ninetynineimpossible;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@CapacitorPlugin(name = "N99Billing")
public class N99BillingPlugin extends Plugin implements PurchasesUpdatedListener {
    private static final Set<String> ALLOWED_PRODUCTS = new HashSet<>(Arrays.asList(
        "remove_ads_forever",
        "unlock_daisy",
        "unlock_mick",
        "unlock_neon_palette",
        "unlock_sunset_palette",
        "unlock_midnight_palette"
    ));
    private BillingClient billingClient;
    private PluginCall pendingPurchaseCall;
    private String pendingProductId;

    @Override
    public void load() {
        billingClient = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .enableAutoServiceReconnection()
            .build();
    }

    private void withBilling(PluginCall call, Runnable action) {
        if (billingClient.isReady()) { action.run(); return; }
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) action.run();
                else call.reject("Billing unavailable: " + result.getDebugMessage());
            }
            @Override public void onBillingServiceDisconnected() {}
        });
    }

    private void resolveOwnership(PluginCall call) {
        withBilling(call, () -> {
            QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.INAPP).build();
            billingClient.queryPurchasesAsync(params, (result, purchases) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject("Purchase query failed: " + result.getDebugMessage()); return;
                }
                JSArray entitlements = new JSArray();
                for (Purchase purchase : purchases) {
                    if (purchase.getPurchaseState() != Purchase.PurchaseState.PURCHASED) continue;
                    for (String productId : purchase.getProducts()) {
                        if (ALLOWED_PRODUCTS.contains(productId)) entitlements.put(productId);
                    }
                }
                JSObject payload = new JSObject();
                payload.put("entitlements", entitlements);
                call.resolve(payload);
            });
        });
    }

    @PluginMethod public void getEntitlements(PluginCall call) { resolveOwnership(call); }
    @PluginMethod public void restorePurchases(PluginCall call) { resolveOwnership(call); }

    @PluginMethod
    public void purchase(PluginCall call) {
        String requested = call.getString("productId");
        if (requested == null || !ALLOWED_PRODUCTS.contains(requested)) { call.reject("Unknown product"); return; }
        if (pendingPurchaseCall != null) { call.reject("A purchase is already in progress"); return; }
        withBilling(call, () -> {
            QueryProductDetailsParams.Product product = QueryProductDetailsParams.Product.newBuilder()
                .setProductId(requested).setProductType(BillingClient.ProductType.INAPP).build();
            QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(Collections.singletonList(product)).build();
            billingClient.queryProductDetailsAsync(params, (result, detailsResult) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject("Product lookup failed: " + result.getDebugMessage()); return;
                }
                List<ProductDetails> products = detailsResult.getProductDetailsList();
                if (products == null || products.isEmpty()) { call.reject("Product unavailable"); return; }
                ProductDetails details = products.get(0);
                List<ProductDetails.OneTimePurchaseOfferDetails> offers = details.getOneTimePurchaseOfferDetailsList();
                if (offers == null || offers.isEmpty()) { call.reject("No eligible purchase option"); return; }
                BillingFlowParams.ProductDetailsParams productParams = BillingFlowParams.ProductDetailsParams.newBuilder()
                    .setProductDetails(details).setOfferToken(offers.get(0).getOfferToken()).build();
                BillingFlowParams flowParams = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(Collections.singletonList(productParams)).build();
                pendingPurchaseCall = call;
                pendingProductId = requested;
                BillingResult launch = billingClient.launchBillingFlow(getActivity(), flowParams);
                if (launch.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    pendingPurchaseCall = null; pendingProductId = null;
                    call.reject("Purchase flow failed: " + launch.getDebugMessage());
                }
            });
        });
    }

    @Override
    public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        PluginCall call = pendingPurchaseCall;
        String expected = pendingProductId;
        if (call == null) return;
        if (result.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            pendingPurchaseCall = null; pendingProductId = null; call.reject("Purchase cancelled"); return;
        }
        if (result.getResponseCode() != BillingClient.BillingResponseCode.OK || purchases == null) {
            pendingPurchaseCall = null; pendingProductId = null; call.reject("Purchase failed: " + result.getDebugMessage()); return;
        }
        Purchase matched = null;
        for (Purchase purchase : purchases) {
            if (expected != null && purchase.getProducts().contains(expected)) { matched = purchase; break; }
        }
        if (matched == null || matched.getPurchaseState() != Purchase.PurchaseState.PURCHASED) {
            pendingPurchaseCall = null; pendingProductId = null; call.reject("Purchase pending"); return;
        }
        if (matched.isAcknowledged()) {
            pendingPurchaseCall = null; pendingProductId = null; resolveOwnership(call); return;
        }
        AcknowledgePurchaseParams ack = AcknowledgePurchaseParams.newBuilder()
            .setPurchaseToken(matched.getPurchaseToken()).build();
        billingClient.acknowledgePurchase(ack, ackResult -> {
            pendingPurchaseCall = null; pendingProductId = null;
            if (ackResult.getResponseCode() == BillingClient.BillingResponseCode.OK) resolveOwnership(call);
            else call.reject("Purchase acknowledgement failed: " + ackResult.getDebugMessage());
        });
    }
}
