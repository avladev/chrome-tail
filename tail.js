var tail_source_tab = null;
var tail_source_interval = 0;

var tail_read_position = 0;
var tail_current_text = null;
var tail_display_lock = false;


chrome.browserAction.onClicked.addListener(function(tab){
    if( tail_source_tab === null && tab.url.indexOf('file://') == 0){
        tail_source_tab = tab;
        chrome.browserAction.setIcon({path:"images/icon-active.png"});
        tail_source_interval = setInterval(checkFile,500);
    }else{
        chrome.browserAction.setIcon({path:"images/icon-inactive.png"});
        clearInterval(tail_source_interval);
        tail_source_tab = null;
    }
})

function checkFile(){
	if( tail_source_tab == null ){
		return;
	}
	
	chrome.tabs.reload(tail_source_tab.id)
	
	chrome.tabs.executeScript(tail_source_tab.id, {code:'document.body.innerText'}, function(result){
        if( tail_display_lock == true ){
            return;
        }

        if( tail_current_text !== null ){
		    tail_current_text = result[0].substr(tail_read_position);
        }else{
            tail_current_text = '';
        }
        tail_read_position = result[0].length;

        if( tail_current_text == '' ){
            return;
        }

        chrome.windows.getAll(function(windows){
            for( var i = 0; i < windows.length; i++ ){
                chrome.tabs.getAllInWindow(window.id, function(tabs){
                    for( var j = 0; j < tabs.length; j++ ){
                        if( tabs[j].url.indexOf('file') == 0 || tabs[j].url.indexOf('http') == 0 ){
                            if( tail_current_text != '' ){
                                chrome.tabs.executeScript(tabs[j].id, {code:'console.log("%c" + decodeURIComponent("' + encodeURIComponent(tail_current_text) + '"), "color:#238C00;font-weight:bold;");'});
                            }
                        }
                    }
                    tail_current_text = '';
                    tail_display_lock = false;
                })
            }
        })
	});
}