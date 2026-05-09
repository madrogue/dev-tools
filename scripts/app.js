let leftEditor;
let rightEditor;

let timestampInput = document.getElementById("timestampInput");
let timezoneSelect = document.getElementById("timezoneSelect");
let timestampFormat = document.getElementById("timestampFormat");
let uuidWithDashes = document.getElementById("uuidWithDashes");
let uuidWithoutDashes = document.getElementById("uuidWithoutDashes");

const proxy = URL.createObjectURL(
  new Blob(
    [`
      self.MonacoEnvironment = { baseUrl: 'https://unpkg.com/monaco-editor@latest/min/' };
      importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
    `],
    { type: "text/javascript" }
  )
);

require.config({ paths: { vs: "https://unpkg.com/monaco-editor@latest/min/vs" } });
window.MonacoEnvironment = { getWorkerUrl: () => proxy };

require(["vs/editor/editor.main"], function () {
  //#region Register JSON5 language for monaco editor
  monaco.languages.register({ id: "json5" });

  // Define JSON5 language configuration
  monaco.languages.setMonarchTokensProvider("json5", {
    tokenizer: {
      root: [
        [/[{}]/, "delimiter.bracket"],
        [/[[]]/, "delimiter.array"],
        [/[,:]/, "delimiter"],
        [/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
        [/"/, "string", "@string"],
        [/[a-zA-Z_$][\w$]*/, "identifier"],
        [/\d+/, "number"],
        [/true|false|null/, "keyword"]
      ],
      string: [
        [/[^\\"]+/, "string"],
        [/\\./, "string.escape"],
        [/"/, "string", "@pop"]
      ]
    }
  });

  // Define JSON5 language configuration
  monaco.languages.setLanguageConfiguration("json5", {
    brackets: [
      ["{", "}"],
      ["[", "]"]
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: '"', close: '"' }
    ]
  });
  //#endregion

  onDOMContentLoaded();
});

// Initialization runs inside Monaco's require() callback — no separate DOMContentLoaded listener needed.

function onDOMContentLoaded() {
  console.log(`DOM content loaded`);

  // Initialize the selected tab as active
  const validTabs = ['tools', 'utils'];
  let selectedTab = localStorage.getItem("selectedTab");
  if (!selectedTab || !validTabs.includes(selectedTab)) selectedTab = 'tools';
  openTab(null, selectedTab);

  //#region Initialize timestamp input and timezone select
  // Save input values
  timestampInput.addEventListener("input", function () {
    localStorage.setItem("timestampInput", this.value);
  });

  timezoneSelect.addEventListener("change", function () {
    localStorage.setItem("timezoneSelect", this.value);
  });

  // Restore input values
  timestampInput.value = localStorage.getItem("timestampInput") || "";
  timezoneSelect.value = localStorage.getItem("timezoneSelect") || "America/Chicago";
  //#endregion

  //#region Initialize uuid input
  // Save input values
  uuidWithDashes.addEventListener("input", function () {
    localStorage.setItem("uuidWithDashes", this.value);

    // Update the UUID without dashes input
    uuidWithoutDashes.value = this.value.replace(/-/g, "");
  });

  uuidWithoutDashes.addEventListener("input", function () {
    localStorage.setItem("uuidWithoutDashes", this.value);
  });

  // Restore input values
  uuidWithDashes.value = localStorage.getItem("uuidWithDashes") || "";
  uuidWithoutDashes.value = localStorage.getItem("uuidWithoutDashes") || "";
  //#endregion

  // Add click-to-copy functionality
  document.querySelectorAll(".click-to-copy").forEach(function (element) {
    element.addEventListener("click", function () {
      const text = element.textContent;
      navigator.clipboard
        .writeText(text)
        .then(function () {
          console.log("Copied to clipboard:", text);
        })
        .catch(function (error) {
          console.error("Failed to copy text:", error);
        });
    });
  });

}

function detectAndUpdateBadge(badgeId, text) {
  const badge = document.getElementById(badgeId);
  if (!badge) return;
  const t = (text || '').trim();
  if (!t) { badge.textContent = ''; badge.className = 'format-badge'; return; }
  try {
    JSON.parse(t);
    badge.textContent = 'JSON';
    badge.className = 'format-badge json';
  } catch(e) {
    try {
      JSON5.parse(t);
      badge.textContent = 'JSON5';
      badge.className = 'format-badge json5';
    } catch(e5) {
      badge.textContent = 'TEXT';
      badge.className = 'format-badge text';
    }
  }
}

function initializeEditor(editorId, language) {
  const editor = monaco.editor.create(document.getElementById(editorId), {
    value: '',
    language: language,
    theme: "vs-dark",
    folding: true
  });

  editor.setValue(localStorage.getItem(editorId) || "");
  const badgeId = editorId === 'leftEditor' ? 'leftFormatBadge' : 'rightFormatBadge';
  detectAndUpdateBadge(badgeId, editor.getValue());

  editor.onDidChangeModelContent(() => {
    localStorage.setItem(editorId, editor.getValue());
    detectAndUpdateBadge(badgeId, editor.getValue());
  });

  return editor;
}

function openTab(evt, tabName) {
  let i;
  let tabcontent;
  let tablinks;

  console.log(`Opening tab: ${tabName}`);

  // Hide all tab contents
  tabcontent = document.getElementsByClassName("tab-content");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].classList.remove("active");
  }

  // Remove the active class from all tab buttons
  tablinks = document.getElementsByClassName("tab-button");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }

  // Show the current tab and add an "active" class to the button that opened the tab
  document.getElementById(tabName).classList.add("active");
  if (evt) {
    evt.currentTarget.classList.add("active");
  } else {
    const btn = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
    if (btn) btn.classList.add("active");
  }

  // Initialize editors for the tools tab (lazy, only on first visit)
  if (tabName === "tools") {
    if (!leftEditor) {
      leftEditor = initializeEditor("leftEditor", "json");
    }
    if (!rightEditor) {
      rightEditor = initializeEditor("rightEditor", "json");
    }
    execute_onToolChange();
  }

  // Save the selected tab to localStorage
  localStorage.setItem("selectedTab", tabName);
}

function tidyEditor(editor) {
  editor.trigger("anyString", "editor.action.formatDocument");
}

document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.key === "k") {
    document.addEventListener("keydown", function (e) {
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        if (leftEditor) tidyEditor(leftEditor);
      }
    }, { once: true });
  }
});

