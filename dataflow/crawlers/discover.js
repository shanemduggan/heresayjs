// "http://www.discoverlosangeles.com/what-to-do/events?when[value][date]=02/25/2017";

var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('fs');
var $ = require("jquery");
var moment = require('moment');
require('../utils.js')();
require('../logUtils.js')();

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

log('discover crawl for ' + monthName + ' starting...', 'info');
generateURLlist();
createFolder(monthName);
firstRequest(URLlist[startIndex], startIndex);

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
						log('discover - parent crawl complete', 'info');
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
			log('discover error - error', 'info');
			var nextNum = index + 1;
			setTimeout(function() {
				firstRequest(URLlist[nextNum], nextNum);
			}, 10000);
			return;
		}
	});
}

//var obj = fs.readFileSync(saveDir + '\\discoverParentData.json', 'utf8');
//obj = JSON.parse(obj);
//makeSecondRequest(obj.events[0], 0);

// start at 500
// cut out first 500 when saving
// cut out any after current index

function makeSecondRequest(event, index) {
	var url = event.detailPage;
	var eventDate = event.date;
	if (url == undefined || parseInt(eventDate.split(' ')[1]) < dateData.currentDay) {
		// want to remove event from array if url is undefined or old event
		var nextIndex = index + 1;
		setTimeout(function() {
			makeSecondRequest(obj.events[nextIndex], nextIndex);
			//}, 10000);
		}, 1000);
		return;
	}

	console.log('crawling event details for ' + url + '\r\n');

	request(url, function(error, response, body) {
		if (response) {
			if (response.statusCode == 200) {

				var nextIndex = index + 1;
				if (nextIndex == Math.ceil(obj.events.length * .999)) {
					var saveData = getSaveData(index);
					saveFile(saveDir + '\\discover99.json', index, saveData.events);
					//saveFile(saveDir + '\\discover99.json', index, obj.events);
					log('discover - child crawl completed', 'info');
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
					var saveData = getSaveData(index);
					log('discover - saving children ' + startIndex + ' - ' + index, 'info');
					saveFile(saveDir + '\\discover' + startIndex + '-' + index + '.json', index, saveData.events);
					//saveFile(saveDir + '\\discover' + startIndex + '-' + index + '.json', index, obj.events);
				} else if (index == obj.events.length) {
					var saveData = getSaveData(index);
					saveFile(saveDir + '\\discover100.json', index, saveData.events);
					//saveFile(saveDir + '\\discover100.json', index, obj.events);
				}
				// detect this at beginning. should consoludate into one
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
	
	// handle logging objects
	log('discover crawl URLS:', 'info');
	log(URLlist, 'info');
}

function getSaveData(index) {
	var saveData = jQuery.extend({}, obj);
	if (startIndex == 0) {
		//split from index to end
		saveData.events.splice(index, saveData.events.length);
	} else {
		// split from 0 to start index
		saveData.events.splice(0, startIndex);
		saveData.events.splice(index, saveData.events.length);
		// split from index to end
	}

	console.log(saveData);
	console.log(saveData.events.length);
	return saveData;
}
