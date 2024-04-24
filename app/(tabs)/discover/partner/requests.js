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
import * as Location from "expo-location";
import { colors } from "../../../../helpers/theme";
import {
  BodyText,
  HeaderText,
  SubHeaderText,
} from "../../../../components/StyledText";
import MainContainer from "../../../../components/MainContainer";
import { AntDesign } from "@expo/vector-icons";
import { Portal, Snackbar, TouchableRipple } from "react-native-paper";
import { userRadius } from "../../../../helpers/constants";
import useDecode from "../../../../hooks/useDecode";

const requests = () => {
  const { user } = useAuthContext();
  const { getUserRequestReceived, acceptRequest, rejectRequest } = useUsers();

  const { getDecodedToken } = useDecode();

  const [currentUser, setCurrentUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [location, setLocation] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const fetchDecodedToken = async () => {
      const response = await getDecodedToken();

      if (response.success) {
        setCurrentUser(response?.user);
      }
    };

    fetchDecodedToken();
  }, [user]);

  const onRequestAccept = async ({ sender_id, receiver_id }) => {
    const resposne = await acceptRequest({ receiver_id, sender_id });

    setOpenToast(true);
    setToastMessage(resposne.message);

    if (resposne.success) {
      getRequests();
    }
  };

  const onRequestReject = async ({ sender_id, receiver_id }) => {
    const resposne = await rejectRequest({ receiver_id, sender_id });

    setOpenToast(true);
    setToastMessage(resposne.message);

    if (resposne.success) {
      getRequests();
    }
  };

  useEffect(() => {
    const getLocation = async () => {
      try {
        let location = await Location.getCurrentPositionAsync({});
        console.log("🚀 ~ location:", location);

        setLocation(location);
      } catch (error) {
        console.log("🚀 ~ requests.js useEffect error:", error);
      }
    };

    getLocation();
  }, []);

  const getRequests = async () => {
    if (currentUser && location) {
      const lat = location?.coords.latitude;
      const lng = location?.coords.longitude;
      const radius = userRadius;
      const response = await getUserRequestReceived({
        user_id: currentUser?.user_id,
        lat,
        lng,
        radius,
      });

      if (response.success) {
        setRequests(response.requests);
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getRequests();
  }, [location]);

  return (
    <MainContainer padding={15}>
      <Portal>
        <Snackbar
          visible={openToast}
          onDismiss={() => setOpenToast(false)}
          action={{
            label: "close",
            labelStyle: {
              color: colors.primary.normal,
            },
          }}
          duration={2000}
          style={{ backgroundColor: colors.white }}
        >
          <BodyText>{toastMessage}</BodyText>
        </Snackbar>
      </Portal>
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
          refreshing={isRefreshing}
          onRefresh={() => getRequests()}
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
                <BodyText style={{ color: colors.gray, marginBottom: 5 }}>
                  {item.item?.email}
                </BodyText>
                <BodyText style={{ color: colors.gray }}>
                  {item.item?.distance} km away
                </BodyText>
              </View>
              <View style={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <TouchableRipple
                  borderless
                  style={{ borderRadius: 100, padding: 5 }}
                  onPress={() =>
                    onRequestReject({
                      receiver_id: currentUser?.user_id,
                      sender_id: item.item.user_id,
                    })
                  }
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
                      receiver_id: currentUser?.user_id,
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
            Oops! It's a bit empty here!
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
