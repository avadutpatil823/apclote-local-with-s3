export const formatTime12Hour = (value, fallback = "N/A") => {
  if (!value) {
    return fallback;
  }

  const [hoursText, minutesText = "0"] = String(value).split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return value;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

export const formatTimeRange12Hour = (start, end, fallback = "Time not set") => {
  if (!start && !end) {
    return fallback;
  }

  if (start && end) {
    return `${formatTime12Hour(start)} - ${formatTime12Hour(end)}`;
  }

  return formatTime12Hour(start || end);
};

export const formatDateTime12Hour = (value, fallback = "Not available") => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};
