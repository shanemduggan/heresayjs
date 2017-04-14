var map;
var markers = [];
var undefinedLocationAddress = 0;
var types = [];
var eventData = [];
var locationData = [];

$(document).ready(function() {
	//var jsonFiles = ['timeout.json', 'discover.json', 'laweekly.json'];

	setUpButtons();
	sortFunctions();
	initMap();

	// for (var i = 0; i < jsonFiles.length; i++) {
	// getJson(jsonFiles[i]);
	// }

	getJson('../../crawldata/april/aprilLocationsAllData.json', '../../locationdata/aprilLocationsGeo.json');
	afterDataLoaded();
});

function afterDataLoaded() {
	$('#user-data').append('<ul id="user-data-list"></ul>');

	var options = $('#selectDate option');
	if (options.length > 2)
		var options = $('#selectDate option')[2].text;
	else
		var options = $('#selectDate option')[1].text;
	setTimeout(function() {
		$("#selectDate").val('2').trigger('change');
	}, 1000);
}

function getJson(eventdir, locationdir) {
	var showData = $('#show-data');
	//var fullDir = 'crawldata/march/' + fileDir;
	//$.getJSON(fullDir, function(data) {
	$.getJSON(eventdir, function(data) {
		var filteredData = [];

		if (data.length) {
			//console.log(data);
			//eventData = data;

			for (var i = 0; i < data.length; i++) {
				//filteredData.push(data[i]);

				if (data[i].date.indexOf('-') != -1) {
					data[i].date = data[i].date.split('-')[0];
				}

				if (parseInt(data[i].date.match(/\d+/)) >= new Date().getDate())
					eventData.push(data[i]);

				// if dash in date, get first num
			}

			//console.log(eventData);
		}
		//else {
		// for (var i = 0; i < data.events.length; i++) {
		// if (data.events[i].date) {
		// if (!data.events[i].date.includes('Until'))
		// filteredData.push(data.events[i]);
		// }
		// }
		// }

		// for (var i = 0; i < filteredData.length; i++) {
		// var item = filteredData[i];
		// var nameSplit = filteredData[i].name.split(' ');
		// if (nameSplit[0] == nameSplit[0].toUpperCase()) {
		// var newName = toTitleCase(filteredData[i].name);
		// filteredData[i].name = newName;
		// }
		//
		// if (item.date.includes(' - ')) {
		// var dateSplit = item.date.split(' - ');
		// filteredData[i].dateFirst = dateSplit[0];
		// } else if (item.date.includes('-')) {
		// var dateSplit = item.date.split('-');
		// filteredData[i].dateFirst = dateSplit[0];
		// }
		//
		// if (item.dateFirst) {
		// var index = item.dateFirst.indexOf('February');
		// var date = item.dateFirst.slice(index, item.dateFirst.length);
		// var dateSplit = item.dateFirst.split(' ');
		// } else {
		// var index = item.date.indexOf('February');
		// var date = item.date.slice(index, item.date.length);
		// var dateSplit = item.date.split(' ');
		// }
		//
		// var monthNum = getMonth();
		// if (dateSplit.length == 4) {
		// if (dateSplit[2].length == 1) {
		// var num = '0' + dateSplit[2];
		// var numDate = '0' + monthNum + num + '2017';
		// } else if (dateSplit[2].length == 2) {
		// var numDate = '0' + monthNum + dateSplit[2] + '2017';
		// }
		// } else if (dateSplit.length == 2) {
		// if (dateSplit[1].length == 1) {
		// var num = '0' + dateSplit[1];
		// var numDate = '0' + monthNum + num + '2017';
		// } else if (dateSplit[1].length == 2) {
		// var numDate = '0' + monthNum + dateSplit[1] + '2017';
		// }
		// }
		//
		// filteredData[i].dateFormed = numDate;
		//
		// // var locationPiece = '';
		// // var namePiece = '<span class="itemHeader" id="' +
		// //item.name + '"><b>' + item.name + '</b>';
		// // var datePiece = '';
		// var summaryPiece = '';
		//
		// if (filteredData[i].summary != "")
		// summaryPiece = '<br>' + item.summary + '<br><br>';
		//
		// if (item.locationAddress) {
		// locationAddress = item.locationAddress;
		// //addMarkerOnLoad(item);
		// if (item.locationAddress == undefined) {
		// //console.log(item);
		// }
		//
		// } else
		// locationAddress = '';
		//
		// if (item.type) {
		// //console.log(item.date);
		// //console.log(item.type);
		// var trimmed = item.type.replace(/\//g, '').trim();
		// var type = getFilterOption(trimmed);
		// if (type == undefined)
		// item.type = "Miscellaneous";
		// //console.log(type);
		// item.type = type;
		// } else
		// item.type = '';
		//
		// if (locationAddress == '') {
		// //console.log(item);
		// undefinedLocationAddress += 1;
		// //console.log(undefinedLocationAddress);
		// }
		//
		// var link = '';
		// if (item.eventDetail)
		// link = item.eventDetail;
		// else if (item.locationLink)
		// link = item.locationLink;
		// else if (item.detailPage)
		// link = item.detailPage
		//
		// if (filteredData[i].location == "") {
		// filteredData[i].element = '<span class="itemHeader" data-index="' + i + '" data-link="' + link + '" data-type="' + item.type + '" id="' + item.name + '"><b>' + item.name + '</b>' + ' (<span class="date" id="' + numDate + '">' + item.date + ') ' + '</span></span>' + summaryPiece;
		// } else {
		// filteredData[i].element = '<span class="itemHeader" data-index="' + i + '" data-link="' + link + '" data-type="' + item.type + '" id="' + item.name + '"><b>' + item.name + '</b>' + ' (<a target="_blank" id="' + locationAddress + '" href="' + item.locationLink + '">' + item.location + '</a>; <span class="date" id="' + numDate + '">' + item.date + ') ' + '</span></span>' + summaryPiece;
		// }
		// }

		// if (filteredData.length) {
		// for (var i = 0; i < filteredData.length; i++) {
		// var potentialParent = $('#show-data').find("ul#" + filteredData[i].dateFormed);
		// if (potentialParent.length) {
		// potentialParent.append('<li>' + filteredData[i].element + '</li>')
		// } else {
		// if (filteredData[i].dateFirst)
		// $('#show-data').append('<div class="show-data-box" id="' + filteredData[i].dateFormed + '"><div><h3>' + filteredData[i].dateFirst + '</h3><ul id="' + filteredData[i].dateFormed + '"><li>' + filteredData[i].element + '</li></ul></div></div>').trigger("app-appened");
		// else
		// $('#show-data').append('<div class="show-data-box" id="' + filteredData[i].dateFormed + '"><div><h3>' + filteredData[i].date + '</h3><ul id="' + filteredData[i].dateFormed + '"><li>' + filteredData[i].element + '</li></ul></div></div>').trigger("app-appened");
		// }
		// }
		// }
	});
	
	$.getJSON(locationdir, function(data) {
		if (data.length) {
			console.log('# of locations: ' + data.length);
			locationData = data;

			// for (var i = 0; i < data.length; i++) {
// 
				// if (data[i].date.indexOf('-') != -1) {
					// data[i].date = data[i].date.split('-')[0];
				// }
// 
				// if (parseInt(data[i].date.match(/\d+/)) >= new Date().getDate())
					// eventData.push(data[i]);
// 
			// }

			//console.log(locationData);
		}
	});
}




