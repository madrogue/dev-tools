// function convertTimestampToDate(timestamp, timezone) {
//   const momentDate = moment.tz(parseInt(timestamp), timezone);
//   return momentDate.format('YYYY-MM-DD HH:mm:ss');
// }

function convertTimestampToDate(timestamp, timezone, format) {
  if (!format) {
    format = 'YYYY-MM-DD HH:mm:ss';
  }

  const momentDate = moment.tz(parseInt(timestamp), timezone);

  return {
    formatted: momentDate.format(format),
    timestamp: momentDate.valueOf(),
    year: momentDate.year(),
    month: momentDate.month() + 1, // Moment.js months are 0-indexed
    day: momentDate.date(),
    hour: momentDate.hour(),
    minute: momentDate.minute(),
    second: momentDate.second(),
    millisecond: momentDate.millisecond()
  };
}

function convertDatePartsToTimestamp(year, month, day, hour, minute, second, millisecond, timezone) {
  const momentDate = moment.tz({
    year: year,
    month: month - 1, // Moment.js months are 0-indexed
    day: day,
    hour: hour,
    minute: minute,
    second: second,
    millisecond: millisecond
  }, timezone);

  return momentDate.valueOf();
}

// Format duration in ms to a human-readable string
function formatDuration(ms) {
  if (isNaN(ms)) return '';
  let absMs = Math.abs(ms);
  const sign = ms < 0 ? '-' : '';
  const days = Math.floor(absMs / (24 * 60 * 60 * 1000));
  absMs %= 24 * 60 * 60 * 1000;
  const hours = Math.floor(absMs / (60 * 60 * 1000));
  absMs %= 60 * 60 * 1000;
  const minutes = Math.floor(absMs / (60 * 1000));
  absMs %= 60 * 1000;
  const seconds = Math.floor(absMs / 1000);
  const milliseconds = absMs % 1000;

  let parts = [];
  if (days) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (seconds) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
  if (milliseconds) parts.push(`${milliseconds} ms`);
  if (parts.length === 0) parts.push('0 ms');
  return sign + parts.join(', ');
}