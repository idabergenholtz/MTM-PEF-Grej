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
const htmlFlowView = document.getElementById("flowText");

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
    //let inputText = reader.result;
    inputText = reader.result;
    // controller.run(fileName, sizeKb, inputText);
    // displayCurrentPage();
    // toggleDiv(false);
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
        //htmlFlowView.innerHTML = "<h1  tabindex=0> Trevlig läsning</h1>"
        htmlFlowView.innerHTML = controller.run(fileName, 0, inputText, false);//--------------------------------------------------
        toggleDiv(false, false);
        // let scrollTo = parseInt(window.localStorage.getItem(fileName + "_flow"));
        // window.location.hash = "jump_to_this_location";
        /*
        if (!isNaN(scrollTo)){
            document.documentElement.scrollTop = scrollTo;        
        }
        let checkpoints = document.getElementsByClassName("checkpoint");
        console.log("checkpoints length = " + checkpoints.length)
        let smallestId = {id: '', pos: 1000000};
        for (let i = 0; i < checkpoints.length; i++){
            let checkpoint = checkpoints.item(i);
            let pos = Math.abs(checkpoint.getBoundingClientRect().top);
            if (pos < smallestId.pos){
                smallestId = {id: checkpoint.id, pos: pos};
            }
        }
        if (smallestId.id !== ''){
            window.location.hash = smallestId.id;
            let el = document.getElementById(smallestId.id);
            el.innerText = "<<SPARAD POSITION>>"
            document.getElementById(smallestId.id).focus();
        }
        */
    }
    inputText = '';
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

//FLOW TEXT NAVIGATION
/*
window.addEventListener("beforeunload", (event) => {
    window.localStorage.setItem(fileName + "_flow", document.documentElement.scrollTop);
})
*/
document.getElementById("instruction").addEventListener("click", (e) => {
alert("Sätta platsmärke \n\n"+
        "Om du väljer alternativet för att läsa boken löpande sparas inte din läsposition" + 
    " när du lämnar/uppdaterar sidan. Används däremot JAWS som skärmläsare går det att sätta platsmärke genom " +
    '"Shift+Control+K". Du får upp en dialog där du kan välja platsmärke att gå till, redigera '
    +"platsmärken eller lägga till nya platsmärken. För att hoppa mellan platsmärken använd "
    + '”K”. På detta sätt kan du ändå komma tillbaka till var du har varit ifall du behöver lämna boken.');
});

document.getElementById("backFromFlow").addEventListener("click",goBackToConversion);

document.getElementById("volumejumper").addEventListener("change", (e) => {
    let option = document.getElementById("volumejumper").value
    if (option != "title"){
        document.getElementById(option).focus()
    }
});

document.getElementById("volumeInfo").addEventListener("click", (e) => {
    alert("Varför volymer \n\n" + 
        "Dessa digitala punktskriftsböcker bygger på samma filer som används " +
        "för att trycka punktskriftsböcker i pappersformat. Varje volym motsvarar en fysisk ihoplimmad bok.\n\n" +
        "Eftersom filerna (PEF) inte innehåller någon strukturinformation för kapitel eller innehålls" +
        "förteckning, vill vi i alla fall erbjuda möjligheten att hoppa mellan volymer. \n\n" +
        "TIPS\n\n" +
        "Testa att använda ordsök (control+f för Windows eller cmd+f för Mac) för att leta efter kapitelrubriker.");
});


document.getElementById("toc").addEventListener("change", (e) => {
    let s = document.getElementById("toc")
    if (s != null){
        let div = document.getElementById(s.value)
        if (div == null) {
            alert("Det gick inte att gå till " + s.options[s.selectedIndex].text + ". Tekniken för att hitta innehållsförteckning i våra " + 
                "punktskriftsböcker bygger på att leta efter rader som slutar med siffror i bokens inledande sidor. Dessa tolkas som sidnummer. "+
                "Tyvärr kan det bli fel ibland som när en rad slutar med ett årtal. Vi ber om ursäkt för förvirringen.");
        }
        else {
            let forts = window.confirm("Vill du gå vidare till " + s.options[s.selectedIndex].text + "?");
            if (forts){
                div.focus()
            }        
        }
    }
});
//PAGE BY PAGE 

function displayCurrentPage(focusNewPage = true){
    htmlPageView.innerHTML = pageReader.getCurrentPage();
    let pageNumber = pageReader.getCurrentPageNbr();
    setPageNumber(pageNumber, true);
    const h1 = document.getElementById('newPage');
    document.title = h1.innerText + " - " + pageReader.title;
    const firstLine = document.getElementById('bookPage');
    if (focusNewPage){
        //We need to use document.getElementById directly here
        //since the h1 tag changes every time
        //So a global const won't work
        h1.focus();
    }
    else if (firstLine != null){
        firstLine.focus()
    }

}

function formatPagePlaceHoler(pageNbr) {
    return `Sida ${pageNbr} (av ${pageReader.getNbrOfPages()})`;
}

function setPageNumber(pageNumber, saveInLocalStorage = false) {
    htmlPageInput.value = "";
    htmlPageInput.placeholder = formatPagePlaceHoler(pageNumber);

    if (saveInLocalStorage) {
        window.localStorage.setItem(fileName, "" + pageNumber);
    }
}

function goBackToConversion() {
    document.title = "Läs punktskrift direkt";
    htmlConvertingText.style = "display:none";
    htmlChosenFile.innerHTML = "- ingen fil vald";
    toggleDiv(true);

    // Must clear this if we go back and want to select the same file again.
    htmlFileSelector.value = '';
    pageReader.reset();
};

function nextPage() {
    if (pageReader.pageForward()){
        displayCurrentPage(false);
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
