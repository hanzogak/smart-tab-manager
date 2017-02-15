$.ajax({
  url: 'chrome-extension://maihpbfhkfmblcnhnmobbgikkckbfhhk/src/html/command_box.html',
  type: 'GET',
  success: function (data) {
    $('body').append($(data)).css('overflow-y', 'hidden');

    $('#smart-tab-manager-command-box').unbind('click').click(function(event) {
      if(event.target.id == 'smart-tab-manager-command-box') {
        $(this).remove();
        $('body').css('overflow-y', 'scroll');
      }
    });
  }, dataType: 'HTML'
});
