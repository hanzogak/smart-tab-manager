$(function () {
  var tabList = $('#tab-list');
  var tabDiv = $('.tab');
  tabDiv.remove();

  chrome.tabs.query({"currentWindow": true}, function (tabs) {
    for (var i = 0; i < tabs.length; i++) {
      var tabInfo = tabDiv.clone();
      tabInfo.find('.title').text(tabs[i].title);
      tabInfo.find('.url').text(tabs[i].url);

      tabList.append(tabInfo);
    }
  });
});
