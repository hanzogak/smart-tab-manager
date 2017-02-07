var options = {
  'search': ['url', 'title'],
  'open': ['url', 'saved'],
  'close': ['url', 'title'],
  'order': ['time', 'name'],
  'window': ['all', 'url', 'title'],
  'suspend': ['older','all', 'url', 'title'] // how to indicate all tabs?
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
  }
}
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

