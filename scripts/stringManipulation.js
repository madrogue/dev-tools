function stripNewlines(str) {
  return str.replace(/\r?\n|\r/g, '');
}

function newlinesToLiteral(str) {
  return str.replace(/\r?\n/g, '\\n');
}

function literalToNewlines(str) {
  return str.replace(/\\n/g, '\n');
}

function quoteString(str) {
  return JSON.stringify(str);
}

function unquoteString(str) {
  if (str.startsWith('"') && str.endsWith('"')) {
    str = str.slice(1, -1); // Remove the surrounding quotes
  }

  // Replace common escape sequences
  return str.replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

function toggleQuotes(str) {
  // If starts and ends with double quotes, convert to single quotes
  if (str.startsWith('"') && str.endsWith('"')) {
    return "'" + str.slice(1, -1).replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
  }

  // If starts and ends with single quotes, convert to double quotes
  if (str.startsWith("'") && str.endsWith("'")) {
    return '"' + str.slice(1, -1).replace(/"/g, '\\"').replace(/\\'/g, "'") + '"';
  }

  // Otherwise, try to convert all double quotes to single quotes and vice versa
  return str
    .replace(/"/g, "'")
    .replace(/'/g, '"');
}

function parseStringifiedJson(str) {
  // Trim whitespace
  let cleaned = str.trim();

  // Store original before removing quotes for error display
  const originalWithQuotes = cleaned;

  // Remove outer quotes if present (handling both single and double quotes)
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }

  // Store the version after quote removal but before unescaping
  const afterQuoteRemoval = cleaned;

  // Unescape all common escape sequences to get the actual JSON string
  cleaned = cleaned
    .replace(/\\"/g, '"')       // \" -> "
    .replace(/\\'/g, "'")       // \' -> '
    .replace(/\\n/g, '\n')      // \n -> actual newline
    .replace(/\\r/g, '\r')      // \r -> actual carriage return
    .replace(/\\t/g, '\t')      // \t -> actual tab
    .replace(/\\b/g, '\b')      // \b -> backspace
    .replace(/\\f/g, '\f')      // \f -> form feed
    .replace(/\\\\/g, '\\');    // \\ -> \

  // Try to parse and pretty-print the JSON
  try {
    const parsed = JSON.parse(cleaned);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    // If JSON.parse fails, try JSON5.parse (handles unquoted keys, trailing commas, comments, etc.)
    if (typeof JSON5 !== 'undefined') {
      try {
        const parsed = JSON5.parse(cleaned);
        return JSON.stringify(parsed, null, 2);
      } catch (e5) {
        // JSON5 also failed, continue to error handling
      }
    }

    // If parsing fails, add visual indicators pointing to the error location
    let errorOutput = `/* Failed to parse as valid JSON or JSON5 */\n/* Error: ${e.message} */\n\n`;

    // Try to extract position from error message
    const posMatch = e.message.match(/position (\d+)/);
    if (posMatch) {
      const errorPos = parseInt(posMatch[1]);

      // Map the error position from unescaped back to original stringified version
      // We need to count how many escape sequences exist before the error position
      let originalPos = 0;
      let unescapedPos = 0;

      while (unescapedPos < errorPos && originalPos < afterQuoteRemoval.length) {
        if (afterQuoteRemoval[originalPos] === '\\' && originalPos + 1 < afterQuoteRemoval.length) {
          const nextChar = afterQuoteRemoval[originalPos + 1];
          // Check if this is an escape sequence
          if (nextChar === '"' || nextChar === "'" || nextChar === 'n' || nextChar === 'r' ||
              nextChar === 't' || nextChar === 'b' || nextChar === 'f' || nextChar === '\\') {
            originalPos += 2; // Skip both the backslash and the escaped character
            unescapedPos += 1; // This represents only 1 character in the unescaped version
          } else {
            originalPos += 1;
            unescapedPos += 1;
          }
        } else {
          originalPos += 1;
          unescapedPos += 1;
        }
      }

      // Show original string with adjusted pointer
      errorOutput += `/* Original stringified version:\n`;
      errorOutput += '-'.repeat(originalPos) + 'v' + ' [Error at position ' + originalPos + ']*/\n';
      errorOutput += afterQuoteRemoval + '\n\n';

      // Show unescaped string with original error pointer
      errorOutput += `/* Unescaped version:\n`;
      errorOutput += '-'.repeat(errorPos) + 'v' + ' [Error at position ' + errorPos + ']*/\n';
      errorOutput += cleaned;
    } else {
      // No position found, just show both versions
      errorOutput += `/* Original stringified version: */\n${afterQuoteRemoval}\n\n`;
      errorOutput += `/* Unescaped version: */\n${cleaned}`;
    }

    return errorOutput;
  }
}