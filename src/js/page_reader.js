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

    addPage(newPage, pageNbr) {

        this.maxPageNbr +=  pageNbr > 0 ? 1 : 0;
        // create pagenumber h1
        let shouldDisplay = pageNbr > 0  || this.pages.length === 0;
        let nbrDisplay = shouldDisplay ? '' + this.maxPageNbr : this.maxPageNbr + ' (forts.)';
        let firstLine = '';

        if (this.maxPageNbr === 0){
            firstLine += '<h1 tabindex=-1 id = "newPage"> Inledande sidor ('
                        + (this.pages.length + 1) + ')</h1>';
        }
        else{
            firstLine += '<h1 tabindex=-1 id = "newPage"> Sidan ' + nbrDisplay + '</h1>';
        }
        //add to array

        const fullPage = {text: firstLine + "<div id = 'bookPage' tabindex = 0 class=\"text-container\">" + 
                                    newPage + "</div>", pageNbr: this.maxPageNbr};

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

    //Get next page number
    //get previous page number

    recalibrate(){
        if (this.maxPageNbr === 0){
            this.maxPageNbr = this.pages.length-1;
            for (let i = 0; i < this.pages.length; i++){
                this.pages[i].pageNbr = i;
            }
        }
    }

    findPhrase(phrase){
        let pageNbrs = []
        let count = 0
        this.pages.forEach(el => {
            let pos = el.text.toLowerCase().indexOf(phrase.toLowerCase())
            if (pos != -1) {
                pageNbrs.push(el.pageNbr)
            }
            while (pos != -1){
                count++
                pos = el.text.toLowerCase().indexOf(phrase.toLowerCase(),pos+phrase.length)
            }
        });
        return {total: count,  matches: pageNbrs};
    }

    highLightPhrases(pageNbr, phrase){
        // does not  take into account inledande sidor yet
        let page = this.pages[pageNbr].text
        let pos = page.toLowerCase().indexOf(phrase.toLowerCase())
        let text = page
        while (pos != -1){
            let spanBegin = "<span tabindex = 0 style='color:blue'>"
            let posEnd = pos+phrase.length
            text = page.substring(0, pos) + spanBegin + page.substring(pos,posEnd) + "<span>" + page.substring(posEnd)
            pos = page.toLowerCase().indexOf(phrase.toLowerCase(),pos+posEnd)
        }
        console.log(text)
        return text;
       
    }

}

export { PageReader };
