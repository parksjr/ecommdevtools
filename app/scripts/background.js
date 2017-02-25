'use strict';

var background = {
  contexts: ["editable", "page"],
  selectedGateway: "",
  paymentGateways: {
    authnet: {
      friendlyName: "Authorize.Net",
      test_cards: [
        {name: "Amex", number: "370000000000002"},
        {name: "Discover", number: "6011000000000012"},
        {name: "MasterCard", number: "5424000000000015"},
        {name: "Visa", number: "4007000000027"},
        {name: "Visa", number: "4012888818888"},
        {name: "Error Visa", number: "4222222222222"}
      ]
    },
    cybersource: {
      friendlyName: "CyberSource",
      test_cards: [
        {name: "Visa", number: "4111111111111111"},
        {name: "MasterCard", number: "5555555555554444"},
        {name: "Amex", number: "378282246310005"},
        {name: "Discover", number: "6011111111111117"},
        {name: "JCB", number: "3566111111111113"},
        {name: "Error Visa", number: "4222222222222"}
      ]
    },
    bluepay: {
      friendlyName: "BluePay",
      test_cards: [
        {name: "Visa", number: "4111111111111111"},
        {name: "Visa", number: "4242424242424242"},
        {name: "MasterCard", number: "5439750001500222"},
        {name: "MasterCard", number: "5439750001500347"},
        {name: "Discover", number: "6011111111111117"},
        {name: "Amex", number: "378282246310005"}
      ]
    }
  },
  addresses: {},
  getGatewayTestCards: function(gateway) {
    if (!(gateway in this.paymentGateways)) {
      gateway = "authnet";
    }
    return this.paymentGateways[gateway].test_cards;
  },
  init: function() {
    this.loadAddresses();
    //  listen for any messages and route to functions
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.fn in background) {
        background[request.fn](request, sender, sendResponse);
      }
    });

    //  load context menu items
    this.updateContexts();
  },

  //  route functions
  openOptionsPage: function(request, sender, callback) {
    chrome.runtime.openOptionsPage();
  },
  setGateway: function(request, sender, callback) {
    this.selectedGateway = request.gateway;
    this.updateContexts();
  },
  //  end route functions

  getGateway: function(request, sender, callback) {
    callback(this.selectedGateway);
  },

  getStorage: function(key, callback) {
    chrome.storage.sync.get({key: ''}, function(items) {
      callback(items);
    });
  },

  //  context menu functions
  updateContexts: function() {
    var gateway = this.selectedGateway;
    function onClickSendMessage(info, tab) {
      console.log("onClickSendMessage", tab);
      chrome.tabs.query({
          "active": true,
          "currentWindow": true
      }, function (tabs) {
        var infoId = info.menuItemId.split("---")[0];
        var payload = info.menuItemId.split("---")[1];
        console.log("editable", info.editable, info);
        chrome.tabs.sendMessage(tabs[0].id, {
          fn: info.editable ? "insertEditableText" : "copyTextToClipBoard",
          "payload": payload
        }, function(response) {
          console.log("response from app", response);
        });
      });
    }
    var setContextMenus = function() {
      for (var i = 0; i < background.contexts.length; i++) {
        var context = background.contexts[i];
        var id = background.createContextItem("Ecomm Dev Tools", "cards-context-"+context, [context]);
        
        //
        var cardsParentId = background.createContextItem("Test Credit Cards ("+gateway+")", "parent-"+context, [context], id);
        var addressParentId = background.createContextItem("Random Address", "address-context-"+context, [context], id);

        //  add authnet test cards list items
        var testCards = background.getGatewayTestCards(gateway);
        for (var n = 0; n < testCards.length; n++) {
          var cardNum = testCards[n].number;
          var cardTitle = testCards[n].name + ": " + cardNum;
          var itemId = "card---"+cardNum;
          background.createContextItem(cardTitle, itemId, [context], cardsParentId, onClickSendMessage);
        }
        background.createSeparatorItem(cardsParentId, [context]);
        background.createContextItem("Change payment gateway provider...", "opensettings---payment---", [context], cardsParentId, function() {background.openOptionsPage();});

        //  get random address
        var ridx = Math.floor(Math.random() * 99);
        var randomAddress = background.addresses.addresses[ridx];
        var addressLine = "address---" + randomAddress.line1 + "---";
        var city = "address---" + randomAddress.city + "---";
        var province = "address---" + randomAddress.state + "---";
        var zip = "address---" + randomAddress.zip + "---";
        //  add it as list items
        background.createContextItem("Address Line: " + addressLine, addressLine, [context], addressParentId, onClickSendMessage);
        background.createContextItem("City: " + city, city, [context], addressParentId, onClickSendMessage);
        background.createContextItem("State/Province: " + province, province, [context], addressParentId, onClickSendMessage);
        background.createContextItem("Zip: " + zip, zip, [context], addressParentId, onClickSendMessage);
        
        background.createSeparatorItem(addressParentId, [context]);
        background.createContextItem("Generate a new random address..", "generateaddress---", [context], addressParentId, function() {
          background.updateContexts();
        });
        background.createSeparatorItem(addressParentId, [context]);
        background.createContextItem("Address settings...", "opensettings---country---", [context], addressParentId, function() {
          background.openOptionsPage();
        });
      }
    }
    //  remove all items before updating
    this.removeAllContexts(setContextMenus);
  },

  removeAllContexts: function(callback) {
    chrome.contextMenus.removeAll(callback);
  },
  createSeparatorItem: function(parentId, contexts) {
    return this.createContextItem(false, false, contexts, parentId, false, "separator");
  },
  createContextItem: function(title, id, contexts, parentId, callback, type) {
    var ctx = {};
    if (title)
      ctx.title = title;
    if (id)
      ctx.id = id + (parentId ? ("---" + parentId) : "");
    ctx.contexts = contexts ? contexts : ["editable"];
    if (parentId)
      ctx.parentId = parentId;
    if (callback)
      ctx.onclick = callback;
    ctx.type = type ? type : "normal";
    return chrome.contextMenus.create(ctx);
  },
  loadAddresses: function() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        background.addresses = JSON.parse(xhr.responseText);
      }
    };
    xhr.open("GET", chrome.extension.getURL("/data/addresses.json"), true);
    xhr.send();
  }
};

//
background.init();