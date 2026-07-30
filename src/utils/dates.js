export const formatDate1 = (inputDateString) => {
  const inputDate = new Date(inputDateString);

  // Local current time
  const now = new Date();

  // Strip time from today and yesterday for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Strip time from inputDate
  const inputDateLocal = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
  );

  const options = { day: 'numeric', month: 'short', year: 'numeric' };

  if (inputDateLocal.getTime() === today.getTime()) {
    return 'Today';
  }

  if (inputDateLocal.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  // 7 Oct 2025
  return inputDate.toLocaleDateString('en-GB', options);
};

export const formatDate2 = (inputDateString) => {
  const inputDate = new Date(inputDateString);

  const options = { day: 'numeric', month: 'short', year: 'numeric' };

  // 7 Oct 2025
  return inputDate.toLocaleDateString('en-GB', options);
};

export const getDateGroupLabel = (inputDateString, now = new Date()) => {
  const inputDate = new Date(inputDateString);

  // Strip time (only keep Y/M/D)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inputDateOnly = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
  );

  const diffInMs = today - inputDateOnly;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  }

  if (diffInDays === 1) {
    return 'Yesterday';
  }

  if (diffInDays <= 7) {
    return 'Last 7 Days';
  }

  // Else return month and year like "June 2025"
  return inputDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

export const formateDateInAgo = (inputDateString) => {
  const inputDate = new Date(inputDateString);
  const now = new Date();

  const diffInMs = now - inputDate;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInMinutes < 1) {
    return 'Just now';
  }
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }
  if (diffInHours < 12) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  // Match formatDate1 logic
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  return inputDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const yearMonthDateFilterFormat = (inputDate) => {
  const dateString = new Date(inputDate);
  const yyyy = dateString.getFullYear();
  const mm = String(dateString.getMonth() + 1).padStart(2, '0');
  const dd = String(dateString.getDate()).padStart(2, '0');
  /** return in YYYY/MM/DD format */
  return `${yyyy}-${mm}-${dd}`;
};

export const subtractDaysFromTheCurrentDate = (numberOfDays) => {
  const d = new Date();
  d.setDate(d.getDate() - numberOfDays);

  return d;
};

export const addNDaysForTheGivenDate = (timeStamp, days, returnUTCString) => {
  const d = new Date(timeStamp);
  d.setDate(d.getDate() + days);

  if (returnUTCString) {
    return d.toISOString();
  }

  return d.toString();
};

export const differenceBetweenDays = ({
  startDate, endDate,
}) => {
  // diff in time
  const diffInTime = new Date(endDate).getTime() - new Date(startDate).getTime();
  // To calculate the no. of days between two dates
  return Math.round(diffInTime / (1000 * 3600 * 24));
};

export const getOrdinalSuffix = (day) => {
  if (day % 10 === 1 && day % 100 !== 11) return `${day}st`;
  if (day % 10 === 2 && day % 100 !== 12) return `${day}nd`;
  if (day % 10 === 3 && day % 100 !== 13) return `${day}rd`;
  return `${day}th`;
};

export const isSameWeek = (date1, date2) => {
  const startOfWeek = (date) => {
    const day = date.getDay();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);
  };

  return startOfWeek(date1).getTime() === startOfWeek(date2).getTime();
};
export const isSameMonth = (date1, date2) => date1.getMonth()
  === date2.getMonth() && date1.getFullYear() === date2.getFullYear();

export const formatDateWithTime = (isoTimestamp) => {
  const date = new Date(isoTimestamp);

  // Extract date components in local time
  const day = date.getDate(); // Day of the month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()]; // Month name
  let hours = date.getHours(); // Local hours
  const minutes = date.getMinutes().toString().padStart(2, '0'); // Local minutes
  const seconds = date.getSeconds().toString().padStart(2, '0'); // Local seconds
  const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine AM or PM

  // Convert hours to 12-hour format
  hours = hours % 12 || 12; // Adjust hours for 12-hour format and handle midnight (0 -> 12)

  // Return formatted string: 15 Nov 06:40:15 PM
  return `${day.toString().padStart(2, '0')} ${month} ${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
};

export const formatDateTimeWithYear = (isoTimestamp) => {
  const date = new Date(isoTimestamp);

  const day = date.getDate(); // Day of the month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()]; // Month name
  const year = date.getFullYear(); // Year

  let hours = date.getHours(); // Local hours
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12; // Convert to 12-hour format

  // Return formatted string: 15 Nov 2025 06:40:15 PM
  return `${day.toString().padStart(2, '0')} ${month} ${year} ${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
};

export const formatUTCDate = (dateInput) => {
  const date = new Date(dateInput);

  const weekday = date.toLocaleString('en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  });

  const month = date.toLocaleString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  });

  const day = date.toLocaleString('en-US', {
    day: 'numeric',
    timeZone: 'UTC',
  });

  const year = date.toLocaleString('en-US', {
    year: 'numeric',
    timeZone: 'UTC',
  });

  const time = date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });

  // Output: "Thu, May 29, 2025 at 11:55 AM"
  return `${weekday}, ${month} ${day}, ${year} at ${time} UTC`;
};

export const isExpiredDate = (expiresOn) => new Date(expiresOn) < new Date();
