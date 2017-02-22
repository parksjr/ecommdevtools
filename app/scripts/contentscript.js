'use strict';

chrome.extension.onMessage.addListener(function (message, sender, callback) {
    if (message.payload) {
        var elm = getActiveElement(document);
        var val = message.payload;
        if (elm) {
            elm.value = val;
        }
        console.log("copy this: ", val);
        copyText(val);
    }
});

/**
 * Copy value to clipboard
 * method adapted from: http://stackoverflow.com/a/34097586/695019
 * @return void
 * 
 */
function copyText(val) {
    var copyFrom = document.createElement("textarea");
    copyFrom.textContent = val;
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand('copy');
    body.removeChild(copyFrom);
}

/**
* Retrieve active element if it's within root document
* method adapted from: http://stackoverflow.com/a/25420726/695019
* @return HTMLElement
**/
var getActiveElement = function(document){

     document = document || window.document;

     // Check if the active element is in the main web or iframe
     if(document.body === document.activeElement || document.activeElement.tagName == 'IFRAME') {
         // active elment is a body or iframe element, get out of here
         return false;
     }
    else return document.activeElement;

     return false;
};

//console.log('\'Allo \'Allo! Content script');
