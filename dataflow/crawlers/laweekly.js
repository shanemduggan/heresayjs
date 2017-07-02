// "http://www.laweekly.com/calendar?dateRange[]=2017-02-26";

var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('fs');
var $ = require("jquery");
var moment = require('moment');
var _ = require('underscore');
require('../utils.js')();
require('../logUtils.js')();

var dateData = getDateData();
var monthName = dateData.monthName;
var num = 0;
var saveIndex = 150;
var startIndex = 0;

var startURL = "http://www.laweekly.com/calendar?dateRange[]=";
var saveDir = '..\\..\\data\\crawldata\\' + monthName;

var URLlist = [];
var events = [];

log('laweekly crawl for ' + monthName + ' starting...', 'info');
generateURLlist();
createFolder(monthName);
firstRequest(URLlist[startIndex], startIndex);

function firstRequest(url, index) {

	num++;
	logNumOfEvents(events.length);

	if (url == undefined)
		return;
	
	log('crawling ' + url, 'info');
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

				events.push({
					name : nameText,
					summary : '',
					locationName : locationName,
					detailPage : detailPage,
					date : monthText
				});

				console.log(events);
			});
		}

		console.log(events);
		saveFile(saveDir + '\\laweeklyParentData.json', events.length, events);

		if (num == URLlist.length) {
			log('laweekly - parent crawl completed. found ' + events.length + ' events', 'info');
			makeSecondRequest(events[0], 0);
		}
	});

}

//var events = fs.readFileSync(saveDir + '\\laWeeklyParentData.json', 'utf8');
//events = JSON.parse(events);
//makeSecondRequest(events[startIndex], startIndex);

function makeSecondRequest(event, index) {
	var url = event.detailPage;
	if (url == undefined) {
		var nextIndex = index + 1;
		setTimeout(function() {
			makeSecondRequest(events[nextIndex], nextIndex);
		}, 10000);
		return;
	}

	console.log('crawling event details for ' + url + '\r\n');

	request(url, function(error, response, body) {
		if (response) {
			if (response.statusCode == 200) {

				var nextIndex = index + 1;
				if (nextIndex == Math.ceil(events.length * .999)) {
					var saveData = getSaveData(index);
					saveFile(saveDir + '\\laweekly99.json', saveData.length, saveData);
					console.log('crawl finished');
					return;
				} else {
					setTimeout(function() {
						makeSecondRequest(events[nextIndex], nextIndex);
					}, 10000);
				}

				var $ = cheerio.load(body);
				var eventHTML = $('.content');
				if (eventHTML) {
					var type = $('.categories').text().replace(/\s+/g, ' ').trim();
					events[index].type = type;
					events[index].filterType = getFilterOption(type);
					events[index].summary = $('.col-desc').text().replace(/\s+/g, ' ').trim();
					events[index].address = $('.address').text().replace(/\s+/g, ' ').trim();
					events[index].price = $('span[itemprop="price"]').text();
					events[index].locationLink = 'http://www.laweekly.com' + $('.loc').attr('href');
				}

				console.log('\r\n' + index + '\r\n');
				console.log(events[index]);
				console.log('\r\n\r\n');

				if (index % saveIndex === 0 && index != 0) {
					var saveData = getSaveData(index);
					log('laweekly - saving children ' + startIndex + ' - ' + index, 'info');
					saveFile(saveDir + '\\laweekly' + startIndex + '-' + index + '.json', saveData.length, saveData);
				} else if (index == events.length) {
					var saveData = getSaveData(index);
					log('laweekly - child crawl complete. saving ' + saveData.length + ' events', 'info');
					saveFile(saveDir + '\\laweekly100.json', saveData.length, saveData);
				}
			} else {
				var nextIndex = index + 1;
				setTimeout(function() {
					makeSecondRequest(events[nextIndex], nextIndex);
				}, 10000);
				return;
			}
		} else {
			log('la weekly child crawl error ' + error, 'info');
			var nextIndex = index + 1;
			setTimeout(function() {
				makeSecondRequest(events[nextIndex], nextIndex);
			}, 10000);
			return;
		}
	});
}

function generateURLlist() {
	for (var i = dateData.currentDay; i < dateData.numOfDays + 1; i++) {
		if (dateData.currentMonth.toString().length == 1)
			dateData.currentMonth = '0' + dateData.currentMonth;
		var dynamicURL = startURL + dateData.year + '-' + dateData.currentMonth + '-' + i;
		URLlist.push(dynamicURL);
	}
}

function getSaveData(index) {
	var saveData = JSON.parse(JSON.stringify(events));
	if (startIndex == 0) {
		saveData.splice(index, saveData.length);
	} else {
		saveData.splice(index, saveData.length);
		saveData.splice(0, startIndex);
	}

	return saveData;
}
