/**
 * This file is for the further features like address bar command.
 */

//
var CONST_URL = 'url';
var CONST_TITLE = 'title';
var CONST_SAVED = 'saved';
var CONST_ALL = 'all';
var CONST_VIEW = 'view';
var CONST_TIME = 'time';

// This is const variable. Always only append action is allowed.
var options = {
  'search': [CONST_URL, CONST_TITLE],
  'open': [CONST_URL, CONST_SAVED],
  'close': [CONST_ALL, CONST_URL, CONST_TITLE],
  'order': [CONST_TIME, CONST_TITLE],
  'window': [CONST_ALL, CONST_URL, CONST_TITLE],
  'save': [CONST_ALL, CONST_URL, CONST_TITLE],
  'preview': [CONST_ALL],
  'merge': [CONST_URL, CONST_TITLE],
  'suspend': ['older',CONST_ALL, CONST_URL, CONST_TITLE] // how to indicate all tabs?
};


/*
 * function when user empty their keyword input
 */
function emptyKeyword(keyword){
	console.log('keyword: ' + keyword);
	if(keyword == null) console.log('null!');
	if(keyword == "") console.log('empty string!');
	if(keyword == undefined) console.log('undefined!');
  if (!keyword) {
    $('#error-message').text('input any keyword');
    return true;
  }else{
    return false;
  }
}

/*
 * function for suspend
 */
function handleSuspend(option, keyword){
	console.log('handleSuspend called');
  if(option === 'older'){
  //TODO: develop 'older' option
    var background = chrome.extension.getBackgroundPage();
    var currWindowId = undefined;
    chrome.tabs.query({"currentWindow": true, "active": true}, function(tabs){
      if(tabs.length == 0){
        alert('current tab is empty');
      } else {
        currWindowId = tabs[0].windowId;
        console.log('current window id: ' + currWindowId);
      }
      var currTabs = background.windows_collection[currWindowId.valueOf()];
      var criteria = Date.now() - keyword.valueOf() * 60 * 1000;
      console.log('criteria: ' + criteria);
      console.log('currTabs: ' + JSON.stringify(currTabs, null, 2));
      for(var tabid in currTabs){
        console.log('tabid: ' + tabid.valueOf() + ', value: ' + currTabs[tabid.valueOf()]);
        if(currTabs[tabid] < criteria){
          chrome.tabs.discard(parseInt(tabid), function(tab){
            console.log('tab with id ' + tab.id + 'has been discarded.');
         });
        }

      }
    });
  }
  else if(option === 'url'){
    var lowercase_keyword = keyword.toLowerCase();

    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      var discarded_num = 0;
      for(var i = 0; i < tabs.length; i++){
        var lowercase_url = tabs[i].url.toLowerCase();
        if(lowercase_url.includes(lowercase_keyword) && !tabs[i].discarded){
          console.log('title: ' + tabs[i].title + ', id: ' + tabs[i].id);
          chrome.tabs.discard(tabs[i].id);
          discarded_num++;
        }
      }
      if(discarded_num != 0){
        alert(discarded_num + ' tabs are suspended.');
      }
    });
  }
  else if(option === 'title'){
    var lowercase_keyword = keyword.toLowerCase();

    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      var discarded_num = 0;
      for(var i = 0; i < tabs.length; i++){
        var lowercase_title = tabs[i].title.toLowerCase();
        if(lowercase_title.includes(lowercase_keyword && !tabs[i].discarded)){
          chrome.tabs.discard(tabs[i].id);
          discarded_num++;
        }
      }
      if(discarded_num != 0){
        alert(discarded_num + ' tabs are suspended.');
      }
    });
  }
}

/*
 * function for order
 */
function handleOrder(option, keyword){
	console.log('handleOrder called');
	if(option === 'time'){
	 //TODO: develop time option 
    var background = chrome.extension.getBackgroundPage();
    var currWindowId = undefined;
    chrome.tabs.query({"currentWindow": true, "active": true}, function(tabs){
      if(tabs.length == 0){
        alert('current tab is empty');
      } else {
        currWindowId = tabs[0].windowId;
        console.log('current window id: ' + currWindowId);
      }
      var currTabs = background.windows_collection[currWindowId.valueOf()];
      console.log('currTabs: ' + JSON.stringify(currTabs, null, 2));

      for(var tabid in currTabs){
        console.log('tabid: ' + tabid.valueOf() + ', value: ' + currTabs[tabid.valueOf()]);
        //TODO: move tabs 
      }
    });
  }
	else if(option === 'name'){
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      tabs.sort(function (low, high){
        if(low.title < high.title) return -1;
        else if(low.title == high.title) return 0;
        else return 1;
      });
      for(var i = 0; i < tabs.length; i++){
        chrome.tabs.move(tabs[i].id, {index: i});
      }

    });
	}
}

