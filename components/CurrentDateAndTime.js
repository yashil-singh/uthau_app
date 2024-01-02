import React from "react";
import { HeaderText, SubHeaderText } from "./StyledText";
import dayjs from "dayjs";

const CurrentDay = () => {
  return <HeaderText>{dayjs().format("dddd, MMMM DD")}</HeaderText>;
};

const CurrentTime = () => {
  return <SubHeaderText>{dayjs().format("hh:mm")}</SubHeaderText>;
};

export default { CurrentDay, CurrentTime };
