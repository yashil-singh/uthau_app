import {
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  BodyText,
  HeaderText,
  SubHeaderText,
} from "../../../../../components/StyledText";
import { useUsers } from "../../../../../hooks/useUsers";
import MainContainer from "../../../../../components/MainContainer";
import { colors } from "../../../../../helpers/theme";
import { Feather } from "@expo/vector-icons";
import { TouchableRipple } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { io } from "socket.io-client";
import { useAuthContext } from "../../../../../hooks/useAuthContext";
import decodeToken from "../../../../../helpers/decodeToken";
import { apiURL, socketURL } from "../../../../../helpers/constants";
import axios from "axios";
import useDecode from "../../../../../hooks/useDecode";

const chat = () => {
  const { id } = useLocalSearchParams();
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

  const router = useRouter();
  const { getUserDetail } = useUsers();
  const [receiver, setReceiver] = useState(null);
  const navigation = useNavigation();
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const socket = io(socketURL);

  const [isMessageLoading, setIsMessageLoading] = useState(true);
  const [isMessageSending, setIsMessageSending] = useState(false);

  useEffect(() => {
    // Listen for incoming messages
    socket.on("receiveMessage", (newMessage) => {
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  socket.emit("connected", id);

  const sendMessage = async () => {
    setIsMessageSending(true);
    if (message.trim() !== "") {
      socket.emit("sendMessage", {
        user_id: currentUser?.user_id,
        id,
        message,
      });
      setMessage("");
    }

    setTimeout(() => {
      setIsMessageSending(false);
    }, 500);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <View
          style={{
            paddingVertical: 15,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 15,
          }}
        >
          <TouchableRipple style={{ borderRadius: 100, padding: 5 }}>
            <Feather
              name="arrow-left"
              size={24}
              color="black"
              onPress={() => router.back()}
            />
          </TouchableRipple>
          <Pressable
            onPress={() => router.push(`/discover/partner/profile/${id}`)}
            style={{ flex: 1, flexDirection: "row", gap: 10 }}
          >
            <Image
              source={{ uri: receiver?.image }}
              width={40}
              height={40}
              style={{ borderRadius: 100 }}
            />
            <View>
              <HeaderText>{receiver?.name}</HeaderText>
              <BodyText style={{ fontSize: 12, color: colors.gray }}>
                {receiver?.email}
              </BodyText>
            </View>
          </Pressable>
        </View>
      ),
    });
  });

  useEffect(() => {
    const userDetail = async () => {
      const response = await getUserDetail({ user_id: id });
      setReceiver(response?.data[0]);
    };

    userDetail();
  }, [id]);

  const fetchMessages = async () => {
    console.log("🚀 ~ currentUser:", currentUser);
    if (currentUser) {
      try {
        const sender_id = currentUser?.user_id;
        const receiver_id = id;

        const response = await axios.get(`${apiURL}/messages`, {
          params: {
            sender_id,
            receiver_id,
          },
        });

        setMessages(response?.data);
      } catch (error) {
        console.log("🚀 ~ [id].js useEffect error:", error);
      }

      setIsMessageLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [currentUser]);

  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };

    return new Date(time).toLocaleString("en-US", options);
  };

  return (
    <MainContainer>
      {isMessageLoading ? (
        <View
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size={"large"} color={colors.primary.normal} />
        </View>
      ) : !isMessageLoading && messages.length <= 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: 20,
          }}
        >
          <BodyText style={{ textAlign: "center", color: colors.gray }}>
            Start a new converstation with{"\n"} {receiver?.name}!
          </BodyText>
        </View>
      ) : (
        <ScrollView
          style={{ transform: [{ scaleY: -1 }] }}
          contentContainerStyle={{ flexGrow: 1, padding: 15 }}
        >
          {messages?.map((item, index) => (
            <Pressable
              key={index}
              style={[
                item?.sender_id === currentUser?.user_id
                  ? {
                      alignSelf: "flex-end",
                      backgroundColor: colors.primary.normal,
                      padding: 8,
                      borderRadius: 8,
                      marginBottom: 5,
                      maxWidth: "60%",
                      transform: [{ scaleY: -1 }],
                    }
                  : {
                      alignSelf: "flex-start",
                      padding: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.lightGray,
                      marginBottom: 5,
                      maxWidth: "60%",
                      transform: [{ scaleY: -1 }],
                    },
              ]}
            >
              <Text>{item?.sent_text}</Text>
              <Text
                style={{
                  fontSize: 9,
                  textAlign: "right",
                  marginTop: 5,
                }}
              >
                {formatTime(item?.sent_at)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 8,
          flexDirection: "row",
          gap: 15,
          alignItems: "center",
          borderTopWidth: 1,
          borderColor: colors.background,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: colors.lightGray,
            borderRadius: 6,
            paddingVertical: 8,
            paddingHorizontal: 10,
          }}
          placeholder="Message..."
          value={message}
          onChangeText={(text) => setMessage(text)}
        />
        {isMessageSending ? (
          <ActivityIndicator color={colors.primary.normal} />
        ) : (
          <Pressable onPress={sendMessage}>
            <BodyText style={{ color: colors.primary.normal }}>Send</BodyText>
          </Pressable>
        )}
      </View>
    </MainContainer>
  );
};

export default chat;
