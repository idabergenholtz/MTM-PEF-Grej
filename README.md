# MTM-PEF-GREJ

## .pef-format

---
### `<body>`
#### Description
- The body element contains the body of the document, its contents.
#### Parent element
- pef
#### Child elements
- volume (at least one)
---
### volume
#### Description
- The volume element defines a volume of braille, i.e. a range of pages that, once embossed, are to be joined together to form a physical unit.
#### Parent element
- body
#### Child elements
- section (at least one)
---
### section
#### Description
- The section element defines a range of pages in a volume that share some common property, such as duplex or dimensions settings.
#### Parent element
- volume
#### Child elements
- page (at least one)
---
### row
#### Description
- The row element defines a row of braille.
#### Parent element
- page
#### Value
- A string containing Unicode braille patterns.
---
### page
#### Description
- The page element defines a braille page.
#### Parent element
- section
#### Child elements
- row (zero or more)
---