function getParameterByName(name) {
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);

  return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function createTabDiv(tabInfo) {
  var newTabDiv = $('<div class="tab">' +
    '<div class="id hide"></div>' +
    '<div class="delete"></div>' +
    '<div class="cover">' +
    '<img src="../../resources/hanzo_128.png" class="favicon">' +
    '<div class="title"></div>' + '</div>' +
    '<div class="content"><img src="../../resources/default_screen.png" class="screen"></div>' +
    '<div class="url hide">' + '</div>' +
    '</div>');

  newTabDiv.find('.id').text(tabInfo.id);
  newTabDiv.find('.title').text(tabInfo.title);
  newTabDiv.find('.url').text(tabInfo.url);

  if(tabInfo.favIconUrl) {
    newTabDiv.find('.favicon').attr('src', tabInfo.favIconUrl);
  }

  var screenUrl = chrome.extension.getBackgroundPage().tabsScreenShot[tabInfo.id];
  if(screenUrl) {
    newTabDiv.find('.screen').attr('src', screenUrl);
  }

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

function createStorageTabDiv(tabInfo, keyName) {
  var newTabDiv = $('<div class="tab">' +
    '<div class="delete"></div>' +
    '<div class="cover">' +
    '<img src="../../resources/hanzo_128.png" class="favicon">' +
    '<div class="title"></div>' + '</div>' +
    '<div class="content"><img src="../../resources/default_screen.png" class="screen"></div>' +
    '<div class="url hide">' + '</div>' +
    '</div>');

  newTabDiv.find('.title').text(tabInfo.title);
  newTabDiv.find('.url').text(tabInfo.url);

  if(tabInfo.favIconUrl) {
    newTabDiv.find('.favicon').attr('src', tabInfo.favIconUrl);
  }

  if(tabInfo.screenUrl) {
    newTabDiv.find('.screen').attr('src', tabInfo.screenUrl);
  }

  newTabDiv.click(function(e) {
    if(e.target.className == 'delete') {
      // tab delete event
      var storageList = JSON.parse(localStorage.getItem(keyName));
      storageList.splice($(this).index(), 1);
      localStorage.setItem(keyName, JSON.stringify(storageList));

      newTabDiv.remove();
    } else {
      // tab active event
      chrome.tabs.create({"url": tabInfo.url, "selected": false});
    }
  });

  return newTabDiv;
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

function sortStorageTabDiv(tabList, keyName) {
  var oldIndex, newIndex;

  tabList.sortable({
    opacity: 0.8,
    start: function(event, ui) {
      oldIndex = ui.item.index();
    },
    update: function (event, ui) {
      newIndex = ui.item.index();

      var storageList = JSON.parse(localStorage.getItem(keyName));
      var pickedTab = storageList[oldIndex];
      storageList.splice(oldIndex, 1);
      storageList.splice(newIndex, 0, pickedTab);
      localStorage.setItem(keyName, JSON.stringify(storageList));
    }
  });
}
