function updateTabList() {
  var tabList = $('#tab-list');

  chrome.tabs.query({"currentWindow": true}, function (tabs) {
    tabList.empty();

    for (var i = 0; i < tabs.length; i++) {
      var newTab = createTabDiv(tabs[i]);
      tabList.append(newTab);
    }
  });
}

chrome.tabs.onCreated.addListener(function () {
  updateTabList();
});

chrome.tabs.onHighlighted.addListener(function () {
  updateTabList();
});

chrome.tabs.onRemoved.addListener(function () {
  updateTabList();
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.status == 'complete')
    updateTabList();
});

chrome.tabs.onMoved.addListener(function () {
  updateTabList();
});

$(function () {
  var tabList = $('#tab-list');

  sortTabDiv(tabList);

  for (var i = 0; i < localStorage.length; i++) {
    var listName = $('.list-name').clone().removeClass('preview');
    listName.text(localStorage.key(i));

    listName.click(function (e) {
      tabList.empty();
      var savedTab = JSON.parse(localStorage.getItem(listName.text()));
      console.log('savedTab');
      for (i in savedTab) {
        var newTab = createTabDiv(savedTab[i]);
        tabList.append(newTab);
      }
    });

    $('#left-side').append(listName);
  }
});