function getFilterOption(type) {
	if ($.inArray(type, types) == -1) {
		types.push(type);
	}

	var miscKeyWords = ['Miscellaneous', 'Other', 'Shopping', 'Community', 'Promotional', 'Activism', 'Spirituality', 'Religion', 'World', 'Competitions', 'Recreation', 'Games'];
	var artKeyWords = ['Theatre', 'Theater', 'theater', 'Gallery', 'Galleries', 'Museum', 'Museums', 'Art', 'Arts'];
	var sportsKeyWords = ['Sports', 'Basketball', 'Baseball', 'Hockey'];
	var musicKeyWords = ['Music', 'Alternative', 'Rock', 'DJ', 'EDM', 'House', 'Country', 'Classical', 'Jazz', 'Funk', 'Punk', 'Latin', 'Rap', 'Pop'];

	// art is too large of a category
	// pull out theater; split museums/galleries from art

	if (type == "")
		return "Miscellaneous";
	var misc = _.filter(miscKeyWords, function(s) {
		return type.indexOf(s) != -1;
	});
	if (misc.length)
		return "Miscellanous";

	var art = _.filter(artKeyWords, function(s) {
		return type.indexOf(s) != -1;
	});
	if (art.length)
		return "Art";

	var sports = _.filter(sportsKeyWords, function(s) {
		return type.indexOf(s) != -1;
	});
	if (sports.length)
		return "Sports";

	var music = _.filter(musicKeyWords, function(s) {
		return type.indexOf(s) != -1;
	});
	if (music.length)
		return "Music";

	if (type.indexOf('Dance') != -1 || type.indexOf('Burlesque') != -1 || type.indexOf('Cabaret') != -1)
		return "Dance";
	if (type.indexOf('Holiday') != -1 || type.indexOf('Christmas') != -1 || type.indexOf("New Year's") != -1)
		return "Holidays";
	if (type.indexOf('Film, TV & Radio') != -1 || type.indexOf('film') != -1 || type.indexOf('Film') != -1)
		return "Film & TV";
	if (type.indexOf('Outdoors') != -1)
		return "Outdoors";
	if (type.indexOf('Family') != -1)
		return "Family";
	if (type.indexOf('MuseumsZoosAquariums') != -1)
		return "Nature";
	if (type.indexOf('Food & Drink') != -1)
		return "Food & Drink";
	if (type.indexOf('Comedy') != -1)
		return "Comedy";
	if (type.indexOf('Health') != -1)
		return "Health";
	if (type.indexOf('Festivals') != -1)
		return "Festivals";
	if (type.indexOf('Educational') != -1)
		return "Educational";
	else
		return "Miscellaneous";
}
