var options = {
  'search': ['url', 'title'],
  'open': ['url', 'title'],
  'close': ['url', 'title'],
  'order': ['time', 'name']
};

/*
 * function that start with dom starting
 */
$(function () {
  $('#command').change(changeOption).change();

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
function changeOption() {
  var option = $('#option');
  option.empty();

  var command = $('#command').val();

  for (var i = 0; i < options[command].length; i++) {
    option.append(new Option('-' + options[command][i], options[command][i]));
  }
}

/*
 * function for command submit
 */
function commandSubmit() {
  $('#error-message').text('');

  var command = $('#command').val();
  var option = $('#option').val();
  var keyword = $('#keyword').val();

  switch (command) {
    case 'search':
      handleSearch(option, keyword);
      break;
  }
}

/*
 * function for search
 */
function handleSearch(option, keyword) {
  if (!keyword) {
    $('#error-message').text('input any keyword');
    return;
  }

  if (option == options.search[0]) {
    chrome.tabs.query({currentWindow: true}, function (tabList) {
      for (var i = 0; i < tabList.length; i++) {
        if (tabList[i].url.includes(keyword)) {
          chrome.tabs.highlight({'tabs': i});
          return;
        }
      }

      $('#error-message').text('no matched tabs');
    });
  }
  else if (option == options.search[1]) {
    chrome.tabs.query({currentWindow: true}, function (tabList) {
      for (var i = 0; i < tabList.length; i++) {
        if (tabList[i].title.includes(keyword)) {
          chrome.tabs.highlight({'tabs': i});
          return;
        }
      }

      $('#error-message').text('no matched tabs');
    });
  }
}
