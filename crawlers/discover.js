// "http://www.discoverlosangeles.com/what-to-do/events?when[value][date]=02/25/2017";

var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('fs');
var $ = require("jquery");
var moment = require('moment');

var startURL = "http://www.discoverlosangeles.com/what-to-do/events?when[value][date]=";
var searchWord = "April";
var currentDay = new Date().getDate();
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
	var dynamicURL = startURL + currentMonth + '/' + i + '/' + year;
	URLlist.push(dynamicURL);
}

var num = 0;
var saveIndex = 150;

//firstRequest(URLlist[0], 0);

function firstRequest(url, index) {
	if (url == undefined)
		return;

	var length = obj.events.length;
	if (length >= 3000)
		console.log('reached 3000 entries');
	if (length >= 5000)
		console.log('reached 5000 entries');
	if (length >= 7000)
		console.log('reached 7000 entries');
	length = 0;

	num++

	request(url, function(error, response, body) {
		if (response) {
			if (response.statusCode == 200) {
				console.log(url);

				var nextNum = index + 1;
				setTimeout(function() {
					firstRequest(URLlist[nextNum], nextNum);
				}, 10000);

				var urlSplit = url.split('=');
				var dateSplit = urlSplit[1].split('/')
				var monthNum = dateSplit[0];
				var dayNum = dateSplit[1];
				var formattedMonth = moment(monthNum, 'MM').format('MMMM');
				var monthText = formattedMonth + ' ' + dayNum;

				var $ = cheerio.load(body);
				var isWordFound = searchForWord($, searchWord);
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
					var parentDate = $('.field-content:contains("' + searchWord + ' ' + linkDate + '")').text().split(', ')[1];

					$(children).each(function(index) {
						var nameText = $(this).find("h2").text().trim();
						var summaryText = '';
						var locationText = $(this).find('.field-name-field-event-venue').children().children().text().trim();
						var eventDetailLink = $(this).find("h2").children().attr("href");
						eventDetailLink = 'http://www.discoverlosangeles.com' + eventDetailLink;

						allEventNames.push(nameText);

						obj.events.push({
							name : nameText,
							summary : summaryText,
							locationName : locationText,
							detailPage : eventDetailLink,
							date : parentDate
						});
					});

					console.log(obj);

					var json = JSON.stringify(obj);
					var length = obj.events.length;
					fs.writeFile('data\\april\\discoverParentData.json', json, 'utf8', function(err) {
						console.log("File saved with " + length + ' entries');
					});

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

function searchForWord($, word) {
	var bodyText = $('html > body').text().toLowerCase();
	return (bodyText.indexOf(word.toLowerCase()) !== -1);
}

var obj = fs.readFileSync('data\\april\\discoverParentData.json', 'utf8');
obj = JSON.parse(obj);
makeSecondRequest(obj.events[0], 0);

function makeSecondRequest(event, index) {
	var url = event.detailPage;
	var eventDate = event.date
	if (url == undefined || parseInt(eventDate.split(' ')[1]) < currentDay) {
		// want to remove event from array if url is undefined or old event
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
					saveFile('data\\april\\discover99.json', index);
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
					
					var summary = $(summaryNodes).text();
					if (summary.indexOf('function') != -1)
						// start end with /* */
						console.log(summary);
					obj.events[index].summary = summary; 
				} else
					return;
				// this is handling responses that aren't on correct page

				console.log('\r\n');
				console.log(index);
				console.log('\r\n');
				console.log(obj.events[index]);
				console.log('\r\n');
				console.log('\r\n');

				if (index % saveIndex === 0 && index != 0) {
					var percent = index / saveIndex;
					saveFile('data\\april\\discover' + percent + '.json', index);
				} else if (index == obj.events.length) {
					saveFile('data\\april\\discover100.json', index);
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
		console.log(obj.events.length - length + 'events to go');
		return;
	});
}
