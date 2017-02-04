var options = {
  'search': ['url', 'title'],
  'open': ['url', 'saved'],
  'close': ['url', 'title'],
  'order': ['time', 'name'],
  'window': ['url', 'title'],
  'preview': ['all']
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
    case 'preview':
      handlePreview();
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

function handleWindow(option, keyword) {
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

/*
 * function for search
 */
function handleSearch(option, keyword) {
  if (!keyword) {
    $('#error-message').text('input any keyword');
    return;
  }

  if (option == options.search[0]) {
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
  else if (option == options.search[1]) {
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

/*
 * function for preview
 */
function handlePreview() {
  window.location.href = "preview.html";
}
