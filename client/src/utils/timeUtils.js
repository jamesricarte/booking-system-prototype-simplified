export const convertTimeTo12HourFormat = (time) => {
  if (time) {
    let [hours, minutes, seconds] = time.split(":").map(Number);
    let period;

    if (hours < 12) {
      period = "AM";
    } else {
      period = "PM";
    }

    hours = hours % 12 || 12;

    return (
      hours.toString().padStart(2, "0") +
      ":" +
      minutes.toString().padStart(2, "0") +
      " " +
      period
    );
  }
};

export const convertUTCDateToSameTimezone = (dateTime) => {
  const localDate = new Date(dateTime);
  const formattedLocalDate = localDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return formattedLocalDate;
};

export const formatUTCDateWithOrdinal = (dateTime) => {
  const localDate = new Date(dateTime);

  const day = localDate.getDate();
  const month = localDate.toLocaleString("en-US", { month: "long" });
  const year = localDate.getFullYear();

  const getOrdinal = (n) => {
    if (n >= 11 && n <= 13) return n + "th";
    const lastDigit = n % 10;
    switch (lastDigit) {
      case 1:
        return n + "st";
      case 2:
        return n + "nd";
      case 3:
        return n + "rd";
      default:
        return n + "th";
    }
  };

  return `${getOrdinal(day)} ${month}, ${year}`;
};

export const convertTimeToMinutes = (time) => {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const bookingTimeToMinutes = (time) => {
  let [hour, minutes, seconds] = time.split(":").map(Number);
  return (hour - 7) * 60 + minutes;
};

export const getDayName = (serverDate) => {
  const dateObj = new Date(serverDate);

  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  return dayName;
};
