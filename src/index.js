import { Controller } from './controller.js';
import { PageReader } from './page_reader.js';


const pageReader = new PageReader();
const controller = new Controller(pageReader);
const KNOWN_PEF_FILE_TYPES = [
    'image/PEF',             // Where is this coming from?
    'image/x-pentax-pef',    // PEF is actually file format for raw images; so some OS thinks .pef files should have this extension (http://fileformats.archiveteam.org/wiki/Pentax_PEF).
    'application/x-pef+xml', // As specified in PEF spec (https://braillespecs.github.io/pef/pef-specification.html#Internet).
]

let fileName;
let readingFile;

const htmlPageView  = document.getElementById("text");
const htmlPageInput = document.getElementById("goToPage");
const htmlFileSelector = document.getElementById('file-selector');

const htmlBackToConversion = document.getElementById('backToConversion');
const htmlNextPage = document.getElementById('nextPage');
const htmlPreviousPage = document.getElementById('previousPage');

const htmlChosenFile = document.getElementById("chosenFile");
const htmlConvertingText = document.getElementById("convertingText");

// -- Attach callbacks -- //

htmlFileSelector.addEventListener('input', selectFile);
htmlBackToConversion.addEventListener("click", goBackToConversion);
htmlNextPage.addEventListener("click", nextPage);
htmlPreviousPage.addEventListener("click", previousPage);
htmlPageInput.addEventListener("input", changeCurrentPage);
htmlPageInput.addEventListener("blur", displayCurrentPage);


// -- Helper functions -- //

function toggleDiv(toConvertDiv){
    let convDiv = document.getElementById("convertDiv");
    let readDiv = document.getElementById("readerDiv");
    readDiv.style.display = toConvertDiv ? "none" : "block";
    convDiv.style.display = toConvertDiv ? "block" : "none";
}

function isPefFileType(fileType) {
    return KNOWN_PEF_FILE_TYPES.indexOf(fileType) != -1;
}

function selectFile() {
    // TODO: Fix this synch
    if (readingFile) {
        alert('Läser redan en fil...');
        return;
    }

    if (htmlFileSelector.files.length === 0) {
        console.warn('No file selected!');
        return;
    }

    let pefFile = htmlFileSelector.files[0];

    /*
    if (!isPefFileType(pefFile.type)) {
        window.alert("Filen du försöker ladda är inte PEF-fil.");
        return;
    }

    let shouldConvert = window.confirm("Vill du konvertera " + pefFile.name + "?")
    if (!shouldConvert){
        return;
    }
    */

    fileName = pefFile.name;
    let fileRead = false;
    let sizeKb = pefFile.size / 1000;

    // Create filereader and start reading the file.
    let reader = new FileReader();
    reader.addEventListener("loadend", () => convertFile(reader, sizeKb));
    readingFile = true;
    reader.readAsText(pefFile);

    // Update UI
    htmlChosenFile.innerHTML = fileName;
    htmlConvertingText.style = "display:block";
}

/* Gets called when the input file has successfully been loaded. */
function convertFile(reader, sizeKb) {
    readingFile = false;
    let inputText = reader.result;
    controller.run(fileName, sizeKb, inputText);
    displayCurrentPage();
    toggleDiv(false);
}

function downloadFile(filename, text) {
    let downloadDummyElement = document.createElement('a');
    downloadDummyElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    downloadDummyElement.setAttribute('download', filename);
    downloadDummyElement.style.display = 'none';
    document.body.appendChild(downloadDummyElement);
    downloadDummyElement.click();
    document.body.removeChild(downloadDummyElement);
}

function displayCurrentPage(){
    htmlPageView.innerHTML = pageReader.getCurrentPage();
    let pageNumber = pageReader.getCurrentPageNbr();
    setPageNumber(pageNumber);
    htmlNextPage.focus();
}

function formatPagePlaceHoler(pageNbr) {
    return `${pageNbr} (av ${pageReader.getNbrOfPages()})`;
}

function setPageNumber(pageNumber, saveInLocalStorage = false) {
    htmlPageInput.value = "";
    htmlPageInput.placeholder = formatPagePlaceHoler(pageNumber);

    if (saveInLocalStorage) {
        window.localStorage.setItem(fileName, "" + pageNumber);
    }
}

function goBackToConversion() {
    htmlConvertingText.style = "display:none";
    htmlChosenFile.innerHTML = "- ingen fil vald";
    toggleDiv(true);

    // Must clear this if we go back and want to select the same file again.
    htmlFileSelector.value = '';
    pageReader.reset();

    // Question: Do we want to reset the page number here?
    setPageNumber(0, true);
};

function nextPage() {
    pageReader.pageForward();
    displayCurrentPage();
}

function previousPage() {
    pageReader.pageBackward();
    displayCurrentPage();
}

function changeCurrentPage() {
    let newPage = parseInt(htmlPageInput.value);
    if (isNaN(newPage)){
        newPage = parseInt(htmlPageInput.placeholder);
    }
    pageReader.setCurrentPage(newPage);
    htmlPageView.innerHTML = pageReader.getCurrentPage();
}
