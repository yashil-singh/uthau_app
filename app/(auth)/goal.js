import { View, KeyboardAvoidingView, Platform } from "react-native";
import { BodyText } from "../../components/StyledText";
import { Controller, useForm } from "react-hook-form";
import { useRegisterContext } from "../../hooks/useRegisterContext";
import { useRouter } from "expo-router";
import DropdownPicker from "../../components/DropdownPicker";
import { colors } from "../../helpers/theme";
import StyledButton from "../../components/StyledButton";
import { ERROR_MESSAGES } from "../../helpers/constants";

const goal = () => {
  const { dispatch } = useRegisterContext();
  const router = useRouter();

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm();

  const nextPage = (data) => {
    dispatch({ type: "SET_DATA", payload: data });
    router.push("/confirmation");
  };

  const activityOptions = [
    { label: "Select your activity level", value: null },
    { label: "Not Very Active", value: "Not Active" },
    { label: "Lightly Active", value: "Lightly Active" },
    { label: "Moderately Active", value: "Moderately Active" },
    { label: "Very Active", value: "Very Active" },
  ];

  const weightGoalOptions = [
    { label: "Select your weight goal", value: null },
    { label: "Lose Weight", value: "Lose Weight" },
    { label: "Maintain Weight", value: "Maintain Weight" },
    { label: "Gain Weight", value: "Gain Weight" },
  ];

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
      <View style={{ gap: 15 }}>
        <BodyText style={{ color: colors.gray, fontSize: 16 }}>
          Please select what suits best for you.
        </BodyText>

        <Controller
          control={control}
          name="activityValue"
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
              title="Activity Level"
              placeholder="Select your activity level"
              options={activityOptions}
              value={value?.value}
              onChange={onChange}
              errorText={errors.activityValue?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="weightGoalValue"
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
              title="Weight Goal"
              placeholder="Select your weight goal"
              options={weightGoalOptions}
              value={value?.value}
              onChange={onChange}
              errorText={errors.weightGoalValue?.message}
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

export default goal;
