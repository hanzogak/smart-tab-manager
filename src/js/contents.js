window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window){
    return;
  }
  if (event.data.type && (event.data.type == 'submit')) {
    chrome.runtime.sendMessage({"text": event.data.text}, function(response){
    });
  }
  else if(event.data.type && (event.data.type == 'savelist request')){
    chrome.storage.local.get('saveList', function (result) {
      window.postMessage({ type: 'savelist answer', src: result.saveList }, "*");
    });
  }
}, false);
