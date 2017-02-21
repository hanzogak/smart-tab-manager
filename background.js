/**
 * This file is for the further features like address bar command.
 */

var CONST_URL = 'url';
var CONST_TITLE = 'title';
var CONST_SAVED = 'saved';
var CONST_ALL = 'all';
var CONST_VIEW = 'view';
var CONST_TIME = 'time';


var CONST_SUCCESS = "success";
var CONST_FAIL = "fail";

var CONST_INT_MIN = 0;

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


var CONST_TABSCOLLECTION = "tabsCollection";
var tabsCollection = {};
chrome.runtime.onInstalled.addListener(function(details){
  tabsCollection = {};
  chrome.tabs.query({}, function (tabs) { 
    var currTime = CONST_INT_MIN;
    for(var i = 0; i < tabs.length; i++){
      tabsCollection[tabs[i].id] = currTime;
    }
    //localStorage.setItem("tabsCollection", JSON.stringify(tabsCollection));
  });
});
  
tabsCollection = {};
  chrome.tabs.query({}, function (tabs) { 
    var currTime = CONST_INT_MIN;
    for(var i = 0; i < tabs.length; i++){
      tabsCollection[tabs[i].id] = currTime;
    }
    //localStorage.setItem("tabsCollection", JSON.stringify(tabsCollection));
   // alert('Initialization: '+ idx + ': ' + JSON.stringify(tabsCollection, null, 2));
  });

/*
 * function when user empty their keyword input
 */
function emptyKeyword(keyword){
  if (!keyword) {
    //$('#error-message').text('input any keyword');
    return true;
  }else{
    return false;
  }
}

/*
 * function for suspend
 */

function handleSuspend(option, keyword){
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
  }else {
    //return {"result": CONST_FAIL, "text": "Invalid option"};
    insertErrorMessage("Invalid option");
  }

}

/*
 * function for order
 */

function sortByTime(tabs, tabCollection){
  var big = tabs[0].id;
  for(var j = tabs.length; j > 0; j--){
    for(var i = 1; i <= j-1; i++){
      if(parseInt(tabCollection[tabs[i-1].id]) > parseInt(tabCollection[tabs[i].id])) big = tabs[i].id;

    }
    chrome.tabs.move(big, {"index": -1});
  }




}

function handleOrder(option, keyword){
	if(option === CONST_TIME){
	  //TODO: develop time option 
    chrome.tabs.query({"currentWindow": true}, function(tabs){
      var selectedTabs = [];
      var str = "";
      for(var i = 0; i < tabs.length; i++){
        str += tabs[i].id + ':' + tabsCollection[tabs[i].id] + ' / ';
        if(parseInt(tabsCollection[tabs[i].id]) != 0) selectedTabs.push(tabs[i].id);
      }
      console.log('tabs: ' + str);
      
      selectedTabs.sort(function (low, high){
        if(parseInt(tabsCollection[low]) < parseInt(tabsCollection[high])){
          return -1;
        }
        else if(parseInt(tabsCollection[low]) == parseInt(tabsCollection[high])) return 0;
        else return 1;
      });

      chrome.tabs.move(selectedTabs, {"index": -1}); 
      str = "";
      for(var i = 0; i < tabs.length; i++){
        str += tabs[i].id + ':' + tabsCollection[tabs[i].id] + ' / ';
      }
      console.log('tabs: ' + str);
      
    });
  }
	else if(option === CONST_TITLE){
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      tabs.sort(function (low, high){
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
	}
	else if(option === CONST_URL){
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
	}else {
    //return {"result": CONST_FAIL, "text": "Invalid option"};
    insertErrorMessage("Invalid option");
  }


}

/*
 * function for open
 */

function handleOpen(option, keyword) {
  if (emptyKeyword(keyword)){
    //return {"result": CONST_FAIL, "text": "input any keyword"};
    insertErrorMessage("input any keyword");
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
      //$('#error-message').text('no matched savelist');
      //return {"result": CONST_FAIL, "text": "no matched savelist"};
      insertErrorMessage("no matched savelist");
    }
  }else {
    //return {"result": CONST_FAIL, "text": "Invalid option"};
    insertErrorMessage("Invalid option");

  }
  

}

/*
 * function for close
 */

function handleClose(option, keyword) {
  if (emptyKeyword(keyword)){
    //return{"result": CONST_FAIL, "text": "input any keyword"};
    insertErrorMessage("input any keyword");
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
        //$('#error-message').text('no matched tabs');
        //return{"result": CONST_FAIL, "text": "no matched tabs"};
        insertErrorMessage("no matched tabs");
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
        //$('#error-message').text('no matched tabs');
        //return{"result": CONST_FAIL, "text": "no matched tabs"};
        insertErrorMessage("no matched tabs");
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
        //$('#error-message').text('no matched tabs');
        //return{"result": CONST_FAIL, "text": "no matched tabs"};
        insertErrorMessage("no matched tabs");
      } else {
        if(confirm("Do you really want to close selected " + selectedTabs.length + " tabs?")){
          chrome.tabs.remove(selectedTabs);
        }
      }
    });
  } else {
    //return {"result": CONST_FAIL, "text": "Invalid option"};
    insertErrorMessage("Invalid option");

  }
  
}

/*
 * function for window
 */

