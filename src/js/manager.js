//
var CONST_URL = 'url';
var CONST_TITLE = 'title';
var CONST_SAVED = 'saved';
var CONST_ALL = 'all';
var CONST_CURRENT = 'current';
var CONST_TIME = 'time';

var CONST_SUCCESS = "success";
var CONST_FAIL = "fail";
// This is const variable. Always only append action is allowed.
var options = {
  'search': [CONST_ALL, CONST_URL, CONST_TITLE],
  'open': [CONST_URL, CONST_SAVED],
  'close': [CONST_ALL, CONST_URL, CONST_TITLE],
  'order': [CONST_TIME, CONST_TITLE],
  'window': [CONST_ALL, CONST_URL, CONST_TITLE],
  'save': [CONST_CURRENT, CONST_URL, CONST_TITLE],
  'preview': [CONST_CURRENT],
  'merge': [CONST_URL, CONST_TITLE],
  'suspend': ['older', CONST_ALL, CONST_URL, CONST_TITLE] // how to indicate all tabs?
};

var guideMsg = {
  'search': {
    'all': 'Search all tabs with [KEYWORD] in the URL or TITLE',
    'url': 'Search all tabs with [KEYWORD] in the URL',
    'title': 'Search all tabs with [KEYWORD] in the TITLE'
  },
  'open': {
    'url': 'Open a new tab with [KEYWORD] as the URL',
    'saved': 'Open a list of tabs named [KEYWORD]'
  },
  'close': {
    'all': 'Close all tabs with [KEYWORD] in the URL or TITLE',
    'url': 'Close all tabs with [KEYWORD] in the URL',
    'title': 'Close all tabs with [KEYWORD] in the TITLE'
  },
  'order': {
    'time': 'Order all tabs in current window by tab\'s activated time',
    'title': 'Order all tabs in current window by tab\'s title'
  },
  'window': {
    'all': 'Separate all tabs with [KEYWORD] in the URL or TITLE with a new window',
    'url': 'Separate all tabs with [KEYWORD] in the URL with a new window',
    'title': 'Separate all tabs with [KEYWORD] in the TITLE with a new window'
  },
  'save': {
    'current': 'Save all tabs in current window',
    'url': 'Save all tabs with [KEYWORD] in the URL',
    'title': 'Save all tabs with [KEYWORD] in the TITLE'
  },
  'preview': {
    'current': 'Show all tabs in current window'
  },
  'merge': {
    'url': 'Merge all tabs with [KEYWORD] in the URL',
    'title': 'Merge all tabs with [KEYWORD] in the TITLE'
  },
  'suspend': {
    'older' : 'Suspend all tabs ...',
    'all': 'Suspend all tabs with [KEYWORD] in the URL or TITLE',
    'url': 'Suspend all tabs with [KEYWORD] in the URL',
    'title': 'Suspend all tabs with [KEYWORD] in the TITLE'
  }
};

/*
 * function that start with dom starting
 */
$(function () {
  $('#command').change(changeCommand).change();
  $('#option').change(changeOption);
  // click submit button
  $('#command-submit').click(commandSubmit);
  // enter keyboard in keyword input
  $('#keyword').keydown(function (e) {
    if (e.keyCode == 13) {
      commandSubmit();
    }
  });
});

/*
 * function for change option for command selection
 */
function changeCommand() {
  var option = $('#option');
  option.empty();
  var command = $('#command').val();
  for (var i = 0; i < options[command].length; i++) {
    option.append(new Option('-' + options[command][i], options[command][i]));
  }
  autocomplete();
  showKeywordBox();
  showGuideLine();
}

function changeOption(){
  autocomplete();
  showKeywordBox();
  showGuideLine();
}

/*
 * function for command submit
 */
function commandSubmit() {
  $('#error-message').text('');
  var command = $('#command').val();
  var option = $('#option').val();
  var keyword = $('#keyword').val();
	var background = chrome.extension.getBackgroundPage();
  switch (command) {
    case 'search':
      background.handleSearch(option, keyword);
      break;
    case 'order':
			background.handleOrder(option, keyword);
      break;
    case 'open':
      background.handleOpen(option, keyword);
      break;
    case 'close':
      background.handleClose(option, keyword);
      break;
    case 'window':
      background.handleWindow(option, keyword);
      break;
    case 'suspend':
      background.handleSuspend(option, keyword);
      break;
    case 'save':
      background.handleSave(option, keyword);
      break;
    case 'preview':
      background.handlePreview();
      break;
    case 'merge':
      background.handleMerge(option, keyword);
      break;
    default:
      background.insertErrorMessage("Invalid option");
  }
  
}

/*
* function for auto complete keyword input box
*/

function autocomplete(){
  var command = $('#command').val();
  var option = $('#option').val();
  $('#keyword').autocomplete();
  if(command == 'open' && option == CONST_SAVED){
    chrome.storage.local.get('saveList', function (result) {
      if(result.saveList != null){
        $( '#keyword' ).autocomplete({
            source : result.saveList,
            minLength : 0,
            position: { my : "right top", at: "right bottom", collision : "fit"},
        }).on("focus", function(){
            $(this).autocomplete("search", '');
        });
      }
    });
  } else if(command == 'search' && option == CONST_TITLE){
    var openSaveSource = [];

    chrome.tabs.query({"currentWindow": true}, function (tabs) {
      for(var i=0; i<tabs.length; i++){
        openSaveSource.push(tabs[i].title);
      }
    });

    $( '#keyword' ).autocomplete({
      source : openSaveSource,
      minLength : 0,
      position: { my : "right top", at: "right bottom", collision : "fit"},
    }).on("focus", function(){
      $(this).autocomplete("search", '');
    });
  } else {
    $('#keyword').autocomplete("destroy");
  }
}

function showKeywordBox(){
  var command = $('#command').val();
  var option = $('#option').val();
  if(command == 'order' || option == CONST_CURRENT){
    $('#keyword').hide();
  } else {
    $('#keyword').show();
  }
}

window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window){
    return;
  }
  if (event.data.type && (event.data.type == 'submit')) {
    console.log("Content script received: " + event.data.text);
    if(event.data.text == 'clear'){
      chrome.storage.local.clear();
    }
    else{
	    chrome.runtime.sendMessage({"text": event.data.text}, function(response){ 
      });
    }
    //TODO : parsing "event.data.text", then call handleFunction.
  }
  else if(event.data.type && (event.data.type == 'savelist request')){
    chrome.storage.local.get('saveList', function (result) {
        window.postMessage({ type: 'savelist answer', src: result.saveList }, "*");
    });
  }
}, false);

function showGuideLine(){
  var command = $('#command').val();
  var option = $('#option').val();

  $('#guideline').text(guideMsg[command][option]);
}
