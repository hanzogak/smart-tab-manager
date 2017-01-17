/**
 * Create a new tab for the url that use entered.
 */
function openNewTab() {
  // Get the url from manager.html that use entered.
  let url = document.querySelector('#url').value;

  // Create a new tab to the info page.
  chrome.tabs.create({"url": url, "selected": true});
}

function changeOption() {
  let optionList;
  let option = document.querySelector('#option');

  switch(document.querySelector('#command').value) {
    case 'search':
      optionList = "<option>-url</option>";
      optionList += "<option>-title</option>";
      break;
    case 'order':
      optionList = "<option>-time</option>";
      optionList += "<option>-name</option>";
      break;
  }
  option.innerHTML = optionList;
}

document.addEventListener('DOMContentLoaded', function() {
  document.body.querySelector('#btn_open_new_tab')
    .addEventListener('click', openNewTab);
  document.body.querySelector('#command')
    .addEventListener('change', changeOption);
});
