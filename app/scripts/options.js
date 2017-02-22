'use strict';
var console = chrome.extension.getBackgroundPage().console;

var options = {
  init: function() {
    var $selGateways = document.getElementById('gateways');
    var $btnSave = document.getElementById('save');

    this.getSelectedGateway(function(response) {
      if (response != "")
        $selGateways.value = response;
    });
    var flashStatus = function(message, failure) {
      options.flashStatus(message, failure);
    };
    $btnSave.addEventListener('click', function(e) {
      var selectedValue = $selGateways.value;
      chrome.runtime.sendMessage({fn: "setGateway", gateway: selectedValue});
      flashStatus("Settings have been saved..");
    });
  },
  flashStatus: function(message, failure) {
    var $divStatus = document.getElementById('status');
    $divStatus.textContent = message;
    if (failure) {
      $divStatus.className = "status-failure";
    }
    else {
      $divStatus.className = "status-success";
    }
    setTimeout(function() {
      $divStatus.textContent = '';
    }, 1000);
  },
  getSelectedGateway: function(callback) {
    chrome.runtime.sendMessage({fn: "getGateway"}, callback);
  }
};

//options start
document.addEventListener("DOMContentLoaded", function() {
  options.init();
});