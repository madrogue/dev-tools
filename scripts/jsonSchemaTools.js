
// jsonSchemaTools.js - event-driven, app.js-style
let objectEditor, schemaEditor;

function initializeJsonSchemaEditors() {
  if (!objectEditor) {
    objectEditor = monaco.editor.create(document.getElementById('objectInput'), {
      value: localStorage.getItem('objectInput') || '{\n  "name": "John Doe",\n  "age": 30\n}',
      language: 'json',
      theme: 'vs-dark',
      automaticLayout: true
    });
    objectEditor.onDidChangeModelContent(() => {
      localStorage.setItem('objectInput', objectEditor.getValue());
    });
  }
  if (!schemaEditor) {
    schemaEditor = monaco.editor.create(document.getElementById('schemaInput'), {
      value: localStorage.getItem('schemaInput') || '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "type": "object",\n  "properties": {}\n}',
      language: 'json',
      theme: 'vs-dark',
      automaticLayout: true
    });
    schemaEditor.onDidChangeModelContent(() => {
      localStorage.setItem('schemaInput', schemaEditor.getValue());
    });
  }
}

function generateJsonSchema() {
  try {
    const obj = JSON.parse(objectEditor.getValue());
    const schema = objectToJsonSchema(obj);
    schemaEditor.setValue(JSON.stringify(schema, null, 2));
    showValidationResult('Schema generated!', 'success');
  } catch (e) {
    showValidationResult('Invalid object: ' + e.message, 'error');
  }
}

function validateObjectAgainstSchema() {
  try {
    const obj = JSON.parse(objectEditor.getValue());
    const schema = JSON.parse(schemaEditor.getValue());
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

function generateObjectFromSchema() {
  try {
    const schema = JSON.parse(schemaEditor.getValue());
    const obj = window.jsf.generate(schema);
    objectEditor.setValue(JSON.stringify(obj, null, 2));
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


// Only initialize editors when the tab is activated
const origOpenTab = window.openTab;
window.openTab = function(event, tabName) {
  origOpenTab(event, tabName);
  if (tabName === 'jsonSchemaTools') {
    setTimeout(initializeJsonSchemaEditors, 100);
  }
};


// Button click events (app.js style)
document.addEventListener('DOMContentLoaded', function () {
  // Paste/copy buttons
  document.getElementById('pasteObjectButton').addEventListener('click', function () {
    navigator.clipboard.readText().then(text => {
      objectEditor.setValue(text);
    });
  });
  document.getElementById('copyObjectButton').addEventListener('click', function () {
    navigator.clipboard.writeText(objectEditor.getValue());
  });
  document.getElementById('pasteSchemaButton').addEventListener('click', function () {
    navigator.clipboard.readText().then(text => {
      schemaEditor.setValue(text);
    });
  });
  document.getElementById('copySchemaButton').addEventListener('click', function () {
    navigator.clipboard.writeText(schemaEditor.getValue());
  });

  // Main action buttons
  document.querySelector('button[onclick="generateJsonSchema()"]')?.addEventListener('click', generateJsonSchema);
  document.querySelector('button[onclick="validateObjectAgainstSchema()"]')?.addEventListener('click', validateObjectAgainstSchema);
  document.querySelector('button[onclick="generateObjectFromSchema()"]')?.addEventListener('click', generateObjectFromSchema);
});
