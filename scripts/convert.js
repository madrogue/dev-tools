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
