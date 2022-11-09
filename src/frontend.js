const page1 = "Ve dem!<br>Leksakspoeterna, fritidsesteterna<br>"
            + "– i deras ådror flyter hallonsaft så röd.<br>"
            + "De gömmer sig i rågfältens blåprickskjortlar,<br>"
            + "de tar sig munnen full<br>"
            + "av jordgubbar.<br><br>"
            + "Men vi ska förgöra dem!<br>"
            + "med pennknivar.<br>"
            + "Och dricka deras bröders<br>"
            + "bråda döds skål,<br>"
            + "vår inbördes skål,<br>"
            + "vår brödfödas skål<br><br>"
            +"i hallonsaft.";

const page2 = "Skulle<br> jag<br> vara <br> så <br> klok";

const page3 = "Vem är väl den på jordens vida rymd, som njutit smaken<br>" 
            + "av krusbär och av stora, söta, röda stickelbär,<br>"
            + "och som härvid ej ropar ut: jag aldrig smakat maken!<br>"
            + "Mot det en skeppslast dumma apelsiner intet är.<br>"
            + "Själv pomeranser<br>"
            + "jag föga anser.<br>"
            + "Vad bjuder oss uppriktigt Afrika?<br>"
            + "Vad visa kan Amerika?<br>"
            + "Vad Asien? Vad allt Europa?<br>"
            + "Jag trotsar öppet allihopa.<br>"
            + "Men Skandinavien - det är alladar!<br>"
            + "Blott Sverge svenska krusbär har<br>";

function PageReader (){
    return {
        pages : [],
        currentPageNbr : 0,
        pageForward : function() {
            if (this.currentPageNbr < this.pages.length - 1) {
                this.currentPageNbr++;
            }
                
        },
        pageBackward : function() {
            if (this.currentPageNbr > 0){
                this.currentPageNbr--;
            }
                
        },
        setCurrentPage : function(pageNbr) {
            pageNbr--;
            if (pageNbr < this.pages.length && pageNbr >= 0){
                this.currentPageNbr = pageNbr;
            }
                
        },
        addPage : function(page) {
            this.pages.push(page);
        },
        getCurrentPage : function(){
            return this.pages[this.currentPageNbr];
        }
    }
};

const pageReader = PageReader();

pageReader.addPage(page1);
pageReader.addPage(page2);
pageReader.addPage(page3);

const pageView = document.getElementById("text");
pageView.innerHTML = pageReader.getCurrentPage();

const pageInput = document.getElementById("goToPage");

document.getElementById("nextPage").addEventListener("click", () => {
    pageReader.pageForward();
    pageView.innerHTML = pageReader.getCurrentPage();
    pageInput.placeholder = pageReader.currentPageNbr + 1;
});

document.getElementById("formerPage").addEventListener("click", () => {
    pageReader.pageBackward();
    pageView.innerHTML = pageReader.getCurrentPage();
    pageInput.placeholder = pageReader.currentPageNbr + 1;
});

pageInput.addEventListener("input", () =>{
    let newPage = parseInt(pageInput.value);
    if (isNaN(newPage)){
        newPage = parseInt(pageInput.placeholder);
    }
    pageReader.setCurrentPage(newPage);
    pageView.innerHTML = pageReader.getCurrentPage();
})