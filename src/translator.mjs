import {alphabetTable, uppercaseSign, numbersTable, numberSign, punctuationTable, spaces} from "./swedishTables.mjs"

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
        temp = lowercase(braille.charAt(i))
        if(temp[0]) {
            string+=alphabetTable[0][temp[1]]
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

function lowercase(currentChar) {
    let index = alphabetTable[1].indexOf(currentChar)
    if(index == -1) return [false]
    return [true, index]
}

function uppercase(braille, index) {
    if(braille.charAt(index) !== uppercaseSign) return [false] //Det ska inte vara en versal
    let count = 1
    let string = ""

    //Endast första bokstaven i ordet ska vara en versal
    if(braille.charAt(index+1) !== uppercaseSign) {
        let temp = lowercase(braille.charAt(index+1))
        if(temp[0]) string += alphabetTable[2][temp[1]]
        
        return [true,string,count]
    }

    //Hela ordet, fram till nästa "icke-bokstav" ska vara versaler
    for(let i = index+2; i < braille.length; i++) {
        let temp = lowercase(braille.charAt(i))        
        if(!temp[0]) break
        count++
        string += alphabetTable[2][temp[1]]
    }
    return [true, string, count]
}

//
function number(braille, index) {
    //Undersök sida 49 i pdf, ex: 100.000.000

    if(braille.charAt(index) !== numberSign) return [false] 
    let count = 0
    let string = ""

    for(let i = index+1; i < braille.length; i++) {
        let temp = findNumber(braille.charAt(i))
        if(!temp[0]) break
        count++
        string += numbersTable[0][temp[1]]
    }
    
    return [true, string, count]
}

//Find a number fron the numbersTable
function findNumber(currentChar) {
    let index = numbersTable[1].indexOf(currentChar)
    if(index == -1) return [false]
    return [true, index]
}

function punctuationMarks() {

}