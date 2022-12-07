let unfPefObject;
let finishedObject;
const testExp = /[A-Z]( ){2,}/gi;
const testExp2 = /(PEFBLANKROW)/gi;
/**
 * Has to be called after translation 
 */
export function frontPage(pefObject){
    unfPefObject = pefObject;

    removeFrontPage();
    console.log(unfPefObject);
    return unfPefObject;
}
/**
 * removes the frontPage if it exists
 */
function removeFrontPage(){
    for(let i = 0; i<unfPefObject.body.volumes.length ; i++){
        let tempRowsArray = unfPefObject.body.volumes[i].sections[0].pages[0].rows;
        let counter = 0;
        tempRowsArray.forEach((e) => {
        if(testExp.test(e) || testExp2.test(e)){
            counter++;
        } 
    });
    if(counter > 10) unfPefObject.body.volumes[i].sections[0].pages.shift();
    }
}