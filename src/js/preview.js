$(function () {
  var tabList = $('#tab-list');
  var tabDiv = $('.tab');
  tabDiv.remove();

  var indexList = getParameterByName('index');

  chrome.tabs.query({"currentWindow": true}, function (tabs) {
    for (var i = 0; i < tabs.length; i++) {
      if(indexList.includes(i) || indexList.length == 0) {
        addNewTab(tabs[i]);
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

  function addNewTab(tabInfo) {
    var newTabDiv = tabDiv.clone();
    newTabDiv.find('.title').text(tabInfo.title);
    newTabDiv.find('.url').text(tabInfo.url);

    if(tabInfo.highlighted) {
      newTabDiv.addClass('active');
    }

    tabList.append(newTabDiv);

    clickListener(newTabDiv, tabInfo.id);
  }

  function getParameterByName(name) {
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);

    if (results === null) {
      return []
    } else {
      return results[1].replace(/\+/g, " ").split(',').map(Number);
    }
  }
});