function copyFromEditor(editor) {
  const value = editor.getValue();
  navigator.clipboard.writeText(value).then(() => {
    console.log('Text copied to clipboard');
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

function pasteToEditor(editor, callback) {
  navigator.clipboard.readText().then(text => {
    editor.setValue(text);
    if (callback) {
      callback();
    }
  }).catch(err => {
    console.error('Failed to read clipboard contents: ', err);
  });
}

function copyTimestamp() {
  const timestampInputValue = timestampInput.value;
  navigator.clipboard.writeText(timestampInputValue).then(() => {
    console.log('Timestamp copied to clipboard');
  }).catch(err => {
    console.error('Failed to copy timestamp: ', err);
  });
}

function pasteTimestamp() {
  navigator.clipboard.readText().then(text => {
    timestampInput.value = text;
    execute_convertTimestampToDate();
  }).catch(err => {
    console.error('Failed to read clipboard contents: ', err);
  });
}

//#region Editor copy/paste buttons
document.getElementById('pasteLeftButton').addEventListener('click', function () {
  pasteToEditor(leftEditor, function() {
    autoDetectKeyFormatAndSwitch();
    autoDetectJsonToolAndSwitch();
    execute_applyTool();
  });
});
document.getElementById('copyLeftButton').addEventListener('click', function () {
  copyFromEditor(leftEditor);
});
document.getElementById('pasteRightButton').addEventListener('click', function () {
  pasteToEditor(rightEditor);
});
document.getElementById('copyRightButton').addEventListener('click', function () {
  copyFromEditor(rightEditor);
});
//#endregion

//#region Timestamp copy/paste buttons
document.getElementById('copyTimestampButton').addEventListener('click', function () {
  copyTimestamp();
});

document.getElementById('pasteTimestampButton').addEventListener('click', function () {
  pasteTimestamp();
});

document.getElementById('pasteCurrentButton').addEventListener('click', function () {
  const currentTimestamp = moment().valueOf();
  timestampInput.value = currentTimestamp;
  execute_convertTimestampToDate();
});
//#endregion

function copyToClipboard(elementId) {
  const copyText = document.getElementById(elementId).value;
  navigator.clipboard.writeText(copyText).then(() => {
    console.log('Copied to clipboard:', copyText);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

// Language modes for each tool: [leftLang, rightLang]
const toolLanguageModes = {
  jsonToJson5:              ['json',      'json5'],
  json5ToJson:              ['json5',     'json'],
  parseGraylog:             ['plaintext', 'json'],
  parseStringifiedJson:     ['plaintext', 'json'],
  stripNewlines:            ['plaintext', 'plaintext'],
  newlinesToLiteral:        ['plaintext', 'plaintext'],
  literalToNewlines:        ['plaintext', 'plaintext'],
  quoteString:              ['plaintext', 'plaintext'],
  unquoteString:            ['plaintext', 'plaintext'],
  toggleQuotes:             ['plaintext', 'plaintext'],
  analyzeJson:              ['json',      'plaintext'],
  flatToWrapped:            ['json',      'json'],
  wrappedToFlat:            ['json',      'json'],
  rewrap:                   ['json',      'json'],
};

function execute_onToolChange() {
  if (!leftEditor || !rightEditor) return;
  const tool = document.getElementById('toolFunctionSelect').value;
  const [leftLang, rightLang] = toolLanguageModes[tool] || ['json', 'json'];
  monaco.editor.setModelLanguage(leftEditor.getModel(), leftLang);
  monaco.editor.setModelLanguage(rightEditor.getModel(), rightLang);
  document.getElementById('validationResult').textContent = '';
  document.getElementById('validationResult').className = 'validation-result';
}

function execute_applyTool() {
  const fn = document.getElementById('toolFunctionSelect').value;
  switch (fn) {
    // JSON group
    case 'jsonToJson5':            execute_convertJsonToJson5(); break;
    case 'json5ToJson':            execute_convertJson5ToJson(); break;
    case 'parseGraylog':           execute_parseGraylogMessage(); break;
    case 'analyzeJson':            execute_analyzeJson(); break;
    // Key Transform group
    case 'flatToWrapped':          execute_keyTransform(); break;
    case 'wrappedToFlat':          execute_keyTransform(); break;
    case 'rewrap':                 execute_keyTransform(); break;
    // Text group
    case 'stripNewlines':          execute_applyStringManipulation(); break;
    case 'newlinesToLiteral':      execute_applyStringManipulation(); break;
    case 'literalToNewlines':      execute_applyStringManipulation(); break;
    case 'quoteString':            execute_applyStringManipulation(); break;
    case 'unquoteString':          execute_applyStringManipulation(); break;
    case 'toggleQuotes':           execute_applyStringManipulation(); break;
    case 'parseStringifiedJson':   execute_applyStringManipulation(); break;
    // Schema group
    case 'generateJsonSchema':           execute_generateJsonSchema(); break;
    case 'generateFormSchema':           execute_generateFormSchema(); break;
    case 'generateDalMap':               execute_generateDalMap(); break;
    case 'flattenNestedSchema':          execute_flattenNestedSchema(); break;
    case 'mergeSchemas':                 execute_mergeSchemas(); break;
    case 'schemaDiff':                   execute_schemaDiff(); break;
    case 'generateTypeScript':           execute_generateTypeScript(); break;
    case 'generateOpenApi':              execute_generateOpenApi(); break;
    case 'generateMockData':             execute_generateMockData(); break;
    case 'generateCsvTemplate':          execute_generateCsvTemplate(); break;
    case 'simplifySchema':               execute_simplifySchema(); break;
    case 'generateTableComponent':       execute_generateTableComponent(); break;
    case 'validateObjectAgainstSchema':  execute_validateObjectAgainstSchema(); break;
    case 'generateObjectFromSchema':     execute_generateObjectFromSchema(); break;
  }
}

function execute_convertJsonToJson5() {
  const result = convertJsonToJson5(leftEditor.getValue());
  if (result !== null) rightEditor.setValue(result);
  else showValidationResult('Invalid JSON — could not convert.', 'error');
}

function execute_convertJson5ToJson() {
  const result = convertJson5ToJson(leftEditor.getValue());
  if (result !== null) rightEditor.setValue(result);
  else showValidationResult('Invalid JSON5 — could not convert.', 'error');
}

function execute_copyRightToLeft() {
  const fn = document.getElementById('toolFunctionSelect').value;
  if (fn === 'jsonToJson5') {
    const result = convertJson5ToJson(rightEditor.getValue());
    if (result !== null) leftEditor.setValue(result);
    else showValidationResult('Invalid JSON5 — could not convert.', 'error');
  } else if (fn === 'json5ToJson') {
    const result = convertJsonToJson5(rightEditor.getValue());
    if (result !== null) leftEditor.setValue(result);
    else showValidationResult('Invalid JSON — could not convert.', 'error');
  } else {
    leftEditor.setValue(rightEditor.getValue());
  }
}

function getDepth(obj, depth) {
  depth = depth || 0;
  if (typeof obj !== 'object' || obj === null) return depth;
  const children = Array.isArray(obj) ? obj : Object.values(obj);
  if (children.length === 0) return depth;
  return Math.max.apply(null, children.map(function(v) { return getDepth(v, depth + 1); }));
}

function execute_analyzeJson() {
  const input = leftEditor.getValue().trim();
  if (!input) { showValidationResult('No input.', 'error'); return; }

  let parsed, detectedFormat;
  try {
    parsed = JSON.parse(input);
    detectedFormat = 'JSON';
  } catch (e) {
    try {
      parsed = JSON5.parse(input);
      detectedFormat = 'JSON5';
    } catch (e5) {
      showValidationResult('Parse error: ' + e5.message, 'error');
      return;
    }
  }

  const lines = [];
  const byteSize = new Blob([input]).size;
  const topType = Array.isArray(parsed) ? 'array' : (parsed === null ? 'null' : typeof parsed);

  lines.push('Format:         ' + detectedFormat);
  lines.push('Size:           ~' + byteSize.toLocaleString() + ' bytes');
  lines.push('Top-level type: ' + topType);

  if (topType === 'array') {
    lines.push('Item count:     ' + parsed.length);
    if (parsed.length === 0) {
      lines.push('(empty array)');
    } else {
      const typeSet = {};
      parsed.forEach(function(item) {
        const t = Array.isArray(item) ? 'array' : (item === null ? 'null' : typeof item);
        typeSet[t] = (typeSet[t] || 0) + 1;
      });
      const typeDesc = Object.entries(typeSet).map(function(e) {
        return parsed.length === e[1] ? e[0] + ' (all)' : e[0] + ' ×' + e[1];
      }).join(', ');
      lines.push('Item types:     ' + typeDesc);

      const objs = parsed.filter(function(item) {
        return typeof item === 'object' && item !== null && !Array.isArray(item);
      });

      if (objs.length > 0) {
        const keySets = objs.map(function(item) { return Object.keys(item); });
        const union = Array.from(new Set([].concat.apply([], keySets)));
        const intersection = union.filter(function(k) {
          return keySets.every(function(ks) { return ks.indexOf(k) !== -1; });
        });

        lines.push('');
        lines.push('Keys (union, ' + union.length + ' total):');
        lines.push('  ' + union.join(', '));
        lines.push('Keys in every item (' + intersection.length + '):');
        lines.push('  ' + (intersection.length ? intersection.join(', ') : '(none)'));

        const optional = union.filter(function(k) { return intersection.indexOf(k) === -1; });
        if (optional.length > 0) {
          lines.push('Optional keys:');
          optional.forEach(function(k) {
            const count = objs.filter(function(item) { return k in item; }).length;
            lines.push('  ' + k + ' — present in ' + count + '/' + objs.length + ' items');
          });
        }

        const nullCounts = {};
        objs.forEach(function(item) {
          Object.entries(item).forEach(function(e) {
            if (e[1] === null || e[1] === undefined) {
              nullCounts[e[0]] = (nullCounts[e[0]] || 0) + 1;
            }
          });
        });
        if (Object.keys(nullCounts).length > 0) {
          lines.push('Keys with null values:');
          Object.entries(nullCounts).forEach(function(e) {
            lines.push('  ' + e[0] + ' — null in ' + e[1] + '/' + objs.length + ' items');
          });
        }

        const depths = objs.map(function(item) { return getDepth(item); });
        const minD = Math.min.apply(null, depths);
        const maxD = Math.max.apply(null, depths);
        const avgD = (depths.reduce(function(a, b) { return a + b; }, 0) / depths.length).toFixed(1);
        lines.push('');
        lines.push('Depth: min=' + minD + ', max=' + maxD + ', avg=' + avgD);

        ['__key', '$id'].forEach(function(field) {
          const vals = objs.filter(function(item) { return field in item; }).map(function(item) { return item[field]; });
          if (vals.length === 0) return;
          const seen = {};
          vals.forEach(function(v) { seen[v] = (seen[v] || 0) + 1; });
          const dups = Object.entries(seen).filter(function(e) { return e[1] > 1; });
          lines.push('');
          if (dups.length > 0) {
            lines.push('Duplicate ' + field + ' values (' + dups.length + '):');
            dups.forEach(function(e) { lines.push('  "' + e[0] + '" appears ' + e[1] + ' times'); });
          } else {
            lines.push(field + ': ' + vals.length + ' unique values (no duplicates)');
          }
        });
      }
    }
  } else if (topType === 'object') {
    const keys = Object.keys(parsed);
    lines.push('Key count:      ' + keys.length);
    lines.push('');
    lines.push('Value types per key:');
    keys.forEach(function(k) {
      const v = parsed[k];
      const t = Array.isArray(v) ? 'array[' + v.length + ']' : (v === null ? 'null' : typeof v);
      lines.push('  ' + k + ': ' + t);
    });
    lines.push('');
    lines.push('Depth: ' + getDepth(parsed));
  } else {
    lines.push('Value: ' + JSON.stringify(parsed));
  }

  rightEditor.setValue(lines.join('\n'));
  showValidationResult('Analysis complete!', 'success');
}

function execute_keyTransform() {
  const fn = document.getElementById('toolFunctionSelect').value;
  try {
    const input = leftEditor.getValue().trim();
    if (!input) { showValidationResult('No input.', 'error'); return; }
    let arr;
    try { arr = JSON.parse(input); } catch(e) { arr = JSON5.parse(input); }
    if (!Array.isArray(arr)) {
      showValidationResult('Input must be a JSON array.', 'error');
      return;
    }
    let result;
    if (fn === 'flatToWrapped') {
      result = flatToWrapped(arr, 'v');
    } else if (fn === 'wrappedToFlat') {
      result = wrappedToFlat(arr);
    } else if (fn === 'rewrap') {
      const fmt = detectKeyFormat(arr);
      if (fmt === 'v') result = rewrapKeys(arr, 'v', 'value');
      else if (fmt === 'value') result = rewrapKeys(arr, 'value', 'v');
      else { showValidationResult('Cannot detect wrap key (expected "v" or "value").', 'error'); return; }
    }
    rightEditor.setValue(JSON.stringify(result, null, 2));
    showValidationResult('Transform complete!', 'success');
  } catch (e) {
    showValidationResult('Error: ' + e.message, 'error');
  }
}

function autoDetectKeyFormatAndSwitch() {
  const keyTransformTools = ['flatToWrapped', 'wrappedToFlat', 'rewrap'];
  const select = document.getElementById('toolFunctionSelect');
  if (keyTransformTools.indexOf(select.value) === -1) return;
  try {
    const text = leftEditor.getValue().trim();
    let arr;
    try { arr = JSON.parse(text); } catch(e) { arr = JSON5.parse(text); }
    if (!Array.isArray(arr)) return;
    const fmt = detectKeyFormat(arr);
    if (fmt === 'flat') select.value = 'flatToWrapped';
    else if (fmt === 'v' || fmt === 'value') select.value = 'wrappedToFlat';
    execute_onToolChange();
  } catch (e) {}
}

function autoDetectJsonToolAndSwitch() {
  const jsonTools = ['jsonToJson5', 'json5ToJson'];
  const select = document.getElementById('toolFunctionSelect');
  if (jsonTools.indexOf(select.value) === -1) return;
  const text = leftEditor.getValue().trim();
  if (!text) return;
  try {
    JSON.parse(text);
    select.value = 'jsonToJson5';
    execute_onToolChange();
  } catch(e) {
    try {
      JSON5.parse(text);
      select.value = 'json5ToJson';
      execute_onToolChange();
    } catch(e5) {}
  }
}

function execute_applyStringManipulation() {
  const fn = document.getElementById('toolFunctionSelect').value;
  const input = leftEditor.getValue();
  const fnMap = {
    stripNewlines:        stripNewlines,
    newlinesToLiteral:    newlinesToLiteral,
    literalToNewlines:    literalToNewlines,
    quoteString:          quoteString,
    unquoteString:        unquoteString,
    toggleQuotes:         toggleQuotes,
    parseStringifiedJson: parseStringifiedJson,
  };
  const output = fnMap[fn] ? fnMap[fn](input) : input;
  rightEditor.setValue(output);
}

function execute_convertTimestampToDate() {
  const timestampInputValue = timestampInput.value;
  const timezone = timezoneSelect.value;
  const format = timestampFormat.value || "YYYY-MM-DD HH:mm:ss.SSS";

  const result = convertTimestampToDate(timestampInputValue, timezone, format);

  document.getElementById("dateOutput").value = result.formatted;

  document.getElementById("yearInput").value = result.year;
  document.getElementById("monthInput").value = result.month;
  document.getElementById("dayInput").value = result.day;
  document.getElementById("hourInput").value = result.hour;
  document.getElementById("minuteInput").value = result.minute;
  document.getElementById("secondInput").value = result.second;
  document.getElementById("millisecondInput").value = result.millisecond;

  // Populate the table with the converted date values
  document.getElementById('timestampDisplayMilliseconds').textContent = result.timestamp;
  document.getElementById('timestampDisplayFormat').textContent = result.formatted;
  document.getElementById('timestampDisplayGmt').textContent = moment.utc(result.timestamp).format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
  document.getElementById('timestampDisplayLocal').textContent = moment.tz(result.timestamp, timezone).format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)');
  document.getElementById('timestampDisplayRelative').textContent = moment(result.timestamp).fromNow();

  const ms = parseInt(document.getElementById('timestampInput').value);
  if (!isNaN(ms)) {
    document.getElementById('timestampDisplayDuration').textContent = formatDuration(ms);
  } else {
    document.getElementById('timestampDisplayDuration').textContent = '';
  }
}

function execute_convertDatePartsToTimestamp() {
  const timezone = timezoneSelect.value;
  const format = timestampFormat.value || "YYYY-MM-DD HH:mm:ss.SSS";

  const year = parseInt(document.getElementById("yearInput").value);
  const month = parseInt(document.getElementById("monthInput").value);
  const day = parseInt(document.getElementById("dayInput").value);
  const hour = parseInt(document.getElementById("hourInput").value);
  const minute = parseInt(document.getElementById("minuteInput").value);
  const second = parseInt(document.getElementById("secondInput").value);
  const millisecond = parseInt(document.getElementById("millisecondInput").value);

  const timestamp = convertDatePartsToTimestamp(year, month, day, hour, minute, second, millisecond, timezone);

  timestampInput.value = timestamp;

  // Populate the table with the converted date values
  document.getElementById('timestampDisplayMilliseconds').textContent = timestamp;
  document.getElementById('timestampDisplayFormat').textContent = moment.tz(timestamp, timezone).format(format);
  document.getElementById('timestampDisplayGmt').textContent = moment.utc(timestamp).format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
  document.getElementById('timestampDisplayLocal').textContent = moment.tz(timestamp, timezone).format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)');
  document.getElementById('timestampDisplayRelative').textContent = moment(timestamp).fromNow();
}

function execute_refreshUuid() {
  const uuidValue = generateUUID();
  document.getElementById("uuidWithDashes").value = uuidValue.uuid;
  document.getElementById("uuidWithoutDashes").value = uuidValue.uuidWithoutDashes;
}

function execute_convertCtoF() {
  const celsius = parseFloat(document.getElementById("cInput").value);
  try {
    const fahrenheit = convertCtoF(celsius);
    document.getElementById("fInput").value = fahrenheit;
  } catch (error) {
    alert(error.message);
  }
}

function execute_convertFtoC() {
  const fahrenheit = parseFloat(document.getElementById("fInput").value);
  try {
    const celsius = convertFtoC(fahrenheit);
    document.getElementById("cInput").value = celsius;
  } catch (error) {
    alert(error.message);
  }
}

function execute_convertPaToInHg() {
  const pascal = parseFloat(document.getElementById("paInput").value);
  try {
    const inHg = convertPaToInHg(pascal);
    document.getElementById("inHgInput").value = inHg;
  } catch (error) {
    alert(error.message);
  }
}

function execute_convertInHgToPa() {
  const inHg = parseFloat(document.getElementById("inHgInput").value);
  try {
    const pascal = convertInHgToPa(inHg);
    document.getElementById("paInput").value = pascal;
  } catch (error) {
    alert(error.message);
  }
}

function execute_convertTimeToMs() {
  const days = parseInt(document.getElementById('daysInput').value) || 0;
  const hours = parseInt(document.getElementById('hoursInput').value) || 0;
  const minutes = parseInt(document.getElementById('minutesInput').value) || 0;
  const seconds = parseInt(document.getElementById('secondsInput').value) || 0;
  const milliseconds = parseInt(document.getElementById('millisecondsInput2').value) || 0;

  const time = { days, hours, minutes, seconds, milliseconds };

  try {
    const totalMilliseconds = convertTimeToMs(time);
    document.getElementById('millisecondsInput').value = totalMilliseconds;
  } catch (error) {
    alert(error.message);
  }
}

function execute_convertMsToTime() {
  const milliseconds = parseInt(document.getElementById('millisecondsInput').value);
  try {
    const result = convertMsToTime(milliseconds);

    document.getElementById('daysInput').value = result.days;
    document.getElementById('hoursInput').value = result.hours;
    document.getElementById('minutesInput').value = result.minutes;
    document.getElementById('secondsInput').value = result.seconds;
    document.getElementById('millisecondsInput2').value = result.milliseconds;
  } catch (error) {
    alert(error.message);
  }
}

function execute_parseGraylogMessage() {
  let input = "";
  try {
    input = leftEditor.getValue();

    // Split input into lines, but process as a single string to handle multi-line pastes
    // We'll scan for all message={...} objects using a brace counter
    const results = [];
    let idx = 0;
    while (idx < input.length) {
      const msgStart = input.indexOf('message={', idx);
      if (msgStart === -1) break;

      // To reliably extract the message={...} JSON object (even with nested braces),
      // we need a parser that matches balanced braces, since regex alone can't do this perfectly.
      // However, for the Graylog format (where "message={"" always starts a JSON object and
      // is followed by a comma or end of string), we can use a simple brace counter.

      // Find the full message object by counting braces
      let braceCount = 0;
      let inMessage = false;
      let startIdx = -1;
      let endIdx = -1;
      for (let i = msgStart + 8; i < input.length; i++) { // +8 to land on the '='
        if (!inMessage && input[i] === '{') {
          inMessage = true;
          braceCount = 1;
          startIdx = i;
          continue;
        }
        if (inMessage) {
          if (input[i] === '{') braceCount++;
          if (input[i] === '}') braceCount--;
          if (braceCount === 0) {
            endIdx = i;
            break;
          }
        }
      }

      if (startIdx === -1 || endIdx === -1) {
        // Could not extract, skip to next
        idx = msgStart + 9;
        continue;
      }

      const messageStr = input.substring(startIdx, endIdx + 1);

      // Parse the JSON inside message={}
      let messageObj;
      try {
        messageObj = JSON5.parse(messageStr);
        results.push(messageObj);
      } catch (e) {
        results.push({ error: `Parse error: ${e.message}`, raw: messageStr });
      }

      idx = endIdx + 1;
    }

    if (results.length === 0) {
      rightEditor.setValue('No message objects found.');
      return;
    }

    // Output all message objects as formatted JSON array if more than one, or single object
    rightEditor.setValue(
      results.length === 1
        ? JSON.stringify(results[0], null, 2)
        : JSON.stringify(results, null, 2)
    );
  } catch (e) {
    rightEditor.setValue("Parse error:\n" + e.message);
  }
}

function execute_generateJsonSchema() {
  try {
    const obj = JSON.parse(leftEditor.getValue());
    const schema = objectToJsonSchema(obj);
    rightEditor.setValue(JSON.stringify(schema, null, 2));
    showValidationResult('Schema generated!', 'success');
  } catch (e) {
    showValidationResult('Invalid object: ' + e.message, 'error');
  }
}

function execute_generateFormSchema() {
  try {
    let input = leftEditor.getValue();
    let obj = JSON.parse(input);
    let jsonSchema;

    // Check if input is already a JSON schema (has 'type' and 'properties')
    if (obj.type === 'object' && obj.properties) {
      jsonSchema = obj;
    } else {
      // Generate JSON schema from object
      jsonSchema = objectToJsonSchema(obj);
    }

    const formSchema = generateFormSchema(jsonSchema);
    rightEditor.setValue(JSON.stringify(formSchema, null, 2));
    showValidationResult('Form schema generated!', 'success');
  } catch (e) {
    showValidationResult('Generation error: ' + e.message, 'error');
  }
}

function execute_validateObjectAgainstSchema() {
  if (!window.Ajv7) {
    showValidationResult('AJV library not loaded — validation unavailable.', 'error');
    return;
  }
  try {
    const obj = JSON.parse(leftEditor.getValue());
    const schema = JSON.parse(rightEditor.getValue());
    const ajv = new window.Ajv7({ allErrors: true, strict: false });
    const validate = ajv.compile(schema);
    const valid = validate(obj);
    if (valid) {
      showValidationResult('Valid!', 'success');
    } else {
      showValidationResult('Invalid: ' + ajv.errorsText(validate.errors), 'error');
    }
  } catch (e) {
    showValidationResult('Validation error: ' + e.message, 'error');
  }
}

function execute_generateDalMap() {
  try {
    const obj = JSON.parse(leftEditor.getValue());

    // For DAL map, we just need the top-level keys of the object
    // Assuming the object is a flat key-value structure
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      throw new Error('Input must be a JSON object');
    }
    const dalMap = Object.keys(obj);

    rightEditor.setValue(JSON.stringify(dalMap, null, 2));
    showValidationResult('DAL map generated!', 'success');
  } catch (e) {
    showValidationResult('Generation error: ' + e.message, 'error');
  }
}

function execute_generateObjectFromSchema() {
  if (!window.jsf) {
    showValidationResult('json-schema-faker not loaded — generation unavailable.', 'error');
    return;
  }
  try {
    const schema = JSON.parse(rightEditor.getValue());
    const obj = window.jsf.generate(schema);
    leftEditor.setValue(JSON.stringify(obj, null, 2));
    showValidationResult('Object generated!', 'success');
  } catch (e) {
    showValidationResult('Generation error: ' + e.message, 'error');
  }
}

function showValidationResult(msg, type) {
  const el = document.getElementById('validationResult');
  el.textContent = msg;
  el.className = 'validation-result ' + type;
}

// Generate a form schema from a JSON schema
function generateFormSchema(jsonSchema) {
  const formSchema = {
    component: "FORM",
    container: "main",
    data: "params",
    values: "data:load/{{__key}}",
    mask: true,
    schema: {
      json: jsonSchema,
      ui: {}
    },
    buttons: [
      {
        text: "Close",
        icon: "fas:times-circle",
        align: "right",
        onClick: {
          action: "close"
        }
      },
      {
        text: "Save",
        icon: "fas:check-circle",
        align: "right",
        onClick: {
          action: "post",
          target: {
            uri: "data:save"
          },
          params: "{{{{$values}}}}",
          options: {
            validate: true,
            close: true
          }
        }
      }
    ]
  };

  // Generate basic UI schema from JSON schema properties
  if (jsonSchema.properties) {
    for (const [key, prop] of Object.entries(jsonSchema.properties)) {
      const uiField = {};

      // Determine field type based on JSON schema type
      const propType = Array.isArray(prop.type) ? prop.type[0] : prop.type;

      // Add title
      uiField["ui:title"] = prop.title || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');

      // Determine field widget
      switch(propType) {
        case 'string':
          uiField["ui:field"] = "text";
          break;
        case 'number':
        case 'integer':
          uiField["ui:field"] = "numeric";
          break;
        case 'boolean':
          uiField["ui:field"] = "checkbox";
          break;
        case 'array':
          uiField["ui:field"] = "array";
          break;
        case 'object':
          uiField["ui:field"] = "object";
          break;
      }

      // Add default value if present
      if (prop.default !== undefined) {
        uiField["ui:default"] = prop.default;
      }

      formSchema.schema.ui[key] = uiField;
    }
  }

  return formSchema;
}

function execute_flattenNestedSchema() {
  try {
    const schema = JSON.parse(leftEditor.getValue());
    const flattened = flattenSchema(schema);
    rightEditor.setValue(JSON.stringify(flattened, null, 2));
    showValidationResult('Schema flattened!', 'success');
  } catch (e) {
    showValidationResult('Error: ' + e.message, 'error');
  }
}

function execute_mergeSchemas() {
  try {
    const schema1 = JSON.parse(leftEditor.getValue());
    const schema2 = JSON.parse(rightEditor.getValue());
    const merged = mergeSchemas(schema1, schema2);
    rightEditor.setValue(JSON.stringify(merged, null, 2));
    showValidationResult('Schemas merged!', 'success');
  } catch (e) {
    showValidationResult('Error: ' + e.message, 'error');
  }
}

function execute_schemaDiff() {
  try {
    const schema1 = JSON.parse(leftEditor.getValue());
    const schema2 = JSON.parse(rightEditor.getValue());
    const diff = schemaDiff(schema1, schema2);
    rightEditor.setValue(JSON.stringify(diff, null, 2));
    showValidationResult('Diff generated!', 'success');
  } catch (e) {
    showValidationResult('Error: ' + e.message, 'error');
  }
}

function execute_generateTypeScript() {
  try {
    const input = leftEditor.getValue();
    const obj = JSON.parse(input);
    let schema;

    if (obj.type && obj.properties) {
      schema = obj;
    } else {
      schema = objectToJsonSchema(obj);
    }

    const typescript = generateTypeScriptInterfaces(schema);
    rightEditor.setValue(typescript);
    showValidationResult('TypeScript interfaces generated!', 'success');
  } catch (e) {
    showValidationResult('Error: ' + e.message, 'error');
  }
}

function execute_generateOpenApi() {
  try {
    const input = leftEditor.getValue();
    const obj = JSON.parse(input);
    let schema;

    if (obj.type && obj.properties) {
      schema = obj;
    } else {
      schema = objectToJsonSchema(obj);
    }

    const openApi = generateOpenApiSchema(schema);
    rightEditor.setValue(JSON.stringify(openApi, null, 2));
    showValidationResult('OpenAPI schema generated!', 'success');
  } catch (e) {
    showValidationResult('Error: ' + e.message, 'error');
  }
}

function execute_generateMockData() {
  try {
    const input = leftEditor.getValue();
    const obj = JSON.parse(input);
    let schema;

    if (obj.type && obj.properties) {
      schema = obj;
    } else {
      schema = objectToJsonSchema(obj);
    }

    const mockData = generateMockDataFromSchema(schema);
    rightEditor.setValue(JSON.stringify(mockData, null, 2));
    showValidationResult('Mock data generated!', 'success');
  } catch (e) {
    showValidationResult('Error: ' + e.message, 'error');
  }
}

function execute_generateCsvTemplate() {
  try {
    const input = leftEditor.getValue();
    const obj = JSON.parse(input);
    let schema;

    if (obj.type && obj.properties) {
      schema = obj;
    } else {
      schema = objectToJsonSchema(obj);
    }

    const csv = generateCsvTemplate(schema);
    rightEditor.setValue(csv);
    showValidationResult('CSV template generated!', 'success');
  } catch (e) {
    showValidationResult('Error: ' + e.message, 'error');
  }
}

function execute_simplifySchema() {
  try {
    const schema = JSON.parse(leftEditor.getValue());
    const simplified = simplifySchema(schema);
    rightEditor.setValue(JSON.stringify(simplified, null, 2));
    showValidationResult('Schema simplified!', 'success');
  } catch (e) {
    showValidationResult('Error: ' + e.message, 'error');
  }
}

function execute_generateTableComponent() {
  try {
    const input = leftEditor.getValue();
    const obj = JSON.parse(input);
    let schema;

    // Check if input is already a JSON schema
    if (obj.type && obj.properties) {
      schema = obj;
    } else {
      // Generate JSON schema from object first
      schema = objectToJsonSchema(obj);
    }

    const tableComponent = generateTableComponent(schema, obj);
    rightEditor.setValue(JSON.stringify(tableComponent, null, 2));
    showValidationResult('Table component generated!', 'success');
  } catch (e) {
    showValidationResult('Error: ' + e.message, 'error');
  }
}

// Helper functions for new features
function flattenSchema(schema, prefix = '', result = {}) {
  if (schema.type === 'object' && schema.properties) {
    for (const [key, prop] of Object.entries(schema.properties)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (prop.type === 'object' && prop.properties) {
        flattenSchema(prop, newKey, result);
      } else {
        result[newKey] = prop;
      }
    }
  }

  return {
    type: 'object',
    properties: result
  };
}

function mergeSchemas(schema1, schema2) {
  const merged = JSON.parse(JSON.stringify(schema1));

  if (schema2.properties && merged.properties) {
    merged.properties = { ...merged.properties, ...schema2.properties };
  }

  if (schema2.required && merged.required) {
    merged.required = [...new Set([...merged.required, ...schema2.required])];
  } else if (schema2.required) {
    merged.required = schema2.required;
  }

  return merged;
}

function schemaDiff(schema1, schema2) {
  const diff = {
    added: [],
    removed: [],
    modified: []
  };

  const props1 = schema1.properties || {};
  const props2 = schema2.properties || {};

  // Find added properties
  for (const key in props2) {
    if (!(key in props1)) {
      diff.added.push({ key, schema: props2[key] });
    }
  }

  // Find removed properties
  for (const key in props1) {
    if (!(key in props2)) {
      diff.removed.push({ key, schema: props1[key] });
    }
  }

  // Find modified properties
  for (const key in props1) {
    if (key in props2) {
      const json1 = JSON.stringify(props1[key]);
      const json2 = JSON.stringify(props2[key]);
      if (json1 !== json2) {
        diff.modified.push({ key, before: props1[key], after: props2[key] });
      }
    }
  }

  return diff;
}

function generateTypeScriptInterfaces(schema, interfaceName = 'Root') {
  let typescript = '';

  if (schema.type === 'object' && schema.properties) {
    typescript += `interface ${interfaceName} {\n`;

    for (const [key, prop] of Object.entries(schema.properties)) {
      const optional = schema.required && !schema.required.includes(key) ? '?' : '';
      const propType = Array.isArray(prop.type) ? prop.type[0] : prop.type;

      let tsType;
      switch(propType) {
        case 'string':
          tsType = 'string';
          break;
        case 'number':
        case 'integer':
          tsType = 'number';
          break;
        case 'boolean':
          tsType = 'boolean';
          break;
        case 'array':
          tsType = 'any[]';
          break;
        case 'object':
          tsType = 'object';
          break;
        default:
          tsType = 'any';
      }

      typescript += `  ${key}${optional}: ${tsType};\n`;
    }

    typescript += '}\n';
  }

  return typescript;
}

function generateOpenApiSchema(schema) {
  return {
    openapi: '3.0.0',
    info: {
      title: 'Generated API',
      version: '1.0.0'
    },
    paths: {
      '/resource': {
        get: {
          summary: 'Get resource',
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: schema
                }
              }
            }
          }
        },
        post: {
          summary: 'Create resource',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: schema
              }
            }
          },
          responses: {
            '201': {
              description: 'Resource created',
              content: {
                'application/json': {
                  schema: schema
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        Resource: schema
      }
    }
  };
}

function generateMockDataFromSchema(schema) {
  if (schema.type === 'object' && schema.properties) {
    const mockData = {};

    for (const [key, prop] of Object.entries(schema.properties)) {
      const propType = Array.isArray(prop.type) ? prop.type[0] : prop.type;

      if (prop.default !== undefined) {
        mockData[key] = prop.default;
      } else {
        switch(propType) {
          case 'string':
            mockData[key] = `sample_${key}`;
            break;
          case 'number':
          case 'integer':
            mockData[key] = 42;
            break;
          case 'boolean':
            mockData[key] = true;
            break;
          case 'array':
            mockData[key] = [];
            break;
          case 'object':
            mockData[key] = {};
            break;
          default:
            mockData[key] = null;
        }
      }
    }

    return mockData;
  }

  return {};
}

function generateCsvTemplate(schema) {
  if (schema.type === 'object' && schema.properties) {
    const headers = Object.keys(schema.properties);
    const csvHeaders = headers.join(',');
    const sampleRow = headers.map(key => {
      const prop = schema.properties[key];
      const propType = Array.isArray(prop.type) ? prop.type[0] : prop.type;

      switch(propType) {
        case 'string':
          return `"sample_${key}"`;
        case 'number':
        case 'integer':
          return '0';
        case 'boolean':
          return 'true';
        default:
          return '';
      }
    }).join(',');

    return `${csvHeaders}\n${sampleRow}`;
  }

  return '';
}

function simplifySchema(schema) {
  const simplified = JSON.parse(JSON.stringify(schema));

  function removeMetadata(obj) {
    if (typeof obj !== 'object' || obj === null) return;

    delete obj.description;
    delete obj.title;
    delete obj.examples;
    delete obj.$comment;
    delete obj.$id;
    delete obj.$schema;

    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        removeMetadata(obj[key]);
      }
    }
  }

  removeMetadata(simplified);
  return simplified;
}

