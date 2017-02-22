
var console = chrome.extension.getBackgroundPage().console;

var app = {
  init: function() {
    // cache some element references
    var $linkOptions = document.getElementById("btnOptions");
    $linkOptions.addEventListener("click", function() {
      chrome.runtime.sendMessage({fn: "openOptionsPage", data: null});
    });
  }
};

//app start
document.addEventListener("DOMContentLoaded", function() {
  app.init();
});