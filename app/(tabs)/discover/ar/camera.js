import {
  StyleSheet,
  View,
  Platform,
  TouchableHighlight,
  Text,
  Modal,
} from "react-native";
import { ArViewerView } from "react-native-ar-viewer";
import RNFS from "react-native-fs";
import { colors } from "../../../../helpers/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { BodyText } from "../../../../components/StyledText";
import { useAuthContext } from "../../../../hooks/useAuthContext";
import { useUsers } from "../../../../hooks/useUsers";
import useDecode from "../../../../hooks/useDecode";
import { useEffect, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator } from "react-native-paper";

const camera = () => {
  const router = useRouter();
  const [localModelPath, setLocalModelPath] = useState("");
  const [showScanSuccess, setshowScanSuccess] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const { user } = useAuthContext();
  const { getStepLogs, onArScan } = useUsers();
  const { getDecodedToken } = useDecode();

  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [points, setPoints] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchDecodedToken = async () => {
      const response = await getDecodedToken();

      if (response.success) {
        setCurrentUser(response?.user);
      }
    };

    fetchDecodedToken();
  }, [user]);

  const fetchStepLogs = async () => {
    if (currentUser && isLoading) {
      const response = await getStepLogs({ user_id: currentUser?.user_id });

      if (response.success) {
        const logs = response.data[0];
        const steps = logs.steps;
        const claimed = logs.claimed;

        if (steps < 10000 || claimed) {
          router.back();
        }
        setPoints(logs);
      }
      setIsLoading(false);
    }
  };

  useFocusEffect(() => {
    fetchStepLogs();
  });

  const loadPath = async () => {
    const modelSrc =
      Platform.OS === "android"
        ? "https://github.com/riderodd/react-native-ar/blob/main/example/src/dice.glb?raw=true"
        : "https://github.com/riderodd/react-native-ar/blob/main/example/src/dice.usdz?raw=true";
    console.log("🚀 ~ modelSrc:", modelSrc);
    const modelPath = `${RNFS.DocumentDirectoryPath}/model.${
      Platform.OS === "android" ? "glb" : "usdz"
    }`;

    const exists = await RNFS.exists(modelPath);

    if (!exists) {
      await RNFS.downloadFile({
        fromUrl: modelSrc,
        toFile: modelPath,
      }).promise;
    }

    setLocalModelPath(modelPath);
  };

  const onModelScanned = async () => {
    const response = await onArScan({ user_id: currentUser?.user_id });

    if (response.success) {
      setshowScanSuccess(true);
      setTimeout(() => {
        setshowScanSuccess(false);
      }, 5000);

      setSuccessMessage(response.message);
    } else {
      router.back();
    }
  };

  useEffect(() => {
    loadPath();
  });

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        <>
          {localModelPath && (
            <ArViewerView
              model={localModelPath}
              style={styles.arView}
              lightEstimation={false}
              disableInstantPlacement
              manageDepth
              allowTranslate
              onModelPlaced={() => {
                setShowInstructions(false);
                onModelScanned();
              }}
              onModelRemoved={() => console.log("model not visible anymore")}
              onError={({ message }) => console.log("Error: ", message)}
              allowRotate
              allowScale
            />
          )}

          {showInstructions && (
            <View
              style={{
                position: "absolute",
                width: "100%",
                top: "65%",
              }}
            >
              <BodyText
                style={{
                  fontSize: 10,
                  color: colors.white,
                  textAlign: "center",
                }}
              >
                Detecting plane, please point at a straight surface. {"\n"} This
                might take some time. Click the screen once the above hand
                disappears.
              </BodyText>
            </View>
          )}

          {showScanSuccess && (
            <Modal animationType="fade" transparent>
              <View
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  position: "absolute",
                  top: 70,
                  left: 70,
                  padding: 5,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={colors.success.normal}
                />
                <BodyText style={{ fontSize: 11 }}>
                  {setSuccessMessage} You can close the camera, {"\n"}or
                  continue viewing.
                </BodyText>
              </View>
            </Modal>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  arView: {
    flex: 1,
  },
  footer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "nowrap",
    flexDirection: "row",
    backgroundColor: "white",
  },
  button: {
    borderColor: "black",
    borderWidth: 1,
    backgroundColor: "white",
    padding: 10,
    margin: 5,
  },
});

export default camera;
