$(function () {
  var tabList = $('#tab-list');
  var indexList = getParameterByName('index');

  sortTabDiv(tabList);

  chrome.tabs.query({"currentWindow": true}, function (tabs) {
    for (var i = 0; i < tabs.length; i++) {
      if(indexList.includes(i) || indexList.length == 0) {
        var newTab = createTabDiv(tabs[i]);
        tabList.append(newTab);
      }
    }
  });
});
