function convertCtoF(celsius) {
  if (!isNaN(celsius)) {
    return ((celsius * 9) / 5 + 32).toFixed(2);
  } else {
    throw new Error("Please enter a valid number for Celsius.");
  }
}

function convertFtoC(fahrenheit) {
  if (!isNaN(fahrenheit)) {
    return (((fahrenheit - 32) * 5) / 9).toFixed(2);
  } else {
    throw new Error("Please enter a valid number for Fahrenheit.");
  }
}

function convertPaToInHg(pascal) {
  if (!isNaN(pascal)) {
    return (pascal * 0.0002953).toFixed(4);
  } else {
    throw new Error("Please enter a valid number for Pascal.");
  }
}

function convertInHgToPa(inHg) {
  if (!isNaN(inHg)) {
    return (inHg / 0.0002953).toFixed(2);
  } else {
    throw new Error("Please enter a valid number for inHg.");
  }
}

function convertMsToTime(milliseconds) {
  if (isNaN(milliseconds)) {
    throw new Error("Please enter a valid number for milliseconds.");
  }

  const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
  milliseconds %= (24 * 60 * 60 * 1000);
  const hours = Math.floor(milliseconds / (60 * 60 * 1000));
  milliseconds %= (60 * 60 * 1000);
  const minutes = Math.floor(milliseconds / (60 * 1000));
  milliseconds %= (60 * 1000);
  const seconds = Math.floor(milliseconds / 1000);
  milliseconds %= 1000;

  return {
    days,
    hours,
    minutes,
    seconds,
    milliseconds
  };
}

function convertTimeToMs(time) {
  const { days, hours, minutes, seconds, milliseconds } = time;

  if (
    isNaN(days) || isNaN(hours) || isNaN(minutes) ||
    isNaN(seconds) || isNaN(milliseconds)
  ) {
    throw new Error("Please enter valid numbers for all time components.");
  }

  const totalMilliseconds = (days * 24 * 60 * 60 * 1000) +
    (hours * 60 * 60 * 1000) +
    (minutes * 60 * 1000) +
    (seconds * 1000) +
    milliseconds;

  return totalMilliseconds;
}