/*
 * function for open
 */
function handleOpen(option, keyword) {
	console.log('handleOpen called');
  if (emptyKeyword(keyword)){
    return;
  }
  if (option === CONST_URL) {
    if (!(keyword.substr(0, 8) === 'https://'
      || keyword.substr(0, 7) === 'http://')) {
      keyword = 'http://' + keyword;
    }
    chrome.tabs.create({"url": keyword, "selected": true});
  } else if (option === CONST_SAVED){
    var value = localStorage.getItem(keyword);
    if(value != null){

      var savedList = JSON.parse(value);
      for(i in savedList){
        chrome.tabs.create({"url":savedList[i].url, "selected": true});
      }
    }
    else{
      $('#error-message').text('no matched savelist');
    }
  }
}

/*
 * function for close
 */
function handleClose(option, keyword) {
  if (emptyKeyword(keyword)){
    return;
  }
  var selectedTabs = [];
  if(option === CONST_ALL){
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.indexOf(keyword) > -1 || tabs[i].title.indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if(selectedTabs.length === 0){
        $('#error-message').text('no matched tabs');
      } else {
        if(confirm("Do you really want to close selected " + selectedTabs.length + " tabs?")){
          chrome.tabs.remove(selectedTabs);
        }
      }
    });
  } else if (option === CONST_URL) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if(selectedTabs.length === 0){
        $('#error-message').text('no matched tabs');
      } else {
        if(confirm("Do you really want to close selected " + selectedTabs.length + " tabs?")){
          chrome.tabs.remove(selectedTabs);
        }
      }
    });
  } else if (option === CONST_TITLE) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].title.indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if(selectedTabs.length === 0){
        $('#error-message').text('no matched tabs');
      } else {
        if(confirm("Do you really want to close selected " + selectedTabs.length + " tabs?")){
          chrome.tabs.remove(selectedTabs);
        }
      }
    });
  }
}

/*
 * function for window
 */
function handleWindow(option, keyword){
	console.log('handleWindow called');
  if (emptyKeyword(keyword)){
		console.log('empty keyword');
    return;
  }
  var selectedTabs = [];
  if(option === CONST_ALL){
		console.log('CONST_ALL');
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.indexOf(keyword) > -1 || tabs[i].title.indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if (selectedTabs.length != 0) {
        if(confirm("Do you really want to move selected " + selectedTabs.length + " tabs to a new window?")) {
          chrome.windows.create({"tabId": selectedTabs[0]}, function (window) {
            chrome.tabs.move(selectedTabs, {"windowId": window.id, "index": -1});
          })
        }
      } else {
        $('#error-message').text('no matched tabs');
      }
    })
		console.log('end of CONST_ALL');
  } else if (option === CONST_URL) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if (selectedTabs.length != 0) {
        if(confirm("Do you really want to move selected " +
            selectedTabs.length + " tabs to a new window?")) {
          chrome.windows.create({"tabId": selectedTabs[0]}, function (window) {
            chrome.tabs.move(selectedTabs, {"windowId": window.id, "index": -1});
          })
        }
      } else {
        $('#error-message').text('no matched tabs');
      }
    })
  } else if (option === CONST_TITLE) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].title.indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if (selectedTabs.length != 0) {
        if(confirm("Do you really want to move selected " +
            selectedTabs.length + " tabs to a new window?")) {
          chrome.windows.create({"tabId": selectedTabs[0]}, function (window) {
            chrome.tabs.move(selectedTabs, {"windowId": window.id, "index": -1});
          })
        }
      } else {
        $('#error-message').text('no matched tabs');
      }
    })
  }
}

/*
 * function for search
 */
