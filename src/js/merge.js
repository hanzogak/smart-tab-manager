var currentId = -1;

$(function () {
  // current tab setting
  chrome.tabs.getCurrent(function (tab) {
    currentId = tab.id
  });

  // get page parameter
  var option = getParameterByName('option');
  var keyword = getParameterByName('keyword');
  var mergeListName = '_hanzogak_merge_' + option + '_' + keyword;

  $('#keyword').text(keyword);
  $('#option').text(option);
  document.title = keyword + ' - merged';

  // add tab div
  var tabList = $('#tab-list');
  var mergedTabs = JSON.parse(localStorage.getItem(mergeListName));

  sortStorageTabDiv(tabList, mergeListName);

  for (var i in mergedTabs) {
    var newTab = createStorageTabDiv(mergedTabs[i], mergeListName);
    tabList.append(newTab);
  }

  // pick color and set favicon
  $('#pick-color').find('div').click(function() {
    var selectedColor = $(this).data('color');

    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = '../../resources/favicon/favi_color_' + selectedColor + '.png';
    $('head').append(link);
  });

  // separate button action
  $('#separate').click(function() {
    $('.tab').find('.url').each(function() {
      chrome.tabs.create({"url":$(this).text(), "selected": false});
    });
    chrome.tabs.remove(currentId);
  });
});

// delete merge list from local storage
chrome.tabs.onRemoved.addListener(function (tabId) {
  if(tabId == currentId) {
    var mergeListName = '_hanzogak_merge_' + getParameterByName('option') + '_' + getParameterByName('keyword');
    localStorage.removeItem(mergeListName);
  }
});
