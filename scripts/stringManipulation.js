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