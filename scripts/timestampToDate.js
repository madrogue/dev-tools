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