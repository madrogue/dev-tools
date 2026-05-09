# Dev Tools — Roadmap & TODO

Each item is a self-contained task. Mark `[x]` when done. Work top-to-bottom; later tasks may depend on earlier ones.

---

## Phase 1 — Bug Fixes & Dead Code Cleanup

- [x] **Remove duplicate function definitions in `app.js`**: `execute_generateFormSchema()` and `execute_validateObjectAgainstSchema()` are each defined twice (the second definitions override the first). Keep only the correct second version of each.
- [x] **Fix broken `pasteOutputStringButton` reference in `app.js`**: The listener on line ~364 references `pasteOutputStringButton` which doesn't exist in the HTML. Either add the button to the Strings tab (right pane) or remove the dead listener.
- [x] **Fix `execute_validateObjectAgainstSchema()`**: It references `window.Ajv7` which is commented out. Replace with a lightweight inline validator or add a clear "AJV not loaded" error message. For now, show a `showValidationResult('AJV library not loaded', 'error')` guard.
- [x] **Fix `execute_generateObjectFromSchema()`**: It references `window.jsf.generate()` (json-schema-faker) which is also commented out. Add a guard message or replace with a simple hand-rolled mock generator.
- [x] **Remove `scripts/jsonSchemaTools.js`** (or keep as dead file): It's commented out in `index.html` and its functionality was fully absorbed into `app.js`. Remove the `<script>` comment so there's no confusion.
- [x] **Fix `sendGraylogMsgToJsonButton` handler**: Uses `typeof jsonInputEditor !== "undefined"` but `jsonInputEditor` is always declared (just null). Change to `if (jsonInputEditor)`.
- [x] **Fix typo in timestamp table**: "Timstamp (ms)" → "Timestamp (ms)" (`index.html` line 206).

---

## Phase 2 — Tab Consolidation (7 → 4 tabs)

All seven current tabs fall into two structural families: **two-pane Monaco editor tools** and **form-based tools**. Consolidating by family reduces the nav bar from 7 tabs to 4 with no feature loss.

### Target tab structure

| Tab | Contents | Current tabs absorbed |
|---|---|---|
| **Tools** | All Monaco editor tools — JSON, Text, Schema — in one grouped dropdown | "JSON ↔ JSON5", "Graylog", "Strings", "JSON Schema" |
| **Utils** | Timestamp, UUID/Token, Unit Conversions | "Timestamp to Date", "UUID/Token", "Convert" |

Two tabs total. Two Monaco editor instances total. The tool dropdown uses `<optgroup>` to group tools by category. Editor language mode (json / json5 / plaintext) switches automatically when the selected tool changes.

### Tasks

- [x] **Merge all Monaco-editor tabs into a single "Tools" tab**: JSON↔JSON5, Graylog, Strings, JSON Schema all use the identical two-pane layout. One tab with a grouped `<optgroup>` dropdown replaces four separate tabs. Two Monaco editor instances total. Editor language mode (json / json5 / plaintext) switches automatically when the selected tool changes.

- [x] **Merge Timestamp + UUID/Token + Convert into a single "Utils" tab**: Form-based tools stacked vertically with `<hr>` dividers.

- [x] **Unify button layout**: `[dropdown] [Apply →]` on left, `[← Copy to left] [Paste] [Copy]` on right. Consistent across all tools.

- [x] **Make the tab bar non-wrapping**: `overflow-x: auto; flex-wrap: nowrap` on `.tabs`.

- [x] **Remove right-pane select in Schema**: Replaced with single "← Generate Object" button.

---

## Phase 3 — Copy/Paste Audit (post-consolidation)

After Phase 2 consolidation, verify copy/paste works in all tools.

- [x] **JSON tab (new)**: Paste on left auto-applies conversion. Copy on left and right. Right pane has "← Copy to left". Verify all three initial functions (JSON→JSON5, JSON5→JSON, Parse Graylog) work correctly.
- [x] **Text tab**: Left pane has Paste+Copy. Right pane has Copy only (output-only by design). Dead `pasteOutputStringButton` listener removed in Phase 1.
- [x] **Schema tab**: All four buttons (Paste Object, Copy Object, Paste Schema, Copy Schema) exist and are wired. ✅
- [x] **Utils tab — Timestamp**: Paste from clipboard → timestamp input, "Now" button, Copy output. ✅
- [x] **Utils tab — UUID/Token**: Inline Copy buttons on each field. ✅
- [x] **Utils tab — Units**: Plain `<input>` fields, no clipboard buttons needed. ✅
- [ ] **After Phases 4–5 (new tools)**: Verify every new tool pane follows the pattern above.

---

## Phase 4 — New Tool: JSON/JSON5 Analyzer

Add **"Analyze"** to the **JSON** tab's left-pane tool dropdown. It accepts JSON or JSON5 input and outputs a structured stats report to the right pane.

Stats to report (all as formatted text/JSON):
- Detected format: JSON or JSON5
- Top-level type: array / object / primitive
- If array:
  - Item count
  - Item types (all objects, mixed, etc.)
  - Keys present across all items (union of all keys)
  - Keys present in every item (intersection)
  - Keys with null/undefined values and how often
  - Min/max/avg depth of nested objects
  - Any duplicate `__key` or `$id` values (with count)
