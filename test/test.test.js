import { receiveFile } from '../src/parser.mjs';
import { translateToSwedish } from '../src/translator.mjs';
import { Pef, Head, Body, Volume, Section, Page, Row } from '../src/pef.mjs';
import { Outputter, OutputFormats } from '../src/outputter.mjs';
import fs from 'fs';

test('tests an increment, if this fails JEST is configured incorrectly', () => {
    expect(1 + 1).toBe(2);
});

test('tests if the Parser returns correct data', () => {
    var PEF = undefined;
    fs.readFile("./test/examples/butterfly.pef", 'utf-8', (err, data) => {
        if (err) throw err;
        expect(data).toBeDefined();
        PEF = receiveFile(data);
        expect(PEF).toBeDefined();
        expect(PEF.head.meta.title).not.toBeNull();
        expect(PEF.head.meta.title).toBe("Butterfly Test Pattern");
        expect(PEF.head.meta.author).toBe("Joel Håkansson");
        expect(true).toBe(false);
    });
});

test('tests if the Translator returns correct data', () => {
    // Detta är "svensk" braille för den engelska frasen "the quick brown fox jumps over the lazy dog"
    const brailleQuickBrownFox = "⠞⠓⠑ ⠟⠥⠊⠉⠅ ⠃⠗⠕⠺⠝ ⠋⠕⠭ ⠚⠥⠍⠏⠎ ⠕⠧⠑⠗ ⠞⠓⠑ ⠇⠁⠵⠽ ⠙⠕⠛";
    var translated = translateToSwedish(brailleQuickBrownFox);
    expect(translated).toEqual("the quick brown fox jumps over the lazy dog");
});

test('tests if the Outputter returns correct data', () => {
    var PEF;
    fs.readFile("./test/examples/butterfly.pef", 'utf-8', (err, data) => {
        if (err) throw err;
        expect(data).toBeDefined();
        PEF = receiveFile(data);
        var text = Outputter.format(PEF, OutputFormats.HTML);
        expect(text).toBeDefined();
        var textBeginsWithCorrectData = text.beginsWith(
            "<h2 class=\"first-page-title\">Butterfly Test Pattern</h2>" +
            "<h4 class=\"first-page-author\">Joel Håkansson</h4>" +
            "<h6 class=\"first-page-date\">2008-09-26</h6>" +
            "<div class=\"volume\">" + 
            "<div class=\"section\">" + 
            "<div class=\"page\">"
        );
        var textEndsWithCorrectData = text.endsWith(
            "</div>" +
            "</div>" +
            "</div>"
        );
        expect(textBeginsWithCorrectData && textEndsWithCorrectData).toBe(true)
        expect(true).toBe(false);
    });
});