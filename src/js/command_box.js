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
var CONST_TIME = '-time';

var optionList = {
  'search': [CONST_URL, CONST_TITLE],
  'open': [CONST_URL, CONST_SAVED],
  'close': [CONST_ALL, CONST_URL, CONST_TITLE],
  'order': [CONST_TIME, CONST_TITLE],
  'window': [CONST_ALL, CONST_URL, CONST_TITLE],
  'save': [CONST_ALL, CONST_URL, CONST_TITLE],
  'preview': [CONST_ALL],
  'merge': [CONST_URL, CONST_TITLE],
  'suspend': ['-older',CONST_ALL, CONST_URL, CONST_TITLE] // how to indicate all tabs?
};

$.ajax({
  url: 'chrome-extension://' + chrome.runtime.id + '/src/html/command_box.html',
  type: 'GET',
  success: function (data) {
    $('body').append($(data)).css('overflow-y', 'hidden');

    $('#smart-tab-manager-command-box').unbind('click').click(function(event) {
      if(event.target.id == 'smart-tab-manager-command-box') {
        $(this).remove();
        $('body').css('overflow-y', 'scroll');
      }
    });

    previewCommand();

  }, dataType: 'HTML'
});

function previewCommand() {
  var inputDiv = $('#smart-tab-manager-input');
  var previewDiv = $('#smart-tab-manager-preview');
  var word ='';

  inputDiv.keyup(function(e){
    var val = $(this).val();
    var stage = 0;
    var pre = '';

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
      e.preventDefault();
      inputDiv.val(word + " ");
      previewDiv.text(word + " ");
      return;
    }

    var src;
    if(stage == 0) {
      src = commandList;
    } else if (stage == 1) {
      src = optionList[pre.slice(0, pre.length-1)];
    } else if (stage == 2 && pre == 'open -saved '){
      //TODO : LocalStorage 불러오는 법을 찾아야함
      return;
    }

    for(var i = 0; i< src.length; i++){
      if(src[i].indexOf(val) === 0){
        word = src[i];
        break;
      }
      word = '';
    }

    word = pre + word;
    previewDiv.text(word);
  });
}
