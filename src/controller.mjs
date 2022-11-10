import { Pef, Head, Body, Volume, Section, Page, Row } from './pef.mjs';
import { Outputter } from './outputter.mjs';
import { receiveFile } from './Parser.mjs';
import { translateToSwedish } from './translator.mjs';

//import { Parser } from './parser.mjs';
//import { Translator } from './translator.mjs';
let text = "";
let fileName = ""
let fileRead = false;
class Translator {
    // Input: String (unicode braille), Output: String, cleartext
    static translate(braille) { return translateToSwedish(braille); }
};

const KNOWN_PEF_FILE_TYPES = [
    'image/PEF',             // Where is this coming from?
    'image/x-pentax-pef',    // PEF is actually file format for raw images; so some OS thinks .pef files should have this extension (http://fileformats.archiveteam.org/wiki/Pentax_PEF).
    'application/x-pef+xml', // As specified in PEF spec (https://braillespecs.github.io/pef/pef-specification.html#Internet).
]

function isPefFileType(fileType) {
    console.log(KNOWN_PEF_FILE_TYPES, fileType, KNOWN_PEF_FILE_TYPES.indexOf(fileType));
    return KNOWN_PEF_FILE_TYPES.indexOf(fileType) != -1;
}


document.getElementById('backToConversion').addEventListener("click", () => {
    document.getElementById("convertingText").style = "display:none";
    document.getElementById("chosenFile").innerHTML = "- ingen fil vald";
    toggleDiv(true);
});

function toggleDiv(toConvertDiv){
    let convDiv = document.getElementById("convertDiv");
    let readDiv = document.getElementById("readerDiv");
    
    readDiv.style.display = toConvertDiv ? "none" : "block";
    convDiv.style.display = toConvertDiv ? "block" : "none";
}

const fileSelector = document.getElementById('file-selector');
fileSelector.addEventListener("input", () => {
    fileRead = false;
    fileName = ""
    if (fileSelector.files.length === 0) {
        console.warn('No file selected!');
        return;
    }

    let pefFile = fileSelector.files[0];
    //JOHAN: Correct file type check
    if (!isPefFileType(pefFile.type)) {
        window.alert("Filen du försöker ladda är inte PEF-fil.");
        return;
    }
    //JOHAN: Lägger till en check för att fråga om man valt rätt fil
    let shouldConvert = window.confirm("Vill du konvertera " + pefFile.name + "?")
    if (!shouldConvert){
        return;
    }

    fileName = pefFile.name
    let sizeKb = pefFile.size / 1000;
    let reader = new FileReader();

    document.getElementById("chosenFile").innerHTML = fileName;
    document.getElementById("convertingText").style = "display:block";

    reader.addEventListener("loadend", () => {//waits for the file to finish loading
        let inputText = reader.result
        fileRead = true;
        //JOHAN: Kör run direkt istället för konvertera-knapp
        Controller.run(fileName, sizeKb, inputText);
    });

    reader.readAsText(pefFile)//load file
})
/*
const runConverter = document.getElementById('converter-button');
runConverter.addEventListener('click', () => {
    if(fileRead)Controller.run()
});
*/

function download(filename, text) {
    let downloadDummyElement = document.createElement('a');
    downloadDummyElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    downloadDummyElement.setAttribute('download', filename);
    downloadDummyElement.style.display = 'none';
    document.body.appendChild(downloadDummyElement);
    downloadDummyElement.click();
    document.body.removeChild(downloadDummyElement);
}

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
                for (i = 0; i < this.pages.length; i++){
                    this.pages[i].pageNbr = i;
                }
            }
        }
    }
};


let pageReader = PageReader();


class Controller {
    /*
        Parameters:
            inputFilename <String>: Output formatter, as String, eg: "HTML"
        Returns:
            <OutputFormatter>: Subclass of OutputFormatter
    */
    static getOutputFileName(inputFilename) {
        return inputFilename.split('.')[0] + '.html';
    }

    /*
        Returns:
            <String>: Format to use for formatting output.
    */
    static getOutputFileFormat() {
        return 'HTML';
    }

    /*
        Parameters:
            filename <String>
            sizeKb <Integer>
            inputText <String>
    */
    static run(fileName, sizeKb, inputText, download=false) {
        
        pageReader = PageReader();
        // 1. Open file?
        //console.log(`Converting file: ${pefFile.name}, size: ${sizeKb} kB, type: ${pefFile.type}`);
        console.log('Giving file to parser');
        let pefTree = receiveFile(inputText)
        let metaData = pefTree.head.meta;
        console.log(`Received pef tree from parser: ${metaData.title}`);
        console.log('Entire pef object');
        console.log(pefTree);

        console.log('Translating all rows from braille to clear text');

        //let count = 0;
        for (let volume of pefTree.body.volumes) {
            for (let section of volume.sections) {
                for (let page of section.pages) {
                    /*for (let row of page.rows) {
                        
                    }*/
                    for(let i = 0; i < page.rows.length; i++) {
                        page.rows[i] = translateToSwedish(page.rows[i])
                    }
                }
            }
            //document.getElementById('convertPer').textContent = 
            //                "Konvertering " + (count/pefTree.body.volumes.length)*100 + "% färdig.";
           // count++;
        }
        //document.getElementById('convertPer').textContent = 
        //                    "Konvertering " + 100 + "% färdig.";
        console.log('Done translating braille to clear text');

        let outputFileFormat = Controller.getOutputFileFormat();
        console.log(`Using output format: ${outputFileFormat}`);

        console.log(`Creating first page from meta date in header: ${metaData}`);
        let firstPage = Outputter.formatFirstPage(metaData, outputFileFormat);

        console.log(firstPage);

        console.log('Giving pef tree with clear text to outputter');
        let output = Outputter.format(pefTree, outputFileFormat, pageReader);
        console.log('Outputter complete');


        if (download) {
            let outputFileName = Controller.getOutputFileName(fileName);
            console.log(`Finished, downloading file: ${outputFileName}`);
            download(outputFileName, output);
        }

        //JOHAN: Skippar nedladdning och skriver ut direkt på sidan (för demo och diskussion)
        //let html = firstPage + output;
        //document.getElementById('text').innerHTML = html;
    
        pageReader.addFirstPage(firstPage);
        pageReader.recalibrate();
        displayCurrentPage();
        toggleDiv(false);
    }
}

const pageView = document.getElementById("text");

const pageInput = document.getElementById("goToPage");

function displayCurrentPage(){
    pageView.innerHTML = pageReader.getCurrentPage();
    pageInput.value = "";
    pageInput.placeholder = (pageReader.getCurrentPageNbr()) + " (av " + pageReader.getNbrOfPages() + ")";
} 

document.getElementById("nextPage").addEventListener("click", () => {
    pageReader.pageForward();
    displayCurrentPage();
});

document.getElementById("formerPage").addEventListener("click", () => {
    pageReader.pageBackward();
    displayCurrentPage();
});

pageInput.addEventListener("input", () =>{
    let newPage = parseInt(pageInput.value);
    if (isNaN(newPage)){
        newPage = parseInt(pageInput.placeholder);
    }
    pageReader.setCurrentPage(newPage);
    pageView.innerHTML = pageReader.getCurrentPage();
})

export { Controller };
