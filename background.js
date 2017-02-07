/**
 * This file is for the further features like address bar command.
 */

/**
 * Insert time on which each tab was selected to the local storage of Chrome.
 * Key: windowId_tabId
 * Value: time
 * Input: windowId, tabId, time
 */
/*function insertToLocalStorage(currWindowId, currTabId, currTime){
  var key = currWindowId + '_' + currTabId;
  chrome.storage.local.set({key: currTime}, function(){
    console.log('Time is added to the local storage. Key: ' + key + ', Value: ' + currTime);
  })


}
*/
/**
 * Remove item when the corresponding tab is closed.
 * Input: windowId, tabId
 */
/*function removeFromLocalStorage(closedWindowId, closedTabId){
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
*/

var STRING_STORAGE_KEY = 'windows_collection_key';
var windows_collection = {};
/**
 * dictionary< windowId, dictionary< tabId, time > >
 */


//Add a listener when the extension is firstly installed
//to initialize windows_collection entry.
chrome.runtime.onInstalled.addListener(function(details){
  /**chrome.storage.local.clear();
  var initial_entry = {};
  initial_entry[STRING_STORAGE_KEY] = {};
  chrome.storage.local.set(initial_entry, function(){
    alert('onInstalled: set ' + JSON.stringify(initial_entry, null, 2)); 
  });**/
  chrome.tabs.query({}, function(tabs) {
    var currTime = Date.now();
    for(var i = 0; i < tabs.length; i++){
      if(!(tabs[i].windowId in windows_collection)){
        windows_collection[tabs[i].windowId] = {};
        //alert(JSON.stringify(windows_collection, null, 2));
      }
      windows_collection[tabs[i].windowId][tabs[i].id] = currTime; 
      //alert(JSON.stringify(windows_collection, null, 2));
    }
    //alert('initial: ' + JSON.stringify(windows_collection, null, 2));
  });
});

function addToCollection(currWindowId, currTabId, currTime){
  /**chrome.storage.local.get(STRING_STORAGE_KEY, function(items){
    alert('get from local storage: ' + JSON.stringify(items, null, 2));
    alert('get from local storage: value of key: ' + JSON.stringify(items[STRING_STORAGE_KEY], null, 2));
    var item = items[STRING_STORAGE_KEY];
    if(!(currWindowId in item)){
      item[currWindowId] = {};
      alert(JSON.stringify(item, null, 2));
    }
    item[currWindowId][currTabId] = currTime;
    alert('addToCollection: before set: ' + JSON.stringify(item, null, 2));
    chrome.storage.local.set({windows_collection_key: item}, function(){
      if(chrome.runtime.lastError){
        alert('error occurred');
      }
      alert(JSON.stringify(item, null, 2));
    });  

  });**/
  windows_collection[currWindowId][currTabId] = currTime;
  //alert('add: ' + JSON.stringify(windows_collection, null, 2));
}

function removeFromCollection(currWindowId, currTabId){
  /**chrome.storage.local.get(STRING_STORAGE_KEY, function(items){
    alert('get from local storage: ' + JSON.stringify(items, null, 2));
    alert('get from local storage: value of key: ' + JSON.stringify(items[STRING_STORAGE_KEY], null, 2));
    var item = items[STRING_STORAGE_KEY];
    if(currWindowId in item){
      if(currTabId in item[currWindowId]){
        delete item[currWindowId][currTabId];
        alert('removeFromCollection: after delete: ' + JSON.stringify(item, null, 2));

      } else{
      //do nothing
      }

      chrome.storage.local.set({windows_collection_key: item}, function(){
        if(chrome.runtime.lastError){
          alert('error occurred');
        }
        alert(JSON.stringify(item, null, 2));
      });  

    } else {
    //do nothing
    }
  });**/
  if(currWindowId in windows_collection){
    if(currTabId in windows_collection[currWindowId]){
      delete windows_collection[currWindowId][currTabId];
    }
  }
  //alert('remove: ' + JSON.stringify(windows_collection, null, 2));
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
/**chrome.runtime.onSuspend.addListener(function (){
  chrome.storage.local.remove('windows_collection', function(){
    alert('remove old entry');
  });
  alert('onSuspend: windows_collection: ' + JSON.stringify(windows_collection, null, 2));
  chrome.storage.local.set({'windows_collection': windows_collection}, function(){
    alert('Stored changes.');
  });


});**/
