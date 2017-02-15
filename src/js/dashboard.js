$(function() {
  var tabList = $('#tab-list');
  var tabDiv = $('.tab');
  tabDiv.remove();

  var listNameDiv = $('.list-name');

  for(var i = 0; i < localStorage.length; i++){
    var listNameClone = listNameDiv.clone();
    listNameClone.text(localStorage.key(i));
    $('#left-side').append(listNameClone);

    listClickListener(listNameClone);
  }

  function listClickListener(tabListName) {
    tabListName.click(function(e) {
      tabList.empty();
      var savedTab = JSON.parse(localStorage.getItem(tabListName.text()));
      for(i in savedTab){
        addNewTab(savedTab[i]);
      }
    });
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
