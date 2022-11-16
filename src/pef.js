
/*
    PefObject tree structure:

        Pef:
            head:
                meta
            body:
                volume(s):
                    section(s):
                        page(s):
                            row(s):
                                - braille <String>
                                - text    <String>
*/

class Pef {
    constructor(head, body) {
        this.head = head;
        this.body = body;
    }
};

class Head {
    constructor(meta) {
        this.meta = meta;
    }
};

class MetaData {

};

class Body {
    constructor(volumes) {
        this.volumes = volumes;
    }
};

class Volume {
    constructor(sections) {
        this.sections = sections;
    }
};

class Section {
    constructor(pages) {
        this.pages = pages;
    }
};

class Page {
    constructor(rows) {
        this.rows = rows;
    }
};

class Row {
    constructor(braille) {
        this.braille = braille;
        this.text = null;
    }
};

export { Pef, Head, Body, Volume, Section, Page, Row };
