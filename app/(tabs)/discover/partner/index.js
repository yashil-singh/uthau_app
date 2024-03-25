import {
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import MainContainer from "../../../../components/MainContainer";
import {
  BodyText,
  HeaderText,
  LinkText,
  SubHeaderText,
} from "../../../../components/StyledText";
import { colors } from "../../../../helpers/theme";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import * as Location from "expo-location";
import { useUsers } from "../../../../hooks/useUsers";
import { useAuthContext } from "../../../../hooks/useAuthContext";
import decodeToken from "../../../../helpers/decodeToken";
import ErrorModal from "../../../../components/ErrorModal";
import { Badge } from "react-native-paper";
import { userRadius } from "../../../../helpers/constants";

const index = () => {
  const { user } = useAuthContext();
  const decodedToken = decodeToken(user);
  const currentUser = decodedToken?.user;
  const user_id = currentUser?.user_id;

  const router = useRouter();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  const { getAllFriends, getUserRequestReceived } = useUsers();

  const [location, setLocation] = useState(null);

  //Modal related states
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [openPermissionErrorModal, setOpenPermissionErrorModal] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const getLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setOpenPermissionErrorModal(true);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    };

    getLocationPermission();
  }, []);

  useEffect(() => {
    const getFriends = async () => {
      const response = await getAllFriends({ user_id });

      if (response.success) {
        const connections = response.data;

        setFriends(connections.data);
      }
    };

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

    getFriends();
    getRequests();
  }, [user_id, location]);

  return (
    <MainContainer padding={15} gap={15}>
      <ErrorModal
        openErrorModal={openPermissionErrorModal}
        title={"Permission Required"}
        message={"Location permession is required to access this feature."}
        onClose={() => {
          setOpenErrorModal(false);
          router.replace("discover");
        }}
        onDismiss={() => {
          setOpenErrorModal(false);
          router.replace("discover");
        }}
      />

      <ErrorModal
        openErrorModal={openErrorModal}
        title={"Error"}
        message={errorMessage}
        onClose={() => {
          setOpenErrorModal(false);
          router.replace("discover");
        }}
        onDismiss={() => {
          setOpenErrorModal(false);
          router.replace("discover");
        }}
      />

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <BodyText style={{ fontSize: 16 }}>Messages</BodyText>
        <View style={{ position: "relative", paddingRight: 10 }}>
          <LinkText
            href={"/discover/partner/requests"}
            style={{ fontSize: 16, color: colors.links }}
          >
            Requests
          </LinkText>
          <Badge style={{ position: "absolute", top: -15, right: 0 }}>
            {requests.length}
          </Badge>
        </View>
      </View>

      {friends.length > 0 ? (
        <FlatList
          data={friends}
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
              onPress={() =>
                router.push(`/discover/partner/chat/${item.item.user_id}`)
              }
            >
              <Image
                source={{
                  uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
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
              </View>
              <Feather name="send" size={24} color={colors.primary.normal} />
            </TouchableOpacity>
          )}
        />
      ) : (
        <View
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <HeaderText style={{ fontSize: 20 }}>It's empty here!</HeaderText>
          <BodyText
            style={{
              maxWidth: "75%",
              textAlign: "center",
              color: colors.gray,
            }}
          >
            It's fun to have a gym buddy. We will help you find one
          </BodyText>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          position: "absolute",
          right: 20,
          bottom: 15,
          backgroundColor: colors.primary.normal,
          padding: 15,
          borderRadius: 100,
        }}
        onPress={() => router.push("discover/partner/find")}
      >
        <Feather name="search" size={20} color="white" />
      </TouchableOpacity>
    </MainContainer>
  );
};

export default index;
