# MTM-PEF-GREJ

This repository contains code for a tool that can convert files in [Portable Embosser Format (PEF)](https://braillespecs.github.io/pef/pef-specification.html), which contains braille text and can be used by blind people to read. The tool has support to download the content as HTML, or display the result directly in the browser.

## How to run locally
Get some kind of live-server program, eg `http-server` from npm, or live-server in VS Code.
Example:
```
	npm install http-server
	node_modules/http-server/bin/http-server src/
```

## Repository structure
All logic is handled with client-side javascript.

| File | Description |
| --- | --- |
| `controller.js` | Handles main control logic of conversion |
| `index.js` | Handles all UI updating and binds logic to frontend |
| `outputter.js` | Handles formatting of output result, eg HTML |
| `page_reader.js` |  |
| `parser.js` | |
| `pef.js` | Contains javascript data structures that represents a pef-file |
| `removeFrontPage.js` | |
| `swedishTables.js` | |
| `translator.js` | |

## How to contribute
TODO