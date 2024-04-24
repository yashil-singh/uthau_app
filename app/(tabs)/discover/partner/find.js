import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import MainContainer from "../../../../components/MainContainer";
import {
  BodyText,
  HeaderText,
  SubHeaderText,
} from "../../../../components/StyledText";
import { useUsers } from "../../../../hooks/useUsers";
import { useAuthContext } from "../../../../hooks/useAuthContext";
import * as Location from "expo-location";
import ErrorModal from "../../../../components/ErrorModal";
import { useRouter } from "expo-router";
import { colors } from "../../../../helpers/theme";
import { Snackbar, TouchableRipple } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import useDecode from "../../../../hooks/useDecode";
import Portal from "react-native-paper/src/components/Portal/Portal";

const find = () => {
  const router = useRouter();

  const {
    updateUserLocation,
    sendRequest,
    getNearByUsers,
    removeRequest,
    getUserRequests,
    acceptRequest,
  } = useUsers();
  const [location, setLocation] = useState(null);

  const { user } = useAuthContext();
  const { getDecodedToken } = useDecode();

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchDecodedToken = async () => {
      const response = await getDecodedToken();

      if (response.success) {
        setCurrentUser(response?.user);
      }
    };

    fetchDecodedToken();
  }, [user]);

  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [userRequests, setUserRequests] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  //Modal related states
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [openPermissionErrorModal, setOpenPermissionErrorModal] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onSendRequest = async ({ sender_id, receiver_id }) => {
    if (currentUser) {
      const response = await sendRequest({ sender_id, receiver_id });

      if (response.success) {
        fetchUserRequests();
      }

      setOpenToast(true);
      setToastMessage(response.message);
    }
  };

  const onRemoveRequest = async ({ sender_id, receiver_id }) => {
    const response = await removeRequest({ sender_id, receiver_id });
    if (response.success) {
      fetchUserRequests();
    }

    setOpenToast(true);
    setToastMessage(response.message);
  };

  useEffect(() => {
    const fetch = async () => {
      let location = await Location.getCurrentPositionAsync({});
      if (currentUser && location) {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setOpenPermissionErrorModal(true);
          return;
        }

        setLocation(location);

        setIsLoading(true);

        const response = await updateUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          user_id: currentUser.user_id,
        });

        if (!response.success) {
          setOpenErrorModal(true);
          setErrorMessage(response.message);
        }

        setIsLoading(false);
      }
    };

    fetch();
  }, [user, currentUser]);

  const fetchNearbyUsers = async () => {
    if (currentUser && location) {
      const response = await getNearByUsers({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        radius: 20,
        user_id: currentUser?.user_id,
      });

      if (response.success) {
        setNearbyUsers(response.nearbyUsers);
        fetchUserRequests();
      }
    }
  };

  const fetchUserRequests = async () => {
    if (currentUser) {
      const response = await getUserRequests({ user_id: currentUser?.user_id });

      if (response.success) {
        setUserRequests(response.requests);
      }
    }
  };

  const onRequestAccept = async ({ sender_id, receiver_id }) => {
    const resposne = await acceptRequest({ receiver_id, sender_id });

    setOpenToast(true);
    setToastMessage(resposne.message);

    if (resposne.success) {
      fetchNearbyUsers();
    }
  };

  useEffect(() => {
    fetchNearbyUsers();
  }, [currentUser, location]);

  return (
    <MainContainer padding={15}>
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
      <BodyText style={{ fontSize: 16, marginBottom: 15 }}>
        Near You ({nearbyUsers.length})
      </BodyText>

      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <HeaderText
            style={{ textAlign: "center", fontSize: 18, marginBottom: 10 }}
          >
            Searching Nearby...
          </HeaderText>
          <ActivityIndicator size={"large"} color={colors.primary.normal} />
        </View>
      ) : nearbyUsers.length > 0 ? (
        <FlatList
          data={nearbyUsers}
          key={(index) => index}
          refreshing={isRefreshing}
          onRefresh={fetchNearbyUsers}
          showsVerticalScrollIndicator={false}
          renderItem={(item) => {
            const userRequestsReceived = userRequests.some(
              (req) => req.sender_id === item.item.user_id
            );

            const userRequestsSent = userRequests.some(
              (req) => req.receiver_id === item.item.user_id
            );

            return (
              <View
                key={item.item.user_id}
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
                    {item.item.email}
                  </BodyText>
                  <BodyText style={{ color: colors.gray }}>
                    Distance: {item.item.distance} km
                  </BodyText>
                </View>
                {userRequestsReceived && (
                  <>
                    <TouchableRipple
                      borderless
                      style={{ borderRadius: 100 }}
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
                      style={{ borderRadius: 100 }}
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
                  </>
                )}
                {userRequestsSent && (
                  <TouchableRipple
                    borderless
                    style={{ borderRadius: 100, padding: 5 }}
                    onPress={() =>
                      onRemoveRequest({
                        sender_id: currentUser?.user_id,
                        receiver_id: item.item.user_id,
                      })
                    }
                  >
                    <Feather name="x" size={24} color={colors.primary.normal} />
                  </TouchableRipple>
                )}
                {!userRequestsReceived && !userRequestsSent && (
                  <TouchableRipple
                    borderless
                    style={{ borderRadius: 100, padding: 5 }}
                    onPress={() =>
                      onSendRequest({
                        sender_id: currentUser?.user_id,
                        receiver_id: item.item.user_id,
                      })
                    }
                  >
                    <AntDesign
                      name="adduser"
                      size={24}
                      color={colors.primary.normal}
                    />
                  </TouchableRipple>
                )}
              </View>
            );
          }}
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
          <HeaderText style={{ fontSize: 20 }}>
            Oops! It's a bit empty here.
          </HeaderText>
          <BodyText
            style={{
              maxWidth: "75%",
              textAlign: "center",
              color: colors.gray,
            }}
          >
            Seems like no one is near you at the moment.
          </BodyText>
        </View>
      )}
    </MainContainer>
  );
};

export default find;
