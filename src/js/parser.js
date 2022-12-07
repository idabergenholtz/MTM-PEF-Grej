import { Body, MetaData, Head, Page, Pef, Section, Volume} from "./pef.js";

let myPefObject
let mybody
let myhead
let test = 0
//Delar upp boken utefer tag och skapar hierarkin i boken
//Tar också ut punktskriften från varje <row> tag och sparar i en array
//Måste också hämta ut metadata från head och spara i ett head-objekt (? vet inte om det kallas objekt i js men antar det :)

/**
 *
 * @param {} file
 * Reads a file to a String variable
 * Starts parser
 */
 export function receiveFile(text){
    return startParser(text)
}

/**
 *
 * @param {*} content
 * @returns
 *
 * Starts parsing the file
 * Påbörjar processen av att skapa hierarkin och plocka ut innehållet från <row>innehåll</row>
 */
function startParser(content){
    mybody = createVolumes(content)
    myhead = new Head(extractMetaData(content))
    myPefObject = new Pef(myhead, mybody)
    console.log(myPefObject)
    return myPefObject
}
/**
 *
 * @param {String} content
 * @returns metaData - object containing all metadata
 */
function extractMetaData(content){
    /*Create object containing attributes for each metadata tag*/
    let metaData = new MetaData();

    let headString = content.substring(findTag(content, "head"), findEndTag(content, "head"))   //creates a substring rom <head> to </head>

    /*While there is a next <dc tag. Ex. <dc:title>Om våren</dc:title> */
    while(headString.indexOf("<dc") != -1){
        let startIndex = findTag(headString, "dc:") + 4     //finds the index of the <dc tag, +4 to get the index of the first bit of relevant information
        let endIndex = findEndTag(headString, "dc:")        //finds the index of the </dc tag
        let rowValue = headString.substring(startIndex, endIndex)   //Ex. "title>Om våren"

        let typeOfData = rowValue.substring(0, rowValue.indexOf('>'))   //Extract the "type" of data, ex. "title"
        let value = rowValue.substring(rowValue.indexOf('>') + 1, rowValue.length)  //Extracts the value present in the <dc> tag. Ex. "Om våren"

        metaData[typeOfData] = value;
        //Updates the substring after each iteration to remove the already added <dc> tag
        headString = headString.substring(endIndex + 1, headString.length);


    }
    return metaData
}

/**
 *
 * @param {String} content
 * @returns Body object containing an array of volumes
 */
function createVolumes(content){
    let volumeArray = []
    /*while there is a next <volume> tag*/
    while(content.indexOf("<volume") != -1){
        let startIndex = findTag(content, "volume")
        let endIndex = findEndTag(content, "volume")

        let temp = createSections(content.substring(startIndex, endIndex))  //calls createSections with the substring from <volume> to </volume> as parameter.
        volumeArray.push(temp)  //adds the Volume object containing an array of sections to the volumeArray
        content = content.substring(endIndex + 1, content.length);  //Updates the substring after each iteration to remove the already added <volume> tag
    }
    return new Body(volumeArray)
}
/**
 *
 * @param {String} content
 * @returns Volume object containing an array of sections
 */
function createSections(content){
    let sectionsArray = []
    /*while there is a next <section> tag*/
    while(content.indexOf("<section") != -1){
        let startIndex = findTag(content, "section")
        let endIndex = findEndTag(content, "section")

        let temp = createPages(content.substring(startIndex, endIndex)) //calls createPages with the substring from <section> to </section> as parameter
        if(temp.pages.length > 0)sectionsArray.push(temp)    //adds the Section object containing an array of pages to the sectionsArray
        content = content.substring(endIndex + 1, content.length);
    }

    return new Volume(sectionsArray)
}

function createPages(content){
    let pagesArray = []
    while(content.indexOf("<page") != -1){
        let startIndex = findTag(content, "page")
        let endIndex = findEndTag(content, "page")
        try{//Måste kanske titta efter första </tag efter startIndex, i butterfly.pef finns det flera </row> innan första <row>, try - catch för att hantera invalid string length

            let temp = createRows(content.substring(startIndex, endIndex))  //calls createRows with the substring from <page> to </page> as parameter

            if(temp.rows.length > 0) pagesArray.push(temp)   //adds the Page object containing an array of Strings to the pagesArray

        } catch(error){ //Ni kan bortse från denna try - catch för nu, verkar ha löst problemet iaf för de exempel vi har tillgång till just nu
            console.error(error)
            console.log(test)   //för att ta reda på vilken sida felet är på
        }
        test++
       //texten = texten + createRows(content.substring(startIndex, endIndex))

        content = content.substring(endIndex + 1, content.length);
    }

    return new Section(pagesArray)
}

function createRows(content){
    let rowsArray = []

    while(content.indexOf("<row") != -1){

        let startIndex = findTag(content, "row")
        //let endIndex = startIndex + findEndTag(content.substring(startIndex, content.length), "row")

        let endIndex = startIndex + findEndTagRow(content.substring(startIndex, content.length), "/")
        //Ovantstående rad beräknar endIndex för första förkomst av </row> efter vårt startIndex, detta behöver kanske göras för alla taggar, men i våra exempel är det bara för row det var ett problem
        if(startIndex +5  < endIndex){//to handle <row /> and <row/> tags

            let rowContent = content.substring(startIndex + 5, endIndex)
            if(isRowEmpty(rowContent)){
                rowsArray.push('PEFBLANKROW')
            }else{
                rowsArray.push(rowContent)
            }
        } else{
           rowsArray.push('PEFBLANKROW')
        }
        content = content.substring(endIndex + 1, content.length)

    }

    if(isPageEmpty(rowsArray)) return new Page([])
    return new Page(rowsArray)
}

/*Finds the index of "<"+tag"*/
function findTag(content, tag){
    return content.indexOf("<"+tag)
}
/*Finds the first index of "</"+"tag" */
function findEndTag(content, tag){
    return content.indexOf("</"+tag)
}
/*Finds the first index of "</"+"tag" - specific for createRows*/
function findEndTagRow(content, tag){
    return content.indexOf(tag)-1
}
/* Checks if a page contains anything other than blank rows*/
function isPageEmpty(rowsArray){
    for(let i = 0;i<rowsArray.length;i++){
        if(!(rowsArray[i] === 'PEFBLANKROW')) return false;
    }
    return true;
}
/**
 * Cheks if a row contains anything other than blankspaces, a braille blankspace is different from a normal blankspace.  '⠀', Normal: ' '
 * returns true if empty
 * */
function isRowEmpty(row){
    let temp = row.replaceAll('⠀', '');
    if(temp.length > 0) return false;
    return true;
}