function handleWindow(option, keyword){
  if (emptyKeyword(keyword)){
    //return{"result": CONST_FAIL, "text": "input any keyword"};
    insertErrorMessage("input any keyword");
  }
  var selectedTabs = [];
  if(option === CONST_ALL){
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.indexOf(keyword) > -1 || tabs[i].title.indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      console.log('handleWindow: CONT_ALL: selectedTabs.length: ' + selectedTabs.length);
      if (selectedTabs.length != 0) {
        if(confirm("Do you really want to move selected " + selectedTabs.length + " tabs to a new window?")) {
          chrome.windows.create({"tabId": selectedTabs[0]}, function (window) {
            chrome.tabs.move(selectedTabs, {"windowId": window.id, "index": -1});
          })
        }
      } else {
        //$('#error-message').text('no matched tabs');
        //return{"result": CONST_FAIL, "text": "no matched tabs"};
        insertErrorMessage("no matched tabs");
      }
  
    });
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
          });
        }
      } else {
        //$('#error-message').text('no matched tabs');
        //return{"result": CONST_FAIL, "text": "no matched tabs"};
        insertErrorMessage("no matched tabs");
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
        //$('#error-message').text('no matched tabs');
        //return{"result": CONST_FAIL, "text": "no matched tabs"};
        insertErrorMessage("no matched tabs");
      }
      
    });
  }else {
    //return {"result": CONST_FAIL, "text": "Invalid option"};
    insertErrorMessage("Invalid option");

  }
  //return {"result": CONST_SUCCESS, "text": ""};

}
function insertErrorMessage(message){
  var views = chrome.extension.getViews({type: "popup"});
  console.log("views.length = " + views.length);
  for(var i = 0; i < views.length; i++){
    views[i].document.getElementById('error-message').innerHTML = message;

  }
}
/*
 * function for search
 */

function handleSearch(option, keyword) {
  if (emptyKeyword(keyword)){
    //return{"result": CONST_FAIL, "text": "input any keyword"};
    insertErrorMessage("input any keyword");
    return;
  }
  var tabsIndex = [];
  chrome.tabs.query({currentWindow: true}, function (tabList) {
    if (option == CONST_ALL) {
      for (var i = 0; i < tabList.length; i++) {
        if (tabList[i].url.includes(keyword) || tabList[i].title.includes(keyword)) {
          tabsIndex.push(i);
        }
      }
    } else if (option == CONST_URL) {
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
    console.log('tabsIndex.length = ' + tabsIndex.length);
    if (tabsIndex.length == 1) {
      chrome.tabs.highlight({'tabs': tabsIndex});
    } else if (tabsIndex.length == 0) {
      //$('#error-message').text('no matched tabs');
      console.log('No matched tabs');
      //result = {"result": CONST_FAIL, "text": "no matched tabs"};
      insertErrorMessage("no matched tabs");
    } else {
      handlePreview(tabsIndex);
    }
    
  });

}

/*
 * function for preview
 */

function handlePreview(indexArr) {
  var params = indexArr ? '?index=' + indexArr : '';
  window.location.href = "preview.html" + params;


}

/*
 * function for save
 */

function handleSave(option, keyword) {
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
      //return{"result": CONST_FAIL, "text": "input any keyword"};
      insertErrorMessage("input any keyword");
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
      //return{"result": CONST_FAIL, "text": "input any keyword"};
      insertErrorMessage("input any keyword");
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
  }else {
    insertErrorMessage("Invalid option");

  }

}

function saveUrlToLocalStorage(saveList){
  if (saveList.length != 0) {
    var d = new Date();
    var localKey = 'temp' + d.getTime();
    localStorage.setItem(localKey, JSON.stringify(saveList));
    window.location.href = "save_list_name.html?name=" + localKey;
  } else {
    //$('#error-message').text('no matched tabs');
    //return{"result": CONST_FAIL, "text": "no matched tabs"};
    insertErrorMessage("no matched tabs");
  }
}

/*
 * function for merge
 */

function handleMerge(option, keyword) {
  if (emptyKeyword(keyword)) {
    //return{"result": CONST_FAIL, "text": "input any keyword"};
    insertErrorMessage("input any keyword");
  }

  chrome.tabs.query({"currentWindow": true}, function (tabs) {
    var mergeList = [];

    for(var i = 0; i < tabs.length; i++) {
      if((option == CONST_URL && tabs[i].url.includes(keyword)) || (option == CONST_TITLE && tabs[i].title.includes(keyword))) {
        if(!tabs[i].url.includes(chrome.runtime.id)) {
          mergeList.push({url : tabs[i].url, title : tabs[i].title});
          chrome.tabs.remove(tabs[i].id);
        }
      }
    }

    var mergeListName = '_'+option+'_'+keyword;

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
    window.close();
  });


}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function addToCollection(currTabId, currTime){
  tabsCollection[currTabId] = currTime;

  //localStorage.setItem("tabsCollection", JSON.stringify(tabsCollection));
}

function removeFromCollection(currTabId){
  if(currTabId in tabsCollection){
    delete tabsCollection[currTabId];
  }
  //localStorage.setItem("tabsCollection", JSON.stringify(tabsCollection));
}
//Add listeners to be notified when a tab is newly created or activated.

chrome.tabs.onCreated.addListener(function(tab) {
  addToCollection(tab.id, Math.floor(Date.now()/10));
});


chrome.tabs.onActivated.addListener(function (activeInfo) {
  addToCollection(activeInfo.tabId, Math.floor(Date.now()/10));
});


chrome.tabs.onRemoved.addListener(function (tabId, removeInfo){
  removeFromCollection(tabId); 
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
	var result = parseArg(message.text);
  sendResponse(result);

});

function parseArg(text){
	var args = text.split(" ");
	if(args.length < 2 || args.length > 3){
	  insertErrorMessage("Not enough arguments");
  }
	var command = args[0];
	var option = args[1].substring(1, args[1].length);
	var keyword = "";
	if(args.length == 3) {
		keyword = args[2];
	}
	console.log('parseArg: command- ' + command + ', option- ' + option + ', keyword- ' + keyword);
  var result = {};
	switch(command){
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
	    insertErrorMessage("Invalid option");
      break;
  }

}
