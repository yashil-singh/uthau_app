import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useUsers } from "../../../../hooks/useUsers";
import { useAuthContext } from "../../../../hooks/useAuthContext";
import decodeToken from "../../../../helpers/decodeToken";
import * as Location from "expo-location";
import { colors } from "../../../../helpers/theme";
import {
  BodyText,
  HeaderText,
  SubHeaderText,
} from "../../../../components/StyledText";
import MainContainer from "../../../../components/MainContainer";
import { AntDesign } from "@expo/vector-icons";
import { TouchableRipple } from "react-native-paper";
import { userRadius } from "../../../../helpers/constants";

const requests = () => {
  const { user } = useAuthContext();
  const { getUserRequestReceived, acceptRequest } = useUsers();

  const decodedToken = decodeToken(user);
  const currentUser = decodedToken?.user;
  const user_id = currentUser?.user_id;

  const [requests, setRequests] = useState([]);
  const [location, setLocation] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const onRequestAccept = async ({ sender_id, receiver_id }) => {
    const resposne = await acceptRequest({ receiver_id, sender_id });
    console.log("🚀 ~ requests onRequestAccept resposne:", resposne);
  };

  useEffect(() => {
    const getLocation = async () => {
      try {
        let location = await Location.getCurrentPositionAsync({});

        setLocation(location);
      } catch (error) {
        console.log("🚀 ~ requests.js useEffect error:", error);
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    const getRequests = async () => {
      const lat = location?.coords.latitude;
      const lng = location?.coords.longitude;
      const radius = userRadius;
      const response = await getUserRequestReceived({
        user_id,
        lat,
        lng,
        radius,
      });

      if (response.success) {
        setRequests(response.requests);
      }
    };

    getRequests();
  }, [location]);

  return (
    <MainContainer padding={15}>
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size={"large"} color={colors.primary.normal} />
        </View>
      ) : requests.length > 0 ? (
        <FlatList
          data={requests}
          key={(index) => index}
          showsVerticalScrollIndicator={false}
          renderItem={(item) => (
            <TouchableOpacity
              key={item.item.user_id}
              activeOpacity={0.9}
              style={{
                width: "100%",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.lightGray,
                padding: 15,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 6,
              }}
            >
              <Image
                source={{
                  uri: item.item.image,
                }}
                height={60}
                width={60}
                borderRadius={100}
              />
              <View
                style={{
                  flex: 1,
                }}
              >
                <SubHeaderText style={{ fontSize: 15 }}>
                  {item.item.name}
                </SubHeaderText>
                <BodyText style={{ color: colors.gray }}>
                  {item.item?.distance} km away
                </BodyText>
              </View>
              <View style={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <TouchableRipple
                  borderless
                  style={{ borderRadius: 100, padding: 5 }}
                  onPress={() => console.log("PRESSED")}
                >
                  <AntDesign
                    name="close"
                    size={24}
                    color={colors.primary.normal}
                  />
                </TouchableRipple>
                <TouchableRipple
                  borderless
                  style={{ borderRadius: 100, padding: 5 }}
                  onPress={() =>
                    onRequestAccept({
                      receiver_id: user_id,
                      sender_id: item.item.user_id,
                    })
                  }
                >
                  <AntDesign
                    name="check"
                    size={24}
                    color={colors.primary.normal}
                  />
                </TouchableRipple>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <HeaderText style={{ fontSize: 18, textAlign: "center" }}>
            Ops! It's a bit empty here!
          </HeaderText>
          <BodyText style={{ color: colors.gray, textAlign: "center" }}>
            You have no pending requests at the moment.
          </BodyText>
        </View>
      )}
    </MainContainer>
  );
};

export default requests;
