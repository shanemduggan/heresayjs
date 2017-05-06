// "http://www.laweekly.com/calendar?dateRange[]=2017-02-26";

var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('fs');
var $ = require("jquery");
var moment = require('moment');
var _ = require('underscore');
require('../utils.js')();

var startURL = "http://www.laweekly.com/calendar?dateRange[]=";
var URLlist = [];
var obj = {
	events : []
};

var dateData = getDateData();
var monthName = dateData.monthName;
var num = 0;
var saveIndex = 150;

for (var i = dateData.currentDay; i < dateData.numOfDays + 1; i++) {
	if (dateData.currentMonth.toString().length == 1)
		dateData.currentMonth = '0' + dateData.currentMonth;
	var dynamicURL = startURL + dateData.year + '-' + dateData.currentMonth + '-' + i;
	URLlist.push(dynamicURL);
}

console.log("starting crawl for " + monthName);
createFolder(monthName);
firstRequest(URLlist[0], 0);

function firstRequest(url, index) {

	num++;
	logNumOfEvents(obj.events.length);
	// var length = obj.events.length;
	// if (length >= 3000)
	// console.log('reached 3000 entries');
	// if (length >= 5000)
	// console.log('reached 5000 entries');
	// if (length >= 7000)
	// console.log('reached 7000 entries');
	// length = 0;

	if (url == undefined)
		return;
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
		var dateSplit = urlSplit[1].split('-');
		var monthNum = dateSplit[1];
		var dayNum = dateSplit[2];
		var formattedMonth = moment(monthNum, 'MM').format('MMMM');
		var monthText = formattedMonth + ' ' + dayNum;

		var $ = cheerio.load(body);
		var content = $('.results').find('.result-day').children('ul');

		for (var i = 0; i < content.length; i++) {
			var children = $(content[i]).children('li');
			// children capped at 100 per date
			children = children.slice(0, 80);
			$(children).each(function(index) {
				var childID = $(this)[0].attribs.class;
				console.log(childID);
				if (childID == "goldstar" || childID == "inline-ad" || childID == "yieldmo-placement")
					return;

				var nameElement = $(this).find(".title");
				if (nameElement.length > 1)
					var nameText = $($(nameElement)[0]).text().replace(/\s+/g, ' ').trim();
				else
					var nameText = $(nameElement).text().replace(/\s+/g, ' ').trim();

				var locationName = $(this).find('.location').children();
				locationName = $(locationName)[0].children[0].data;
				locationName = locationName.replace('@', '').trim();
				var detailPage = $(this).find(".title").children().attr("href");
				detailPage = 'http://www.laweekly.com' + detailPage;

				obj.events.push({
					name : nameText,
					summary : '',
					locationName : locationName,
					detailPage : detailPage,
					date : monthText
				});

				console.log(obj.events);
			});
		}

		console.log(obj);
		var json = JSON.stringify(obj);
		var length = obj.events.length;
		fs.writeFile('data\\' + monthName + '\\laWeeklyParentData.json', json, 'utf8', function(err) {
			console.log("File saved with " + length + ' entries');
		});
		if (num == URLlist.length) {
			console.log('first request completed');
			makeSecondRequest(obj.events[0], 0);
		}
	});

}

//var obj = fs.readFileSync('data\\' + monthName + '\\laWeeklyParentData.json', 'utf8');
//obj = JSON.parse(obj);
//makeSecondRequest(obj.events[601], 601);

function makeSecondRequest(event, index) {
	var url = event.detailPage;
	if (url == undefined) {
		var nextIndex = index + 1;
		setTimeout(function() {
			makeSecondRequest(obj.events[nextIndex], nextIndex);
		}, 10000);
		return;
	}

	console.log('crawling event details for ' + url + '\r\n');

	request(url, function(error, response, body) {
		if (response) {
			if (response.statusCode == 200) {

				var nextIndex = index + 1;
				if (nextIndex == Math.ceil(obj.events.length * .999)) {
					saveFile('data\\' + monthName + '\\laweekly99.json', index);
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

				console.log('\r\n' + index + '\r\n');
				console.log(obj.events[index] + '\r\n\r\n');

				if (index % saveIndex === 0 && index != 0) {
					var percent = index / saveIndex;
					saveFile('data\\' + monthName + '\\laweekly' + percent + '.json', index);
				} else if (index == obj.events.length) {
					saveFile('data\\' + monthName + '\\laweekly100.json', index);
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
