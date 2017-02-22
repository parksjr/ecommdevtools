'use strict';

var app = {
  init: function() {
    console.log("content.init()");
    chrome.extension.onMessage.addListener(function(request, sender, callback) {
      console.log(sender.tab ? 
        "message received from content script:" + sener.tab.url :
        "message received from the extension");
      if (request.fn in app) {
        app[request.fn](request, sender, callback);
      }
      else {
        console.log('no function to run', request);
      }
    });
    
  },
  insertEditableText: function(request, sender, callback) {
    var elm = getActiveElement(document);
    if (elm) {
      elm.value = request.payload;
      callback({action: "inserted"});
    }
    else {
      //  fallback to copy to clipboard if we can't insert into editable field
      this.copyTextToClipBoard(request, sender, callback);
    }
  },
  copyTextToClipBoard: function(request, sender, callback) {
    var copyFrom = document.createElement("textarea");
    copyFrom.textContent = request.payload;
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand('copy');
    body.removeChild(copyFrom);
    callback({action: "copied"});
  }
};

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

//app start
app.init();