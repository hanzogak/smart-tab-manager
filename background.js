/**
 * This file is for the further features like address bar command.
 */

/**
 * Insert time on which each tab was selected to the local storage of Chrome.
 * Key: windowId_tabId
 * Value: time
 * Input: windowId, tabId, time
 */
function insertToLocalStorage(currWindowId, currTabId, currTime){
  var key = currWindowId + '_' + currTabId;
  chrome.storage.local.set({key: currTime}, function(){
    console.log('Time is added to the local storage. Key: ' + key + ', Value: ' + currTime);
  })


}

/**
 * Remove item when the corresponding tab is closed.
 * Input: windowId, tabId
 */
function removeFromLocalStorage(closedWindowId, closedTabId){
  var key = closedWindowId + '_' + closedTabId;
  chrome.storage.local.remove(key, function(){
    if (chrome.runtime.lastError){
      console.log('Error: removeFromLocalStorage(): background.js: fail to remove item from the local storage.');
    }
    else { 
      console.log('Time is added to the local storage. Key: ' + key + ', Value: ' + currTime);
    
    }
  });
}

//Add listeners to be notified when a tab is newly created or activated.
/*
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  insertToLocalStorage(tab.windowId, tabId, Date.now());  

});


chrome.tabs.onActivated.addListener(function (activeInfo) {
  insertToLocalStorage(activeInfo.windowId, activeInfo.tabId, Date.now());  

});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo){
  removeFromLocalStorage(removeInfo.windowId, tabId);

});*/
