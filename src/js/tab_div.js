function createTabDiv(tabInfo) {
  var newTabDiv = $('<div class="tab">' +
    '<div class="id hide"></div>' +
    '<div class="delete"></div>' +
    '<div class="title"></div>' +
    '<div class="url"></div>' +
    '</div>');

  newTabDiv.find('.id').text(tabInfo.id);
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

function sortTabDiv(tabList) {
  tabList.sortable({
    opacity: 0.8,
    update: function (event, ui) {
      var itemId = parseInt(ui.item.find('.id').text());
      var itemIndex = ui.item.index();

      chrome.tabs.move(itemId, {index: itemIndex});
    }
  });
}
