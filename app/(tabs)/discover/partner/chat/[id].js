import {
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BodyText, HeaderText } from "../../../../../components/StyledText";
import { useUsers } from "../../../../../hooks/useUsers";
import MainContainer from "../../../../../components/MainContainer";
import { colors } from "../../../../../helpers/theme";
import { Feather } from "@expo/vector-icons";
import { TouchableRipple } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { io } from "socket.io-client";
import { useAuthContext } from "../../../../../hooks/useAuthContext";
import decodeToken from "../../../../../helpers/decodeToken";
import { apiURL } from "../../../../../helpers/constants";
import axios from "axios";

const chat = () => {
  const { id } = useLocalSearchParams();
  const { user } = useAuthContext();
  const decodedToken = decodeToken(user);
  const currentUser = decodedToken?.user;
  const user_id = currentUser?.user_id;

  const router = useRouter();
  const { getUserDetail } = useUsers();
  const [receiver, setReceiver] = useState(null);
  const navigation = useNavigation();
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const socket = io("http://192.168.101.3:8000", { autoConnect: true });

  // socket.on("receiveMessage", (newMessage) => {
  //   console.log("newMessage", newMessage);
  //   setMessages((prevMessages) => [...prevMessages, newMessage]);
  // });

  useEffect(() => {
    // Listen for incoming messages
    socket.on("receiveMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.disconnect(); // Disconnect the socket when the component unmounts
    };
  }, []);

  socket.emit("connected", id);

  const sendMessage = async () => {
    if (message.trim() !== "") {
      socket.emit("sendMessage", { user_id, id, message });
      setMessage("");
    }

    setTimeout(() => {
      fetchMessages();
    }, 200);
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
          <Image
            source={{ uri: receiver?.image }}
            width={40}
            height={40}
            style={{ borderRadius: 100 }}
          />
          <HeaderText>{receiver?.name}</HeaderText>
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
    try {
      const sender_id = user_id;
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
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };

    return new Date(time).toLocaleString("en-US", options);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 15 }}>
        {messages?.map((item, index) => (
          <Pressable
            key={index}
            style={[
              item?.sender_id === user_id
                ? {
                    alignSelf: "flex-end",
                    backgroundColor: colors.primary.normal,
                    padding: 8,
                    borderRadius: 8,
                    marginBottom: 5,
                    maxWidth: "60%",
                  }
                : {
                    alignSelf: "flex-start",
                    padding: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.lightGray,
                    marginBottom: 5,
                    maxWidth: "60%",
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
        <Pressable onPress={sendMessage}>
          <BodyText style={{ color: colors.primary.normal }}>Send</BodyText>
        </Pressable>
      </View>
    </View>
  );
};

export default chat;
