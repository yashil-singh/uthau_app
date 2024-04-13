import { View, Platform } from "react-native";
import React, { useState } from "react";
import { TouchableRipple } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import WebView from "react-native-webview";
import { HeaderText } from "./StyledText";

const PaymentView = ({ onClose, uri, onPaymentSuccess }) => {
  const webRef = React.createRef();

  const [canGoBack, setCanGoBack] = useState(false);

  const handleNavigationStateChange = (newNavState) => {
    console.log("🚀 ~ newNavState.url:", newNavState.url);
    if (
      newNavState.url.includes("callback") ||
      newNavState.url.includes("pay")
    ) {
      setCanGoBack(true);
    }

    if (newNavState.url.includes("callback/?status=Completed")) {
      function extractPurchaseOrderId() {
        const urlParams = new URLSearchParams(newNavState.url);
        return urlParams.get("purchase_order_id");
      }
      const order_id = extractPurchaseOrderId();
      onPaymentSuccess({ order_id });
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: 15 }}>
      {canGoBack ? (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 20,
            alignItems: "center",
          }}
        >
          <TouchableRipple
            borderless
            style={{
              borderRadius: 100,
              padding: 5,
              marginLeft: 15,
              width: 35,
            }}
            onPress={onClose}
          >
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableRipple>
          <HeaderText style={{ fontSize: 24 }}>Payment</HeaderText>
        </View>
      ) : (
        <HeaderText>Payment</HeaderText>
      )}
      <WebView
        source={{ uri: uri }}
        javaScriptEnabled={true}
        style={{ flex: 1, zIndex: 100 }}
        nativeConfig={{ props: { webContentsDebuggingEnabled: true } }}
        ref={webRef}
        domStorageEnabled={true}
        mixedContentMode="always"
        useWebKit={Platform.OS === "ios"}
        startInLoadingState={true}
        onNavigationStateChange={handleNavigationStateChange}
      />
    </View>
  );
};

export default PaymentView;