- If object:
  - Key count
  - Value types per key
  - Nested depth
- Estimated JSON size (bytes)

Output is plain text or a structured JSON report in the right editor.

Implementation notes:
- Add `analyzeJson` to the tool select dropdown in the JSON tab
- Add `execute_analyzeJson()` to `app.js`
- The function should try `JSON5.parse()` first (handles both JSON and JSON5)

---

## Phase 5 — New Tool: Key Format Transform

Add **"Flat → Wrapped"**, **"Wrapped → Flat"**, and **"Rewrap (v ↔ value)"** to the **JSON** tab's left-pane tool dropdown for converting between these three array-of-objects formats:

**Format A** (flat): `[{ __key: "k1", ts: 1234, fieldA: 1, fieldB: "x" }]`

**Format B** (wrapped with `v`): `[{ $id: "k1", $ts: 1234, v: { fieldA: 1, fieldB: "x" } }]`

**Format C** (wrapped with `value`): `[{ $id: "k1", $ts: 1234, value: { fieldA: 1, fieldB: "x" } }]`

Rules:
- `__key` ↔ `$id`
- `ts` ↔ `$ts`
- All other fields ↔ content of `v` or `value`
- Input can be JSON or JSON5; output is JSON5 by default (toggle to JSON)
- Both directions: A→B, A→C, B→A, C→A, B→C, C→B
- Use the two-editor side-by-side layout with direction arrows

Implementation:
- Add a new file `scripts/keyTransform.js` with pure functions: `flatToWrapped(arr, wrapKey)`, `wrappedToFlat(arr)`, `detectKeyFormat(arr)` (returns `'flat'|'v'|'value'|'unknown'`)
- Add the three functions to the JSON tab dropdown (no new tab needed)
- Auto-detect format on paste and pre-select the appropriate conversion
- Input accepts JSON or JSON5

---

## Phase 6 — Smart Paste & Format Detection

This improves the **JSON ↔ JSON5** tab (and the new JSON Analyze/Transform tools) so pasting into either pane auto-detects the format and applies the right conversion.

- [ ] **Detect format on paste**: When user clicks Paste (or Ctrl+V into a Monaco editor), run `detectFormat(text)` which tries:
  1. `JSON.parse()` → it's strict JSON
  2. `JSON5.parse()` without errors that `JSON.parse` would have caught → it's JSON5 (has unquoted keys, trailing commas, comments, etc.)
  3. Falls through → unknown, just paste raw
- [ ] **Auto-select tool**: After detection, update the tool dropdown to the most relevant option and optionally auto-apply.
- [ ] **Direction buttons**: The existing left-arrow / right-arrow buttons already control direction. Enhance them:
  - Left pane → right pane: apply selected tool, result goes to right
  - Right pane → left pane: apply reverse operation, result goes to left
  - The "←" and "→" chevron buttons already exist; wire them to use the detected format
- [ ] **Show format badge**: Next to each editor, show a small badge (e.g. `JSON` or `JSON5` or `?`) that updates whenever editor content changes.

---

## Phase 7 — ~~Graylog Merge into JSON Tab~~

> **Absorbed into Phase 2.** The Graylog merge is now part of the JSON tab consolidation task. No separate phase needed.

---

## Suggestions for Future Tools

These are additional tools worth considering for later. All must work stand-alone from GitHub Pages (no server, no backend).

1. **JSON Diff** — Paste two JSON/JSON5 objects (one per pane), get a structured diff showing added/removed/changed keys. More ergonomic than Schema Diff which works on schemas, not objects.

2. **JWT Decoder** — Paste a JWT token, decode header + payload (no verification, client-side only). Show expiry relative to now.

3. **Base64 Encoder/Decoder** — Encode/decode base64 strings. Handle URL-safe variant. Optionally detect if the decoded value is JSON and pretty-print it.

4. **URL Parser/Builder** — Paste a URL and get protocol, host, path, query params broken out. Edit individual parts and reconstruct. Useful for debugging API calls.

5. **Regex Tester** — Paste a regex and test input strings against it. Show matches highlighted. Support flags (g, i, m, s).

6. **Color Converter** — Convert between HEX, RGB, HSL, HSV. Show a color preview swatch. Useful for design/CSS work.

7. **JSON Path Explorer** — Paste JSON and a JSONPath expression (e.g. `$.items[*].id`), see matching values. Helps debug DAL expressions and data access.

8. **Cron Expression Parser** — Paste a cron string, show human-readable explanation and next N fire times. Client-side only.

9. **YAML ↔ JSON Converter** — Two-pane converter like the JSON/JSON5 tab. Use a CDN-hosted `js-yaml` library.

10. **Number Base Converter** — Convert numbers between decimal, hex, binary, octal. Also useful for bit-flag debugging.

11. **CSV ↔ JSON Converter** — Paste CSV with headers, get JSON array of objects. And vice versa. Pair well with the existing CSV Template generator in JSON Schema tab.

12. **Markdown Preview** — (Lowest priority - nor very necessary) Left pane markdown source, right pane live HTML preview. Use a CDN-hosted `marked.js`.