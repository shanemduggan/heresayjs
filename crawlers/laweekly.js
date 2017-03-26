// "http://www.laweekly.com/calendar?dateRange[]=2017-02-26";

var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('fs');
var $ = require("jquery");
var moment = require('moment');
var _ = require('underscore');

var startURL = "http://www.laweekly.com/calendar?dateRange[]=";
var searchWord = "March";
var allEventNames = [];
var obj = {
	events : []
};
var URLlist = [];

function daysInMonth(month, year) {
	return new Date(year, month, 0).getDate();
}

var year = 2017;
var currentMonth = new Date().getMonth() + 1;
var currentDay = new Date().getDate();
var daysInCurrentMonth = daysInMonth(currentMonth, year);

for (var i = currentDay; i < daysInCurrentMonth + 1; i++) {
	if (currentMonth.toString().length == 1)
		currentMonth = '0' + currentMonth;
	var dynamicURL = startURL + year + '-' + currentMonth + '-' + i;
	URLlist.push(dynamicURL);
}

var num = 0;
var saveIndex = 150;
//firstRequest(URLlist[0], 0);

function firstRequest(url, index) {

	var length = obj.events.length;
	if (length >= 3000)
		console.log('reached 3000 entries');
	if (length >= 5000)
		console.log('reached 5000 entries');
	if (length >= 7000)
		console.log('reached 7000 entries');
	length = 0;

	num++
	if (url == undefined)
		return;
	//setTimeout(function() {
	request(url, function(error, response, body) {
		if (response)
			console.log("Status code: " + response.statusCode);
		if (response.statusCode !== 200)
			return;
		console.log(url);

		var nextNum = index + 1;
		setTimeout(function() {
			firstRequest(URLlist[nextNum], nextNum);
		}, 10000);

		var urlSplit = url.split('=');
		var dateSplit = urlSplit[1].split('-')
		var monthNum = dateSplit[1];
		var dayNum = dateSplit[2];
		var formattedMonth = moment(monthNum, 'MM').format('MMMM');
		var monthText = formattedMonth + ' ' + dayNum;

		var $ = cheerio.load(body);
		var isWordFound = searchForWord($, searchWord);

		if (isWordFound) {
			var content = $('.results').find('.result-day').children('ul');

			for (var i = 0; i < content.length; i++) {
				//console.log(content[i]);
				// TO DO: cap children at 100
				var children = $(content[i]).children('li');
				children = children.slice(0, 80);
				$(children).each(function(index) {
					var childID = $(this)[0].attribs.class;
					console.log(childID);
					if (childID == "goldstar" || childID == "inline-ad" || childID == "yieldmo-placement")
						return;

					// TO DO: fix doubling name
					var nameText = $(this).find(".title").text().replace(/\s+/g, ' ').trim();

					// TO DO: replace @ and trim in location name
					var locationName = $(this).find('.location').children();
					locationName = $(locationName)[0].children[0].data;
					var detailPage = $(this).find(".title").children().attr("href");
					detailPage = 'http://www.laweekly.com' + detailPage;

					allEventNames.push(nameText);

					obj.events.push({
						name : nameText,
						summary : '',
						location : locationName,
						detailPage : detailPage,
						date : monthText
					});

					console.log(obj.events);
				});
			}

			console.log(obj);
			var json = JSON.stringify(obj);
			var length = obj.events.length;
			fs.writeFile('data\\march\\laWeeklyParentData.json', json, 'utf8', function(err) {
				console.log("File saved with " + length + ' entries');
			});
			//secondRequest(obj);
			// var nextNum = index + 1;
			//if (nextNum == URLlist.length) {
			if (num == URLlist.length) {
				console.log('first request completed');
				//secondRequest(obj);
				makeSecondRequest(obj.events[0], 0);
			}

			// TO DO: set timeout on request?
			// current set up is much slower than 10s
			// setTimeout(function() {
			// firstRequest(URLlist[nextNum], nextNum);
			// }, 10000);
		}
	});
	//}, 10000);

	// var nextNum = index + 1;
	// firstRequest(URLlist[nextNum], nextNum);
}

function searchForWord($, word) {
	var bodyText = $('html > body').text().toLowerCase();
	return (bodyText.indexOf(word.toLowerCase()) !== -1);
}

//var obj = fs.readFileSync('data\\march\\laWeeklyParentData.json', 'utf8');
//obj = JSON.parse(obj);
//makeSecondRequest(obj.events[301], 301);

