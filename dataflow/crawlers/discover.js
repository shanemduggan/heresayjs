// "http://www.discoverlosangeles.com/what-to-do/events?when[value][date]=02/25/2017";

var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('fs');
var $ = require("jquery");
var moment = require('moment');
require('../utils.js')();

var dateData = getDateData();
var monthName = dateData.monthName;
// should this be capitalized?
var searchWord = dateData.monthName;
var num = 0;
var saveIndex = 150;
var startIndex = 0;

var startURL = "http://www.discoverlosangeles.com/what-to-do/events?when[value][date]=";
var saveDir = '..\\..\\data\\crawldata\\' + monthName;

var URLlist = [];
var obj = {
	events : []
};



console.log("starting crawl for " + monthName);
generateURLlist();
createFolder(monthName);
//firstRequest(URLlist[startIndex], startIndex);

// TO DO:
// pull callbacks into callback function

function firstRequest(url, index) {
	if (url == undefined)
		return;

	num++;
	logNumOfEvents(obj.events.length);

	request(url, function(error, response, body) {
		if (response) {
			if (response.statusCode == 200) {
				console.log(url);

				var nextNum = index + 1;
				setTimeout(function() {
					firstRequest(URLlist[nextNum], nextNum);
				}, 10000);

				var urlSplit = url.split('=');
				var dateSplit = urlSplit[1].split('/');
				var monthNum = dateSplit[0];
				var dayNum = dateSplit[1];
				var formattedMonth = moment(monthNum, 'MM').format('MMMM');
				var monthText = formattedMonth + ' ' + dayNum;

				var $ = cheerio.load(body);
				var dayElement;
				var element = $('.field-content');
				for (var i = 0; i < element.length; i++) {
					var headerText = $(element[i]).text();
					if (headerText.indexOf(monthText)) {
						dayElement = element[i];
						break;
					}
				}

				if (dayElement) {
					var content = $(dayElement).parent().next().children()[0];
					var children = $(content).children('.views-row');
					var linkDate = url.split('=')[1].split('/')[1];
					//var parentDate = $('.field-content:contains("' + searchWord + ' ' + linkDate + '")').text().split(', ')[1];
					var parentDate = searchWord + ' ' + linkDate;

					$(children).each(function(index) {
						var nameText = $(this).find("h2").text().trim();
						var summaryText = '';
						var locationText = $(this).find('.field-name-field-event-venue').children().children().text().trim();
						var eventDetailLink = $(this).find("h2").children().attr("href");
						eventDetailLink = 'http://www.discoverlosangeles.com' + eventDetailLink;

						obj.events.push({
							name : nameText,
							summary : summaryText,
							locationName : locationText,
							detailPage : eventDetailLink,
							date : parentDate
						});
					});

					console.log(obj);
					saveFile(saveDir + '\\discoverParentData.json', obj.events.length, obj);

					var nextNum = index + 1;
					if (nextNum == URLlist.length) {
						console.log('first request completed');
						makeSecondRequest(obj.events[0], 0);
					}
				}
			} else {
				var nextNum = index + 1;
				setTimeout(function() {
					firstRequest(URLlist[nextNum], nextNum);
				}, 10000);
				return;
			}
		} else {
			var nextNum = index + 1;
			setTimeout(function() {
				firstRequest(URLlist[nextNum], nextNum);
			}, 10000);
			return;
		}
	});
}

var obj = fs.readFileSync(saveDir + '\\discoverParentData.json', 'utf8');
obj = JSON.parse(obj);
makeSecondRequest(obj.events[1051], 1051);

function makeSecondRequest(event, index) {
	var url = event.detailPage;
	var eventDate = event.date;
	if (url == undefined || parseInt(eventDate.split(' ')[1]) < dateData.currentDay) {
		// want to remove event from array if url is undefined or old event
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
					saveFile(saveDir + '\\discover99.json', index, obj.events);
					console.log('crawl finished');
					return;
				} else {
					setTimeout(function() {
						makeSecondRequest(obj.events[nextIndex], nextIndex);
					}, 10000);
				}

				var $ = cheerio.load(body);
				if ($('#event_tabs').length) {
					var eventHTML = $('#event_tabs');
					summaryNodes = $('#event_tabs').find('.detail-page-description .field-item').children()[0];

					if ($('.poi-map__address').length) {
						obj.events[index].address = $('.poi-map__address').html().replace('<br>', ' ').trim();
					} else if ($('.poi-map__image').length) {
						var address = $('.poi-map__image').find('img').attr('src').split('%7C')[1].replace(/,|\\/g, '');
						address.replace(/(\r\n|\n|\r)/gm, '');
						obj.events[index].address = address;
					}


					obj.events[index].date = $(eventHTML).find('.detail-page-date-time .date').text();
					var type = $(eventHTML).find('.detail-page-breadcrumb')[0].childNodes[2].data;
					obj.events[index].type = type.replace('/', '').trim();
					obj.events[index].filterType = getFilterOption(type.replace('/', '').trim());

					var summary = $(summaryNodes).text();
					if (summary.indexOf('function') != -1)
						// parse if start end with /* */
						console.log(summary);
					obj.events[index].summary = summary;
				} else
					return;
				// handle responses that aren't on correct page

				console.log('\r\n' + index + '\r\n');
				console.log(obj.events[index]);
				console.log('\r\n\r\n');

				if (index % saveIndex === 0 && index != 0) {
					saveFile(saveDir + '\\discover' + startIndex + '-' + index + '.json', index, obj.events);
				} else if (index == obj.events.length) {
					saveFile(saveDir + '\\discover100.json', index, obj.events);
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

function generateURLlist() {
	for (var i = dateData.currentDay; i < dateData.numOfDays; i++) {
		if (dateData.currentMonth.toString().length == 1)
			dateData.currentMonth = '0' + dateData.currentMonth;
		var dynamicURL = startURL + dateData.currentMonth + '/' + i + '/' + dateData.year;
		URLlist.push(dynamicURL);
	}
}
