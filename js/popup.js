$('#test').click(e => {
	alert('test succeed');
});

$('#123').click(e => {
	var bg = chrome.extension.getBackgroundPage();
	bg.sendStopWord();
});
