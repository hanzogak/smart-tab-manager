/*
 * functions that start with dom starting
 */
$(function() {
    $('#btn-open-new-tab').click(openNewTab);
    $('#command').change(changeOption);

    $('#command-submit').click(function() {
        $('#error_message').text('');

        let command = $('#command').val();
        let option = $('#option').val();
        let keyword = $('#keyword').val();

        switch(command) {
            case 'search':
                searchTab(option, keyword);
                break;
        }
    });
});

/*
 * change option for command selection
 */
function changeOption() {
    let option = $('#option');
    option.empty();

    switch($('#command').val()) {
        case 'search':
        case 'open':
        case 'close':
            option.append(new Option('-url', 'url'));
            option.append(new Option('-title', 'title'));
            break;
        case 'order':
            option.append(new Option('-time', 'time'));
            option.append(new Option('-name', 'name'));
            break;
    }
}

/*
 * Command - open
 */
function openNewTab() {
    let url = $('#url').val();

    if (!(url.toString().substr(0, 8) === "https://"
        || url.toString().substr(0, 7) === "http://")) {
        url = "http://" + url;
    }

    chrome.tabs.create({ "url": url, "selected": true });
}

/*
 * Command - search
 */
function searchTab(option, keyword) {
    if(!keyword) {
        $('#error_message').text('input any keyword');
        return;
    }

    if(option == 'url') {
        chrome.tabs.query({currentWindow: true}, function(tabList) {
            for(let i = 0; i < tabList.length; i++) {
                if(tabList[i].url.includes(keyword)) {
                    chrome.tabs.highlight({'tabs': i});
                    return;
                }
            }

            $('#error_message').text('no matched tabs');
        });
    } else if(option == 'title') {
        chrome.tabs.query({currentWindow: true}, function(tabList) {
            for(let i = 0; i < tabList.length; i++) {
                if(tabList[i].title.includes(keyword)) {
                    chrome.tabs.highlight({'tabs': i});
                    return;
                }
            }

            $('#error_message').text('no matched tabs');
        });
    }
}