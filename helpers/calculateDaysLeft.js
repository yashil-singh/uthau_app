function calculateDays(date) {
  const today = new Date();
  const eventDate = new Date(date);
  var differenceInMillis = eventDate.getTime() - today.getTime();
  var daysLeft = Math.ceil(differenceInMillis / (1000 * 3600 * 24));
  return daysLeft;
}

export { calculateDays };
