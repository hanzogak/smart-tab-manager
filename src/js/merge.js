var CONST_URL = 'url';
var CONST_TITLE = 'title';

$(function () {
  var tabList = $('#tab-list');
  var tabDiv = $('.tab');

  var option = getParameterByName('option');
  var keyword = getParameterByName('keyword');

  $('#keyword').text(keyword);
  $('#option').text(option);
  document.title = keyword;

  tabDiv.remove();

  var currentId;
  chrome.tabs.getCurrent(function (tab) {
    currentId = tab.id
  });

  chrome.tabs.query({"currentWindow": true}, function (tabs) {
    if (option == CONST_URL) {
      for (var i = 0; i < tabs.length; i++) {
        if(tabs[i].url.includes(keyword) && tabs[i].id != currentId) {
          addNewTab(tabs[i]);
          chrome.tabs.remove(tabs[i].id);
        }
      }
    } else if (option == CONST_TITLE) {
      for (var i = 0; i < tabs.length; i++) {
        if(tabs[i].title.includes(keyword) && tabs[i].id != currentId) {
          addNewTab(tabs[i]);
          chrome.tabs.remove(tabs[i].id);
        }
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

    return results === null ? null : results[1].replace(/\+/g, " ");
  }

  $('#separate').click(function() {
    $('.tab').find('.url').each(function() {
      chrome.tabs.create({"url":$(this).text(), "selected": false});
    });

    chrome.tabs.remove(currentId);
  });
});
