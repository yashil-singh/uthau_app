import { ScrollView, View } from "react-native";
import React, { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { colors } from "../../../helpers/theme";
import DropdownPicker from "../../../components/DropdownPicker";
import InputFields from "../../../components/InputFields";
import { Controller, useForm } from "react-hook-form";
import { ERROR_MESSAGES } from "../../../helpers/constants";
import StyledButton from "../../../components/StyledButton";
import useAbout from "../../../hooks/useAbout";
import { BodyText } from "../../../components/StyledText";

const aboutYou = () => {
  const { email } = useLocalSearchParams();

  const genderOptions = [
    { label: "Select your gender", value: null },
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Non-Binary", value: "Non-Binary" },
  ];

  const { storeAboutInfo } = useAbout();
  const router = useRouter();
  const [error, setError] = useState(null);

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm({ mode: "onSubmit" });

  const onSubmit = async (data) => {
    setError(null);

    const { age, genderValue, height, weight } = data;
    const gender = genderValue.value;

    try {
      const response = await storeAboutInfo({
        email,
        age,
        gender,
        height,
        weight,
      });
      if (response.success) {
        reset();
        router.push("/accountCreated");
        setError(null);
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.log("🚀 ~ file: aboutYou.js:47 ~ error:", error);
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: 25,
        backgroundColor: colors.white,
      }}
    >
      <View style={{ gap: 15, flex: 1, marginBottom: 150 }}>
        <BodyText style={{ color: colors.gray, fontSize: 16 }}>
          Please answers these correctly.
        </BodyText>

        <Controller
          control={control}
          name="age"
          rules={{
            required: { value: true, message: ERROR_MESSAGES.REQUIRED },
          }}
          render={({ field: { onChange, value } }) => (
            <InputFields
              title="Age"
              placeholder="Enter your age"
              type={"numeric"}
              value={value}
              keyboardType="numeric"
              isInvalid={errors.age ? true : false}
              onChangeText={onChange}
              errorText={errors.age?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="genderValue"
          rules={{
            required: { value: true, message: ERROR_MESSAGES.REQUIRED },
          }}
          render={({ field: { onChange, value } }) => (
            <DropdownPicker
              title="Gender"
              placeholder="Select your gender"
              options={genderOptions}
              value={value?.value}
              onChange={onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="height"
          rules={{
            required: { value: true, message: ERROR_MESSAGES.REQUIRED },
          }}
          render={({ field: { onChange, value } }) => (
            <InputFields
              title="Height (in cm)"
              placeholder="Enter your height"
              type={"numeric"}
              value={value}
              keyboardType="numeric"
              isInvalid={errors.height ? true : false}
              onChangeText={onChange}
              errorText={errors.height?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="weight"
          rules={{
            required: { value: true, message: ERROR_MESSAGES.REQUIRED },
          }}
          render={({ field: { onChange, value } }) => (
            <InputFields
              title="Weight (in kg)"
              placeholder="Enter your weight"
              type={"numeric"}
              value={value}
              keyboardType="numeric"
              isInvalid={errors.weight ? true : false}
              onChangeText={onChange}
              errorText={errors.weight?.message}
            />
          )}
        />
      </View>
      <View style={{ marginTop: 180 }}>
        <StyledButton
          title="Next"
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </ScrollView>
  );
};

export default aboutYou;
