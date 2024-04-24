import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import MainContainer from "../../../components/MainContainer";
import {
  BodyText,
  HeaderText,
  SubHeaderText,
} from "../../../components/StyledText";
import DropdownPicker from "../../../components/DropdownPicker";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useRouter } from "expo-router";
import useGym from "../../../hooks/useGym";
import { colors } from "../../../helpers/theme";
import ErrorModal from "../../../components/ErrorModal";
import useDecode from "../../../hooks/useDecode";

const reports = () => {
  const { user } = useAuthContext();
  const [currentUser, setCurrentUser] = useState(null);

  const { getDecodedToken } = useDecode();

  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const fetchDecodedToken = async () => {
      const response = await getDecodedToken();

      if (response.success) {
        const user = response.user;

        if (user.role !== "member") {
          router.back();
          return;
        }
        setCurrentUser(response?.user);
        setIsPageLoading(false);
      }
    };

    fetchDecodedToken();
  }, [user]);
  const router = useRouter();

  const { getReportYears, getReport, getMemberById } = useGym();

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const [memberDetails, setMemberDetails] = useState({});
  const [years, setYears] = useState([]);
  const [overallGrade, setOverallGrade] = useState("");
  const [report, setReport] = useState([]);

  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorModalTitle, setErrorModalTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateYearOptions = () => {
    const yearOptions = [{ label: "Select year", value: null }];
    for (let year of years) {
      yearOptions.push({ label: year.year.toString(), value: year.year });
    }

    return yearOptions;
  };

  const yearOptions = generateYearOptions();

  const monthOptions = [
    { label: "Select month", value: null },
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  const fetchReport = async () => {
    if (selectedMonth && selectedYear) {
      setIsLoading(true);
      const response = await getReport({
        member_id: memberDetails?.member_id,
        month: selectedMonth,
        year: selectedYear,
      });

      if (response.success) {
        setReport(response.report.reports);
        setOverallGrade(response.report.grade);
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } else {
      return;
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, selectedYear]);

  const fetchYears = async () => {
    const response = await getReportYears();
    if (response.success) {
      setYears(response.years);
    }
  };

  const fetchMemberDetails = async () => {
    if (currentUser) {
      setIsLoading(true);
      const response = await getMemberById({ user_id: currentUser?.user_id });

      if (response.success) {
        const user = response.member;

        if (user.status !== "Active") {
          console.log("status");

          router.back();
          return;
        }

        setMemberDetails(response.member);
      } else {
        setErrorMessage(response.message);
        setErrorModalTitle("Error fetching member details.");
        setOpenErrorModal(true);
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
    fetchMemberDetails();
  }, [currentUser]);

  function formatDateTime(datetime) {
    const date = new Date(datetime);

    function getOrdinalSuffix(day) {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    }

    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    const formattedHours = hours % 12 || 12;

    const ordinalSuffix = getOrdinalSuffix(day);

    const formattedDateTime = `${day}${ordinalSuffix} ${month} ${year}, ${formattedHours}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;
    return formattedDateTime;
  }

  return (
    <MainContainer padding={15} gap={25}>
      <ErrorModal
        openErrorModal={openErrorModal}
        title={errorModalTitle}
        message={errorMessage}
        onClose={() => {
          setOpenErrorModal(false);
          setErrorMessage("");
          setErrorModalTitle("");
        }}
        onDismiss={() => {
          setOpenErrorModal(false);
          setErrorMessage("");
          setErrorModalTitle("");
        }}
      />
      {isPageLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={colors.primary.normal} size={"large"} />
        </View>
      ) : (
        <>
          <View
            style={{
              felx: 1,
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <DropdownPicker
              placeholder="Select month"
              options={monthOptions}
              style={{ width: 200 }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.value)}
            />
            <DropdownPicker
              placeholder="Select year"
              options={yearOptions}
              style={{ width: 150 }}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.value)}
            />
          </View>

          {isLoading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size={"large"} color={colors.primary.normal} />
            </View>
          ) : selectedMonth && selectedYear ? (
            report.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <BodyText
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    color: colors.gray,
                  }}
                >
                  No records found.
                </BodyText>
              </View>
            ) : (
              <>
                <View
                  style={{
                    height: 200,
                    width: 200,
                    borderRadius: 100,
                    borderWidth: 5,
                    borderColor: colors.primary.normal,
                    alignSelf: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <SubHeaderText>Overall</SubHeaderText>
                  <HeaderText style={{ fontSize: 32 }}>
                    {overallGrade}
                  </HeaderText>
                </View>
                <View
                  style={{
                    padding: 15,
                    borderWidth: 1,
                    borderColor: colors.lightGray,
                    borderRadius: 8,
                  }}
                >
                  <HeaderText style={{ fontSize: 18 }}>Grades</HeaderText>
                  {report.map((report, index) => (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                      key={index}
                    >
                      <BodyText>{report?.metric_name}</BodyText>
                      <SubHeaderText>{report?.grade}</SubHeaderText>
                    </View>
                  ))}
                </View>
                <ScrollView
                  style={{
                    padding: 15,
                    borderWidth: 1,
                    borderColor: colors.lightGray,
                    borderRadius: 8,
                    maxHeight: 300,
                  }}
                >
                  <HeaderText style={{ fontSize: 18 }}>
                    Note from Trainer
                  </HeaderText>
                  <View style={{ flex: 1, marginBottom: 15 }}>
                    <BodyText style={{ color: colors.gray }}>
                      {report[0]?.note}
                    </BodyText>
                  </View>
                  <BodyText style={{ color: colors.gray }}>
                    by {memberDetails?.trainer_name}
                  </BodyText>
                </ScrollView>
                <BodyText style={{ color: colors.gray, alignSelf: "flex-end" }}>
                  Created: {formatDateTime(report[0]?.created_at)}
                </BodyText>
              </>
            )
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <BodyText
                style={{
                  color: colors.gray,
                  textAlign: "center",
                  fontSize: 16,
                }}
              >
                Please select month and year to view your report.
              </BodyText>
            </View>
          )}
        </>
      )}
    </MainContainer>
  );
};

export default reports;
