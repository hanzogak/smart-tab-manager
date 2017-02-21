////////////////////////////////////////HANDLE FUNCTIONS////////////////////////////////////////

var CONST_URL = 'url';
var CONST_TITLE = 'title';
var CONST_SAVED = 'saved';
var CONST_ALL = 'all';
var CONST_CURRENT = 'current';
var CONST_TIME = 'time';
var CONST_OLDER = 'older';

/**
 * function for suspend
 */
function handleSuspend(option, keyword) {
  if(option === CONST_OLDER){
    var background = chrome.extension.getBackgroundPage();
    var currWindowId = undefined;
    chrome.tabs.query({"currentWindow": true, "active": true}, function(tabs){
      if(tabs.length == 0){
        insertErrorMessage('current tab is empty');
      } else {
        currWindowId = tabs[0].windowId;
        console.log('current window id: ' + currWindowId);
      }
      var currTabs = background.windows_collection[currWindowId.valueOf()];
      var criteria = Math.floor(Date.now()/10) - keyword.valueOf() * 60 * 100;
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
  else if(option === CONST_URL){
    var lowercase_keyword = keyword.toLowerCase();

    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      var discarded_num = 0;
      for(var i = 0; i < tabs.length; i++){
        var lowercase_url = tabs[i].url.toLowerCase();
        if(lowercase_url.includes(lowercase_keyword) && !tabs[i].discarded){
          chrome.tabs.discard(tabs[i].id);
          discarded_num++;
        }
      }
      if(discarded_num != 0){
        alert(discarded_num + ' tabs are suspended.');
      }
    });
  }
  else if(option === CONST_TITLE){
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
  }else {
    insertErrorMessage("Invalid option");
  }
}

/**
 * function for order
 */
function handleOrder(option) {
	if(option === CONST_TIME) {
    chrome.tabs.query({"currentWindow": true}, function(tabs) {
      var selectedTabs = [];

      for(var i = 0; i < tabs.length; i++) {
        if(parseInt(tabsCollection[tabs[i].id]) != 0) selectedTabs.push(tabs[i].id);
      }

      selectedTabs.sort(function(low, high) {
        if(parseInt(tabsCollection[low]) < parseInt(tabsCollection[high])) return -1;
        else if(parseInt(tabsCollection[low]) == parseInt(tabsCollection[high])) return 0;
        else return 1;
      });

      chrome.tabs.move(selectedTabs, {"index": -1});
    });
  } else if(option === CONST_TITLE) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      tabs.sort(function(low, high) {
        var lowLowerCase = low.title.toLowerCase();
        var highLowerCase = high.title.toLowerCase();

        if(lowLowerCase < highLowerCase) return -1;
        else if(lowLowerCase == highLowerCase) return 0;
        else return 1;
      });

      for(var i = 0; i < tabs.length; i++){
        chrome.tabs.move(tabs[i].id, {"index": i});
      }
    });
	} else if(option === CONST_URL) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      tabs.sort(function (low, high){
        var lowLowerCase = low.url.toLowerCase();
        var highLowerCase = high.url.toLowerCase();

        if(lowLowerCase < highLowerCase) return -1;
        else if(lowLowerCase == highLowerCase) return 0;
        else return 1;
      });

      for(var i = 0; i < tabs.length; i++){
        chrome.tabs.move(tabs[i].id, {index: i});
      }
    });
	} else {
    insertErrorMessage("Invalid option");
  }
}

/**
 * function for open
 */
function handleOpen(option, keyword) {
  if (!keyword) {
    insertErrorMessage("input any keyword");
  	return;
	}
  if (option === CONST_URL) {
    if (!(keyword.substr(0, 8) === 'https://' || keyword.substr(0, 7) === 'http://')) {
      keyword = 'http://' + keyword;
    }
    chrome.tabs.create({"url": keyword, "selected": true});
  } else if (option === CONST_SAVED){
    var value = localStorage.getItem(keyword);
    if(value != null){
      var savedList = JSON.parse(value);
      for(var i in savedList) {
        chrome.tabs.create({"url":savedList[i].url, "selected": true});
      }
    } else{
      insertErrorMessage("no matched saved list");
    }
  } else {
    insertErrorMessage("Invalid option");
  }
}

/**
 * function for close
 */
function handleClose(option, keyword) {
  if (!keyword){
    insertErrorMessage("input any keyword");
    return;
  }
  keyword = keyword.toLowerCase();
  var selectedTabs = [];
  if(option === CONST_ALL) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.toLowerCase().indexOf(keyword) > -1 || tabs[i].title.toLowerCase().indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if(selectedTabs.length === 0) {
        insertErrorMessage("no matched tabs");
      } else {
        chrome.tabs.remove(selectedTabs);
      }
    });
  } else if (option === CONST_URL) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.toLowerCase().indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if(selectedTabs.length === 0){
        insertErrorMessage("no matched tabs");
      } else {
        chrome.tabs.remove(selectedTabs);
      }
    });
  } else if (option === CONST_TITLE) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].title.toLowerCase().indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if(selectedTabs.length === 0){
        insertErrorMessage("no matched tabs");
      } else {
        chrome.tabs.remove(selectedTabs);
      }
    });
  } else {
    insertErrorMessage("Invalid option");
  }
}

