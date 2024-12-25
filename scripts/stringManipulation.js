function stripNewlines(str) {
  return str.replace(/\r?\n|\r/g, '');
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