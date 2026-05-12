# Dev Tools

A browser-based developer utility app. No build step, no backend — open `index.html` and go.

Live: https://madrogue.github.io/dev-tools/

---

## Tools tab

Two editor panes (left → right). Select a tool from the dropdown, paste input in the left pane, hit **Apply**.

### JSON
- **JSON → JSON5** — Converts strict JSON to JSON5 (trailing commas, unquoted keys)
- **JSON5 → JSON** — Parses JSON5 and outputs strict JSON
- **Parse Graylog** — Extracts and reformats `message={…}` objects from Graylog log lines
- **Analyze JSON** — Reports structure: type, key count, nesting depth, value types, duplicates
- **JSON Diff** — Compares two JSON objects (uses both panes); reports added, removed, and modified keys
- **JSON Path Explorer** — Evaluates a JSONPath expression against a JSON document

### Key Transform
- **Flat → Wrapped** — Wraps every value in `{v: …}`
- **Wrapped → Flat** — Unwraps `{v: …}` or `{value: …}` back to plain key-value pairs
- **Rewrap** — Swaps the inner key between `v` and `value`

### Text
- **Strip Newlines** — Removes all newline characters
- **Newlines → \n** — Converts real newlines to literal `\n` escape sequences
- **\n → Newlines** — Converts literal `\n` sequences back to real line breaks
- **Quote** — JSON-stringifies the input (adds surrounding quotes, escapes internals)
- **Unquote** — Removes surrounding quotes and unescapes common sequences
- **Toggle Quotes** — Swaps between single and double quotes
- **Parse Stringified JSON** — Unescapes and parses a double-encoded JSON string; shows error location on failure
- **Base64 Encode** — Encodes text to Base64
- **Base64 Decode** — Decodes a Base64 string; pretty-prints if the result is JSON
- **JWT Decode** — Splits and decodes a JWT's header and payload; reports expiry status
- **JWT Encode** — Signs a JSON payload as a JWT using HMAC (HS256 / HS384 / HS512) with a secret key
- **HTML Encode** — Converts `< > & " '` to HTML entities
- **HTML Decode** — Converts HTML entities back to plain text
- **URL Encode** — Percent-encodes a string (`/**/ → %2F%2A%2A%2F`)
- **URL Decode** — Decodes a percent-encoded string (`%2F%2A%2A%2F → /**/`)
- **Markdown Preview** — Renders Markdown to a live HTML preview in the right pane

### Regex
- **Regex Tester** — Tests a pattern (with optional flags) against text; returns all matches with index and captured groups

### Data
- **CSV → JSON** — Parses CSV to a JSON array of objects using the first row as headers
- **JSON → CSV** — Converts a JSON array of objects to CSV

### YAML
- **YAML → JSON** — Parses YAML and outputs formatted JSON
- **JSON → YAML** — Converts JSON to YAML

### Schema
- **Generate JSON Schema** — Infers a JSON Schema from a sample object
- **Generate Form Schema** — Generates a UI form schema from a JSON object or JSON Schema
- **Generate DAL Map** — Extracts the top-level keys of an object as a JSON array
- **Flatten Nested Schema** — Flattens a nested JSON Schema to a single level using dot-notation keys
- **Merge Schemas** — Deep-merges two JSON Schemas (uses both panes)
- **Schema Diff** — Reports added, removed, and modified properties between two schemas (uses both panes)
- **Generate TypeScript Interfaces** — Generates TypeScript interface declarations from a JSON Schema
- **Generate OpenAPI Schema** — Wraps a JSON Schema in a minimal OpenAPI 3.0 document
- **Generate Mock Data** — Generates a sample object from a JSON Schema
- **Generate CSV Template** — Generates a CSV header row and sample data row from a JSON Schema
- **Simplify Schema** — Strips metadata fields (`description`, `title`, `$id`, etc.) from a JSON Schema
- **Generate Table Component** — Generates a TABLE component config from a JSON Schema
- **Validate Object** — Validates a JSON object (left) against a JSON Schema (right) using AJV
- **Generate Object from Schema** — Generates a random object from a JSON Schema (right → left) using json-schema-faker

---

## Utils tab

### Time

**Timestamp Converter**
- Convert a Unix timestamp (ms) to a formatted date, or build a timestamp from date parts
- Timezone selector (ET / CT / MT / PT / AKT / HAT) with custom format string
- Output shows: timestamp (ms), GMT, local time, formatted, relative ("3 hours ago"), and duration

**Cron Expression Parser**
- Parses a 5-field cron expression and shows a human-readable description
- Lists the next 10 fire times in your chosen timezone

### Generate

**UUID v4**
- Generates a random UUID v4, shown with and without dashes

**Random Token**
- Configurable length (1–256), character sets: lowercase, uppercase, digits, symbols

### Convert

**Unit Conversions**
- Temperature: Celsius ↔ Fahrenheit
- Pressure: Pascals ↔ inHg
- Time: milliseconds ↔ days / hours / minutes / seconds / milliseconds

**Number Base Converter**
- Live conversion between Decimal, Hexadecimal, Binary, and Octal — edit any field

**Color Converter**
- Live conversion between HEX, RGB, HSL, and HSV — edit any field; live color swatch

### Web

**URL Parser / Builder**
- Parse a full URL into its parts (protocol, host, port, path, fragment, query params)
- Build a URL from its parts; query params entered as `key=value` one per line