/**
 * function for window
 */
function handleWindow(option, keyword) {
  if (!keyword){
    insertErrorMessage("input any keyword");
    return;
  }
  keyword = keyword.toLowerCase();
  var selectedTabs = [];
  if(option === CONST_ALL){
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.toLowerCase().indexOf(keyword) > -1 || tabs[i].title.toLowerCase().indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if (selectedTabs.length != 0) {
        chrome.windows.create({"tabId": selectedTabs[0]}, function (window) {
          chrome.tabs.move(selectedTabs, {"windowId": window.id, "index": -1});
        });
      } else {
        insertErrorMessage("no matched tabs");
      }
    })
  } else if (option === CONST_URL) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.toLowerCase().indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if (selectedTabs.length != 0) {
        chrome.windows.create({"tabId": selectedTabs[0]}, function (window) {
          chrome.tabs.move(selectedTabs, {"windowId": window.id, "index": -1});
        });
      } else {
        insertErrorMessage("no matched tabs");
      }
    });
  } else if (option === CONST_TITLE) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].title.toLowerCase().indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if (selectedTabs.length != 0) {
        chrome.windows.create({"tabId": selectedTabs[0]}, function (window) {
          chrome.tabs.move(selectedTabs, {"windowId": window.id, "index": -1});
        });
      } else {
        insertErrorMessage("no matched tabs");
      }
    });
  } else {
    insertErrorMessage("Invalid option");
  }
}

/**
 * function for search
 */
function handleSearch(option, keyword) {
  if (!keyword){
    insertErrorMessage("input any keyword");
    return;
  }
  var tabsIndex = [];
  keyword = keyword.toLowerCase();

  chrome.tabs.query({currentWindow: true}, function (tabList) {
    if (option == CONST_ALL) {
      for (var i = 0; i < tabList.length; i++) {
        if (tabList[i].url.toLowerCase().includes(keyword) || tabList[i].title.toLowerCase().includes(keyword)) {
          tabsIndex.push(i);
        }
      }
    } else if (option == CONST_URL) {
      for (var i = 0; i < tabList.length; i++) {
        if (tabList[i].url.toLowerCase().includes(keyword)) {
          tabsIndex.push(i);
        }
      }
    } else if (option == CONST_TITLE) {
      for (var i = 0; i < tabList.length; i++) {
        if (tabList[i].title.toLowerCase().includes(keyword)) {
          tabsIndex.push(i);
        }
      }
    } else {
      insertErrorMessage("Invalid option");
      return;
    }

    if (tabsIndex.length == 1) {
      chrome.tabs.highlight({'tabs': tabsIndex});
    } else if (tabsIndex.length == 0) {
      insertErrorMessage("no matched tabs");
    } else {
      handlePreview(tabsIndex);
    }
  });
}

/**
 * function for preview
 */
function handlePreview(indexArr) {
  var params = indexArr ? '?index=' + indexArr : '';
  var url = 'chrome-extension://' + chrome.runtime.id + '/src/html/preview.html' + params;
  var views = chrome.extension.getViews({type: "popup"});

  if(views.length > 0) {
    for(var i = 0; i < views.length; i++) {
      views[i].window.location.href = url;
    }
  } else {
    chrome.tabs.create({"url": url, "selected": true});
  }
}

/**
 * function for save
 */
function handleSave(option, keyword) {
  if (option == CONST_CURRENT) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      var saveList = [];

      for(var i = 0; i < tabs.length; i++){
        saveList.push({url : tabs[i].url, title : tabs[i].title, favIconUrl : tabs[i].favIconUrl });
      }
      saveUrlToLocalStorage(saveList);
    });
  } else if (option == CONST_URL){
    if (!keyword){
      insertErrorMessage("input any keyword");
      return;
    }
    keyword = keyword.toLowerCase();
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      var saveList = [];
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.toLowerCase().indexOf(keyword) > -1) {
          saveList.push({url : tabs[i].url, title : tabs[i].title, favIconUrl : tabs[i].favIconUrl });
        }
      }
      saveUrlToLocalStorage(saveList);
    });
  } else if (option == CONST_TITLE){
    if (!keyword){
      insertErrorMessage("input any keyword");
      return;
    }
    keyword = keyword.toLowerCase();
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      var saveList = [];
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].title.toLowerCase().indexOf(keyword) > -1) {
          saveList.push({url : tabs[i].url, title : tabs[i].title, favIconUrl : tabs[i].favIconUrl });
        }
      }
      saveUrlToLocalStorage(saveList);
    });
  }else {
    insertErrorMessage("Invalid option");
  }
}

