/**
 * This file is for the further features like address bar command.
 */

var windows_collection = {};


//Add a listener when the extension is firstly installed
//to initialize windows_collection entry.
chrome.runtime.onInstalled.addListener(function(details){
  chrome.tabs.query({}, function(tabs) {
    var currTime = Date.now();
    for(var i = 0; i < tabs.length; i++){
      if(!(tabs[i].windowId in windows_collection)){
        windows_collection[tabs[i].windowId] = {};
      }
      windows_collection[tabs[i].windowId][tabs[i].id] = currTime; 
    }
  });
});

function addToCollection(currWindowId, currTabId, currTime){
  windows_collection[currWindowId][currTabId] = currTime;
}

function removeFromCollection(currWindowId, currTabId){
  if(currWindowId in windows_collection){
    if(currTabId in windows_collection[currWindowId]){
      delete windows_collection[currWindowId][currTabId];
    }
  }
}
//Add listeners to be notified when a tab is newly created or activated.

chrome.tabs.onCreated.addListener(function(tabId, changeInfo, tab) {
  addToCollection(tab.windowId, tabId, Date.now());
});


chrome.tabs.onActivated.addListener(function (activeInfo) {
  addToCollection(activeInfo.windowId, activeInfo.tabId, Date.now());
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo){
  removeFromCollection(removeInfo.windowId, tabId); 
});

chrome.commands.onCommand.addListener(function(command) {
  if(command == 'show_command_box'){
    chrome.tabs.executeScript({
      file: 'src/js/jquery.min.js'
    });
   chrome.tabs.executeScript({
     file: 'src/js/command_box.js'
    });
    chrome.tabs.insertCSS({
      file: 'src/css/command_box.css'
    });
  }
});
