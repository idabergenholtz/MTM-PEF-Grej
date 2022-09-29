import { Pef, Head, Body, Volume, Section, Page, Row } from './pef.mjs';
import { Outputter } from './outputter.mjs';

//import { Parser } from './parser.mjs';
//import { Translator } from './translator.mjs';

class Parser {
    // Input: String, Output: Pef
    static parse(pefFile) {
        return new Pef(
            new Head(),
            new Body([
                    new Volume([
                        new Section([
                            new Page([
                                new Row("Hello world!")
                            ])
                        ])
                    ])
                ])
        );
    }
};
class Translator {
    // Input: String (unicode braille), Output: String, cleartext
    static translate(braille) { return braille; }
};


const fileSelector = document.getElementById('file-selector');
const runConverter = document.getElementById('run-converter');
runConverter.addEventListener('click', () => Controller.run());


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
        if (fileSelector.files.length === 0) {
            console.warn('No file selected!');
            return;
        }

        let pefFile = fileSelector.files[0];
        let sizeKb = pefFile.size / 1000;
        console.log(`Converting file: ${pefFile.name}, size: ${sizeKb} kB, type: ${pefFile.type}`);

        console.log('Giving file to parser');
        let pefTree = Parser.parse(pefFile);
        console.log('Received pef tree from parser');

        console.log('Translating all rows from braille to clear text');
        for (let volume of pefTree.body.volumes) {
            for (let section of volume.sections) {
                for (let page of section.pages) {
                    for (let row of page.rows) {
                        row.text = Translator.translate(row.braille);
                    }
                }
            }
        }
        console.log('Done translating braille to clear text');

        let outputFileFormat = Controller.getOutputFileFormat();
        console.log(`Giving pef tree with clear text to outputter, using format: ${outputFileFormat}`);
        let output = Outputter.format(pefTree, outputFileFormat);
        console.log('Outputter complete');

        let outputFileName = Controller.getOutputFileName(pefFile.name);
        console.log(`Finished, downloading file: ${outputFileName}`);

        download(outputFileName, output);
    }
}


//download("nisse.html", "hejhej!");


export { Controller };