function saveUrlToLocalStorage(saveList) {
  if (saveList.length != 0) {
    var d = new Date();
    var localKey = 'temp' + d.getTime();
    localStorage.setItem(localKey, JSON.stringify(saveList));

    var url = 'chrome-extension://' + chrome.runtime.id + '/src/html/save_list_name.html?name=' + localKey;
    var views = chrome.extension.getViews({type: "popup"});

    if(views.length > 0) {
      for(var i = 0; i < views.length; i++) {
        views[i].window.location.href = url;
      }
    } else {
      chrome.windows.create({'url': url, 'type': 'popup', 'width': 440, 'height': 160, top: (screen.height/2)-100, left: (screen.width/2)-220});
    }
  } else {
    insertErrorMessage("no matched tabs");
  }
}

/**
 * function for merge
 */
function handleMerge(option, keyword) {
  if (!keyword) {
    insertErrorMessage("input any keyword");
    return;
  }
  var keywordLower = keyword.toLowerCase();

  chrome.tabs.query({"currentWindow": true}, function (tabs) {
    var mergeList = [];

    for(var i = 0; i < tabs.length; i++) {
      if((option == CONST_URL && tabs[i].url.toLowerCase().includes(keywordLower)) || (option == CONST_TITLE && tabs[i].title.toLowerCase().includes(keywordLower))) {
        if(!tabs[i].url.includes(chrome.runtime.id)) {
          mergeList.push({url : tabs[i].url, title : tabs[i].title, favIconUrl : tabs[i].favIconUrl});
          chrome.tabs.remove(tabs[i].id);
        }
      }
    }

    var mergeListName = '_hanzogak_merge_'+option+'_'+keyword;

    if(localStorage.getItem(mergeListName) != null) {
      var existMergeList = JSON.parse(localStorage.getItem(mergeListName));
      existMergeList = existMergeList.concat(mergeList);
      localStorage.setItem(mergeListName, JSON.stringify(existMergeList));
    } else {
      localStorage.setItem(mergeListName, JSON.stringify(mergeList));
    }
  });

  var url = 'src/html/merge.html?option=' + option + '&keyword=' + keyword;

  // if there already merged tab, update tab
  chrome.tabs.query({"currentWindow": true, "url": 'chrome-extension://' + chrome.runtime.id + '/' + url}, function (tabs) {
    if(tabs.length == 0) {
      chrome.tabs.create({"url": url, "selected": true});
    } else {
      chrome.tabs.reload(tabs[0].id, function() {
        chrome.tabs.update(tabs[0].id, {highlighted: true, active: true});
      });
    }
  });

  // window closed after merge
  var views = chrome.extension.getViews({type: "popup"});
  if(views.length > 0) {
    for(var i = 0; i < views.length; i++) {
      views[i].window.close();
    }
  }
}

/**
 * function to deal error-message
 */
function insertErrorMessage(message) {
  var views = chrome.extension.getViews({type: "popup"});

  if(views.length > 0) {
    for(var i = 0; i < views.length; i++){
      views[i].document.getElementById('error-message').innerHTML = message;
    }
  } else {
    chrome.tabs.executeScript({
      code: 'alert("' + message + '")'
    });
  }
}

////////////////////////////////////////TIME SETTING////////////////////////////////////////

var CONST_INT_MIN = 0;

var tabsCollection = {};
var tabsScreenShot = {};

chrome.tabs.query({}, function (tabs) {
  var currTime = CONST_INT_MIN;
  for(var i = 0; i < tabs.length; i++) {
    tabsCollection[tabs[i].id] = currTime;
  }
});

chrome.runtime.onInstalled.addListener(function () {
  tabsCollection = {};
  chrome.tabs.query({}, function (tabs) {
    var currTime = CONST_INT_MIN;
    for(var i = 0; i < tabs.length; i++){
      tabsCollection[tabs[i].id] = currTime;
    }
  });
});

function addToCollection(currTabId, currTime) {
  tabsCollection[currTabId] = currTime;

  chrome.tabs.captureVisibleTab(function(screenUrl) {
    tabsScreenShot[currTabId] = screenUrl;
  });
}

function removeFromCollection(currTabId) {
  if(currTabId in tabsCollection){
    delete tabsCollection[currTabId];
  }

  if(currTabId in tabsScreenShot){
    delete tabsScreenShot[currTabId];
  }
}
//Add listeners to be notified when a tab is newly created or activated.

chrome.tabs.onCreated.addListener(function(tab) {
  addToCollection(tab.id, Math.floor(Date.now()/10));
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  addToCollection(activeInfo.tabId, Math.floor(Date.now()/10));
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  removeFromCollection(tabId); 
});

////////////////////////////////////////COMMAND BOX////////////////////////////////////////

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

chrome.runtime.onMessage.addListener(function(message) {
	parseArg(message.text);
});

function parseArg(text){
	var args = text.split(" ");
	if(args.length < 2 || args.length > 3) {
	  insertErrorMessage("Not enough arguments");
	  return;
  }
	var command = args[0];
	var option = args[1].substring(1, args[1].length);
	var keyword = "";
	if(args.length == 3) {
		keyword = args[2];
	}

	switch(command) {
    case 'search':
      handleSearch(option, keyword);
      break;
    case 'order':
			handleOrder(option);
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
    default:
	    insertErrorMessage("Invalid option");
      break;
  }
}
