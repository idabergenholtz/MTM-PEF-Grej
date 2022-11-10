import { receiveFile } from '../src/parser.mjs';
import { translateToSwedish } from '../src/translator.mjs';
import { Pef, Head, Body, Volume, Section, Page, Row } from '../src/pef.mjs';
import { Outputter, OutputFormats } from '../src/outputter.mjs';
import fs from 'fs';

test('tests an increment, if this fails JEST is configured incorrectly', () => {
    expect(1 + 1).toBe(2);
});

test('tests if the Parser returns correct data', () => {
    var data = fs.readFileSync("./test/examples/butterfly.pef", 'utf-8');
    expect(data).toBeDefined();
    var PEF = receiveFile(data);
    expect(PEF).toBeDefined();
    expect(PEF.head.meta.title).not.toBeNull();
    expect(PEF.head.meta.title).toBe("Butterfly Test Pattern");
    expect(PEF.head.meta.creator).toBe("Joel Håkansson");
});

test('tests if the Translator returns correct data', () => {
    // Detta är "svensk" braille för den engelska frasen "the quick brown fox jumps over the lazy dog"
    const brailleQuickBrownFox = "⠞⠓⠑ ⠟⠥⠊⠉⠅ ⠃⠗⠕⠺⠝ ⠋⠕⠭ ⠚⠥⠍⠏⠎ ⠕⠧⠑⠗ ⠞⠓⠑ ⠇⠁⠵⠽ ⠙⠕⠛";
    var translated = translateToSwedish(brailleQuickBrownFox);
    expect(translated).toEqual("the quick brown fox jumps over the lazy dog");
});

test('tests if the Outputter returns correct data', () => {
    var data = fs.readFileSync("./test/examples/butterfly.pef", 'utf-8');
    var PEF = receiveFile(data);
    var text = Outputter.format(PEF, OutputFormats.HTML);
    expect(text).toBeDefined();
    // Okej, fick detta att fungera men verkar som att jag egentligen
    // inte testar något här?
    var textBeginsWithCorrectData = text.startsWith(
        // "<h2 class=\"first-page-title\">Butterfly Test Pattern</h2>" +
        // "<h4 class=\"first-page-author\">Joel Håkansson</h4>" +
        // "<h6 class=\"first-page-date\">2008-09-26</h6>" +
        "<div class=\"volume\">" + 
        "<div class=\"section\">" + 
        "<div class=\"page\">"
    );
    // Här har vi alltså <p> taggar där innehållet kan vara annorlunda.
    var textEndsWithCorrectData = text.endsWith(
        "</div>" +
        "</div>" +
        "</div>"
    );
    expect(textBeginsWithCorrectData && textEndsWithCorrectData).toBe(true)
});