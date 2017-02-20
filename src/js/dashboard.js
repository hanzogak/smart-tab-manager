function updatePreviewTabList() {
  // update current preview list only when preview list is active
  if ($('.list-name.preview').hasClass('active')) {
    var tabList = $('#tab-list');
    sortTabDiv(tabList);

    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      tabList.empty();

      for (var i = 0; i < tabs.length; i++) {
        var newTab = createTabDiv(tabs[i]);
        tabList.append(newTab);
      }
    });
  }
}

chrome.tabs.onCreated.addListener(function () {
  updatePreviewTabList();
});

chrome.tabs.onHighlighted.addListener(function () {
  updatePreviewTabList();
});

chrome.tabs.onRemoved.addListener(function () {
  updatePreviewTabList();
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.status == 'complete')
    updatePreviewTabList();
});

chrome.tabs.onMoved.addListener(function () {
  updatePreviewTabList();
});

$(function () {
  var tabList = $('#tab-list');
  var previewList = $('.list-name.preview');

  previewList.click(function () {
    $(this).parent().find('.list-name').removeClass('active');
    $(this).addClass('active');
    updatePreviewTabList();
  });

  // call saved lists from local storage
  for (var i = 0; i < localStorage.length; i++) {
    // append list name to left side
    var listName = $('.list-name').first().clone().removeClass('preview').removeClass('active');
    listName.append('<div class="delete"></div><div class="edit"></div>').find('.name').text(localStorage.key(i));
    $('#list-set').append(listName);

    // list name click event
    listName.find('.name').click(function () {
      if ($(this).hasClass('editing'))
        return;

      $(this).parent().parent().find('.list-name').removeClass('active');
      $(this).parent().addClass('active');
      tabList.empty();

      var savedListName = $(this).text();
      var savedTabs = JSON.parse(localStorage.getItem(savedListName));
      sortStorageTabDiv(tabList, savedListName);

      for (var i in savedTabs) {
        var newTab = createStorageTabDiv(savedTabs[i], savedListName);
        tabList.append(newTab);
      }
    });

    // list delete click event
    listName.find('.delete').click(function () {
      var removeListName = $(this).siblings('.name').text();
      localStorage.removeItem(removeListName);

      chrome.storage.local.get(function (result) {
        var KeyForSaveList = [];
        if (result.saveList != null) {
          KeyForSaveList = result.saveList;
        }

        for (var i in KeyForSaveList) {
          if (KeyForSaveList[i] == removeListName) {
            KeyForSaveList.splice(i, 1);
            break;
          }
        }

        chrome.storage.local.set({'saveList': KeyForSaveList});
      });

      if ($(this).parent().hasClass('active')) {
        previewList.click();
      }

      $(this).parent().remove();
    });

    // list edit click event
    listName.find('.edit').click(function () {
      var inputSpace = $(this).siblings('.name');
      inputSpace.prop('contenteditable', true).attr("spellcheck", false).addClass('editing');
      inputSpace.focus();

      var originName = inputSpace.text();

      inputSpace.keydown(function (e) {
        if (e.keyCode == 13) {
          $(this).prop('contenteditable', false).removeClass('editing');
          changeStorageData(originName, $(this).text());
        }
      });

      inputSpace.focusout(function () {
        $(this).prop('contenteditable', false).removeClass('editing');
        changeStorageData(originName, $(this).text());
      });
    });

    function changeStorageData(originName, newName) {
      var originList = localStorage.getItem(originName);
      if (originList !== null) {
        localStorage.setItem(newName, originList);
        localStorage.removeItem(originName);

        chrome.storage.local.get(function(result){
          var KeyForSaveList = [];
          if(result.saveList != null){
            KeyForSaveList = result.saveList;
          }

          for(var i in KeyForSaveList) {
            if (KeyForSaveList[i] == originName) {
              KeyForSaveList.splice(i, 1, newName);
              break;
            }
          }

          chrome.storage.local.set({'saveList' : KeyForSaveList});
        });
      }
    }
  }
});
