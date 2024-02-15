import { View, TouchableOpacity, Image, FlatList } from "react-native";
import React, { useState } from "react";
import MainContainer from "../../../../components/MainContainer";
import {
  BodyText,
  HeaderText,
  SubHeaderText,
} from "../../../../components/StyledText";
import { colors } from "../../../../helpers/theme";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const index = () => {
  const router = useRouter();
  const [friends, setFriends] = useState([
    { user_id: 1, name: "Yashil Singh", distance: 2.5 },
    { user_id: 2, name: "Sangya Vaidya", distance: 7 },
  ]);
  return (
    <MainContainer padding={15} gap={15}>
      <SubHeaderText style={{ fontSize: 18 }}>Your Friends</SubHeaderText>

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
                <BodyText style={{ color: colors.gray }}>
                  Distance: {item.item.distance} km
                </BodyText>
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
