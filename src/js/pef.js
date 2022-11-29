
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
    constructor(
        format,
        identifier,
        title,
        creator,
        subject,
        description,
        publisher,
        contributor,
        date,
        type,
        source,
        language,
        relation,
        coverage,
        rights
    ) {
        this.format = format;
        this.identifier = identifier;
        this.title = title;
        this.creator = creator;
        this.subject = subject;
        this.description = description;
        this.publisher = publisher;
        this.contributor = contributor;
        this.date = date;
        this.type = type;
        this.source = source;
        this.language = language;
        this.relation = relation;
        this.coverage = coverage;
        this.rights = rights;
    }
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

export { Pef, Head, MetaData, Body, Volume, Section, Page };
