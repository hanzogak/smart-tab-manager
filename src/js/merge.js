var CONST_URL = 'url';
var CONST_TITLE = 'title';
var CONST_SAVED = 'saved';
var CONST_ALL = 'all';

$(function () {
  var tabList = $('#tab-list');
  var tabDiv = $('.tab');

  var option = getParameterByName('option');
  var keyword = getParameterByName('keyword');

  tabDiv.remove();

  chrome.tabs.query({"currentWindow": true}, function (tabs) {
    if (option == CONST_URL) {
      for (var i = 0; i < tabs.length; i++) {
        if(tabs[i].url.includes(keyword)) {
          addNewTab(tabs[i]);
        }
      }
    } else if (option == CONST_TITLE) {
      for (var i = 0; i < tabs.length; i++) {
        if(tabs[i].title.includes(keyword)) {
          addNewTab(tabs[i]);
        }
      }
    }
  });

  function getParameterByName(name) {
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);

    return results === null ? null : results[1].replace(/\+/g, " ");
  }

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
});
