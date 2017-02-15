$.ajax({
  url: 'chrome-extension://bkfpbilbmkljinginaocfmmbkgiieahg/src/html/command_box.html',
  type: 'GET',
  success: function (data) {
    $('body').append($(data)).css('overflow-y', 'hidden');

    $('#smart-tab-manager-command-box').unbind('click').click(function(event) {
      if(event.target.id == 'smart-tab-manager-command-box') {
        $(this).remove();
        $('body').css('overflow-y', 'scroll');
      }
    });

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

    var word ='';
    $('#command').keyup(function(e){
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
        $('#complete').text('');
        return;
      }

      if(stage == 0){
        var src = commandList;
        if(e.which === 39 && word != ''){  //(->)
          e.preventDefault();
          $('#command').val(word + " ");
          $('#complete').text(word + " ");
          return;
        }

        var find = false;
        for(var i = 0; i< src.length; i++){
          if(src[i].indexOf(val) === 0){
            find = true;
            word = src[i];
            break;
          } else {
            word = '';
          }
        }

        $('#complete').text(word);

      } else if (stage == 1) {
        var src = optionList[pre.slice(0, pre.length-1)];

        if(e.which === 39 && word!=''){  //space or (->)
          e.preventDefault();
          $('#command').val(word + " ");
          $('#complete').text(word + " ");
        }

        var find = false;
        for(var i = 0; i< src.length; i++){
          if(src[i].indexOf(val) === 0){
            find = true;
            word = src[i];
            break;
          } else {
            word = '';
          }
        }

        word = pre + word;
        $('#complete').text(word);
      } else if (stage == 2 && pre == 'open -saved '){
        //TODO : LocalStorage 불러오는 법을 찾아야함
      }
    });

  }, dataType: 'HTML'
});
