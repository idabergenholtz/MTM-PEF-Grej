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

//extra global for making convert with choice work
let inputText = '';

// -- Get html elements -- //
const htmlPageView         = document.getElementById("text");
const htmlPageInput        = document.getElementById("goToPage");
const htmlFileSelector     = document.getElementById('file-selector');
const htmlBackToConversion = document.getElementById('backToConversion');
const htmlNextPage         = document.getElementById('nextPage');
const htmlPreviousPage     = document.getElementById('previousPage');
const htmlChosenFile       = document.getElementById("chosenFile");
const htmlConvertingText   = document.getElementById("convertingText");

// html elements for choosing reading style
const htmlConvertBtn = document.getElementById("convert-btn");
const htmlFlowText = document.getElementById("flowText");

// -- Attach callbacks -- //
htmlFileSelector.addEventListener('input', selectFile);
htmlBackToConversion.addEventListener("click", goBackToConversion);
htmlNextPage.addEventListener("click", nextPage);
htmlPreviousPage.addEventListener("click", previousPage);
htmlPageInput.addEventListener("input", changeCurrentPage);
htmlPageInput.addEventListener("blur", pageChangeFinished);
htmlPageInput.addEventListener("keydown", inputPageKeyDown)

//extra attach callbacks
htmlConvertBtn.addEventListener("click", convert);


// -- Helper functions -- //

function toggleDiv(toConvertDiv, pageByPage = true){

    // let convDiv = document.getElementById("convertDiv");
    // let readDiv = document.getElementById("readerDiv");
    // readDiv.style.display = toConvertDiv ? "none" : "block";
    // convDiv.style.display = toConvertDiv ? "block" : "none";
    
    document.getElementById("convertDiv").style.display = toConvertDiv ? "block" : "none";
    if (toConvertDiv){
        document.getElementById("readerDiv").style.display = "none";
        document.getElementById("flowDiv").style.display = "none";
    }
    else if (pageByPage){
        document.getElementById("readerDiv").style.display = "block";
    }
    else{
        document.getElementById("flowDiv").style.display = "block";
    }
    
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

    let splitFileNameArray = pefFile.name.split(".");
    let fileSuffix = splitFileNameArray[splitFileNameArray.length-1];
    console.log("The suffix is " + fileSuffix);
    if (fileSuffix !== "pef") {
        window.alert("Filen du försöker ladda är inte PEF-fil.");
        return;
    }


    // let shouldConvert = window.confirm("Vill du läsa " + pefFile.name + "?")
    // if (!shouldConvert){
    //     return;
    // }
    
    fileName = pefFile.name;
    let fileRead = false;
    let sizeKb = pefFile.size / 1000;

    // Create filereader and start reading the file.
    let reader = new FileReader();
    reader.addEventListener("loadend", () => saveInputText(reader, sizeKb));
    readingFile = true;
    reader.readAsText(pefFile);

    // Update UI
    htmlChosenFile.innerHTML = fileName;
    //htmlConvertingText.style = "display:block";
}

/* Gets called when the input file has successfully been loaded. */
//previous name was convert()
function saveInputText(reader, sizeKb) {
    readingFile = false;
    inputText = reader.result;
 
}

function convert(){
    if (readingFile) {
        alert("Filen är inte färdigläst.");
        return;
    }
    if (inputText === ''){
        alert("Ingen fil är vald.")
        return;
    }
    htmlConvertingText.style = "display:block";
    let byPage = document.getElementById("byPage").checked;
    if (byPage){
        controller.run(fileName, 0, inputText);
        displayCurrentPage();
        toggleDiv(false);
    }
    else{
        let text = controller.run(fileName, 0, inputText, false);
        //findContents(text)
        
        htmlFlowText.innerHTML = text
        toggleDiv(false, false);
    }
    inputText = '';
    // findPhraseField.value="0";
    // matches =[]
}


// PAGE NAVIGATION

function displayCurrentPage(focusNewPage = true){
    htmlPageView.innerHTML = pageReader.getCurrentPage();
    let pageNumber = pageReader.getCurrentPageNbr();
    setPageNumber(pageNumber, true);
    const h1 = document.getElementById('newPage');
    document.title = h1.innerText + " - " + pageReader.title;
    if (focusNewPage){
        //We need to use document.getElementById directly here
        //since the h1 tag changes every time
        //So a global const won't work
        const daPage = document.getElementById('currentPage')
        if (daPage != null) {
           daPage.focus();
           daPage.click(); 
        }
        else {
            h1.focus()
        }
        
    // daPage.addEventLi    stener("blur", (event) =>{
        //     nextPage()
        // });
    }

}

