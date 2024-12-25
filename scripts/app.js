let jsonInputEditor;
let json5InputEditor;
let stringInputEditor;
let stringOutputEditor;

let timestampInput = document.getElementById('timestampInput');
let timezoneSelect = document.getElementById('timezoneSelect');
let timestampFormat = document.getElementById('timestampFormat');
let uuidWithDashes = document.getElementById('uuidWithDashes');
let uuidWithoutDashes = document.getElementById('uuidWithoutDashes');

require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' } });
window.MonacoEnvironment = { getWorkerUrl: () => proxy };

let proxy = URL.createObjectURL(new Blob([`
	self.MonacoEnvironment = {
		baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'
	};
	importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
`], { type: 'text/javascript' }));

// require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.8.3/min/vs' } });
// window.MonacoEnvironment = { getWorkerUrl: () => proxy };

// let proxy = URL.createObjectURL(new Blob([`
// 	self.MonacoEnvironment = {
// 		baseUrl: 'https://unpkg.com/monaco-editor@0.8.3/min/'
// 	};
// 	importScripts('https://unpkg.com/monaco-editor@0.8.3/min/vs/base/worker/workerMain.js');
// `], { type: 'text/javascript' }));

require(["vs/editor/editor.main"], function () {
  //#region Register JSON5 language for monaco editor
  monaco.languages.register({ id: 'json5' });

  // Define JSON5 language configuration
  monaco.languages.setMonarchTokensProvider('json5', {
    tokenizer: {
      root: [
        [/[{}]/, 'delimiter.bracket'],
        [/[[]]/, 'delimiter.array'],
        [/[,:]/, 'delimiter'],
        [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
        [/"/, 'string', '@string'],
        [/[a-zA-Z_$][\w$]*/, 'identifier'],
        [/\d+/, 'number'],
        [/true|false|null/, 'keyword'],
      ],
      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop']
      ]
    }
  });

  // Define JSON5 language configuration
  monaco.languages.setLanguageConfiguration('json5', {
    brackets: [
      ['{', '}'],
      ['[', ']']
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '"', close: '"' }
    ]
  });
  //#endregion

  onDOMContentLoaded();
});

// Initialize the selected tab and editor values after monaco editor is loaded
document.addEventListener("DOMContentLoaded", onDOMContentLoaded);

function onDOMContentLoaded() {
  console.log(`DOM content loaded`);

  // Initialize the selected tab as active
  let selectedTab = localStorage.getItem('selectedTab') || 'jsonToJson5';
  //document.querySelector(`.tab-button[onclick="openTab(event, '${selectedTab}')"]`).click();
  openTab(null, selectedTab);

  //#region Initialize timestamp input and timezone select
  // Save input values
  timestampInput.addEventListener('input', function () {
    localStorage.setItem('timestampInput', this.value);
  });

  timezoneSelect.addEventListener('change', function () {
    localStorage.setItem('timezoneSelect', this.value);
  });

  // Restore input values
  timestampInput.value = localStorage.getItem('timestampInput') || '';
  timezoneSelect.value = localStorage.getItem('timezoneSelect') || 'America/Chicago';
  //#endregion

  //#region Initialize uuid input
  // Save input values
  uuidWithDashes.addEventListener('input', function () {
    localStorage.setItem('uuidWithDashes', this.value);

    // Update the UUID without dashes input
    uuidWithoutDashes.value = this.value.replace(/-/g, '');
  });

  uuidWithoutDashes.addEventListener('input', function () {
    localStorage.setItem('uuidWithoutDashes', this.value);
  });

  // Restore input values
  uuidWithDashes.value = localStorage.getItem('uuidWithDashes') || '';
  uuidWithoutDashes.value = localStorage.getItem('uuidWithoutDashes') || '';
  //#endregion

  // Add click-to-copy functionality
  document.querySelectorAll('.click-to-copy').forEach(function (element) {
    element.addEventListener('click', function () {
      const text = element.textContent;
      navigator.clipboard.writeText(text).then(function () {
        console.log('Copied to clipboard:', text);
      }).catch(function (error) {
        console.error('Failed to copy text:', error);
      });
    });
  });

  // // Restore editor values
  // if (jsonInputEditor) {
  //   jsonInputEditor.setValue(localStorage.getItem('jsonInput') || '');
  // }
  // if (json5InputEditor) {
  //   json5InputEditor.setValue(localStorage.getItem('json5Input') || '');
  // }
  // if (stringInputEditor) {
  //   stringInputEditor.setValue(localStorage.getItem('stringInput') || '');
  // }
  // if (stringOutputEditor) {
  //   stringOutputEditor.setValue(localStorage.getItem('stringOutput') || '');
  // }
}

