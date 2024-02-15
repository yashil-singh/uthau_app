import { Text } from "react-native";
import { Link } from "expo-router";
import { colors } from "../helpers/theme";

export const HeaderText = ({ style, children, ellipsis, numOfLines }) => {
  return (
    <Text
      ellipsizeMode={ellipsis}
      numberOfLines={numOfLines}
      style={{
        ...style,
        fontFamily: "Poppins",
        margin: 0,
        padding: 0,
      }}
    >
      {children}
    </Text>
  );
};

export const SubHeaderText = ({ style, children }) => {
  return (
    <Text style={{ ...style, fontFamily: "Poppins-Medium" }}>{children}</Text>
  );
};

export const BodyText = ({ style, children, ellipsis, numOfLines }) => {
  return (
    <Text
      ellipsizeMode={ellipsis}
      numberOfLines={numOfLines}
      style={{ ...style, fontFamily: "Figtree" }}
    >
      {children}
    </Text>
  );
};

export const LinkText = ({ style, children, href }) => {
  return (
    <Link
      href={href}
      style={{ ...style, fontFamily: "Figtree", color: colors.links }}
    >
      {children}
    </Link>
  );
};
