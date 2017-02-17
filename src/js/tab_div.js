function createTabDiv(tabInfo) {
  var newTabDiv = $('<div class="tab">' +
    '<div class="id hide"></div>' +
    '<div class="delete"></div>' +
    '<div class="title"></div>' +
    '<div class="url"></div>' +
    '</div>');

  newTabDiv.find('.title').text(tabInfo.title);
  newTabDiv.find('.url').text(tabInfo.url);

  if(tabInfo.highlighted) {
    newTabDiv.addClass('active');
  }

  newTabDiv.click(function(e) {
    if(e.target.className == 'delete') {
      // tab delete event
      chrome.tabs.remove(tabInfo.id);
      newTabDiv.remove();
    } else {
      // tab active event
      chrome.tabs.update(tabInfo.id, {highlighted: true, active: true});
    }
  });

  return newTabDiv;
}

function getParameterByName(name) {
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);

  if (results === null) {
    return []
  } else {
    return results[1].replace(/\+/g, " ").split(',').map(Number);
  }
}
