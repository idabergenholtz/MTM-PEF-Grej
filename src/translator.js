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
        if(temp[0]) {
            string+=alphabetTable[0][temp[1]]
            continue
        }
        //Check for punctuation, parentheses, currency signs, etc
        if(i + 1 < braille.length) {
            let nextChar = braille.charAt(i+1)
            temp = findInTable(currentChar + nextChar, doubleCharTable)

            if(temp[0]) {
                string+=doubleCharTable[0][temp[1]]
                i++
                continue
            }
        }
        temp = findInTable(currentChar, singleCharTable)
        if(temp[0]) {
            string+=singleCharTable[0][temp[1]]
            continue
        }

        //Check for an uppercase sign
        temp = uppercase(braille, i)
        if(temp[0]) {
            string += temp[1]
            i+=temp[2]
            continue
        }

        //Check for a number sign
        temp = number(braille, i)
        if(temp[0]) {
            string += temp[1]
            i+=temp[2]
            continue
        }

        string += currentChar //Eller currentChar
    }
    return string
}

function uppercase(braille, index) {
    if(braille.charAt(index) !== uppercaseSign) return [false] //Det ska inte vara en versal
    let count = 1
    let string = ""

    //Endast första bokstaven i ordet ska vara en versal
    if(braille.charAt(index+1) !== uppercaseSign) {
        let temp = findInTable(braille.charAt(index+1), alphabetTable)
        if(temp[0]) string += alphabetTable[2][temp[1]]
        
        return [true,string,count]
    }

    //Hela ordet, fram till nästa "icke-bokstav" ska vara versaler
    for(let i = index+2; i < braille.length; i++) {
        let temp = findInTable(braille.charAt(i), alphabetTable)    
        if(!temp[0]) break
        count++
        string += alphabetTable[2][temp[1]]
    }
    return [true, string, count]
}

function number(braille, index) {
    //Undersök sida 49 i pdf, ex: 100.000.000
    if(braille.charAt(index) !== numberSign) return [false] 
    let count = 0
    let string = ""

    for(let i = index+1; i < braille.length; i++) {
        let temp = findInTable(braille.charAt(i), numbersTable)
        if(!temp[0]) break
        count++
        string += numbersTable[0][temp[1]]
    }
    
    return [true, string, count]
}

function findInTable(currentChars, table) {
    let index = table[1].indexOf(currentChars)
    if(index == -1) return [false]
    return [true, index]
}