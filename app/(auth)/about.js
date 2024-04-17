import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../helpers/theme";
import DropdownPicker from "../../components/DropdownPicker";
import InputFields from "../../components/InputFields";
import { Controller, useForm } from "react-hook-form";
import { ERROR_MESSAGES } from "../../helpers/constants";
import StyledButton from "../../components/StyledButton";
import { BodyText, HeaderText } from "../../components/StyledText";
import { useRegisterContext } from "../../hooks/useRegisterContext";
import { useState } from "react";
import StyledDatePicker from "../../components/StyledDatePicker";
import { formatDate } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";

const about = () => {
  const { dispatch } = useRegisterContext();
  const router = useRouter();

  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
  } = useForm({
    mode: "onSubmit",
    defaultValues: {
      dob: "",
      gender: null,
      height: "",
      weight: "",
    },
  });

  const genderOptions = [
    { label: "Select your gender", value: null },
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ];

  const nextPage = (data) => {
    dispatch({ type: "SET_DATA", payload: data });
    router.push("/goal");
  };

  const onDateChange = ({ type }, selectedDate) => {
    if (type == "set") {
      const currentDate = selectedDate;
      setDate(currentDate);

      if (Platform.OS === "android") {
        setValue("dob", formatDate(new Date(currentDate), "yyyy-MM-dd"));
        setOpenDatePicker(false);
      }
    } else {
      setOpenDatePicker(false);
    }
  };

  const onIOSDateConfrim = () => {
    setValue("dob", formatDate(currentDate, "yyyy-MM-dd"));
    setOpenDatePicker(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        padding: 25,
        backgroundColor: colors.white,
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1, gap: 15 }}>
        <BodyText style={{ color: colors.gray, fontSize: 16 }}>
          Please answer these correctly.
        </BodyText>

        <Controller
          control={control}
          name="dob"
          rules={{
            required: { value: true, message: ERROR_MESSAGES.REQUIRED },
          }}
          render={({ field: { onChange, value } }) => (
            <>
              <StyledDatePicker
                title="Date of Birth"
                placeholder={"Select your date of birth"}
                value={value}
                isInvalid={errors.height ? true : false}
                onChangeText={onChange}
                errorText={errors.height?.message}
                onPress={() => setOpenDatePicker(true)}
                isEditable={false}
              />
            </>
          )}
        />

        {openDatePicker && (
          <DateTimePicker
            mode="date"
            display="calendar"
            value={date}
            onChange={onDateChange}
            maximumDate={new Date().setFullYear(new Date().getFullYear() - 5)}
          />
        )}
        {openDatePicker && Platform.OS === "ios" && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Pressable onPress={() => setOpenDatePicker(false)}>
              <HeaderText>Cancel</HeaderText>
            </Pressable>
            <StyledButton
              style={{ width: "50%" }}
              title={"Confirm"}
              onPress={onIOSDateConfrim}
            ></StyledButton>
          </View>
        )}

        <Controller
          control={control}
          name="genderValue"
          rules={{
            validate: (value) => {
              if (value?.value === null || value?.value === undefined) {
                return ERROR_MESSAGES.REQUIRED;
              }
              return true; // Validation passed
            },
          }}
          render={({ field: { onChange, value } }) => (
            <DropdownPicker
              title="Gender"
              placeholder="Select your gender"
              options={genderOptions}
              value={value?.value}
              onChange={onChange}
              errorText={errors.genderValue?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="height"
          rules={{
            required: { value: true, message: ERROR_MESSAGES.REQUIRED },
            min: { value: 90, message: "Height must be at least 90cm." },
            max: { value: 250, message: "Height must be at most 250cm." },
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
            min: { value: 15, message: "Weight must be at least 15kg." },
            max: { value: 200, message: "Weight must be at most 200kg." },
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

      <StyledButton
        title="Next"
        isLoading={isSubmitting}
        isDisabled={isSubmitting}
        onPress={handleSubmit(nextPage)}
      />
    </KeyboardAvoidingView>
  );
};

export default about;