function handleSearch(option, keyword) {
	console.log('handleSearch called');
  if (emptyKeyword(keyword)){
    return;
  }
  var tabsIndex = [];

  chrome.tabs.query({currentWindow: true}, function (tabList) {
    if (option == CONST_URL) {
      for (var i = 0; i < tabList.length; i++) {
        if (tabList[i].url.includes(keyword)) {
          tabsIndex.push(i);
        }
      }
    } else if (option == CONST_TITLE) {
      for (var i = 0; i < tabList.length; i++) {
        if (tabList[i].title.includes(keyword)) {
          tabsIndex.push(i);
        }
      }
    }

    if (tabsIndex.length == 1) {
      chrome.tabs.highlight({'tabs': tabsIndex});
    } else if (tabsIndex.length == 0) {
      $('#error-message').text('no matched tabs');
    } else {
      handlePreview(tabsIndex);
    }
  });
}

/*
 * function for preview
 */
function handlePreview(indexArr) {
	console.log('handlePreview called');
  var params = indexArr ? '?index=' + indexArr : '';
  window.location.href = "preview.html" + params;
}

/*
 * function for save
 */
function handleSave(option, keyword) {
	console.log('handleSave called');
  if (option == CONST_ALL) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      var saveList = [];

      for(var i = 0; i < tabs.length; i++){
        saveList.push({url : tabs[i].url, title : tabs[i].title });
      }
      saveUrlToLocalStorage(saveList);
    });
  } else if (option == CONST_URL){
    if (emptyKeyword(keyword)){
      return;
    }
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      var saveList = [];
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.indexOf(keyword) > -1) {
          saveList.push({url : tabs[i].url, title : tabs[i].title });
        }
      }
      saveUrlToLocalStorage(saveList);
    });
  } else if (option == CONST_TITLE){
    if (emptyKeyword(keyword)){
      return;
    }
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      var saveList = [];
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].title.indexOf(keyword) > -1) {
          saveList.push({url : tabs[i].url, title : tabs[i].title });
        }
      }
      saveUrlToLocalStorage(saveList);
    });
  }
}

function saveUrlToLocalStorage(saveList){
  if (saveList.length != 0) {
    var saveListName = prompt("Please enter name for save list", "NewList");
    if (localStorage.getItem(saveListName) != null) {
      alert("Already Exist! Please enter another name.");
      return;
    }else{
      localStorage.setItem(saveListName, JSON.stringify(saveList));
    }
  }
  else {
    $('#error-message').text('no matched tabs');
  }
}

/*
 * function for merge
 */
function handleMerge(option, keyword) {
  if (emptyKeyword(keyword)) {
    return;
  }
  var url = 'src/html/merge.html?option=' + option + '&keyword=' + keyword;
  chrome.tabs.create({"url": url, "selected": true});
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



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
  //addToCollection(tab.windowId, tabId, Date.now());
});


chrome.tabs.onActivated.addListener(function (activeInfo) {
  //addToCollection(activeInfo.windowId, activeInfo.tabId, Date.now());
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo){
  //removeFromCollection(removeInfo.windowId, tabId); 
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
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
  console.log("text: " + message.text);
	parseArg(message.text);
	/**var option = message.option;
	var keyword = message.keyword;
  switch (message.command) {
    case 'search':
      handleSearch(option, keyword);
      break;
    case 'order':
			handleOrder(option, keyword);
      break;
    case 'open':
      handleOpen(option, keyword);
      break;
    case 'close':
      handleClose(option, keyword);
      break;
    case 'window':
      handleWindow(option, keyword);
      break;
    case 'suspend':
      handleSuspend(option, keyword);
      break;
    case 'save':
      handleSave(option, keyword);
      break;
    case 'preview':
      handlePreview();
      break;
    case 'merge':
      handleMerge(option, keyword);
      break;
  }**/
  



});
function parseArg(text){
	var args = text.split(" ");
	if(args.length < 2 || args.length > 3){
		return null;
	}
	var command = args[0];
	var option = args[1].substring(1, args[1].length);
	var keyword = "";
	if(args.length == 3) {
		keyword = args[2];
	}
	console.log('parseArg: command- ' + command + ', option- ' + option + ', keyword- ' + keyword);
	switch(command){
    case 'search':
      handleSearch(option, keyword);
      break;
    case 'order':
			//handleOrder(option, keyword);
      break;
    case 'open':
      handleOpen(option, keyword);
      break;
    case 'close':
      handleClose(option, keyword);
      break;
    case 'window':
      handleWindow(option, keyword);
      break;
    case 'suspend':
      //handleSuspend(option, keyword);
      break;
    case 'save':
      handleSave(option, keyword);
      break;
    case 'preview':
      handlePreview();
      break;
    case 'merge':
      handleMerge(option, keyword);
      break;
    default:
      return null;
      break;
  }


}
