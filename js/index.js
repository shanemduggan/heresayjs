var map;
var markers = [];
var undefinedLocationAddress = 0;

$(document).ready(function() {
	var jsonFiles = ['timeout.json', 'discover.json', 'laweekly.json'];

	setUpButtons();
	sortFunctions();
	initMap();

	for (var i = 0; i < jsonFiles.length; i++) {
		getJson(jsonFiles[i]);
	}
	afterDataLoaded();
});

function afterDataLoaded() {
	$('#user-data').append('<ul id="user-data-list"></ul>');

	var options = $('#selectDate option')[2].text;
	setTimeout(function() {
		$("#selectDate").val('2').trigger('change'); 
	}, 500);	
}

function getJson(fileDir) {
	var showData = $('#show-data');
	var fullDir = 'crawldata/march/' + fileDir;
	$.getJSON(fullDir, function(data) {
		var filteredData = [];

		if (data.length) {
			for (var i = 0; i < data.length; i++) {
				filteredData.push(data[i]);
			}
		} else {
			for (var i = 0; i < data.events.length; i++) {
				if (data.events[i].date) {
					if (!data.events[i].date.includes('Until'))
						filteredData.push(data.events[i]);
				}
			}
		}

		for (var i = 0; i < filteredData.length; i++) {
			var item = filteredData[i];
			var nameSplit = filteredData[i].name.split(' ');
			if (nameSplit[0] == nameSplit[0].toUpperCase()) {
				var newName = toTitleCase(filteredData[i].name);
				filteredData[i].name = newName;
			}

			if (item.date.includes(' - ')) {
				var dateSplit = item.date.split(' - ');
				filteredData[i].dateFirst = dateSplit[0];
			} else if (item.date.includes('-')) {
				var dateSplit = item.date.split('-');
				filteredData[i].dateFirst = dateSplit[0];
			}

			if (item.dateFirst) {
				var index = item.dateFirst.indexOf('February');
				var date = item.dateFirst.slice(index, item.dateFirst.length);
				var dateSplit = item.dateFirst.split(' ');
			} else {
				var index = item.date.indexOf('February');
				var date = item.date.slice(index, item.date.length);
				var dateSplit = item.date.split(' ');
			}

			if (dateSplit.length == 4) {
				if (dateSplit[2].length == 1) {
					var num = '0' + dateSplit[2];
					var numDate = '02' + num + '2017';
				} else if (dateSplit[2].length == 2) {
					var numDate = '02' + dateSplit[2] + '2017';
				}
			} else if (dateSplit.length == 2) {
				if (dateSplit[1].length == 1) {
					var num = '0' + dateSplit[1];
					var numDate = '02' + num + '2017';
				} else if (dateSplit[1].length == 2) {
					var numDate = '02' + dateSplit[1] + '2017';
				}
			}

			filteredData[i].dateFormed = numDate;

			// var locationPiece = '';
			// var namePiece = '<span class="itemHeader" id="' +
			//item.name + '"><b>' + item.name + '</b>';
			// var datePiece = '';
			var summaryPiece = '';

			if (filteredData[i].summary != "")
				summaryPiece = '<br>' + item.summary + '<br><br>';

			if (item.locationAddress) {
				locationAddress = item.locationAddress;
				//addMarkerOnLoad(item);
				if (item.locationAddress == undefined) {
					//console.log(item);
				}

			} else
				locationAddress = '';

			if (item.type) {
				//console.log(item.date);
				//console.log(item.type);
				var trimmed = item.type.replace(/\//g, '').trim();
				var type = getFilterOption(trimmed);
				if (type == undefined)
					item.type = "Miscellaneous";
				//console.log(type);
				item.type = type;
			} else
				item.type = '';

			if (locationAddress == '') {
				//console.log(item);
				undefinedLocationAddress += 1;
				//console.log(undefinedLocationAddress);
			}

			if (filteredData[i].location == "") {
				filteredData[i].element = '<span class="itemHeader" data-type="' + item.type + '" id="' + item.name + '"><b>' + item.name + '</b>' + ' (<span class="date" id="' + numDate + '">' + item.date + ') ' + '</span></span>' + summaryPiece;
			} else {
				filteredData[i].element = '<span class="itemHeader" data-type="' + item.type + '" id="' + item.name + '"><b>' + item.name + '</b>' + ' (<a target="_blank" id="' + locationAddress + '" href="' + item.locationLink + '">' + item.location + '</a>; <span class="date" id="' + numDate + '">' + item.date + ') ' + '</span></span>' + summaryPiece;
			}
		}

		if (filteredData.length) {
			for (var i = 0; i < filteredData.length; i++) {
				var potentialParent = $('#show-data').find("ul#" + filteredData[i].dateFormed);
				if (potentialParent.length) {
					potentialParent.append('<li>' + filteredData[i].element + '</li>')
				} else {
					if (filteredData[i].dateFirst)
						$('#show-data').append('<div class="show-data-box" id="' + filteredData[i].dateFormed + '"><div><h3>' + filteredData[i].dateFirst + '</h3><ul id="' + filteredData[i].dateFormed + '"><li>' + filteredData[i].element + '</li></ul></div></div>').trigger("app-appened");
					else
						$('#show-data').append('<div class="show-data-box" id="' + filteredData[i].dateFormed + '"><div><h3>' + filteredData[i].date + '</h3><ul id="' + filteredData[i].dateFormed + '"><li>' + filteredData[i].element + '</li></ul></div></div>').trigger("app-appened");
				}
			}
		}
	});
}

function getFilterOption(type) {
	switch (type) {
	case type.includes('Theatre'):
		return "Art & Theatre";
		break;
	case type.includes('Gallery'):
		return "Art Gallery & Museum";
		break;
	case "Museums & Galleries":
		return "Art Gallery & Museum";
		break;
	case "Sports":
		return "Sports";
		break;
	case "Festivals":
		return "Festivals";
		break;
	case "Art & Theatre" || "Arts & Theatre":
		return "Art & Theatre";
		break;
	case "Miscellaneous":
		return "Miscellaneous";
		break;
	case "Music":
		return "Music";
		break;
	case "Educational":
		return "Educational";
		break;
	// default:
	// return "Miscellaneous";
	}
}