var input = document.getElementById('file-input');
input.type = 'file';
console.log("tja")

input.onchange = e => { 

   // getting a hold of the file reference
    var file = e.target.files[0]
    console.log(file.name)
    console.log(file.type) 
    let shouldConvert = window.confirm("Vill du konvertera " + file.name + "?")
    if (!shouldConvert){
        return;
    }
   // setting up the reader
    var reader = new FileReader();
    reader.readAsText(file,'UTF-8');

   // here we tell the reader what to do when it's done reading...
    reader.onload = readerEvent => {
        var content = readerEvent.target.result; // this is the content!
        showConvertProgress = setInterval((content) => convert(content), 1000)
        cont = content;
        console.log( content );
    }
}
var showConvertProgress;
var percentage = 0;
var cont;
function convert (content){
    document.getElementById('convertPer').textContent = 
        "Konvertering " + percentage + "% färdig.";
    percentage += 20;
    if (percentage > 100){
        percentage = 0;
        document.getElementById('text').textContent = cont;
        clearInterval(showConvertProgress)
    }
}