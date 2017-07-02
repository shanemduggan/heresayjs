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
//var num = 0;
var saveIndex = 150;
var startIndex = 0;

var startURL = "http://www.discoverlosangeles.com/what-to-do/events?when[value][date]=";
var saveDir = '..\\..\\data\\crawldata\\' + monthName;

var URLlist = [];
var events = [];

log('discover crawl for ' + monthName + ' starting...', 'info');
generateURLlist();
createFolder(monthName);
firstRequest(URLlist[startIndex], startIndex);

function firstRequest(url, index) {
	if (url == undefined)
		return;

	//num++;
	logNumOfEvents(events.length);
	log('crawling ' + url, 'info');

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

						events.push({
							name : nameText,
							summary : summaryText,
							locationName : locationText,
							detailPage : eventDetailLink,
							date : parentDate
						});
					});

					console.log(events);
					saveFile(saveDir + '\\discoverParentData.json', events.length, events);

					var nextNum = index + 1;
					if (nextNum == URLlist.length) {
						log('discover - parent crawl completed. found ' + events.length + ' events', 'info');
						makeSecondRequest(events[0], 0);
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

//var events = fs.readFileSync(saveDir + '\\discoverParentData.json', 'utf8');
//events = JSON.parse(events);
//makeSecondRequest(events[startIndex], startIndex);

function makeSecondRequest(event, index) {
	var url = event.detailPage;
	var eventDate = event.date;
	if (url == undefined || parseInt(eventDate.split(' ')[1]) < dateData.currentDay) {
		// ignore old events or ones that have no url
		var nextIndex = index + 1;
		setTimeout(function() {
			makeSecondRequest(events[nextIndex], nextIndex);
			//}, 10000);
		}, 1000);
		return;
	}

	console.log('crawling event details for ' + url + '\r\n');
	request(url, function(error, response, body) {
		if (response) {
			if (response.statusCode == 200) {

				var nextIndex = index + 1;
				if (nextIndex == Math.ceil(events.length * .999)) {
					var saveData = getSaveData(index);
					saveFile(saveDir + '\\discover99.json', saveData.length, saveData);
					log('discover - child crawl completed', 'info');
					return;
				} else {
					setTimeout(function() {
						makeSecondRequest(events[nextIndex], nextIndex);
					}, 10000);
				}

				var $ = cheerio.load(body);
				if ($('#event_tabs').length) {
					var eventHTML = $('#event_tabs');
					summaryNodes = $('#event_tabs').find('.detail-page-description .field-item').children()[0];

					if ($('.poi-map__address').length) {
						events[index].address = $('.poi-map__address').html().replace('<br>', ' ').trim();
					} else if ($('.poi-map__image').length) {
						var address = $('.poi-map__image').find('img').attr('src').split('%7C')[1].replace(/,|\\/g, '');
						address.replace(/(\r\n|\n|\r)/gm, '');
						events[index].address = address;
					}

					events[index].date = $(eventHTML).find('.detail-page-date-time .date').text();
					var type = $(eventHTML).find('.detail-page-breadcrumb')[0].childNodes[2].data;
					events[index].type = type.replace('/', '').trim();
					events[index].filterType = getFilterOption(type.replace('/', '').trim());
					events[index].price = $('.detail-page-price').text();

					var summary = $(summaryNodes).text();
					if (summary.indexOf('function') != -1)
						// parse if start end with /* */
						console.log(summary);
					events[index].summary = summary;
				} else
					return;
				// handle responses that aren't on correct page

				console.log('\r\n' + index + '\r\n');
				console.log(events[index]);
				console.log('\r\n\r\n');

				if (index % saveIndex === 0 && index != 0) {
					var saveData = getSaveData(index);
					log('discover - saving children ' + startIndex + ' - ' + index, 'info');
					saveFile(saveDir + '\\discover' + startIndex + '-' + index + '.json', saveData.length, saveData);
				} else if (index == events.length) {
					var saveData = getSaveData(index);
					log('discover - child crawl complete. saving ' + saveData.length + ' events', 'info');
					saveFile(saveDir + '\\discover100.json', saveData.length, saveData);
				}
				// detecting above at beginning. should consoludate into one
			} else {
				var nextIndex = index + 1;
				setTimeout(function() {
					makeSecondRequest(events[nextIndex], nextIndex);
				}, 10000);
				return;
			}
		} else {
			var nextIndex = index + 1;
			setTimeout(function() {
				makeSecondRequest(events[nextIndex], nextIndex);
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
