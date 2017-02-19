/**
 * Created by Sujin Park on 2017-02-19.
 */

$(function () {

  var localKey = getParameterByName('name');
  var localValue = localStorage.getItem(localKey);
  localStorage.removeItem(localKey);

  console.log(localKey + "," + localValue);
  $('#name-submit').click(nameSubmit);
  $('#newName').keydown(function (e) {
    if (e.keyCode == 13) {
      nameSubmit();
    }
  });

  function nameSubmit() {
    $('#error-message').text();
    var newName = $('#newName').val();

    if (!newName) {
      $('#error-message').text('name box is empty');
      return;
    }

    if (localStorage.getItem(newName) != null) {
      $('#error-message').text('Already Exist!');
      return;
    }else{
      localStorage.setItem(newName, localValue);
      chrome.storage.local.get('saveList', function (result) {
        var KeyForSaveList = [];
        if(result.saveList != null){
          KeyForSaveList = result.saveList;
        }
        KeyForSaveList.push(newName);
        chrome.storage.local.set({'saveList' : KeyForSaveList});
      });
    }
  }

  function getParameterByName(name) {
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);

    return results === null ? null : results[1].replace(/\+/g, " ");
  }

});
