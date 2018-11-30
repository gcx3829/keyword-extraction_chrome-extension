console.log('Content script running');
var stopWordList = [];
//var text = 'Jack loves eating apple. The doctor said that an apple a day keeps the doctor away.';
var minCharLength = 3;
var minPhaseLength = 3;
var maxPhaseLength = 5;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    stopWordList = request;
    sendResponse('Stop word received.');
    run();
});

function getText() {
	var tex = '';
	var d = document.getElementsByClassName('story-body__inner')[0];
	var t = d.getElementsByTagName('p');
	//var d = document.getElementById('123').innerHTML;
	for (i in t) {
		tex += t[i].innerHTML;
	}
	return tex;
}

function splitText(text) {
	var sentenceList = text.split(/\./);
	return sentenceList;
}

function splitSentence(sentenceList) {
	var wordList = [];
	for (i in sentenceList) {
		var sentence = sentenceList[i].trim().toLowerCase();
		var tempWordList = sentence.split(' ');
		tempWordList = isWord(tempWordList);
		tempWordList = isStopWord(tempWordList);
		if (tempWordList != '' && tempWordList != '#') {
			wordList.push(tempWordList);
		}
	}
	return wordList;
}

function isWord(tempWordList) {
	for (i in tempWordList) {
		if (tempWordList[i].length < minCharLength) {
			tempWordList[i] = '#';
		}
	}
	return tempWordList;
}

function isStopWord(tempWordList) {
	for (i in tempWordList) {
		if (stopWordList.indexOf(tempWordList[i]) != -1) {
			tempWordList[i] = '#';
		}
	}
	return tempWordList;
}

function candidate(wordList) {
	var candidateList = [];
	for (i in wordList) {
		var temp = wordList[i];
		var stack = [];
		for (j in temp) {
			if (temp[j] == '#') {
				continue;
			}
			stack.push(temp[j]);
		}
		if (stack.length < minPhaseLength) {
			continue;
		}
		for (k in stack) {
			let tempStack = [];
			var count = 0;
			var index = Number(k);
			while (count < maxPhaseLength && index < stack.length) {
				tempStack.push(stack[index]);
				index += 1;
				count += 1;
				if (count >= minPhaseLength) {
					let tem = Array.from(tempStack);
					candidateList.push(tem);
				}
			}
		}
	}
	return candidateList;
}

function calaulateScore(candidateList) {
	var degree = {};
	var frequency = {};
	for (i in candidateList) {
		var candidate = candidateList[i];
		tempDegree = candidate.length - 1;
		for (j in candidate) {
			var word = candidate[j];
			if (word in degree === false) {
				degree[word] = tempDegree;
			}
			else {
				degree[word] += tempDegree;
			}
			if (word in frequency === false) {
				frequency[word] = 1;
			}
			else {
				frequency[word] += 1;
			}
		}
	}
	for (i in frequency) {
		degree[i] = degree[i] + frequency[i];
	}
	var wordScore = {};
	for (i in frequency) {
		wordScore[i] = degree[i] / frequency[i];
	}
	var candidateScore = {}
	for (i in candidateList) {
		var tempScore = 0;
		var can = candidateList[i];
		for (j in candidateList[i]) {
			tempScore += wordScore[candidateList[i][j]];
		}
		candidateScore[candidateList[i]] = tempScore;
	}
	return candidateScore;
}

function run() {
	var text = getText();
	var sentenceList = splitText(text);
	var wordList = splitSentence(sentenceList);
	var candidateList = candidate(wordList);
	var candidateScore = calaulateScore(candidateList);
	console.log(candidateScore);
}
