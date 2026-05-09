# Dev Tools — Roadmap & TODO

---

## Completed

**Phase 1** — Bug fixes: removed duplicate function definitions, dead event listeners, stale variable checks; fixed AJV/jsf guards, timestamp typo.

**Phase 2** — Consolidated 7 tabs → 2 (Tools + Utils). All Monaco-editor tools share one two-pane layout with a grouped `<optgroup>` dropdown. Form-based tools (Timestamp, UUID, Conversions) merged into Utils with `<hr>` dividers.

**Phase 3** — Copy/paste audit: verified Paste/Copy/Copy-to-left wiring for all tools.

**Phase 4** — JSON Analyzer tool: detects format, reports item count, key union/intersection, optional keys, null frequencies, depth stats, duplicate `__key`/`$id`, byte size.

**Phase 5** — Key Format Transform tools: Flat → Wrapped (v), Wrapped → Flat, Rewrap (v ↔ value). Auto-detects format on paste.

**Phase 6** — Smart paste & format detection: format badges (JSON/JSON5/TEXT) on both panes, auto-select tool on paste for JSON and Key Transform groups, reverse direction on "← Copy to left" for JSON tools.

**Bug review** — Fixed double `onDOMContentLoaded`, tab button losing active class on load, UUID replaced with `crypto.randomUUID()`, token generation switched to `crypto.getRandomValues()`, error feedback on null JSON conversions, dead `value` parameter removed, `proxy` ordering fixed.

---

## Phase 7 — Tools Tab: Quick-Win Conversions (no CDN) ✓

- [x] **JSON Diff** — recursive value-level diff (not schema-level); reads both panes, outputs `{ added, removed, modified }` with dot-notation paths to right pane.
- [x] **Base64 Encode / Base64 Decode** — Unicode-safe via `TextEncoder`/`TextDecoder`; decode auto-pretty-prints if result is valid JSON.
- [x] **JWT Decode** — splits on `.`, base64url-decodes header + payload, adds `expiry` block with ISO date and relative time if `exp` claim present. Uses existing `formatDuration()`.
- [x] **CSV → JSON / JSON → CSV** — proper quoted-field parser (`parseCsvRow`) handles embedded commas, escaped quotes, `\r\n` line endings; JSON→CSV quotes fields containing commas/quotes/newlines; validates all items are objects.

---

## Phase 8 — Utils Tab: Quick-Win Form Tools (no CDN) ✓

- [x] **Number Base Converter** — four `<input>` fields (Decimal, Hex, Binary, Octal). Any field change triggers recalculation of the other three. Use `parseInt(val, fromBase).toString(toBase)`. Handle empty/invalid input gracefully.

- [x] **Color Converter** — four fields: HEX (`#rrggbb`), RGB (`r, g, b`), HSL (`h, s%, l%`), HSV (`h, s%, v%`). A small color swatch `<div>` updates to show the current color. Conversion math is pure JS. Changing any field updates all others.

- [x] **URL Parser/Builder** — one text input for the full URL. On parse (button or auto), break into fields: Protocol, Host, Port, Path, Query Params (editable key/value table), Fragment. A "Build →" button reconstructs the URL from the fields into the top input. Use the built-in `new URL()` API for parsing.

---

## Phase 9 — Tools Tab: YAML (CDN) ✓

- [x] **YAML → JSON / JSON → YAML** — two options in a new "YAML" optgroup. CDN: `https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js`. Use `jsyaml.load()` and `jsyaml.dump()`. Language modes: `['plaintext', 'json']` and `['json', 'plaintext']`. Add the `<script>` tag to `index.html`.

---

## Phase 10 — Tools Tab: Regex Tester ✓

- [x] `<div id="regexControls" style="display:none">` with pattern + flags inputs; shown only when `regexTest` is selected.
- [x] `execute_regexTest()`: uses `matchAll` (with `g` flag) or single `exec`; outputs array of `{ index, match, groups }` to right pane. Shows match count in validationResult.
- [x] Invalid regex shown in `validationResult`.

---

## Phase 11 — Tools Tab: JSON Path Explorer (CDN) ✓

- [x] `<div id="jsonPathControls" style="display:none">` with JSONPath expression input; shown only when `jsonPathExplorer` is selected.
- [x] CDN: `https://cdn.jsdelivr.net/npm/jsonpath-plus/dist/index-browser-umd.min.js`. Uses `JSONPath({ path, json })`.
- [x] `execute_jsonPathExplorer()`: parse left pane as JSON5, evaluate expression, output results array to right pane. Language modes: `['json', 'json']`.

---

## Phase 12 — Tools Tab: Markdown Preview (CDN) ✓

- [x] `<div id="rightPreviewPanel" class="code-editor" style="display:none; overflow:auto; padding:10px;">` alongside rightEditor.
- [x] `execute_onToolChange`: hides rightEditor + shows rightPreviewPanel for `markdownPreview`; restores Monaco with `rightEditor.layout()` on switch away.
- [x] CDN: `https://cdn.jsdelivr.net/npm/marked/marked.min.js`. `execute_markdownPreview()`: sets `rightPreviewPanel.innerHTML = marked.parse(...)`.
- [x] Added to Text optgroup. Dark-theme CSS for h1–h6, code, pre, blockquote, a, table.

---

## Phase 13 — Utils Tab: Cron Expression Parser ✓

- [x] Added as a Utils section with cron expression input, dedicated timezone select, and Parse button.
- [x] CDN: `cronstrue` for human-readable description. Next-fire-time calculator implemented inline (minute-by-minute iteration, standard 5-field cron, up to ~4 years look-ahead).
- [x] Outputs human-readable description + table of next 10 fire times in selected timezone (formatted via moment-timezone).
