function PageReader (){
    return {
        pages : [],
        currentPageNbr : 0,
        maxPageNbr : 0,
        pageForward : function() {
            if (this.currentPageNbr < this.pages.length-1) {
                this.currentPageNbr++;
            }

        },
        pageBackward : function() {
            if (this.currentPageNbr > 0){
                this.currentPageNbr--;
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

            let newPage = ""
            newPage += outputFormatter.formatPageStart();
            let pageRows = page.rows.entries();
            let pageNbr = -1;
            for (let [row_i, row] of pageRows) {
                if (row_i == 0){
                    let str = row.replace(/\s+/g, '');
                    pageNbr = parseInt(str);
                    pageNbr = !isNaN(pageNbr) ? pageNbr : -1;
                }
                newPage += outputFormatter.formatRowStart();
                newPage += row;//Ändrade från row.text till endast row / Daniel
                newPage += outputFormatter.formatRowEnd();
            }
            newPage += outputFormatter.formatPageEnd();

            this.maxPageNbr +=  pageNbr > 0 ? 1 : 0;
            const fullPage = {text: newPage, pageNbr: this.maxPageNbr};
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
