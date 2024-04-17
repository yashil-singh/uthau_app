import {
  initialize,
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
  requestPermission,
} from "react-native-health-connect";

const useHealthData = () => {
  const getAndroidData = async () => {
    try {
      const status = await getSdkStatus();

      if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
        console.log("NO APP avaiable.");
        return {
          success: false,
          appPresent: false,
        };
      }
      const isInitialized = await initialize();

      if (!isInitialized) {
        console.log("NOT INITIALIZED.");
        return {
          success: false,
          appPresent: false,
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

      let caloriesResult = [];
      let stepsResult;
      let activeCalories;
      try {
        // caloriesResult = await readRecords("TotalCaloriesBurned", {
        //   timeRangeFilter: timeRangeFilter,
        // });

        activeCalories = await readRecords("ActiveCaloriesBurned", {
          timeRangeFilter: timeRangeFilter,
        });

        stepsResult = await readRecords("Steps", {
          timeRangeFilter: timeRangeFilter,
        });
      } catch (error) {
        return {
          success: false,
          appPresent: true,
          permission: false,
        };
      }

      const totalSteps = stepsResult
        .reduce((sum, curr) => sum + curr.count, 0)
        .toFixed();
      const totalCalories = activeCalories
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
