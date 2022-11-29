const OutputFormats = {
    HTML: "HTML"
};


class OutputFormatter {
    /*
        Abstract class with all formatting methods used by the Outputter to
        format the output.
    */

    // --- First page ---/
    static formatFirstPageTitleStart()         { throw new Error("Not implemented!"); }
    static formatFirstPageAuthorStart()        { throw new Error("Not implemented!"); }
    static formatFirstPageDateStart()          { throw new Error("Not implemented!"); }
    static formatFirstPageOtherMetaDataStart() { throw new Error("Not implemented!"); }

    static formatFirstPageTitleEnd()           { throw new Error("Not implemented!"); }
    static formatFirstPageAuthorEnd()          { throw new Error("Not implemented!"); }
    static formatFirstPageDateEnd()            { throw new Error("Not implemented!"); }
    static formatFirstPageOtherMetaDataEnd()   { throw new Error("Not implemented!"); }

    // --- Normal content ---/
    static formatBodyStart()                   { throw new Error("Not implemented!"); }
    static formatVolumeStart()                 { throw new Error("Not implemented!"); }
    static formatSectionStart()                { throw new Error("Not implemented!"); }
    static formatPageStart()                   { throw new Error("Not implemented!"); }
    static formatRowStart()                    { throw new Error("Not implemented!"); }

    static formatBodyEnd()                     { throw new Error("Not implemented!"); }
    static formatVolumeEnd()                   { throw new Error("Not implemented!"); }
    static formatSectionEnd()                  { throw new Error("Not implemented!"); }
    static formatPageEnd()                     { throw new Error("Not implemented!"); }
    static formatRowEnd()                      { throw new Error("Not implemented!"); }
}

class OutputFormatterHtml extends OutputFormatter {
    // First page
    static formatFirstPageTitleStart()     { return '<h1 tabindex=0 id="newPage" class="first-page-title">'; }
    static formatFirstPageAuthorStart()    { return '<h4 class="first-page-author">'; }
    static formatFirstPageDateStart()      { return '<h6 class="first-page-date">'; }
    static firstPageMetaDataTableStart()   { return '<table>'; }
    static formatFirstPageMetaKeyStart()   { return '<tr><td>'; }
    static formatFirstPageMetaValueStart() { return '<td>'; }

    static formatFirstPageTitleEnd()       { return '</h2>'; }
    static formatFirstPageAuthorEnd()      { return '</h4>'; }
    static formatFirstPageDateEnd()        { return '</h6>'; }
    static firstPageMetaDataTableEnd()     { return '</table>'; }
    static formatFirstPageMetaKeyEnd()     { return '</td>'; }
    static formatFirstPageMetaValueEnd()   { return '</td></tr>'; }

    // Normal content
    static formatBodyStart()               { return '<div class="body">'; }
    static formatVolumeStart()             { return '<div class="volume">'; }
    static formatSectionStart()            { return '<div class="section">'; }
    static formatPageStart()               { return '<div class="page">'; }
    static formatRowStart()                { return '<p>'; }

    static formatBodyEnd()                 { return '</div>'; }
    static formatVolumeEnd()               { return '</div>'; }
    static formatSectionEnd()              { return '</div>'; }
    static formatPageEnd()                 { return '</div>'; }
    static formatRowEnd()                  { return '</p>'; }
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
                        output += row;
                        output += outputFormatter.formatRowEnd();
                    }
                    output += outputFormatter.formatPageEnd();
                    pageReader.addPage(page, outputFormatter);
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
        let otherMetaData = new Map();

        for (const [key, value] of Object.entries(metaData)) {
            switch (key) {
                case 'title':
                    output += outputFormatter.formatFirstPageTitleStart() +
                              value +
                              outputFormatter.formatFirstPageTitleEnd();
                break;
                case 'creator':
                    output += outputFormatter.formatFirstPageAuthorStart() +
                              value +
                              outputFormatter.formatFirstPageAuthorEnd();
                    break;
                case 'date':
                    output += outputFormatter.formatFirstPageDateStart() +
                              value +
                              outputFormatter.formatFirstPageDateEnd();
                    break;
                default:
                    // If the value for the given meta data exists, we'll save it
                    // for now so we can add it to the front page so it comes after title/creator/date.
                    if (value) {
                        otherMetaData.set(key, value);
                    }
                    break;
            }
        }

        let addedMetadataTable = false;

        for (const [key, value] of otherMetaData.entries()) {
            if (!addedMetadataTable) {
                // Let's append a metadata table
                output += outputFormatter.firstPageMetaDataTableStart();
                addedMetadataTable = true;
            }

            output += outputFormatter.formatFirstPageMetaKeyStart() +
                      key +
                      outputFormatter.formatFirstPageMetaKeyEnd() +
                      outputFormatter.formatFirstPageMetaValueStart() +
                      value +
                      outputFormatter.formatFirstPageMetaValueEnd();
        }

        if (addedMetadataTable) {
            output += outputFormatter.firstPageMetaDataTableEnd();
        }


        return output;
    }

}


export { Outputter, OutputFormats };
