function updatePreviewTabList() {
  // update current preview list only when preview list is active
  if($('.list-name.preview').hasClass('active')) {
    var tabList = $('#tab-list');

    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      tabList.empty();

      for (var i = 0; i < tabs.length; i++) {
        var newTab = createTabDiv(tabs[i]);
        tabList.append(newTab);
      }
    });
  }
}

chrome.tabs.onCreated.addListener(function () {
  updatePreviewTabList();
});

chrome.tabs.onHighlighted.addListener(function () {
  updatePreviewTabList();
});

chrome.tabs.onRemoved.addListener(function () {
  updatePreviewTabList();
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.status == 'complete')
    updatePreviewTabList();
});

chrome.tabs.onMoved.addListener(function () {
  updatePreviewTabList();
});

$(function () {
  var tabList = $('#tab-list');
  var previewList = $('.list-name.preview');

  sortTabDiv(tabList);

  previewList.click(function() {
    $(this).addClass('active');
    updatePreviewTabList();
  });

  // call saved lists from local storage
  for (var i = 0; i < localStorage.length; i++) {
    // append list name to left side
    var listName = $('.list-name').last().clone().removeClass('preview');
    listName.text(localStorage.key(i));
    $('#left-side').append(listName);

    // list name click event
    listName.click(function() {
      previewList.removeClass('active');
      $(this).addClass('active');
      tabList.empty();

      var savedListName = $(this).text();

      var mergedTabs = JSON.parse(localStorage.getItem(savedListName));

      sortStorageTabDiv(tabList, savedListName);

      for (var i in mergedTabs) {
        var newTab = createStorageTabDiv(mergedTabs[i], savedListName);
        tabList.append(newTab);
      }
    });
  }
});
