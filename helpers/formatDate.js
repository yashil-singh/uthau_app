import { format } from "date-fns";

function formatTime(time) {
  if (!time) {
    return;
  }
  const date = new Date(`2000-01-01T${time}`);
  return format(date, "h:mm a");
}

export default formatTime;
