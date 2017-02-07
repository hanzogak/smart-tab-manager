$(function () {
  var tabList = $('#tab-list');
  var tabDiv = $('.tab');
  tabDiv.remove();

  var indexList = getParameterByName('index');

  chrome.tabs.query({"currentWindow": true}, function (tabs) {
    for (var i = 0; i < tabs.length; i++) {
      if(indexList.includes(i) || indexList.length == 0) {
        var tabInfo = tabDiv.clone();
        tabInfo.find('.title').text(tabs[i].title);
        tabInfo.find('.url').text(tabs[i].url);

        if(tabs[i].highlighted) {
          tabInfo.addClass('active');
        }

        tabList.append(tabInfo);

        clickListener(tabInfo, tabs[i].id);
      }
    }
  });

  function clickListener(tabInfo, tabId) {
    tabInfo.click(function(e) {
      if(e.target.className == 'delete') {
        chrome.tabs.remove(tabId, function () {
          tabInfo.remove();
        });
      } else {
        var index = $('.tab').index(tabInfo);
        chrome.tabs.highlight({'tabs': index});
      }
    });
  }

  // TODO
  function captureTabScreen(tabId, screenImg) {
    chrome.tabs.onActivated.addListener(function () {
      chrome.tabs.captureVisibleTab(function (capturedUrl) {
        screenImg.attr('src', capturedUrl);
      })
    });
  }
});

function getParameterByName(name) {
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);

  if (results === null) {
    return []
  } else {
    return results[1].replace(/\+/g, " ").split(',').map(Number);
  }
}
