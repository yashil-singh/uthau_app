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
import decodeToken from "../../../../helpers/decodeToken";
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

  const { getNearByUsers } = useUsers();

  const { updateUserLocation, sendRequest, getUserRequestSent } = useUsers();
  const [location, setLocation] = useState(null);

  const { user } = useAuthContext();
  const { getDecodedToken } = useDecode();

  const [isPageLoading, setIsPageLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchDecodedToken = async () => {
      const response = await getDecodedToken();

      if (response.success) {
        setCurrentUser(response?.user);
        setIsPageLoading(false);
      }
    };

    fetchDecodedToken();
  }, [user]);

  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [requestSent, setRequestSent] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  //Modal related states
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [openPermissionErrorModal, setOpenPermissionErrorModal] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const onSendRequest = async ({ sender_id, receiver_id }) => {
    if (currentUser) {
      const response = await sendRequest({ sender_id, receiver_id });
      console.log("🚀 ~ response:", response);

      setOpenToast(true);
      setToastMessage(response.message);

      if (response.success) {
        getNearByUsers();
      }
    }
  };

  useEffect(() => {
    const fetch = async () => {
      if (currentUser) {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setOpenPermissionErrorModal(true);
          return;
        }
        let location = await Location.getCurrentPositionAsync({});

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

        const requestSentResponse = await getUserRequestSent({
          user_id: currentUser?.user_id,
        });

        if (requestSentResponse.success) {
          setRequestSent(requestSentResponse.requests);
        }

        const nearbyUsersResponse = await getNearByUsers({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          radius: 20,
          user_id: currentUser?.user_id,
        });

        if (nearbyUsersResponse.success) {
          setNearbyUsers(nearbyUsersResponse.nearbyUsers);
        }

        setIsLoading(false);
      }
    };

    fetch();
  }, [user, currentUser, openToast]);

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
          <ActivityIndicator
            size={"large"}
            color={colors.primary.normal}
            style={{ flex: 1, justifyContent: "center" }}
          />
        </View>
      ) : nearbyUsers.length > 0 ? (
        <FlatList
          data={nearbyUsers}
          key={(index) => index}
          showsVerticalScrollIndicator={false}
          renderItem={(item) => {
            const isRequestSent = requestSent.some(
              (request) => request.receiver_id === item.item.user_id
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
                  <BodyText style={{ color: colors.gray }}>
                    Distance: {item.item.distance} km
                  </BodyText>
                </View>
                {isRequestSent ? (
                  <TouchableRipple
                    borderless
                    style={{ borderRadius: 100, padding: 5 }}
                    onPress={() => console.log("PRESSED")}
                  >
                    <Feather name="x" size={24} color={colors.primary.normal} />
                  </TouchableRipple>
                ) : (
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
