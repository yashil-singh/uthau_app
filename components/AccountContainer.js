import { Pressable, Image } from "react-native";
import React from "react";
import { colors } from "../helpers/theme";

const AccountContainer = ({ imageURI, size, onPress }) => {
  return (
    <Pressable
      style={{
        width: { size },
        height: { size },
        borderRadius: 25,
        backgroundColor: "#e3e3e3",
      }}
      onPress={onPress}
    >
      <Image
        source={{
          uri: imageURI,
        }}
        width={size}
        height={size}
        resizeMode="cover"
        style={{ borderRadius: 25 }}
      />
    </Pressable>
  );
};

export default AccountContainer;