function generateTableComponent(schema, sampleData) {
  if (schema.type !== 'object' || !schema.properties) {
    throw new Error('Schema must be an object type with properties');
  }

  const properties = schema.properties;
  const columns = [];

  // Generate columns from schema properties
  for (const [key, propSchema] of Object.entries(properties)) {
    const propType = Array.isArray(propSchema.type) ? propSchema.type[0] : propSchema.type;

    const column = {
      header: propSchema.title || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
      width: '100px',
      minwidth: '100px',
      cell: {
        autoEllipsis: true,
        tooltip: true,
        value: `{{{${key}}}}`
      },
      sort: {
        datakey: key,
        direction: 'ASC'
      },
      filter: 'contains'
    };

    // Add type-specific styling
    if (propType === 'boolean') {
      column.cell.style = {
        color: `{{{ iif ${key} 'green' 'red'}}}`,
        fontWeight: 'bold'
      };
    } else if (propType === 'number' || propType === 'integer') {
      column.cell.style = {
        textAlign: 'right'
      };
    }

    columns.push(column);
  }

  // Build the table component
  const tableComponent = {
    component: 'TABLE',
    container: 'main',
    placeholder: 'No data available',
    data: 'data/items',
    datakey: '__key',
    command: 'tablecommand',
    name: 'datatable',
    options: {
      checkbox: true,
      multi: true,
      sticky: {
        selected: true
      }
    },
    filter: {
      hide: false
    },
    sticky: {
      sort: true,
      position: true,
      filter: true
    },
    header: 'Table Header',
    rows: {
      height: '32px',
      style: [
        {
          backgroundColor: '#ffffff'
        },
        {
          backgroundColor: '#fafafa'
        }
      ],
      selected: {
        fontWeight: 'bold'
      },
      active: {
        backgroundColor: '#cccccc'
      }
    },
    columns: columns,
    buttons: [
      {
        align: 'left',
        icon: 'fa-filter',
        tooltip: {
          text: 'Filter',
          direction: 'up-left'
        },
        action: 'filter'
      },
      {
        align: 'left',
        icon: 'fa-sync-alt',
        color: 'primary',
        tooltip: {
          text: 'Refresh',
          direction: 'up-left'
        },
        onClick: {
          action: 'refresh'
        }
      }
    ]
  };

  return tableComponent;
}

// Simple object to JSON Schema generator (basic types only)
function objectToJsonSchema(obj) {
  if (Array.isArray(obj)) {
    return {
      type: 'array',
      items: objectToJsonSchema(obj[0] ?? {})
    };
  } else if (typeof obj === 'object' && obj !== null) {
    const properties = {};
    for (const key in obj) {
      properties[key] = objectToJsonSchema(obj[key]);
    }
    return {
      type: 'object',
      properties,
      required: Object.keys(properties)
    };
  } else {
    return { type: typeof obj };
  }
}