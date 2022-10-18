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
    static run(fileName, sizeKb, inputText) {
        // 1. Open file?
        //console.log(`Converting file: ${pefFile.name}, size: ${sizeKb} kB, type: ${pefFile.type}`);
        console.log('Giving file to parser');
        let pefTree = receiveFile(inputText)
        console.log('Received pef tree from parser');
        console.log(pefTree)

        console.log(pefTree.head.meta.title)
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
        console.log(`Giving pef tree with clear text to outputter, using format: ${outputFileFormat}`);
        let output = Outputter.format(pefTree, outputFileFormat);
        console.log('Outputter complete');
        let outputFileName = Controller.getOutputFileName(fileName);
        
        console.log(`Finished, downloading file: ${outputFileName}`);

        //JOHAN: Skippar nedladdning och skriver ut direkt på sidan (för demo och diskussion)
        document.getElementById('text').innerHTML = output;
        //download(outputFileName, output);
    }
}


//download("nisse.html", "hejhej!");


export { Controller };