import { Pef } from './pef.mjs';


const OutputFormats = {
    HTML: "HTML"
};


class OutputFormatter {
    /*
        Abstract class with all formatting methods used by the Outputter to
        format the output.
    */

    // --- First page ---/
    static formatFirstPageTitleStart()  { throw new Error("Not implemented!"); }
    static formatFirstPageAuthorStart() { throw new Error("Not implemented!"); }
    static formatFirstPageDateStart()   { throw new Error("Not implemented!"); }

    static formatFirstPageTitleEnd()  { throw new Error("Not implemented!"); }
    static formatFirstPageAuthorEnd() { throw new Error("Not implemented!"); }
    static formatFirstPageDateEnd()   { throw new Error("Not implemented!"); }

    // --- Normal content ---/
    static formatBodyStart()            { throw new Error("Not implemented!"); }
    static formatVolumeStart()          { throw new Error("Not implemented!"); }
    static formatSectionStart()         { throw new Error("Not implemented!"); }
    static formatPageStart()            { throw new Error("Not implemented!"); }
    static formatRowStart()             { throw new Error("Not implemented!"); }

    static formatBodyEnd()              { throw new Error("Not implemented!"); }
    static formatVolumeEnd()            { throw new Error("Not implemented!"); }
    static formatSectionEnd()           { throw new Error("Not implemented!"); }
    static formatPageEnd()              { throw new Error("Not implemented!"); }
    static formatRowEnd()               { throw new Error("Not implemented!"); }
}

class OutputFormatterHtml extends OutputFormatter {
    // First page
    static formatFirstPageTitleStart()  { return '<h2 class="first-page-title">'; }
    static formatFirstPageAuthorStart() { return '<h4 class="first-page-author">'; }
    static formatFirstPageDateStart()   { return '<h6 class="first-page-date">'; }

    static formatFirstPageTitleEnd()  { return '</h2>'; }
    static formatFirstPageAuthorEnd() { return '</h4>'; }
    static formatFirstPageDateEnd()   { return '</h6>'; }

    // Normal content
    static formatBodyStart()    { return '<div class="body">'; }
    static formatVolumeStart()  { return '<div class="volume">'; }
    static formatSectionStart() { return '<div class="section">'; }
    static formatPageStart()    { return '<div class="page">'; }
    static formatRowStart()     { return '<p>'; }

    static formatBodyEnd()      { return '</div>'; }
    static formatVolumeEnd()    { return '</div>'; }
    static formatSectionEnd()   { return '</div>'; }
    static formatPageEnd()      { return '</div>'; }
    static formatRowEnd()       { return '</p>'; }
}


class Outputter {

    /*
        Parameters:
            outputFormat <String>: Output formatter, as String, eg: "HTML"
        Returns:
            <OutputFormatter>: Subclass of OutputFormatter
    */
    static getOutputFormatter(outputFormat) {
        if (outputFormat.toUpperCase() == OutputFormats.HTML)
            return OutputFormatterHtml;
        else
            throw new Error(`Failed to recognize output format ${outputFormat}`);
    }

    /*
        Parameters:
            pefObject <Pef>
            outputFormat <String> What output format we want (as string), eg 'HTML'
        Returns:
            <String>: Formatted output text
    */
    static format(pefObject, outputFormat, pageReader) {
        let outputFormatter = Outputter.getOutputFormatter(outputFormat);
        let output = '';
        for (let [volumes_i, volume] of pefObject.body.volumes.entries()) {
            output += outputFormatter.formatVolumeStart();
            for (let [section_i, section] of volume.sections.entries()) {
                output += outputFormatter.formatSectionStart();
                for (let [page_i, page] of section.pages.entries()) {
                    let outputIndex = output.length;
                    output += outputFormatter.formatPageStart();
                    
                    for (let [row_i, row] of page.rows.entries()) {
                        output += outputFormatter.formatRowStart();
                        output += row;//Ändrade från row.text till endast row / Daniel
                        output += outputFormatter.formatRowEnd();
                    }
                    output += outputFormatter.formatPageEnd();
                    pageReader.addPage(output.substring(outputIndex, output.length-1));
                }
                output += outputFormatter.formatSectionEnd();
            }
            output += outputFormatter.formatVolumeEnd();
        }
        return output;
    }

    /*
        Parameters:
            metaData <Meta>
            outputFormat <String> What output format we want (as string), eg 'HTML'
        Returns:
            <String>: Formatted first page
    */
    static formatFirstPage(metaData, outputFormat) {
        let outputFormatter = Outputter.getOutputFormatter(outputFormat);

        let output = '';

        output += outputFormatter.formatFirstPageTitleStart() +
                  metaData.title +
                  outputFormatter.formatFirstPageTitleEnd();

        output += outputFormatter.formatFirstPageAuthorStart() +
                  metaData.creator +
                  outputFormatter.formatFirstPageAuthorEnd();

        output += outputFormatter.formatFirstPageDateStart() +
                  metaData.date +
                  outputFormatter.formatFirstPageDateEnd();

        return output;
    }

}

class FirstPageMetaData {
    constructor(title, creator, date) {
        this.title = title;
        this.creator = creator;
        this.date = date;
    }
}



export { Outputter, OutputFormats };
