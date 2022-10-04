import { Pef, Head, Body, Volume, Section, Page, Row } from './pef.mjs';
import { Outputter } from './outputter.mjs';
import {recieveFile} from './Parser.mjs';
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


const fileSelector = document.getElementById('file-selector');
fileSelector.addEventListener("input", () => {
    fileRead = false;
    fileName = ""
    if (fileSelector.files.length === 0) {
        console.warn('No file selected!');
        return;
    }
    let pefFile = fileSelector.files[0];
    fileName = pefFile.name
    let sizeKb = pefFile.size / 1000;
    let reader = new FileReader()
    reader.addEventListener("loadend", () => {//waits for the file to finish loading
        text = reader.result
        fileRead = true;
    });
    reader.readAsText(pefFile)//load file
})
const runConverter = document.getElementById('converter-button');
runConverter.addEventListener('click', () => {
    if(fileRead)Controller.run()
});


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

    static run() {
        // 1. Open file?
        //console.log(`Converting file: ${pefFile.name}, size: ${sizeKb} kB, type: ${pefFile.type}`);
        console.log('Giving file to parser');
        let pefTree = recieveFile(text)
        console.log('Received pef tree from parser');
        console.log(pefTree)
        
        console.log(pefTree.head.meta.title)
        console.log('Translating all rows from braille to clear text');
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
        }
        console.log('Done translating braille to clear text');

        let outputFileFormat = Controller.getOutputFileFormat();
        console.log(`Giving pef tree with clear text to outputter, using format: ${outputFileFormat}`);
        let output = Outputter.format(pefTree, outputFileFormat);
        console.log('Outputter complete');
        let outputFileName = Controller.getOutputFileName(fileName);
        
        console.log(`Finished, downloading file: ${outputFileName}`);

        download(outputFileName, output);
    }
}


//download("nisse.html", "hejhej!");


export { Controller };