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
    static format(pefObject, outputFormat) {
        let outputFormatter = Outputter.getOutputFormatter(outputFormat);
        let output = '';
        for (let [volumes_i, volume] of pefObject.body.volumes.entries()) {
            output += outputFormatter.formatVolumeStart();
            for (let [section_i, section] of volume.sections.entries()) {
                output += outputFormatter.formatSectionStart();
                for (let [page_i, page] of section.pages.entries()) {
                    output += this.formatPage(page, outputFormatter).page;
                }
                output += outputFormatter.formatSectionEnd();
            }
            output += outputFormatter.formatVolumeEnd();
        }
        // output += "<span id='jump_to_this_location'>Jump here!</span>";
        return output;
    }
    
    static foundContents = 0;
    static stopLooking = false
    static contentPages = []
    /**
     * 
     * @param {*} page 
     * @param {*} outputFormatter 
     * @returns object with page text and page nbr
     */
    static formatPage(page, outputFormatter) {
        let newPage = ''
        // newPage += outputFormatter.formatPageStart();
        let pageRows = page.rows.entries();
        let pageNbr = -1;
        let prevRow = '';
        let prevRowHadhypen = false;

        let volymCounter = 0

        for (let [row_i, row] of pageRows) {
            if (row_i == 0){
                let str = row.replace(/\s+/g, '');
                pageNbr = parseInt(str);
                pageNbr = !isNaN(pageNbr) ? pageNbr : -1;
            }

            if (row.toUpperCase().includes("INNEHÅLL")){
                // console.log(row)
                this.foundContents += 1;
            }


            if (this.foundContents == 1 && row.toUpperCase().includes("VOLYM")){
                volymCounter++;
            }

            // page number row will not be added to normal page text
            // special page numbers like roman numerals will be added however
            // as well as first rows not containing page numbers
            let isBlankRow = row === 'PEFBLANKROW'.replace(/\s+/g, '');
            if (isBlankRow){
                newPage += '<br>';
            }
            else if (pageNbr < 0){
                newPage += outputFormatter.formatRowStart();
                newPage += row;
                newPage += outputFormatter.formatRowEnd();
            }
            else if (row_i !== 0) {
                //newPage += outputFormatter.formatRowStart();
                let shouldDeleteSpaces = prevRowHadhypen;
                let hyphenFound = hasHyphen(row);
                row = hyphenFound ? taBortAvstavning(row) : row;
                prevRowHadhypen = hyphenFound;
                let nbrOfSpaces = countSpaces(row);
                let lineBreak = nbrOfSpaces > countSpaces(prevRow) && prevRow !== '';
                prevRow = row;
                row = shouldDeleteSpaces ? row.substring(nbrOfSpaces) : row;
                
                if (lineBreak){
                    newPage += '<br>&ensp;' + row;
                }
                else{
                    newPage += row;
                }
                //newPage += outputFormatter.formatRowEnd();
            }
        }
        // newPage += outputFormatter.formatPageEnd();
        if (volymCounter > 0){
            ///console.log(newPage)
            pageRows = page.rows.entries();
            let r = /\d+/g;
            let contentArray = []
            let str = ''
            let nbr = -1
            for (let [row_i, row] of pageRows) {
                let matches = row.match(r)
                str += row
                if (matches){
                    // let str = ""
                    // matches.forEach(e => str += e + " ")
                    // str += row + matches[matches.length -1]
                    // console.log(str)
                    let prevNbr = nbr

                    let newNbr = matches[matches.length-1]
                    if (newNbr >= prevNbr){
                        nbr = newNbr
                        contentArray.push(str)
                        str = ''
                    }
                }
            }
            let ind = 0
            contentArray.forEach(e => {
                let out = "ROW " + ind + ": " + e
                console.log(out)
            });
        }
        return {page: newPage, pageNbr: pageNbr};
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

//helper functions
function hasHyphen(str){
    let index = str.length-1;
    let letter = str.charAt(index);
    let hasHyphen= false;
    while(letter === ' ' || letter === '-'){
        hasHyphen = letter === '-';
        index--;
        letter = str.charAt(index);
    }
    return hasHyphen;
}

function taBortAvstavning(str){
    let index = str.length-1;
    let letter = str.charAt(index);
    while(letter === ' ' || letter === '-'){
        str = str.substring(0, index);
        index--;
        letter = str.charAt(index);
    }
    return str;
}

function countSpaces(str){
    let letter = str.charAt(0);
    let count = 0;
    while (letter === ' '){
        count++;
        letter = str.charAt(count);
    }
    return count;
}


export { Outputter, OutputFormats };
