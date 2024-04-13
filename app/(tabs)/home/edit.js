import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import MainContainer from "../../../components/MainContainer";
import AccountContainer from "../../../components/AccountContainer";
import InputFields from "../../../components/InputFields";
import { useAuthContext } from "../../../hooks/useAuthContext";
import decodeToken from "../../../helpers/decodeToken";
import { BodyText, HeaderText, LinkText } from "../../../components/StyledText";
import { colors } from "../../../helpers/theme";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage, database } from "../../../config";
import { ref as dbRef, set } from "firebase/database";
import { useUsers } from "../../../hooks/useUsers";
import ErrorModal from "../../../components/ErrorModal";
import { useForm, Controller } from "react-hook-form";
import { ERROR_MESSAGES, REGEX } from "../../../helpers/constants";
import DropdownPicker from "../../../components/DropdownPicker";
import StyledButton from "../../../components/StyledButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import StyledDatePicker from "../../../components/StyledDatePicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import firebase from "../../../config";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import useDecode from "../../../hooks/useDecode";
const edit = () => {
  const router = useRouter();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    getValues,
    setValue,
  } = useForm({
    mode: "onSubmit",
    defaultValues: {
      name: "",
      email: "",
      gender: "",
      weight: "",
      height: "",
      dob: "",
      calorie_burn: "",
      calorie_intake: "",
      image: "xyz",
    },
  });

  const [uploading, setUploading] = useState(false);
  const [fileUri, setFileUri] = useState(null);

  const [imageUrl, setImageUrl] = useState("");

  const onUploadImage = async () => {
    setUploading(true);
    // if (!fileUri) {
    const { uri } = await FileSystem.getInfoAsync(imageUrl);

    try {
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          resolve(xhr.response);
        };
        xhr.onerror = (e) => {
          reject(new TypeError("Network request failed."));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      const filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);

      const storageRef = firebase.storage().ref();
      const imageRef = storageRef.child(filename);

      await imageRef.put(blob);

      const downloadURL = await getDownloadURL(imageRef);

      console.log(getValues().image);

      setValue("image", downloadURL);

      console.log(getValues().image);

      setUploading(false);
      return imageRef;
    } catch (error) {
      console.log("🚀 ~ error uploading image:", error);
      setUploading(false);
      setOpenErrorModal(true);
      setModalTitle("Error uploading image");
      setErrorMessage("Please try again later.");
    }
    // } else {
    //   try {
    //     const blob = await new Promise((resolve, reject) => {
    //       const xhr = new XMLHttpRequest();
    //       xhr.onload = () => {
    //         resolve(xhr.response);
    //       };
    //       xhr.onerror = (e) => {
    //         reject(new TypeError("Network request failed."));
    //       };
    //       xhr.responseType = "blob";
    //       xhr.open("GET", fileUri, true);
    //       xhr.send(null);
    //     });

    //     const filename = image.substring(image.lastIndexOf("/") + 1);

    //     const storageRef = firebase.storage().ref();
    //     const imageRef = storageRef.child(filename);

    //     await imageRef.put(blob);
    //     setUploading(false);

    //     await getDownloadURL(imageRef).then((url) => {
    //       setValue("image", url);
    //     });

    //     return imageRef;
    //   } catch (error) {
    //     console.log("🚀 ~ error uploading image:", error);
    //     setUploading(false);
    //     setOpenErrorModal(true);
    //     setModalTitle("Error uploading image");
    //     setErrorMessage("Please try again later.");
    //   }
    // }
  };

  const onPickImage = async () => {
    if (isDisabled) {
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setIsImageChanged(true);
      setImageUrl(result.assets[0].uri);
    }
  };

  const [isPageLoading, setIsPageLoading] = useState(true);

  const [userDetails, setUserDetails] = useState({});

  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const { getUserDetail, updateUserProfile } = useUsers();

  const { user } = useAuthContext();
  const [currentUser, setCurrentUser] = useState(null);

  const { getDecodedToken } = useDecode();

  useEffect(() => {
    const fetchDecodedToken = async () => {
      const response = await getDecodedToken();

      if (response.success) {
        const user = response?.user;
        if (user.role === "trainer") {
          router.back();
          return;
        }
        setCurrentUser(response?.user);
      }
    };

    fetchDecodedToken();
  }, [user]);

  const [isImageChanged, setIsImageChanged] = useState(false);

  const genderOptions = [
    { label: "Select your gender", value: null },
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ];

  const fetchUserDetails = async () => {
    if (currentUser) {
      const response = await getUserDetail({ user_id: currentUser?.user_id });
      if (response.success) {
        const userData = response.data[0];

        setUserDetails(userData);
        reset({
          name: userData?.name,
          gender: userData?.gender,
          email: userData?.email,
          weight: userData?.weight,
          height: userData?.height,
          dob: formatDate(userData?.dob),
          calorie_burn: userData?.calorie_burn,
          calorie_intake: userData?.calorie_intake,
          image: userData?.image,
        });
        setImageUrl(userData?.image);
        setDate(new Date(userData?.dob));
      }
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [currentUser]);

  const onDateChange = ({ type }, selectedDate) => {
    if (type == "set") {
      const currentDate = selectedDate;
      setDate(currentDate);

      if (Platform.OS === "android") {
        setOpenDatePicker(false);
        setValue("dob", formatDate(currentDate));
      }
    } else {
      setOpenDatePicker(false);
    }
  };

  const onIOSDateConfrim = () => {
    setValue("dob", formatDate(currentDate));
    setOpenDatePicker(false);
  };

  function formatDate(date) {
    let current = new Date(date);
    let year = current.getFullYear();
    let month = current.getMonth() + 1;
    let day = current.getDate();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;

    return `${year}-${month}-${day}`;
  }

  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const onEdit = async (data) => {
    setIsDisabled(true);
    setIsLoading(true);

    let imageRef;
    if (isImageChanged) {
      imageRef = await onUploadImage();
    }

    const { name, gender, weight, height, dob, calorie_burn, calorie_intake } =
      data;

    const downloadImageUrl = getValues().image;

    const response = await updateUserProfile({
      user_id: userDetails?.user_id,
      name,
      gender,
      weight,
      height,
      dob,
      calorie_burn,
      calorie_intake,
      image: downloadImageUrl,
    });

    if (response.success) {
      router.back();
    } else {
      setOpenErrorModal(true);
      setErrorMessage(response.message);
      setModalTitle("Error updating profile");
      if (isImageChanged) {
        deleteObject(imageRef)
          .then(() => {})
          .catch((error) => {
            console.log("Error deleting: ", error);
          });
      }
    }
    setIsDisabled(false);
    setIsLoading(false);
    setIsImageChanged(false);
  };

  return (
    <MainContainer padding={15} gap={15}>
      <ErrorModal
        openErrorModal={openErrorModal}
        title={modalTitle}
        message={errorMessage}
        onClose={() => setOpenErrorModal(false)}
        onDismiss={() => setOpenErrorModal(false)}
      />
      {isPageLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={colors.primary.normal} size={"large"} />
        </View>
      ) : (
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AccountContainer size={150} imageURI={imageUrl} />
            <Pressable onPress={onPickImage}>
              <BodyText
                style={{ color: colors.info.normal, marginVertical: 15 }}
              >
                Uplaod Image
              </BodyText>
            </Pressable>
          </View>
          <View style={{ gap: 15 }}>
            <Controller
              control={control}
              disabled={isSubmitting}
              name="name"
              rules={{
                required: { value: true, message: ERROR_MESSAGES.REQUIRED },
                pattern: {
                  value: REGEX.personalName,
                  message: ERROR_MESSAGES.NAME_INVALID,
                },
                validate: (value) => {
                  return !!value.trim() || ERROR_MESSAGES.NAME_INVALID;
                },
              }}
              render={({ field: { onChange, value } }) => (
                <InputFields
                  title="Full Name"
                  placeholder="Enter your full name"
                  value={value}
                  isInvalid={errors.name ? true : false}
                  onChangeText={onChange}
                  errorText={errors.name?.message}
                />
              )}
            />
            <Controller
              control={control}
              disabled={isSubmitting}
              name="email"
              rules={{
                required: { value: true, message: ERROR_MESSAGES.REQUIRED },
                pattern: {
                  value: REGEX.email,
                  message: "Invalid email address.",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <InputFields
                  title="Email Address"
                  placeholder="Enter your email address"
                  value={value}
                  type="email-address"
                  isInvalid={errors.email ? true : false}
                  onChangeText={onChange}
                  errorText={errors.email?.message}
                  isEditable={false}
                />
              )}
            />
            <Controller
              control={control}
              disabled={isSubmitting}
              name="dob"
              rules={{
                required: { value: true, message: ERROR_MESSAGES.REQUIRED },
                min: {
                  value: 10,
                  message: "This height is invalid.",
                },
                max: {
                  value: 100,
                  message: "This height is invalid.",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <StyledDatePicker
                  title="Date of Birth"
                  placeholder={userDetails?.dob}
                  value={value}
                  isInvalid={errors.height ? true : false}
                  onChangeText={onChange}
                  errorText={errors.height?.message}
                  onPress={() => setOpenDatePicker(true)}
                  isEditable={false}
                />
              )}
            />
            {openDatePicker && (
              <DateTimePicker
                mode="date"
                display="spinner"
                value={date}
                onChange={onDateChange}
                maximumDate={new Date()}
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
              name="gender"
              rules={{
                validate: (value) => {
                  if (value === null || value === undefined) {
                    return ERROR_MESSAGES.REQUIRED;
                  }
                  return true;
                },
              }}
              render={({ field: { onChange, value } }) => (
                <DropdownPicker
                  title="Gender"
                  placeholder="Select your gender"
                  options={genderOptions}
                  value={value}
                  onChange={onChange}
                  errorText={errors.gender?.message}
                />
              )}
            />
            <Controller
              control={control}
              disabled={isSubmitting}
              name="weight"
              rules={{
                required: { value: true, message: ERROR_MESSAGES.REQUIRED },
                min: {
                  value: 15,
                  message: "This weight is invalid.",
                },
                max: {
                  value: 300,
                  message: "This weight is invalid.",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <InputFields
                  title="Weight"
                  placeholder="Enter your weight"
                  value={value}
                  isInvalid={errors.weight ? true : false}
                  onChangeText={onChange}
                  errorText={errors.weight?.message}
                  type={"number-pad"}
                />
              )}
            />

            <Controller
              control={control}
              disabled={isSubmitting}
              name="height"
              rules={{
                required: { value: true, message: ERROR_MESSAGES.REQUIRED },
                min: {
                  value: 10,
                  message: "This height is invalid.",
                },
                max: {
                  value: 250,
                  message: "This height is invalid.",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <InputFields
                  title="Height"
                  placeholder="Enter your height"
                  value={value}
                  isInvalid={errors.height ? true : false}
                  onChangeText={onChange}
                  errorText={errors.height?.message}
                  type={"number-pad"}
                />
              )}
            />

            <Controller
              control={control}
              disabled={isSubmitting}
              name="calorie_burn"
              rules={{
                required: { value: true, message: ERROR_MESSAGES.REQUIRED },
                min: {
                  value: 1200,
                  message: "This calorie is invalid.",
                },
                max: {
                  value: 4000,
                  message: "This calorie is invalid.",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <InputFields
                  title="Calorie Burn (cals)"
                  placeholder="Enter your calorie burn"
                  value={value.toString()}
                  isInvalid={errors.calorie_burn ? true : false}
                  onChangeText={onChange}
                  errorText={errors.calorie_burn?.message}
                  type={"number-pad"}
                />
              )}
            />
            <Controller
              control={control}
              disabled={isSubmitting}
              name="calorie_intake"
              rules={{
                required: { value: true, message: ERROR_MESSAGES.REQUIRED },
                min: {
                  value: 1200,
                  message: "This calorie is invalid.",
                },
                max: {
                  value: 4000,
                  message: "This calorie is invalid.",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <InputFields
                  title="Calorie Intake (cals)"
                  placeholder="Enter your calorie intake"
                  value={value.toString()}
                  isInvalid={errors.calorie_burn ? true : false}
                  onChangeText={onChange}
                  errorText={errors.calorie_burn?.message}
                  type={"number-pad"}
                />
              )}
            />
          </View>

          <View
            style={{ flex: 1, justifyContent: "flex-end", marginVertical: 15 }}
          >
            <StyledButton
              style={{ width: "100%" }}
              title={"Edit"}
              onPress={handleSubmit(onEdit)}
              isLoading={isLoading}
              isDisabled={isDisabled}
            />
          </View>
        </KeyboardAwareScrollView>
      )}
    </MainContainer>
  );
};

export default edit;