function initializeEditor(editorId, language, value) {
  const editor = monaco.editor.create(document.getElementById(editorId), {
    value: value,
    language: language,
    theme: 'vs-dark',
    folding: true
  });

  editor.setValue(localStorage.getItem(editorId) || '');

  // Save editor value on change
  editor.onDidChangeModelContent(() => {
    localStorage.setItem(editorId, editor.getValue());
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
  }

  // Initialize editors for the active tab
  if (tabName === 'jsonToJson5') {
    if (!jsonInputEditor) {
      jsonInputEditor = initializeEditor('jsonInput', 'json');
    }
    if (!json5InputEditor) {
      json5InputEditor = initializeEditor('json5Input', 'json5');
    }
  } else if (tabName === 'stringManipulation') {
    if (!stringInputEditor) {
      stringInputEditor = initializeEditor('stringInput', 'plaintext');
    }
    if (!stringOutputEditor) {
      stringOutputEditor = initializeEditor('stringOutput', 'plaintext');
    }
  } else if (tabName === 'timestampToDate') {
    // No Monaco Editor initialization needed for this tab
  }

  // Save the selected tab to localStorage
  localStorage.setItem('selectedTab', tabName);
}

function tidyEditor(editor) {
  editor.trigger('anyString', 'editor.action.formatDocument')
}

document.addEventListener('keydown', function (e) {
  if (e.ctrlKey && e.key === 'k') {
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        if (document.getElementById('jsonInput').parentElement.classList.contains('active')) {
          tidyEditor(jsonInputEditor);
        } else if (document.getElementById('json5Input').parentElement.classList.contains('active')) {
          tidyEditor(json5InputEditor);
        } else if (document.getElementById('stringInput').parentElement.classList.contains('active')) {
          tidyEditor(stringInputEditor);
        } else if (document.getElementById('stringOutput').parentElement.classList.contains('active')) {
          tidyEditor(stringOutputEditor);
        }
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
document.getElementById('copyJsonButton').addEventListener('click', function () {
  copyFromEditor(jsonInputEditor);
});

document.getElementById('pasteJsonButton').addEventListener('click', function () {
  pasteToEditor(jsonInputEditor, execute_convertJsonToJson5);
});

document.getElementById('copyJson5Button').addEventListener('click', function () {
  copyFromEditor(json5InputEditor);
});

document.getElementById('pasteJson5Button').addEventListener('click', function () {
  pasteToEditor(json5InputEditor, execute_convertJson5ToJson);
});
//#endregion

//#region String copy/paste buttons
document.getElementById('copyInputStringButton').addEventListener('click', function () {
  copyFromEditor(stringInputEditor);
});

document.getElementById('pasteInputStringButton').addEventListener('click', function () {
  pasteToEditor(stringInputEditor);
});

document.getElementById('copyOutputStringButton').addEventListener('click', function () {
  copyFromEditor(stringOutputEditor);
});

document.getElementById('pasteOutputStringButton').addEventListener('click', function () {
  pasteToEditor(stringOutputEditor);
});
//#endregion

//#region Timestamp copy/paste buttons
document.getElementById('copyTimestampButton').addEventListener('click', function () {
  copyTimestamp();
});

document.getElementById('pasteTimestampButton').addEventListener('click', function () {
  pasteTimestamp();
});
//#endregion

function execute_convertJsonToJson5() {
  const jsonInput = jsonInputEditor.getValue();
  const json5Input = convertJsonToJson5(jsonInput);
  json5InputEditor.setValue(json5Input);
}

function execute_convertJson5ToJson() {
  const json5Input = json5InputEditor.getValue();
  const jsonInput = convertJson5ToJson(json5Input);
  jsonInputEditor.setValue(jsonInput);
}

function execute_stripNewlines() {
  const stringInput = stringInputEditor.getValue();
  const stringOutput = stripNewlines(stringInput);
  stringOutputEditor.setValue(stringOutput);
}

function execute_quoteStringValue() {
  const unquotedValue = stringInputEditor.getValue();
  const quotedValue = quoteString(unquotedValue);
  stringOutputEditor.setValue(quotedValue);
}

function execute_unquoteStringValue() {
  const quotedValue = stringOutputEditor.getValue();
  const unquotedValue = unquoteString(quotedValue);
  stringInputEditor.setValue(unquotedValue);
}

function execute_convertTimestampToDate() {
  const timestampInputValue = timestampInput.value;
  const timezone = timezoneSelect.value;
  const format = timestampFormat.value || 'YYYY-MM-DD HH:mm:ss.SSS';

  const result = convertTimestampToDate(timestampInputValue, timezone, format);

  document.getElementById('dateOutput').value = result.formatted;

  document.getElementById('yearInput').value = result.year;
  document.getElementById('monthInput').value = result.month;
  document.getElementById('dayInput').value = result.day;
  document.getElementById('hourInput').value = result.hour;
  document.getElementById('minuteInput').value = result.minute;
  document.getElementById('secondInput').value = result.second;
  document.getElementById('millisecondInput').value = result.millisecond;

  // Populate the table with the converted date values
  document.getElementById('timestampDisplayMilliseconds').textContent = result.timestamp;
  document.getElementById('timestampDisplayFormat').textContent = result.formatted;
  document.getElementById('timestampDisplayGmt').textContent = moment.utc(result.timestamp).format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
  document.getElementById('timestampDisplayLocal').textContent = moment.tz(result.timestamp, timezone).format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)');
  document.getElementById('timestampDisplayRelative').textContent = moment(result.timestamp).fromNow();
}

function execute_convertDatePartsToTimestamp() {
  const timezone = timezoneSelect.value;
  const format = timestampFormat.value || 'YYYY-MM-DD HH:mm:ss.SSS';

  const year = parseInt(document.getElementById('yearInput').value);
  const month = parseInt(document.getElementById('monthInput').value);
  const day = parseInt(document.getElementById('dayInput').value);
  const hour = parseInt(document.getElementById('hourInput').value);
  const minute = parseInt(document.getElementById('minuteInput').value);
  const second = parseInt(document.getElementById('secondInput').value);
  const millisecond = parseInt(document.getElementById('millisecondInput').value);

  const timestamp = convertDatePartsToTimestamp(year, month, day, hour, minute, second, millisecond, timezone);

  timestampInput.value = timestamp;

  // Populate the table with the converted date values
  document.getElementById('timestampDisplayMilliseconds').textContent = timestamp;
  document.getElementById('timestampDisplayFormat').textContent = moment.tz(timestamp, timezone).format(format);
  document.getElementById('timestampDisplayGmt').textContent = moment.utc(timestamp).format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
  document.getElementById('timestampDisplayLocal').textContent = moment.tz(timestamp, timezone).format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)');
  document.getElementById('timestampDisplayRelative').textContent = moment(timestamp).fromNow();
}

async function execute_refreshUuid() {
  const uuidValue = await generateUUID();

  document.getElementById('uuidWithDashes').value = uuidValue.uuid;
  document.getElementById('uuidWithoutDashes').value = uuidValue.uuidWithoutDashes;
}