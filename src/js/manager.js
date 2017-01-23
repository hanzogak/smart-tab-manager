/**
 * Create a new tab for the url that use entered.
 */
function openNewTab() {
  // Get the url from manager.html that user entered.
  let url = $('#url').value;

  // Create a new tab with the url.
  chrome.tabs.create({ "url": url, "selected": true });
}

function changeOption() {
  let option = $('#option');

  switch($('#command').value) {
    case 'search':
      option.append("<option>-url</option>");
      option.append("<option>-title</option>");
      break;
    case 'order':
      option.append("<option>-time</option>");
      option.append("<option>-name</option>");
      break;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  $('#btn-open-new-tab').addEventListener('click', openNewTab);
  $('#command').addEventListener('change', changeOption);
});
