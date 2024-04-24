import { Pressable, Image, View, ActivityIndicator } from "react-native";
import React from "react";
import { colors } from "../helpers/theme";

const AccountContainer = ({ imageURI, size, onPress, isLoading }) => {
  return (
    <Pressable
      style={{
        width: size,
        height: size,
        borderRadius: 100,
        backgroundColor: "#e3e3e3",
      }}
      onPress={onPress}
    >
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={colors.primary.normal} />
        </View>
      ) : (
        <Image
          source={{
            uri: imageURI,
          }}
          width={size}
          height={size}
          resizeMode="cover"
          style={{ borderRadius: 100 }}
        />
      )}
    </Pressable>
  );
};

export default AccountContainer;
