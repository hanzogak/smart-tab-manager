/**
 * Create a new tab for the url that use entered.
 */
function changeOption() {
  var option = $('#option');
  option.empty();

  switch ($('#command').val()) {
    case 'close':
    case 'window':
    case 'search':
      option.append(new Option('-url', 'url'));
      option.append(new Option('-title', 'title'));
      break;
    case 'order':
      option.append(new Option('-time', 'time'));
      option.append(new Option('-name', 'name'));
      break;
    case 'open':
      option.append(new Option('-url', 'url'));
      option.append(new Option('-saved', 'saved'));
      break;
  }
}

function commandSubmit() {

  $('#error_message').text('');

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
  if (option === 'url') {
    if (!(keyword.substr(0, 8) === 'https://'
      || keyword.substr(0, 7) === 'http://')) {
      keyword = 'http://' + keyword;
    }
    chrome.tabs.create({"url": keyword, "selected": true});
  } else if (option === '-saved') {
    //todo need 'save' function
  }
}

function handleClose(option, keyword) {
  if (option === 'url') {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.indexOf(keyword) > -1) {
          chrome.tabs.remove(tabs[i].id);
        }
      }
    });
  }
  else if (option === 'title') {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].title.indexOf(keyword) > -1) {
          chrome.tabs.remove(tabs[i].id);
        }
      }
    });
  }
}

function handleWindow(option, keyword){
  var selectedTabs = [];
  if (option === 'url') {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if (selectedTabs.length != 0) {
        chrome.windows.create({"tabId": selectedTabs[0]}, function (window) {
          chrome.tabs.move(selectedTabs, {"windowId": window.id, "index": -1});
        })
      }
    })
  }
  else if (option === 'title') {
    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].title.indexOf(keyword) > -1) {
          selectedTabs.push(tabs[i].id);
        }
      }
      if (selectedTabs.length != 0) {
        chrome.windows.create({"tabId": selectedTabs[0]}, function (window) {
          chrome.tabs.move(selectedTabs, {"windowId": window.id, "index": -1});
        })
      }
    })
  }
}

document.addEventListener('DOMContentLoaded', function () {
  $('#command').change(changeOption);
  $('#command-submit').click(commandSubmit);
});
