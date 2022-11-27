function PageReader (){
    return {
        pages : [],
        currentPageNbr : 0,
        maxPageNbr : 0,
        title : "",
        addTitle : function(title) {
            this.title = title;
        },
        pageForward : function() {
            if (this.currentPageNbr < this.pages.length-1) {
                this.currentPageNbr++;
                return true;
            }
            else{
                alert("Det finns inga fler sidor i boken.");
                return false;
            }

        },
        pageBackward : function() {
            if (this.currentPageNbr > 0){
                this.currentPageNbr--;
                return true;
            }
            else{
                alert("Du kan inte gå längre bakåt i den här boken.");
                return false;
            }

        },
        reset : function() {
            this.pages = [];
            this.currentPageNbr = 0;
            this.maxPageNbr = 0;
            console.log(this.pages, this.currentPageNbr, this.maxPageNbr);
        },
        setCurrentPage : function(pageNbr) {
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
        },
        addPage : function(page, outputFormatter) {

            let newPage = ''
            newPage += outputFormatter.formatPageStart();
            let pageRows = page.rows.entries();
            let pageNbr = -1;
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
                    newPage += outputFormatter.formatRowStart();
                    newPage += row;
                    newPage += outputFormatter.formatRowEnd();
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

        },
        addFirstPage : function(page) {
            const fullPage = {text: page, pageNbr: 0}
            this.pages.unshift(fullPage);
        },
        getCurrentPage : function() {
            return this.pages[this.currentPageNbr].text;
        },
        getNbrOfPages(){
            return this.maxPageNbr;
        },
        getCurrentPageNbr(){
            return this.pages[this.currentPageNbr].pageNbr;
        },
        recalibrate(){
            if (this.maxPageNbr === 0){
                console.log("did not find any page numbers")
                this.maxPageNbr = this.pages.length-1;
                for (let i = 0; i < this.pages.length; i++){
                    this.pages[i].pageNbr = i;
                }
            }
        }
    }
};

export { PageReader };
