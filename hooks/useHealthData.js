import {
  initialize,
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
} from "react-native-health-connect";

const useHealthData = () => {
  const getAndroidData = async () => {
    try {
      const status = await getSdkStatus();

      if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
        console.log("NO APP avaiable.");
        return {
          success: false,
          title: "Health Connect Missing",
          message:
            "Health connect is not installed yet. Please install it from the playstore.",
        };
      }
      const isInitialized = await initialize();

      if (!isInitialized) {
        console.log("NOT INITIALIZED.");
        return {
          success: false,
          title: "Health Connect Missing",
          message:
            "Failed to initialze the Health Connect app. Make sure it is installed and up-to-date.",
        };
      }

      const today = new Date();
      const startTime = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endTime = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const timeRangeFilter = {
        operator: "between",
        startTime: startTime,
        endTime: endTime,
      };

      let caloriesResult;
      let stepsResult;
      try {
        caloriesResult = await readRecords("TotalCaloriesBurned", {
          timeRangeFilter: timeRangeFilter,
        });

        stepsResult = await readRecords("Steps", {
          timeRangeFilter: timeRangeFilter,
        });
      } catch (error) {
        return {
          success: false,
          title: "Permission Required",
          message: "Please grant required permissions from Health Connect.",
        };
      }

      const totalSteps = stepsResult
        .reduce((sum, curr) => sum + curr.count, 0)
        .toFixed();
      const totalCalories = caloriesResult
        .reduce((sum, curr) => sum + curr.energy.inKilocalories, 0)
        .toFixed();

      return { success: true, totalSteps, totalCalories };
    } catch (error) {
      console.log("🚀 ~ error:", error);
      return {
        success: false,
        title: "Error",
        message: "An unexpected error occurred. Try again later.",
      };
    }
  };
  return { getAndroidData };
};

export default useHealthData;