function formatPagePlaceHoler(pageNbr) {
    return `${pageNbr} (av ${pageReader.getNbrOfPages()})`;
}

function setPageNumber(pageNumber, saveInLocalStorage = false) {
    htmlPageInput.value = "";
    htmlPageInput.placeholder = formatPagePlaceHoler(pageNumber);
    // htmlNextPage.innerHTML = "Nästa sida (" + (pageNumber+1) + ")";
    // htmlPreviousPage.innerHTML = "Föregående sida (" + (pageNumber-1) + ")";
    if (saveInLocalStorage) {
        window.localStorage.setItem(fileName, "" + pageNumber);
    }
}

function goBackToConversion() {
    storedRange = null;
    selection = null;
    goToStart = false;
    window.getSelection().removeAllRanges()
    document.title = "Läs punktskrift direkt";
    htmlConvertingText.style = "display:none";
    htmlChosenFile.innerHTML = "- ingen fil vald";
    toggleDiv(true);

    // Must clear this if we go back and want to select the same file again.
    htmlFileSelector.value = '';
    pageReader.reset();
};


let autoPageTurn = false
const autoPageTurnBtn = document.getElementById("autoPageTurnBtn")
autoPageTurnBtn.addEventListener("click", (e) =>{
    autoPageTurn = !autoPageTurn
    let label = autoPageTurn ? "(aktiverad)" : "(ej aktiverad)"
    autoPageTurnBtn.innerHTML = "Automatiskt sidbyte " + label;
    
});

htmlNextPage.addEventListener("focus", (e) =>{
    if (autoPageTurn){
        nextPage()
    }
    
});

//Phrase finding
// const findPhraseField = document.getElementById("findPhrase")
// findPhraseField.addEventListener("input", searchPhrase)
// findPhraseField.addEventListener("keydown", event => goToMatch(event))
// let matches = []
// let total = 0
// let phrase = ""
// function searchPhrase(){
//     phrase = findPhraseField.value
//     if (phrase === ""){
//         matches =[]
//         total = 0
//     }
//     else {
//         let finding = pageReader.findPhrase(phrase)
//         matches = finding.matches
//         total = finding.total
        
//     }
    
//     document.getElementById("nbrOfMatches").innerHTML = total

// }
// function goToMatch(event){
//     if (event.key == "Enter") {
//         let pNbr = matches[0]
//         pageReader.setCurrentPage(pNbr);
//         htmlPageView.innerHTML = pageReader.getCurrentPage();
//         pageReader.highLightPhrases(pNbr,phrase)
//         //displayCurrentPage()
//     }
    

// }
function nextPage() {
    if (pageReader.pageForward()){
        displayCurrentPage();
    }

}

function previousPage() {
    if (pageReader.pageBackward()){
        displayCurrentPage();
    }

}

function changeCurrentPage() {
    let newPage = parseInt(htmlPageInput.value);
    if (isNaN(newPage)){
        newPage = parseInt(htmlPageInput.placeholder);
    }
    pageReader.setCurrentPage(newPage);
    htmlPageView.innerHTML = pageReader.getCurrentPage();
}

function pageChangeFinished() {
    if (htmlPageInput.value === ""){
        displayCurrentPage(false);
    }
    else{
        displayCurrentPage();
    }
}

function inputPageKeyDown(event) {
    if (event.key == 'Enter'){
        htmlPageInput.blur();
    }
}

//FLOW TEXT NAVIGATION

let storedRange = null;
let selection = null;
let goToStart = false
 

document.getElementById("goToSavedPosition").addEventListener("click", (e) =>{
    if (openFlowPos()) {
        goToStart = false        
        selection = window.getSelection()
        htmlFlowText.focus()
    }
    else {
        alert("Ingen sparad position hittades. Du tas till början av boken.")
        goToBeginning()

    }
})

document.getElementById("goToBeginning").addEventListener("click", goToBeginning)
document.getElementById("backToConversion2").addEventListener("click", goBackToConversionFromFlow) 

