$(function() {
  var listNameDiv = $('.list-name');

  for(var i = 0; i < localStorage.length; i++){
    var listNameClone = listNameDiv.clone();
    listNameClone.text(localStorage.key(i));
    $('#left-side').append(listNameClone);

    listClickListener(listNameClone);
  }

  function listClickListener(tabList) {
    tabList.click(function(e) {
      var savedURL = JSON.parse(localStorage.getItem($(this).text()));
      for(i in savedURL.URL){
        chrome.tabs.create({"url":savedURL.URL[i], "selected": true});
      }
    });
  }
});
