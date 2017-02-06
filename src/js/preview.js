$(function () {
  var tabList = $('#tab-list');
  var tabDiv = $('.tab');
  tabDiv.remove();

  chrome.tabs.query({"currentWindow": true}, function (tabs) {
    for (var i = 0; i < tabs.length; i++) {
      var tabInfo = tabDiv.clone();
      tabInfo.find('.title').text(tabs[i].title);
      tabInfo.find('.url').text(tabs[i].url);

      if(tabs[i].highlighted) {
        tabInfo.addClass('active');
      }

      tabList.append(tabInfo);

      clickListener(tabInfo, tabs[i].id);
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
