/**
 * Create a new tab for the url that use entered.
 */
function openNewTab() {
  // Get the url from manager.html that user entered.
  var url = document.querySelector('#url').value;

  if (!(url.toString().substr(0, 8) === "https://"
      || url.toString().substr(0, 7) === "http://")) {
    url = "http://" + url;
  }

  // Create a new tab with the url.
  chrome.tabs.create({"url": url, "selected": true});
}

function changeOption() {
  var option = document.querySelector('#option');

  var op = new Option();
  for(var i=1; i<option.options.length; i++){
    option.options[i] = null;
  }

  switch ($('#command').val()) {
    case 'search':
      option.options.length = 0;
      option.add(new Option('-url', '-url'));
      option.add(new Option('-title', '-title'));
      break;
    case 'order':
      option.options.length = 0;
      option.add(new Option('-time', '-time'));
      option.add(new Option('-name', '-name'));
      break;
    case 'open':
      option.options.length = 0;
      option.add(new Option('-url', '-url'));
      option.add(new Option('-saved', '-saved'));
      break;
    case 'close':
      option.options.length = 0;
      option.add(new Option('-url', '-url'));
      option.add(new Option('-title', '-title'));
      break;
    case 'window':
      option.options.length = 0;
      option.add(new Option('-url', '-url'));
      option.add(new Option('-title', '-title'));
  }
}

function commandSubmit(){
  var option = document.querySelector('#option');
  switch(document.querySelector('#command').value){
    case 'search':
      break;

    case 'order':
      break;

    case 'open':
      var url = document.querySelector('#keyword').value;

      if(option.value === '-url'){
        if (!(url.toString().substr(0, 8) === "https://"
            || url.toString().substr(0, 7) === "http://")) {
          url = "http://" + url;
        }
        chrome.tabs.create({"url": url, "selected": true});
      }
      else if(option.value === '-saved'){
        //todo need 'save' function
      }
      break;

    case 'close':
      if(document.querySelector('#keyword').value.length == 0){
        chrome.tabs.query({"currentWindow": true}, function (tabs) {
          for(var i=0; i<tabs.length-1; i++){
            chrome.tabs.remove(tabs[i].id);
          }
        });
      }
      else {

        var keyword = document.querySelector('#keyword').value;
        if (option.value === '-url') {
          chrome.tabs.query({"currentWindow": true}, function (tabs) {
            for(var i=0; i<tabs.length; i++){
              if(tabs[i].url.indexOf(keyword) > -1){
                chrome.tabs.remove(tabs[i].id);
              }
            }
          });
        }
        else if (option.value === '-title') {
          chrome.tabs.query({"currentWindow": true}, function (tabs) {
            for(var i=0; i<tabs.length; i++){
              if(tabs[i].title.indexOf(keyword) > -1){
                chrome.tabs.remove(tabs[i].id);
              }
            }
          });
        }
      }
      break;

    case 'window':
      var keyword = document.querySelector('#keyword').value;
      var selectedTabs = [];
      if(option.value === '-url'){
        chrome.tabs.query({"currentWindow": true}, function(tabs){
          for(var i = 0; i<tabs.length; i++) {
            if(tabs[i].url.indexOf(keyword) > -1){
              selectedTabs.push(tabs[i].id);
            }
          }
          if(selectedTabs.length != 0){
              chrome.windows.create({"tabId":selectedTabs[0]}, function(window){
              chrome.tabs.move(selectedTabs, {"windowId":window.id, "index":-1});
            })
          }
        })
      }
      else if(option.value === '-title'){
        chrome.tabs.query({"currentWindow": true}, function(tabs){
          for(var i = 0; i<tabs.length; i++) {
            if(tabs[i].title.indexOf(keyword) > -1){
              selectedTabs.push(tabs[i].id);
            }
          }
          if(selectedTabs.length != 0){
            chrome.windows.create({"tabId":selectedTabs[0]}, function(window){
              chrome.tabs.move(selectedTabs, {"windowId":window.id, "index":-1});
            })
          }
        })
      }
  }
}

document.addEventListener('DOMContentLoaded', function () {
    $('#btn-open-new-tab').click(openNewTab);
    $('#command').change(changeOption);
    $('#command-submit').click(commandSubmit);
});
