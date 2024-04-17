import { View, Text, ActivityIndicator, Modal } from "react-native";
import React, { useEffect, useState } from "react";
import MainContainer from "../../../components/MainContainer";
import DropdownPicker from "../../../components/DropdownPicker";
import useGym from "../../../hooks/useGym";
import { colors } from "../../../helpers/theme";
import useDecode from "../../../hooks/useDecode";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { BodyText, HeaderText } from "../../../components/StyledText";
import StyledButton from "../../../components/StyledButton";
import PaymentView from "../../../components/PaymentView";
import usePay from "../../../hooks/usePay";
import ErrorModal from "../../../components/ErrorModal";
import Portal from "react-native-paper/src/components/Portal/Portal";
import { Snackbar } from "react-native-paper";
import { useRouter } from "expo-router";

const payment = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const { getPlans } = useGym();
  const { onInitializePay, onPayMembership, onMemberShipPaymentSuccess } =
    usePay();

  const { getDecodedToken } = useDecode();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planOptions, setPlanOptions] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uri, setUri] = useState("");
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  useEffect(() => {
    const fetchDecodedToken = async () => {
      const response = await getDecodedToken();

      if (response.success) {
        const user = response?.user;

        if (user.role !== "normal") {
          router.back();
        }
        setCurrentUser(response?.user);
        setIsPageLoading(false);
      }
    };

    fetchDecodedToken();
  }, [user]);

  const fetchPlans = async () => {
    if (currentUser) {
      const response = await getPlans();

      const plans = response.plans;

      setPlans(plans);

      const planArray = [{ label: "Select plan", value: null }];
      plans.map((plan) =>
        planArray.push({
          label: `${plan.duration} months`,
          value: plan.plan_id,
        })
      );

      setPlanOptions(planArray);

      if (response.success) {
        setPlans(response.plans);
      }
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [currentUser]);

  function getPlanDetails() {
    return plans.find((plan) => plan.plan_id === selectedPlan);
  }

  const onGetMembership = async () => {
    setIsSubmitting(true);
    setErrorMessage("");
    if (!selectedPlan) {
      setErrorMessage("This field is required.");
    } else {
      const initialize = await onPayMembership({
        plan_id: selectedPlan,
        user_id: currentUser?.user_id,
      });

      if (initialize.success) {
        const order_id = initialize.order_id;
        console.log("🚀 ~ order_id:", order_id);

        const response = await onInitializePay({ order_id });

        if (response.success) {
          setUri(response.uri);
        } else {
          setOpenErrorModal(true);
          setModalErrorMessage(response.message);
          setModalTitle("Error processing payment.");
        }
      } else {
        setOpenErrorModal(true);
        setModalErrorMessage(initialize.message);
        setModalTitle("Error initiating payment.");
      }
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (uri) {
      setOpenPaymentModal(true);
    }
  }, [uri]);

  const onPaymentSuccess = async ({ order_id }) => {
    setOpenPaymentModal(false);
    setUri("");
    const response = await onMemberShipPaymentSuccess({
      user_id: currentUser?.user_id,
      payment_id: order_id,
    });
    console.log("🚀 ~ response:", response);

    const token = response.token;

    if (response.success) {
      setOpenToast(true);
      setToastMessage(response.message);
    } else {
      setOpenErrorModal(true);
      setModalErrorMessage(response.message);
      setModalTitle("There was an error");
    }
  };

  return (
    <>
      {isPageLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.primary.normal} size={"large"} />
        </View>
      ) : openPaymentModal ? (
        <Modal animationType="slide" visible={openPaymentModal}>
          <PaymentView
            uri={uri}
            onClose={() => {
              setUri(null);
              setOpenPaymentModal(false);
            }}
            onPaymentSuccess={onPaymentSuccess}
          />
        </Modal>
      ) : (
        <MainContainer padding={15}>
          <ErrorModal
            title={modalTitle}
            message={modalErrorMessage}
            openErrorModal={openErrorModal}
            onClose={() => {
              setOpenErrorModal(false);
            }}
            onDismiss={() => {
              setOpenErrorModal(false);
            }}
          />

          <DropdownPicker
            placeholder={"Select plan"}
            title={"Plan"}
            options={planOptions}
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.value)}
            errorText={errorMessage}
          />
          <View
            style={{
              marginTop: 15,
              gap: 10,
              flex: 1,
              justifyContent: "flex-end",
            }}
          >
            {selectedPlan && (
              <>
                <HeaderText>Plan Details</HeaderText>
                <BodyText>
                  Duration: {getPlanDetails().duration} months
                </BodyText>
                <BodyText>Amount: Rs. {getPlanDetails().amount}</BodyText>
              </>
            )}

            <StyledButton
              title={"Get Membership"}
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
              onPress={onGetMembership}
            />
          </View>
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
        </MainContainer>
      )}
    </>
  );
};

export default payment;
