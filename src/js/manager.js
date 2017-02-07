//
var CONST_URL = 'url';
var CONST_TITLE = 'title';
var CONST_SAVED = 'saved';
var CONST_ALL = 'all';
var CONST_VIEW = 'view';
// This is const variable. Always only append action is allowed.
var options = {
  'search': [CONST_URL, CONST_TITLE],
  'open': [CONST_URL, CONST_SAVED],
  'close': [CONST_ALL, CONST_URL, CONST_TITLE],
  'order': ['time', 'name'],
  'window': [CONST_ALL, CONST_URL, CONST_TITLE],
  'save': [CONST_ALL, CONST_URL, CONST_TITLE, CONST_VIEW],
  'preview': [CONST_ALL]
};
/*
 * function that start with dom starting
 */
$(function () {
  $('#command').change(changeOption).change();
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
function changeOption() {
  var option = $('#option');
  option.empty();
  var command = $('#command').val();
  for (var i = 0; i < options[command].length; i++) {
    option.append(new Option('-' + options[command][i], options[command][i]));
  }
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
    case 'save':
      handleSave(option, keyword);
      break;
    case 'preview':
      handlePreview();
      break;
  }
}

function emptyKeyword(keyword){
  if (!keyword) {
    $('#error-message').text('input any keyword');
    return true;
  }else{
    return false;
  }
}

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

      var savedURL = JSON.parse(value);
      for(i in savedURL.URL){
        chrome.tabs.create({"url":savedURL.URL[i], "selected": true});
      }
    }
    else{
      $('#error-message').text('no matched savelist');
    }
  }
}
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
  var params = indexArr ? '?index=' + indexArr : '';
  window.location.href = "preview.html" + params;
}
/*
 * function for search
 */
function handleSave(option, keyword) {
  if (option == CONST_ALL) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      var saveListURL = { "URL": []};
      for(var i = 0; i < tabs.length; i++){
        saveListURL.URL.push(tabs[i].url);
      }
      saveUrlToLocalStorage(saveListURL);
    });
  } else if (option == CONST_URL){
    if (emptyKeyword(keyword)){
      return;
    }
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      var saveListURL = { "URL": []};
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.indexOf(keyword) > -1) {
          saveListURL.URL.push(tabs[i].url);
        }
      }
      saveUrlToLocalStorage(saveListURL);
    });
  } else if (option == CONST_TITLE){
    if (emptyKeyword(keyword)){
      return;
    }
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      var saveListURL = { "URL": []};
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].title.indexOf(keyword) > -1) {
          saveListURL.URL.push(tabs[i].url);
        }
      }
      saveUrlToLocalStorage(saveListURL);
    });
  } else if (option == CONST_VIEW){
    /*임시로...*/
    var viewlist = '';
    for(var i = 0; i < localStorage.length; i++){
      viewlist += localStorage.key(i) + '\n';
    }
    alert(viewlist);

    if(keyword === 'delete'){
      localStorage.clear();
    }
  }
}

function saveUrlToLocalStorage(saveListURL){
  if (saveListURL.URL.length != 0) {
    var saveListName = prompt("Please enter name for save list", "NewList");
    if(localStorage.getItem(saveListName) != null){
      alert("Already Exist! Please enter another name.");
      return;
    }else{
      localStorage.setItem(saveListName, JSON.stringify(saveListURL));
      //alert(JSON.stringify(saveListURL));
    }
  } else {
    $('#error-message').text('no matched tabs');
  }
}
