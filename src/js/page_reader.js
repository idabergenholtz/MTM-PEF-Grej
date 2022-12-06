class PageReader {

    constructor() {
        this.pages = [];
        this.currentPageNbr = 0;
        this.maxPageNbr = 0;
        this.title = "";
    }

    addTitle(title) {
        this.title = title;
    }

    pageForward() {
        if (this.currentPageNbr < this.pages.length-1) {
            this.currentPageNbr++;
            return true;
        }
        else{
            alert("Det finns inga fler sidor i boken.");
            return false;
        }

    }

    pageBackward() {
        if (this.currentPageNbr > 0){
            this.currentPageNbr--;
            return true;
        }
        else{
            alert("Du kan inte gå längre bakåt i den här boken.");
            return false;
        }

    }

    reset() {
        this.pages = [];
        this.currentPageNbr = 0;
        this.maxPageNbr = 0;
        console.log(this.pages, this.currentPageNbr, this.maxPageNbr);
    }

    setCurrentPage(pageNbr) {
        if (pageNbr > this.maxPageNbr || pageNbr < 0){
            alert("Sidnumret du försöker ange finns inte i den här boken.")
            return;
        }
        let index = pageNbr;
        let nbr = this.pages[index].pageNbr;
        //Look ahead
        while (nbr != pageNbr && index < this.pages.length-1){
            index++;
            nbr = this.pages[index].pageNbr;
        }
        if (nbr === pageNbr){
            this.currentPageNbr = index;
            return;
        }

        //if correct page was not ahead, look back
        index = pageNbr;
        while (nbr != pageNbr && index > 0){
            index--;
            nbr = this.pages[index].pageNbr;
        }
        if (nbr === pageNbr){
            this.currentPageNbr = index;
        }
        else{
            this.currentPageNbr = pageNbr;
        }
    }

    addPage(page, outputFormatter) {

        let newPage = ''
        newPage += outputFormatter.formatPageStart();
        let pageRows = page.rows.entries();
        let pageNbr = -1;
        let prevRow = '';
        let prevRowHadhypen = false;
        for (let [row_i, row] of pageRows) {
            if (row_i == 0){
                let str = row.replace(/\s+/g, '');
                pageNbr = parseInt(str);
                pageNbr = !isNaN(pageNbr) ? pageNbr : -1;
            }
            // page number row will not be added to normal page text
            // special page numbers like roman numerals will be added however
            // as well as first rows not containing page numbers
            if (row_i !== 0 || pageNbr < 0) {
                //newPage += outputFormatter.formatRowStart();
                let shouldDeleteSpaces = prevRowHadhypen;
                let isBlankRow = row === 'PEFBLANKROW'.replace(/\s+/g, '');
                let hyphenFound = hasHyphen(row);
                row = hyphenFound? taBortAvstavning(row) : row;
                prevRowHadhypen = hyphenFound;
                let nbrOfSpaces = countSpaces(row);
                let lineBreak = nbrOfSpaces > countSpaces(prevRow);
                prevRow = row;
                row = shouldDeleteSpaces ? row.substring(nbrOfSpaces) : row;
                if (isBlankRow){
                    newPage += '<br><br>';
                }
                else if (lineBreak){
                    newPage += '<br>&ensp;' + row;
                }
                else{
                    newPage += row;
                }
                //newPage += outputFormatter.formatRowEnd();
            }
        }
        newPage += outputFormatter.formatPageEnd();
        this.maxPageNbr +=  pageNbr > 0 ? 1 : 0;
        // create pagenumber h1
        let shouldDisplay = pageNbr > 0  || this.pages.length === 0;
        let nbrDisplay = shouldDisplay ? '' + this.maxPageNbr : this.maxPageNbr + ' (forts.)';
        let firstLine = '';

        if (this.maxPageNbr === 0){
            firstLine += '<h1 tabindex=0 id = "newPage"> Inledande sidor ('
                        + (this.pages.length + 1) + ')</h1>';
        }
        else{
            firstLine += '<h1 tabindex=0 id = "newPage"> Sidan ' + nbrDisplay + '</h1>';
        }
        //add to array
        const fullPage = {text: firstLine + newPage, pageNbr: this.maxPageNbr};
        this.pages.push(fullPage);

    }

    addFirstPage(page) {
        const fullPage = {text: page, pageNbr: 0}
        this.pages.unshift(fullPage);
    }

    getCurrentPage() {
        return this.pages[this.currentPageNbr].text;
    }

    getNbrOfPages(){
        return this.maxPageNbr;
    }

    getCurrentPageNbr(){
        return this.pages[this.currentPageNbr].pageNbr;
    }

    recalibrate(){
        if (this.maxPageNbr === 0){
            this.maxPageNbr = this.pages.length-1;
            for (let i = 0; i < this.pages.length; i++){
                this.pages[i].pageNbr = i;
            }
        }
    }

}

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

export { PageReader };
