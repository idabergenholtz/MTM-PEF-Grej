import {alphabetTable, uppercaseSign, numbersTable, numberSign,uppercaseEndSign, spaces, doubleCharTable, singleCharTable, oneCharIgnoreTable, twoCharIgnoreTable} from "./swedishTables.js"

//https://www.mtm.se/globalassets/punktskriftsnamnden/svenska_skrivregler_for_punktskrift.pdf

export function translateToSwedish(braille) {
    let string = ""
    let temp
    for(let i = 0; i < braille.length; i++){
        //Check for a blank space
        let currentChar = braille.charAt(i)
        if(currentChar == spaces[0] || currentChar == spaces[1]) {
            string += " "
            continue
        }
        //Check for lowercase letters
        temp = findInTable(currentChar, alphabetTable[1])

        if(temp > -1) {
            string += alphabetTable[0][temp]
            continue
        }

        //Ignore some characters, such as cursive indicators
        temp = findInTable(currentChar, oneCharIgnoreTable)
        if(temp > -1) {
            string += currentChar
            continue
        }

        if(i + 1 < braille.length) {
            //Check for characters to ignore
            let nextChar = braille.charAt(i+1)

            temp = findInTable(currentChar + nextChar, twoCharIgnoreTable)
            if(temp > -1) {
                string += currentChar + nextChar
                i++
                continue
            }

            //Two character punctuation and special braille signs
            temp = findInTable(currentChar + nextChar, doubleCharTable[1])

            if(temp > -1) {
                string += doubleCharTable[0][temp]
                i++
                continue
            }
        }
        //Single character punctuation and special braille signs
        temp = findInTable(currentChar, singleCharTable[1])

        if(temp > -1) {
            string+=singleCharTable[0][temp]
            continue
        }

        //Check for uppercase characters
        temp = uppercase(braille, i)
        if(temp.length > 0) {
            string += temp
            i++
            if(temp.length > 1) i += temp.length
            continue
        }

        //Check for number signs
        temp = number(braille, i)
        if(temp.length > 0) {
            string += temp
            i+=temp.length
            continue
        }

        string += currentChar //No suitable replacement found, add the braille char to the string
    }
    return string
}

function uppercase(braille, index) {
    if(braille.charAt(index) !== uppercaseSign) return "" //Not an upper case letter
    let string = ""

    //Only the first letter should be upper case
    if(braille.charAt(index+1) !== uppercaseSign) {
        let temp = findInTable(braille.charAt(index+1), alphabetTable[1])
        if(temp > -1) string += alphabetTable[2][temp]
        //return [true,string,count]
        return string
    }

    //The whole word, until the next non alphabetic character, should be upper case
    if (braille.charAt(index+2)!== uppercaseSign) {
        for(let i = index + 2; i < braille.length; i++) {
            let temp = findInTable(braille.charAt(i), alphabetTable[1])
            if(temp <= -1) break
            string += alphabetTable[2][temp]
        }
        return string
    }

    //The whole sentence, until ⠱/uppercaseEndSign should be upper case
    for(let i = index + 3; i < braille.length; i++) {
        let daChar = braille.charAt(i)
        if (daChar == uppercaseEndSign) {
            break;
        }

        //check if space
        let isSpace = daChar == spaces[0]
        if (isSpace){
            string += spaces[1]
            continue 
        }
        //find letter
        let temp = findInTable(daChar, alphabetTable[1])

        // if(temp == uppercaseEndSign) break
        let tecken = alphabetTable[2][temp]
        if (tecken == undefined){
            tecken = daChar == '⠤' ? '-' : daChar;
        }
        string += tecken
    }
    return string + "  "

}

function number(braille, index) {
    if(braille.charAt(index) !== numberSign) return ""
    let count = 0
    let string = ""

    for(let i = index+1; i < braille.length; i++) {
        let temp = findInTable(braille.charAt(i), numbersTable[1])
        if(temp <= -1) break
        count++
        string += numbersTable[0][temp]
    }
    return string
}

function findInTable(currentChars, table) {
    let index = table.indexOf(currentChars)

    return index;
}