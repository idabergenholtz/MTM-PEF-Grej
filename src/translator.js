import {alphabetTable, uppercaseSign, numbersTable, numberSign, spaces, doubleCharTable, singleCharTable} from "./swedishTables.js"

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
        temp = findInTable(currentChar, alphabetTable)

        if(temp > -1) {
            string += alphabetTable[0][temp]
            continue
        }
        //skiljetecken och specialtecken som i punktskrift består av två tecken
        if(i + 1 < braille.length) {
            let nextChar = braille.charAt(i+1)
            temp = findInTable(currentChar + nextChar, doubleCharTable)

            if(temp > -1) {
                string += doubleCharTable[0][temp]
                i++
                continue
            }
        }
        //skiljetecken och specialtecken som i punktskrift består av ett tecken
        temp = findInTable(currentChar, singleCharTable)

        if(temp > -1) {
            string+=singleCharTable[0][temp]
            continue
        }

        //Check for uppercase characters
        temp = uppercase(braille, i)
        if(temp.length > 0) {
            string += temp
            i+= temp.length
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
    if(braille.charAt(index) !== uppercaseSign) return "" //Det ska inte vara en versal
    let count = 1
    let string = ""

    //Endast första bokstaven i ordet ska vara en versal
    if(braille.charAt(index+1) !== uppercaseSign) {
        let temp = findInTable(braille.charAt(index+1), alphabetTable)
        if(temp > -1) string += alphabetTable[2][temp]
        //return [true,string,count]
        return string
    }

    //Hela ordet, fram till nästa "icke-bokstav" ska vara versaler
    for(let i = index+2; i < braille.length; i++) {
        let temp = findInTable(braille.charAt(i), alphabetTable)    
        if(temp <= -1) break
        count++
        string += alphabetTable[2][temp]
    }
    return string
}

function number(braille, index) {
    if(braille.charAt(index) !== numberSign) return "" 
    let count = 0
    let string = ""

    for(let i = index+1; i < braille.length; i++) {
        let temp = findInTable(braille.charAt(i), numbersTable)
        if(temp <= -1) break
        count++
        string += numbersTable[0][temp]
    }
    return string
}

function findInTable(currentChars, table) {
    let index = table[1].indexOf(currentChars)

    return index;
}