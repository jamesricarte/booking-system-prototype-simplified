export const getNearestTimeSlot = () => {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();

  if (minutes < 25) {
    minutes = 0;
  } else if (minutes >= 55) {
    hours++;
    minutes = 0;
  } else {
    minutes = 30;
  }

  return hours * 60 + minutes;
};

export const nearestTimeInTimeSlotFunction = (hours, minutes) => {
  if (minutes < 25) {
    minutes = 0;
  } else if (minutes >= 55) {
    hours++;
    minutes = 0;
  } else {
    minutes = 30;
  }

  return hours * 60 + minutes;
};
