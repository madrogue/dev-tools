function convertJsonToJson5(json) {
  try {
    const jsonObject = JSON.parse(json);
    return JSON5.stringify(jsonObject, { space: 2, quote: "\"" }); // Beautified JSON5 output
  } catch (error) {
    console.error("Invalid JSON input:", error);
    return null; // Return null if parsing fails
  }
}