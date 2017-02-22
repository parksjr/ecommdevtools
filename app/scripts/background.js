'use strict';

function onClickHandler(info, tab) {
    chrome.tabs.query({
        "active": true,
        "currentWindow": true
    }, function (tabs) {
        var infoId = info.menuItemId.split("---")[0];
        var payload = info.menuItemId.split("---")[1];
        chrome.tabs.sendMessage(tabs[0].id, {
            "payload": payload
        });
    });
}
function onClickSettingsHandler(info, tab) {
  chrome.runtime.openOptionsPage();
}
var createMenuItem = function(title, id, contexts, parentId, callback) {
  var obj = {};
  obj["title"] = title;  
  obj["id"] = id + (parentId ? ("---" + parentId) : "");  
  obj["contexts"] = contexts ? contexts : ["editable"];
  if (parentId) {
    obj["parentId"] = parentId;
  }
  obj["onclick"] = callback ? callback : onClickHandler;
  return obj;
}
var createSeparator = function(parentId, contexts) {
  var obj = {};
  obj["type"] = "separator";
  obj["parentId"] = parentId;
  obj["contexts"] = contexts ? contexts : ["editable"];
  return obj;
}
var gatewayTestCards = function(gateway) {
  var authnetCards = ["Amex:370000000000002", "Discover:6011000000000012", "MasterCard:5424000000000015",
        "Visa:4007000000027", "Visa:4012888818888", "Error Visa:4222222222222"];
  var cyberSourceCards = ["Visa:4111111111111111", "MasterCard:5555555555554444", "Amex:378282246310005",
        "Discover:6011111111111117", "JCB:3566111111111113"];
  var bluePayCards = ["Visa:4111111111111111", "Visa:4242424242424242", "MasterCard:5439750001500222",
        "MasterCard:5439750001500347", "Discover:6011111111111117", "Amex:378282246310005"];
  if (gateway == "cybersource") {
    return cyberSourceCards;
  }
  else if (gateway == "bluepay") {
    return bluePayCards;
  }
  else {
    return authnetCards;
  }
}

function updateContexts(storage) {
  chrome.contextMenus.removeAll(function() {
    var contexts = ["editable", "page"];
    var gateway = storage.paymentProvider ? storage.paymentProvider : "authnet";
    for (var i = 0; i < contexts.length; i++) {
      var context = contexts[i];
      var id = chrome.contextMenus.create(createMenuItem("Ecomm Dev Tools", "cards-context-"+context, [context]));
      
      //
      var cardsParentId = chrome.contextMenus.create(createMenuItem("Test Credit Cards ("+gateway+")", "parent-"+context, [context], id));
      var addressParentId = chrome.contextMenus.create(createMenuItem("Random Address", "address-context-"+context, [context], id));

      //  add authnet test cards list items
      var testCards = gatewayTestCards(gateway);
      for (var n = 0; n < testCards.length; n++) {
        var cardNum = testCards[n].split(":")[1];
        var cardTitle = testCards[n].split(":")[0] + ": " + cardNum;
        var itemId = "card---"+cardNum;
        chrome.contextMenus.create(createMenuItem(cardTitle, itemId, [context], cardsParentId));
      }
      chrome.contextMenus.create(createSeparator(cardsParentId, [context]));
      chrome.contextMenus.create(createMenuItem("Change payment gateway provider...", "opensettings---payment---", [context], cardsParentId, onClickSettingsHandler));

      //  get random address
      var addressLine = "address---23005 S Hootycreek Rd---";
      var city = "address---Claremore---";
      var province = "address---OK---";
      var zip = "address---74019---";
      //  add it as list items
      chrome.contextMenus.create(createMenuItem("Address Line: " + addressLine, addressLine, [context], addressParentId));
      chrome.contextMenus.create(createMenuItem("City: " + city, city, [context], addressParentId));
      chrome.contextMenus.create(createMenuItem("State/Province: " + province, province, [context], addressParentId));
      chrome.contextMenus.create(createMenuItem("Zip: " + zip, zip, [context], addressParentId));
      chrome.contextMenus.create(createSeparator(addressParentId, [context]));
      chrome.contextMenus.create(createMenuItem("Address settings...", "opensettings---country---", [context], addressParentId, onClickSettingsHandler));
    }
  });
}

chrome.runtime.onInstalled.addListener(function (details) {
  chrome.storage.sync.get({paymentProvider: 'authnet'}, function(items) {
    updateContexts(items);
  });
});

chrome.storage.onChanged.addListener(function(storage, area) {
  if (area == "sync") {
    chrome.storage.sync.get({paymentProvider: 'authnet'}, function(items) {
      updateContexts(items);
    });
  }
});
