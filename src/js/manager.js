//
var CONST_URL = 'url';
var CONST_TITLE = 'title';
var CONST_SAVED = 'saved';
var CONST_ALL = 'all';
// This is const variable. Always only append action is allowed.
var options = {
  'search': [CONST_URL, CONST_TITLE],
  'open': [CONST_URL, CONST_SAVED],
  'close': [CONST_ALL, CONST_URL, CONST_TITLE],
  'order': ['time', 'name'],
  'window': [CONST_ALL, CONST_URL, CONST_TITLE]
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
  }
}
function handleOpen(option, keyword) {
  if (!keyword) {
    $('#error-message').text('input any keyword');
    return;
  }
  if (option === CONST_URL) {
    if (!(keyword.substr(0, 8) === 'https://'
      || keyword.substr(0, 7) === 'http://')) {
      keyword = 'http://' + keyword;
    }
    chrome.tabs.create({"url": keyword, "selected": true});
  } else if (option === CONST_SAVED) {
    //todo need 'save' function
  }
}
function handleClose(option, keyword) {
  if (!keyword) {
    $('#error-message').text('input any keyword');
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
      }
      else{
        if(confirm("Do you really want to close selected " + selectedTabs.length + " tabs?")){
          chrome.tabs.remove(selectedTabs);
        }
      }
    });
  }
  else if (option === CONST_URL) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if(selectedTabs.length === 0){
        $('#error-message').text('no matched tabs');
      }
      else{
        if(confirm("Do you really want to close selected " + selectedTabs.length + " tabs?")){
          chrome.tabs.remove(selectedTabs);
        }
      }
    });
  }
  else if (option === CONST_TITLE) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].title.indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if(selectedTabs.length === 0){
        $('#error-message').text('no matched tabs');
      }
      else{
        if(confirm("Do you really want to close selected " + selectedTabs.length + " tabs?")){
          chrome.tabs.remove(selectedTabs);
        }
      }
    });
  }
}
function handleWindow(option, keyword){
  if (!keyword) {
    $('#error-message').text('input any keyword');
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
      }
      else{
        $('#error-message').text('no matched tabs');
      }
    })
  }
  else if (option === CONST_URL) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if (selectedTabs.length != 0) {
        if(confirm("Do you really want to move selected " + selectedTabs.length + " tabs to a new window?")) {
          chrome.windows.create({"tabId": selectedTabs[0]}, function (window) {
            chrome.tabs.move(selectedTabs, {"windowId": window.id, "index": -1});
          })
        }
      }
      else{
        $('#error-message').text('no matched tabs');
      }
    })
  }
  else if (option === CONST_TITLE) {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].title.indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if (selectedTabs.length != 0) {
        if(confirm("Do you really want to move selected " + selectedTabs.length + " tabs to a new window?")) {
          chrome.windows.create({"tabId": selectedTabs[0]}, function (window) {
            chrome.tabs.move(selectedTabs, {"windowId": window.id, "index": -1});
          })
        }
      }
      else{
        $('#error-message').text('no matched tabs');
      }
    })
  }
}
/*
 * function for search
 */
function handleSearch(option, keyword) {
  if (!keyword) {
    $('#error-message').text('input any keyword');
    return;
  }
  if (option == CONST_URL) {
    chrome.tabs.query({currentWindow: true}, function (tabList) {
      for (var i = 0; i < tabList.length; i++) {
        if (tabList[i].url.includes(keyword)) {
          chrome.tabs.highlight({'tabs': i});
          return;
        }
      }
      $('#error-message').text('no matched tabs');
    });
  }
  else if (option == CONST_TITLE) {
    chrome.tabs.query({currentWindow: true}, function (tabList) {
      for (var i = 0; i < tabList.length; i++) {
        if (tabList[i].title.includes(keyword)) {
          chrome.tabs.highlight({'tabs': i});
          return;
        }
      }
      $('#error-message').text('no matched tabs');
    });
  }
}
