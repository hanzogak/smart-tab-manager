var commandList = [
  'search',
  'order',
  'open',
  'close',
  'window',
  'save',
  'suspend',
  'preview',
  'merge'
];
//
var CONST_URL = '-url';
var CONST_TITLE = '-title';
var CONST_SAVED = '-saved';
var CONST_ALL = '-all';
var CONST_CURRENT = '-current';
var CONST_TIME = '-time';
var CONST_OLDER = '-older';

// This is const variable. Always only append action is allowed.
var optionList = {
  'search': [CONST_ALL, CONST_URL, CONST_TITLE],
  'open': [CONST_SAVED, CONST_URL],
  'close': [CONST_ALL, CONST_URL, CONST_TITLE],
  'order': [CONST_URL, CONST_TITLE, CONST_TIME],
  'window': [CONST_ALL, CONST_URL, CONST_TITLE],
  'save': [CONST_CURRENT, CONST_URL, CONST_TITLE],
  'preview': [CONST_CURRENT],
  'merge': [CONST_URL, CONST_TITLE],
  'suspend': [CONST_OLDER, CONST_ALL, CONST_URL, CONST_TITLE]
};

var saveList;
window.postMessage({ type: "savelist request" }, "*");
window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window){
        return;
    }
    if (event.data.type && (event.data.type == 'savelist answer')) {
        saveList = event.data.src;
    }
}, false);

if($('#smart-tab-manager-command-box').length == 0) {
  $.ajax({
    url: 'chrome-extension://' + chrome.runtime.id + '/src/html/command_box.html',
    type: 'GET',
    success: function (data) {
      $('body').append($(data)).css('overflow-y', 'hidden');
      $('#command-box').find('.icon').attr('src', 'chrome-extension://' + chrome.runtime.id + '/resources/favicon.png');

      $('#smart-tab-manager-input').focus();

      $('#smart-tab-manager-command-box').unbind('click').click(function(event) {
        if(event.target.id == 'smart-tab-manager-command-box') {
          $(this).remove();
          $('body').css('overflow-y', 'scroll');
        }
      });

      previewCommand();

    }, dataType: 'HTML'
  });
}

function previewCommand() {
  var inputDiv = $('#smart-tab-manager-input');
  var previewDiv = $('#smart-tab-manager-preview');
  var word ='';

  inputDiv.keyup(function(e){
    var val = $(this).val();
    var stage = 0;
    var pre = '';

    if(e.which === 13 ){
      window.postMessage({ type: "submit", text: val }, "*");
    }

    if(e.which === 27 ){
      $('#smart-tab-manager-command-box').remove();
      $('body').css('overflow-y', 'scroll');
    }

    //set stage
    while(val.indexOf(' ') > 0 && stage < 2){
      pre += val.slice(0, val.indexOf(' ') + 1);
      val = val.slice(val.indexOf(' ') + 1,val.length);
      stage++;
    }

    //empty case
    if(val == ''){
      previewDiv.text('');
      return;
    }

    //auto complete
    if(e.which === 39 && word != ''){  //(->)
      if (stage == 0 || stage == 1){
          e.preventDefault();
          inputDiv.val(word + " ");
          previewDiv.text(word + " ");
          word = '';
      } else if (stage == 2){
          e.preventDefault();
          inputDiv.val(word);
          previewDiv.text(word);
          word = '';
      }
      return;
    }

    var src = [];
    if(stage == 0) {
      src = commandList;
    } else if (stage == 1) {
      src = optionList[pre.slice(0, pre.length-1)];
    } else if (stage == 2 && pre == 'open -saved '){
      if(saveList != null){
        src = saveList;
      }
    } else{
      return;
    }

    word = '';
    for(var i = 0; i< src.length; i++){
      if(src[i].indexOf(val) === 0){
        word = src[i];
        break;
      }
    }

    word = pre + word;
    previewDiv.text(word);
  });
}
