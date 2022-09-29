import { Pef } from './pef.mjs';


const OutputFormats = {
    HTML: "HTML"
};


class OutputFormatter {
    // --- Abstract methods --- //
    static formatBodyStart()    { throw new Error("Not implemented!"); }
    static formatVolumeStart()  { throw new Error("Not implemented!"); }
    static formatSectionStart() { throw new Error("Not implemented!"); }
    static formatPageStart()    { throw new Error("Not implemented!"); }
    static formatRowStart()     { throw new Error("Not implemented!"); }

    static formatBodyEnd()      { throw new Error("Not implemented!"); }
    static formatVolumeEnd()    { throw new Error("Not implemented!"); }
    static formatSectionEnd()   { throw new Error("Not implemented!"); }
    static formatPageEnd()      { throw new Error("Not implemented!"); }
    static formatRowEnd()       { throw new Error("Not implemented!"); }
}

class OutputFormatterHtml extends OutputFormatter {
    static formatBodyStart()    { return '<div class="body">'; }
    static formatVolumeStart()  { return '<div class="volume">'; }
    static formatSectionStart() { return '<div class="section">'; }
    static formatPageStart()    { return '<div class="page">'; }
    static formatRowStart()     { return '<p>'; }

    static formatBodyEnd()      { return '</div>'; }
    static formatVolumeEnd()    { return '</div>'; }
    static formatSectionEnd()   { return '</div>'; }
    static formatPageEnd()      { return '</div>'; }
    static formatRowEnd()       { return '</p>'; }
}


class Outputter {

    /*
        Parameters:
            outputFormat <String>: Output formatter, as String, eg: "HTML"
        Returns:
            <OutputFormatter>: Subclass of OutputFormatter
    */
    static getOutputFormatter(outputFormat) {
        if (outputFormat.toUpperCase() == OutputFormats.HTML)
            return OutputFormatterHtml;
        else
            throw new Error(`Failed to recognize output format ${outputFormat}`);
    }

    /*
        Parameters:
            pefObject <Pef>
        Returns:
            <String>: Formatted output text
    */
    static format(pefObject, outputFormat) {
        let outputFormatter = Outputter.getOutputFormatter(outputFormat);
        let output = '';
        for (let [volumes_i, volume] of pefObject.body.volumes.entries()) {
            output += outputFormatter.formatVolumeStart();
            for (let [section_i, section] of volume.sections.entries()) {
                output += outputFormatter.formatSectionStart();
                for (let [page_i, page] of section.pages.entries()) {
                    output += outputFormatter.formatPageStart();
                    for (let [row_i, row] of page.rows.entries()) {
                        output += outputFormatter.formatRowStart();
                        output += row.text;
                        output += outputFormatter.formatRowEnd();
                    }
                    output += outputFormatter.formatPageEnd();
                }
                output += outputFormatter.formatSectionEnd();
            }
            output += outputFormatter.formatVolumeEnd();
        }
        return output;
    }

}


export { Outputter, OutputFormats };
