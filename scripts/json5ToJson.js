function convertJson5ToJson(json5) {
    try {
        // Use a JSON5 parser to convert JSON5 to JSON
        const json = JSON5.parse(json5);
        return JSON.stringify(json, null, 2); // Beautify the JSON output
    } catch (error) {
        console.error("Invalid JSON5 input:", error);
        return null; // Return null if parsing fails
    }
}