function goToBeginning() {
    goToStart = true
    selection = window.getSelection()
    storedRange = null;
    selection.removeAllRanges()
    htmlFlowText.focus()
}

htmlFlowText.addEventListener("blur", function () {
    // Store the cursor position in a variable when the user leaves the contenteditable div
    goToStart = false
    selection = window.getSelection()
    storedRange = selection.getRangeAt(0).cloneRange();
});


htmlFlowText.addEventListener("focusin", function () {
    // Restore the cursor position when the user reenters the contenteditable div
    onFocus(goToStart)
});

function onFocus(goToBeginning = false){
    if (goToBeginning){
        return
    }
    selection = window.getSelection();
    if (storedRange) {
        selection.removeAllRanges();
        selection.addRange(storedRange);
    }
    else {
        openFlowPos()
        selection = window.getSelection()
        selection.removeAllRanges();
        selection.addRange(storedRange);
    }
}

htmlFlowText.addEventListener("keydown", function(event) {
    // Prevent the default behavior for the keys that add or remove text
    if (event.key === "Backspace" || event.key === "Delete" || event.key === "Insert" || event.key == "Enter") {
        event.preventDefault();
    }
});

htmlFlowText.addEventListener("beforeinput", function(event) {
    if (event.inputType === "insertText" || event.inputType === "insertReplacementText" || event.inputType === "insertFromPaste") {
        // Prevent the default behavior for the input
        event.preventDefault();
    }
});



window.onbeforeunload = function(){
    saveFlowPos()
 }

 window.addEventListener("beforeunload", function(e){
    saveFlowPos()
 }, false);

document.getElementById("savePos").addEventListener("click", saveFlowPos)

function saveFlowPos(){
    if (selection) {
        //localStorage.setItem("sparadpos", selection.toString())
        //console.log("sparade " +  selection.toString())
        let range = storedRange;
        let saveNode = range.startContainer;

        let startOffset = range.startOffset;  // where the range starts
        let endOffset = range.endOffset;      // where the range ends

        let nodeData = saveNode.data;                       // the actual selected text
        let nodeHTML = saveNode.parentElement.innerHTML;    // parent element innerHTML
        let nodeTagName = saveNode.parentElement.tagName;   // parent element tag name
        let rangeObj = {
            sO : startOffset,
            eO : endOffset,
            nD : nodeData,
            nH : nodeHTML,
            nT: nodeTagName
        }
        localStorage.setItem("sparadpos"+fileName, JSON.stringify(rangeObj))
        alert("Sparade läsposition")
        console.log("sparade ")
    }
}

function openFlowPos(){
    let pos = localStorage.getItem("sparadpos"+fileName)
    if (pos){
        let r = JSON.parse(pos)
        storedRange = buildRange(r.sO,r.eO,r.nD,r.nH,r.nT)
        return true
    }
    return false
}

function goBackToConversionFromFlow() {
    saveFlowPos()
    storedRange = null;
    selection = null;
    goToStart = false;
    window.getSelection().removeAllRanges()
    document.title = "Läs punktskrift direkt";
    htmlConvertingText.style = "display:none";
    htmlChosenFile.innerHTML = "- ingen fil vald";
    toggleDiv(true);

    // Must clear this if we go back and want to select the same file again.
    htmlFileSelector.value = '';
    pageReader.reset();
};


// This code is from adrianmc at the following link
// https://stackoverflow.com/questions/23479533/how-can-i-save-a-range-object-from-getselection-so-that-i-can-reproduce-it-on
function buildRange(startOffset, endOffset, nodeData, nodeHTML, nodeTagName){
    let cDoc = document.getElementById("flowText")
    let tagList = cDoc.getElementsByTagName(nodeTagName);
    
    // find the parent element with the same innerHTML
    for (let i = 0; i < tagList.length; i++) {
        if (tagList[i].innerHTML == nodeHTML) {
            var foundEle = tagList[i];
        }
    }

    // find the node within the element by comparing node data
    let nodeList = foundEle.childNodes;
    for (let i = 0; i < nodeList.length; i++) {
        if (nodeList[i].data == nodeData) {
            var foundNode = nodeList[i];
        }
    }

    // create the range
    let range = document.createRange();

    range.setStart(foundNode, startOffset);
    range.setEnd(foundNode, endOffset);
    console.log(range)
    return range;
}