// var json = fs.readFileSync('data\\march\\laweekly.json', 'utf8');
// json = JSON.parse(json);
//
// var events = json.events;
// console.log(json.length);
// console.log(events.length);

// //var newJson = JSON.parse(JSON.stringify(json).split('"address":').join('"locationAddress":'));
// var newJson = JSON.parse(json.split('"address":').join('"locationAddress":'));
//
// //document.write(JSON.stringify(json));
// newJson = JSON.stringify(newJson);
// fs.writeFile('data\\march\\laweeklyfixed.json', newJson, 'utf8', function(err) {
// });

function makeSecondRequest(event, index) {
	var url = event.detailPage;
	if (url == undefined) {
		//secondCallback(obj.events, index);
		var nextIndex = index + 1;
		setTimeout(function() {
			makeSecondRequest(obj.events[nextIndex], nextIndex);
		}, 10000);
		return;
	}

	console.log('crawling event details for ' + url);
	console.log('\r\n');

	request(url, function(error, response, body) {
		if (response) {
			if (response.statusCode == 200) {

				var nextIndex = index + 1;
				if (nextIndex == Math.ceil(obj.events.length * .999)) {
					saveFile('data\\march\\laweekly99.json', index);
					console.log('crawl finished');
					return;
				} else {
					setTimeout(function() {
						makeSecondRequest(obj.events[nextIndex], nextIndex);
					}, 10000);
				}

				var $ = cheerio.load(body);
				var eventHTML = $('.content');
				if (eventHTML) {
					obj.events[index].type = $('.categories').text().replace(/\s+/g, ' ').trim();
					obj.events[index].summary = $('.col-desc').text().replace(/\s+/g, ' ').trim();
					obj.events[index].address = $('.address').text().replace(/\s+/g, ' ').trim();
				}

				console.log('\r\n');
				console.log(index);
				console.log('\r\n');
				console.log(obj.events[index]);
				console.log('\r\n');
				console.log('\r\n');

				if (index % saveIndex === 0) {
					var percent = index / saveIndex;
					saveFile('data\\march\\laweekly' + percent + '.json', index);
				} else if (index == obj.events.length) {
					saveFile('data\\march\\laweekly100.json', index);
				}
			} else {
				var nextIndex = index + 1;
				setTimeout(function() {
					makeSecondRequest(obj.events[nextIndex], nextIndex);
				}, 10000);
				return;
			}
		} else {
			var nextIndex = index + 1;
			setTimeout(function() {
				makeSecondRequest(obj.events[nextIndex], nextIndex);
			}, 10000);
			return;
		}
	});
}

function saveFile(dir, length) {
	var json = JSON.stringify(obj);
	fs.writeFile(dir, json, 'utf8', function(err) {
		console.log("File saved with " + length + ' entries');
		return;
	});
}

// function secondRequest(obj) {
// console.log('secondRequest');
// var that = this;
// var number = 0;
// //for (var i = 0; i < 2; i++) {
// for (var i = 0; i < obj.events.length; i++) {
// if (obj.events[i].detailPage != "" || obj.events[i].detailPage != '') {
// console.log(obj.events[i].detailPage);
// var url = obj.events[i].detailPage;
// console.log(i);
// if (url == undefined)
// return;
// makeSecondRequest(url, i, function(val, i) {
// console.log(val);
// obj.events[i].address = val.address;
// obj.events[i].type = val.type;
// obj.events[i].summary = val.summary;
// console.log(i);
// console.log(obj.events[i]);
// number++
//
// if (number == obj.events.length) {
// //if (number == 2) {
// console.log(i + ' is greater than ' + obj.events.length);
// var json = JSON.stringify(obj);
// var length = obj.events.length;
//
// fs.writeFile('data\\march\\laweekly.json', json, 'utf8', function(err) {
// console.log("File saved with " + length + ' entries');
// });
// }
// });
// }
// }
// }
//
// function makeSecondRequest(url, i, callback) {
// console.log('crawling event details for ' + url)
// setTimeout(function() {
// request(url, function(error, response, body) {
// if (!response)
// return;
// console.log("Status code: " + response.statusCode);
// if (response.statusCode !== 200)
// return;
// var $ = cheerio.load(body);
// var data = [];
//
// var eventHTML = $('.content');
// if (eventHTML) {
// data.type = $('.categories').text().replace(/\s+/g, ' ').trim();
// data.summary = $('.col-desc').text().replace(/\s+/g, ' ').trim();
// data.address = $('.address').text().replace(/\s+/g, ' ').trim();
// }
//
// console.log(data);
// return callback(data, i);
//
// });
// }, 10000);
// }