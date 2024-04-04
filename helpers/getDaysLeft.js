const getDaysLeft = (startDate, endDate) => {
  const start = new Date();
  const end = new Date(endDate);
  const difference = end - start;
  const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));
  return daysLeft;
};

export default getDaysLeft;
