import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import logo from "../assets/icon.png";

const Logo = () => {
  return (
    <Image
      source={logo}
      style={{
        width: 200,
        height: 100,
        resizeMode: "cover",
      }}
    />
  );
};

export default Logo;

const styles = StyleSheet.create({});
