// required node modules
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('fs');
var $ = require("jquery");
var moment = require('moment');

// find in dataflow
require('../utils.js')();

var startURL = "http://www.discoverlosangeles.com/what-to-do/events?when[value][date]=02/25/2017";

// store data in global object
var obj = {
	events : []
};

// get date info from utilities
var dateData = getDateData();
var monthName = dateData.monthName;
var searchWord = dateData.monthName;
var num = 0;
var saveIndex = 150;

console.log("starting crawl for " + monthName);
// create folder to save file in
createFolder(monthName);

// initial request
firstRequest(URLlist[0], 0);

function firstRequest(url, index) {
	if (url == undefined)
		return;

	num++;
	request(url, function(error, response, body) {
		if (response) {
			if (response.statusCode == 200) {
				console.log(url);

				var nextNum = index + 1;
				setTimeout(function() {
					firstRequest(URLlist[nextNum], nextNum);
				}, 10000);

				// need to find date on page to find parent element
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

				// once parent is found, loop through children to get event name & page link
				if (dayElement) {
					var content = $(dayElement).parent().next().children()[0];
					var children = $(content).children('.views-row');

					$(children).each(function(index) {
						var nameText = $(this).find("h2").text().trim();
						var eventDetailLink = $(this).find("h2").children().attr("href");
						eventDetailLink = 'http://www.discoverlosangeles.com' + eventDetailLink;

						obj.events.push({
							name : nameText,
							detailPage : eventDetailLink,
						});
					});

					// save data after looping through children
					var json = JSON.stringify(obj);
					var length = obj.events.length;
					fs.writeFile('data\\' + monthName + '\\discoverParentData.json', json, 'utf8', function(err) {
						console.log("File saved with " + length + ' entries');
					});

					var nextNum = index + 1;
					if (nextNum == URLlist.length) {
						// once parent crawl is finished, start child crawl
						console.log('first request completed');
						makeSecondRequest(obj.events[0], 0);
					}
				}
			} else {
				// callback for bad status code
				var nextNum = index + 1;
				setTimeout(function() {
					firstRequest(URLlist[nextNum], nextNum);
				}, 10000);
				return;
			}
		} else {
			// callback if no response
			var nextNum = index + 1;
			setTimeout(function() {
				firstRequest(URLlist[nextNum], nextNum);
			}, 10000);
			return;
		}
	});
}

function makeSecondRequest(event, index) {
	var url = event.detailPage;
	var eventDate = event.date;
	if (url == undefined) {
		// if url is undefined, make next request
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
				// at end of events, save file
				if (nextIndex == Math.ceil(obj.events.length * .999)) {
					saveFile('data\\' + monthName + '\\discover99.json', index);
					console.log('crawl finished');
					return;
				} else {
					// make next request
					setTimeout(function() {
						makeSecondRequest(obj.events[nextIndex], nextIndex);
					}, 10000);
				}

				var $ = cheerio.load(body);
				// get container for event details
				if ($('#event_tabs').length) {
					var eventHTML = $('#event_tabs');
					var summaryNodes = $('#event_tabs').find('.detail-page-description .field-item').children()[0];
					var summary = $(summaryNodes).text();
					var type = $(eventHTML).find('.detail-page-breadcrumb')[0].childNodes[2].data;

					// get address
					if ($('.poi-map__address').length) {
						obj.events[index].address = $('.poi-map__address').html().replace('<br>', ' ').trim();
					} else if ($('.poi-map__image').length) {
						var address = $('.poi-map__image').find('img').attr('src').split('%7C')[1].replace(/,|\\/g, '');
						address.replace(/(\r\n|\n|\r)/gm, '');
						obj.events[index].address = address;
					}

					// push up additional data to event object
					obj.events[index].date = $(eventHTML).find('.detail-page-date-time .date').text();		
					obj.events[index].type = type.replace('/', '').trim();		
					obj.events[index].summary = summary;
					
				} else
					return;
				// handle responses that aren't on correct page

				// save data at pre-defined interval
				if (index % saveIndex === 0 && index != 0) {
					var percent = index / saveIndex;
					saveFile('data\\' + monthName + '\\discover' + percent + '.json', index);
				} else if (index == obj.events.length) {
					saveFile('data\\' + monthName + '\\discover100.json', index);
				}
			} else {
				// callback for bad status code
				var nextIndex = index + 1;
				setTimeout(function() {
					makeSecondRequest(obj.events[nextIndex], nextIndex);
				}, 10000);
				return;
			}
		} else {
			// callback if no response
			var nextIndex = index + 1;
			setTimeout(function() {
				makeSecondRequest(obj.events[nextIndex], nextIndex);
			}, 10000);
			return;
		}
	});
}