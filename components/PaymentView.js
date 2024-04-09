import { View, Platform } from "react-native";
import React, { useState } from "react";
import { TouchableRipple } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import WebView from "react-native-webview";

const PaymentView = ({ onClose, uri }) => {
  const webRef = React.createRef();

  const [canGoBack, setCanGoBack] = useState(false);

  const handleNavigationStateChange = (newNavState) => {
    console.log("🚀 ~ newNavState.url:", newNavState.url);
    if (newNavState.url.includes("callback")) {
      //   webRef.current.stopLoading();
      //   webRef.current.goBack();
      //   setIsVisible(false);
      //   setUrl("");
      //   webRef.current.injectJavaScript(injectScript);
      setCanGoBack(true);
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: 15 }}>
      {canGoBack && (
        <TouchableRipple
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
