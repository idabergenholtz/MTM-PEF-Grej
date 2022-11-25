import { Outputter } from './outputter.js';
import { receiveFile } from './Parser.js';
import { translateToSwedish } from './translator.js';
import { PageReader } from './page_reader.js';
import { frontPage} from './removeFrontPage.js';


class Controller {

    constructor(pageReader) {
        this.pageReader = pageReader;
    }

    /*
        Parameters:
            inputFilename <String>: Output formatter, as String, eg: "HTML"
        Returns:
            <OutputFormatter>: Subclass of OutputFormatter
    */
    getOutputFileName(inputFilename) {
        return inputFilename.split('.')[0] + '.html';
    }

    /*
        Returns:
            <String>: Format to use for formatting output.
    */
    getOutputFileFormat() {
        return 'HTML';
    }

    /*
        Parameters:
            filename <String>
            sizeKb <Integer>
            inputText <String>
    */
    run(fileName, sizeKb, inputText, download=false) {
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

        //Removing front page, can be extended to include more changes to the translated pefObject.
        pefTree = frontPage(pefTree);

        let outputFileFormat = this.getOutputFileFormat();
        console.log(`Using output format: ${outputFileFormat}`);

        console.log(`Creating first page from meta date in header: ${metaData}`);
        let firstPage = Outputter.formatFirstPage(metaData, outputFileFormat);

        console.log(firstPage);

        console.log('Giving pef tree with clear text to outputter');
        let output = Outputter.format(pefTree, outputFileFormat, this.pageReader);
        console.log('Outputter complete');


        if (download) {
            let outputFileName = this.getOutputFileName(fileName);
            console.log(`Finished, downloading file: ${outputFileName}`);
            download(outputFileName, output);
        }

        //let html = firstPage + output;
        //document.getElementById('text').innerHTML = html;

        this.pageReader.addFirstPage(firstPage);
        this.pageReader.addTitle(metaData.title);
        this.pageReader.recalibrate();

        //look if in local storage
        let lastPage = window.localStorage.getItem(fileName); //identifier global fileName
        if (lastPage === null){
            window.localStorage.setItem(fileName, "0");
            lastPage = "0";
        }
        this.pageReader.setCurrentPage(parseInt(lastPage));

    }
}


export { Controller };
