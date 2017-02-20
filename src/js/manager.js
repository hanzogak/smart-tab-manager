//
var CONST_URL = 'url';
var CONST_TITLE = 'title';
var CONST_SAVED = 'saved';
var CONST_ALL = 'all';
var CONST_CURRENT = 'current'
var CONST_TIME = 'time';

// This is const variable. Always only append action is allowed.
var options = {
  'search': [CONST_ALL, CONST_URL, CONST_TITLE],
  'open': [CONST_URL, CONST_SAVED],
  'close': [CONST_ALL, CONST_URL, CONST_TITLE],
  'order': [CONST_TIME, CONST_TITLE],
  'window': [CONST_ALL, CONST_URL, CONST_TITLE],
  'save': [CONST_CURRENT, CONST_URL, CONST_TITLE],
  'preview': [CONST_CURRENT],
  'merge': [CONST_URL, CONST_TITLE],
  'suspend': ['older',CONST_ALL, CONST_URL, CONST_TITLE] // how to indicate all tabs?
};

/*
 * function that start with dom starting
 */
$(function () {
  $('#command').change(changeCommand).change();
  $('#option').change(changeOption);
  // click submit button
  $('#command-submit').click(commandSubmit);
  // enter keyboard in keyword input
  $('#keyword').keydown(function (e) {
    if (e.keyCode == 13) {
      commandSubmit();
    }
  });
});

/*
 * function for change option for command selection
 */
function changeCommand() {
  var option = $('#option');
  option.empty();
  var command = $('#command').val();
  for (var i = 0; i < options[command].length; i++) {
    option.append(new Option('-' + options[command][i], options[command][i]));
  }
  autocomplete();
  showKeywordBox();
  showguideline();
}

function changeOption(){
  autocomplete();
  showKeywordBox();
  showguideline();
}

/*
 * function for command submit
 */
function commandSubmit() {
  $('#error-message').text('');
  var command = $('#command').val();
  var option = $('#option').val();
  var keyword = $('#keyword').val();
  switch (command) {
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
  }
}

/*
 * function when user empty their keyword input
 */
function emptyKeyword(keyword){
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
  if (emptyKeyword(keyword)){
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
  var params = indexArr ? '?index=' + indexArr : '';
  window.location.href = "preview.html" + params;
}

/*
 * function for save
 */
function handleSave(option, keyword) {
  if (option == CONST_CURRENT) {
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
    var d = new Date();
    var localKey = 'temp' + d.getTime();
    localStorage.setItem(localKey, JSON.stringify(saveList));
    window.location.href = "save_list_name.html?name=" + localKey;
  } else {
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

/*
* function for auto complete keyword input box
*/
function autocomplete(){
  var command = $('#command').val();
  var option = $('#option').val();
  $('#keyword').autocomplete();
  if(command == 'open' && option == CONST_SAVED){
    chrome.storage.local.get('saveList', function (result) {
      if(result.saveList != null){
        $( '#keyword' ).autocomplete({
            source : result.saveList,
            minLength : 0,
            position: { my : "right top", at: "right bottom", collision : "fit"},
        }).on("focus", function(){
            $(this).autocomplete("search", '');
        });
      }
    });
  } else if(command == 'search' && option == CONST_TITLE){
    var openSaveSource = [];

    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for(var i=0; i<tabs.length; i++){
        openSaveSource.push(tabs[i].title);
      }
    });

    $( '#keyword' ).autocomplete({
      source : openSaveSource,
      minLength : 0,
      position: { my : "right top", at: "right bottom", collision : "fit"},
    }).on("focus", function(){
      $(this).autocomplete("search", '');
    });
  } else {
    $('#keyword').autocomplete("destroy");
  }
}

function showKeywordBox(){
  var command = $('#command').val();
  var option = $('#option').val();
  if(command == 'order'){
    $('#keyword').hide();
  } else if (command == 'save' && option == CONST_ALL){
    $('#keyword').hide();
  } else if (command == 'preview'){
    $('#keyword').hide();
  } else {
    $('#keyword').show();
  }
}

window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window){
    return;
  }
  if (event.data.type && (event.data.type == 'submit')) {
    console.log(event.data.text);
    if(event.data.text == 'clear'){
      chrome.storage.local.clear();
    }
    //TODO : parsing "event.data.text", then call handleFunction.
  }
  else if(event.data.type && (event.data.type == 'savelist request')){
    chrome.storage.local.get('saveList', function (result) {
        window.postMessage({ type: 'savelist answer', src: result.saveList }, "*");
    });
  }
}, false);

function  showguideline(){
  var command = $('#command').val();
  var option = $('#option').val();

  $('#guideline').text(guideMsg[command][option]);
}

var guideMsg = {
  'search': {
    [CONST_ALL]: 'Search all tabs with [KEYWORD] in the URL or TITLE',
    [CONST_URL]: 'Search all tabs with [KEYWORD] in the URL',
    [CONST_TITLE]: 'Search all tabs with [KEYWORD] in the TITLE'
  },
  'open': {
    [CONST_URL]: 'Open a new tab with [KEYWORD] as the URL',
    [CONST_SAVED]: 'Open a list of tabs named [KEYWORD]'
  },
  'close': {
    [CONST_ALL]: 'Close all tabs with [KEYWORD] in the URL or TITLE',
    [CONST_URL]: 'Close all tabs with [KEYWORD] in the URL',
    [CONST_TITLE]: 'Close all tabs with [KEYWORD] in the TITLE'
  },
  'order': {
    [CONST_TIME]: 'Order all tabs in current window by tab\'s activated time',
    [CONST_TITLE]: 'Order all tabs in current window by tab\'s title'
  },
  'window': {
    [CONST_ALL]: 'Separate all tabs with [KEYWORD] in the URL or TITLE with a new window',
    [CONST_URL]: 'Separate all tabs with [KEYWORD] in the URL with a new window',
    [CONST_TITLE]: 'Separate all tabs with [KEYWORD] in the TITLE with a new window'
  },
  'save': {
    [CONST_CURRENT]: 'Save all tabs in current window',
    [CONST_URL]: 'Save all tabs with [KEYWORD] in the URL',
    [CONST_TITLE]: 'Save all tabs with [KEYWORD] in the TITLE'
  },
  'preview': {
    [CONST_CURRENT]: 'Show all tabs in current window'
  },
  'merge': {
    [CONST_URL]: 'Merge all tabs with [KEYWORD] in the URL',
    [CONST_TITLE]: 'Merge all tabs with [KEYWORD] in the TITLE'
  },
  'suspend': {
    [CONST_ALL]: 'Suspend all tabs with [KEYWORD] in the URL or TITLE',
    [CONST_URL]: 'Suspend all tabs with [KEYWORD] in the URL',
    [CONST_TITLE]: 'Suspend all tabs with [KEYWORD] in the TITLE'
  }
}