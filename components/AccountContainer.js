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
        backgroundColor: colors.gray,
      }}
      onPress={onPress}
    >
      <Image src={imageURI} width={size} height={size} resizeMode="cover" />
    </Pressable>
  );
};

export default AccountContainer;
