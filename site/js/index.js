var map;
//var personalMap;
var markers = [];
var undefinedLocationAddress = 0;
var types = [];
var eventData = [];
var locationData = [];
var infoWindowOpen = 0;
var openInfoWindows = [];

// cached data
var cachedDateEvents = [];
var cachedTypeEvents = [];

// filtered data
var dateEvents = [];
var typeEvents = [];

// multi filtered data
var dateTypeEvents = [];
var typeDateEvents = [];

// previous value pre filter change
var prevDateFilter;

$(window).on('load', function() {
	getJson('../../crawldata/april/aprilLocationsAllData.json', '../../locationdata/aprilLocationsGeo.json');
	setUpFilters();
});

function getJson(eventdir, locationdir) {
	$.getJSON(locationdir, function(data) {
		if (data.length) {
			console.log('# of locations: ' + data.length);
			locationData = data;
		}
	});

	$.getJSON(eventdir, function(data) {
		var filteredData = [];

		if (data.length) {
			for (var i = 0; i < data.length; i++) {
				if (data[i].date.indexOf('-') != -1) {
					data[i].date = data[i].date.split('-')[0];
				}

				if (parseInt(data[i].date.match(/\d+/)) >= new Date().getDate())
					eventData.push(data[i]);
			}
		}
		initMap();
		afterDataLoaded();
	});
}

function afterDataLoaded() {
	var browserWidth = $('html').width();
	var browserHeight = $('html').height();
	var headerHeight = Math.ceil(browserHeight * .07);
	var mapHeight = Math.ceil(browserHeight * .93);

	$('#header').height(headerHeight);
	$('#dateFilter').height(headerHeight);
	$('#dateFilter select').height(headerHeight - 2);
	$('#typeFilter').height(headerHeight);
	$('#typeFilter select').height(headerHeight - 2);

	$('#map_canvas').height(mapHeight);
	$('#sidebar').height(mapHeight);
	$('#gutter').height(mapHeight);

	$("#selectDate").val('1').trigger('change');
	$("#selectType").val('2').trigger('change');

	$("#gutter").click(function() {
		var sideBarWidth = $('#sidebar').width();
		var sideBarPercent = Math.ceil((sideBarWidth / browserWidth) * 100);
		if (sideBarPercent == 40) {
			smallSidebar();
		} else {
			largeSidebar();

		}
	});

	$('.close').click(function() {
		$('.pop').hide();
		$('#popName').html('');
		$('#popDateType').html('');
		return false;
	});
}

function largeSidebar() {
	$('#map_canvas').css('width', '59.5%');
	//$('#map_canvas').css('width', '400px');
	$('#sidebar').css('width', '40%');
	$('#sidebar li').css('text-align', 'left');
	$('#sidebar li').css('padding-bottom', '0');
	$('#sidebar li').css('margin-bottom', '25px');
	$('#sidebar li').css('border-bottom', '1px solid black');
	$('.details').css('display', 'block');

	map = null;
	$('#map_canvas').empty();
	initMap();

	reAddMarkers();
}

function smallSidebar() {
	$('#map_canvas').css('width', '79.5%');
	$('#sidebar').css('width', '20%');
	$('#sidebar li').css('text-align', 'center');
	$('#sidebar li').css('padding-bottom', '7.5px');
	$('#sidebar li').css('margin-bottom', '0px');
	$('#sidebar li').css('border-bottom', 'none');
	$('.details').css('display', 'none');

	map = null;
	$('#map_canvas').empty();
	initMap();
	reAddMarkers();
}

function reAddMarkers() {
	console.log(markers);
	for (var key in markers) {
		if (!markers.hasOwnProperty(key))
			continue;
		(function(key) {
			var marker = markers[key];
			var myLatlng = new google.maps.LatLng(marker.__lat, marker.__lng);
			var marker = new google.maps.Marker({
				position : myLatlng,
				__name : marker.__name,
				__link : marker.__link,
				__loc : marker.__loc,
				__date : marker.__date,
				__type : marker.__type,
				__lng : marker.__lng,
				__lat : marker.__lat,
				map : map,
			});

			var contentString = "<html class='infoWindow'><body><div class='infoWindow' style='text-align: center'><p><h4><a target='_blank' href='" + marker.__link + "'>" + marker.__name + "</a></h4>" + marker.__loc + "<br>" + marker.__date + "</p></div></body></html>";
			var infowindow = new google.maps.InfoWindow({
				content : contentString
			});

			// marker.addListener('click', function() {
			// infowindow.open(map, this);
			// });
			//
			// marker.addListener('mouseover', function() {
			// infoWindowOpen++;
			// infowindow.open(map, this);
			// setTimeout(function() {
			// map.panTo(marker.position);
			// }, 150);
			// });
			//
			// marker.addListener('mouseout', function() {
			// openInfoWindows.push(infowindow);
			// setTimeout(function() {
			// if (!($('.infoWindow:hover').length > 0))
			// openInfoWindows[0].close();
			// openInfoWindows.shift();
			// }, 1500);
			// });
			//
			// google.maps.event.addListener(marker, 'click', function() {
			// window.open(this.__link, '_blank');
			// });

		})(key);
	}
}

function initMap() {
	var browserHeight = $('html').height();
	var mapHeight = Math.ceil(browserHeight * .90);
	$('#map_canvas').height(mapHeight);

	map = new google.maps.Map(document.getElementById('map_canvas'), {
		zoom : 11,
		center : {
			lat : 34.0416,
			lng : -118.328661
		},
		mapTypeControl : false
	});

	google.maps.event.addDomListener(window, "resize", function() {
		var center = map.getCenter();
		google.maps.event.trigger(map, "resize");
		map.setCenter(center);
	});

	google.maps.event.addListener(map, "click", function(event) {
		$('.pop').hide();
	});
}

function placeMarkers(events) {
	if (events.length)
		console.log('# of events pre-clean: ' + events.length);

	var events = _.uniq(events, 'name');
	if (events.length)
		console.log('# of unique events: ' + events.length);

	for (var i = 0; i < events.length; i++) {
		if (!events[i].lat)
			continue;

		(function(i) {
			var myLatlng = new google.maps.LatLng(events[i].lat, events[i].lng);
			var marker = new google.maps.Marker({
				position : myLatlng,
				__name : events[i].name,
				__link : events[i].detailPage,
				__loc : events[i].locationName,
				__date : events[i].date,
				__type : events[i].type,
				__lng : events[i].lng,
				__lat : events[i].lat,
				map : map,
				animation : google.maps.Animation.DROP
			});

			var contentString = "<html class='infoWindow'><body><div class='infoWindow' style='text-align: center'><p><h4><a target='_blank' href='" + events[i].detailPage + "'>" + events[i].name + "</a></h4>" + events[i].locationName + "<br>" + events[i].date + "</p></div></body></html>";
			var infowindow = new google.maps.InfoWindow({
				content : contentString
			});

			marker.addListener('click', function() {
				map.panTo(marker.position);
				showCard(this);
				toggleBounce(marker);
			});

			markers[events[i].name] = marker;
		})(i);
	}

	console.log('after creating markers we have: ' + Object.keys(markers).length, 'should have around: ' + events.length);
}

function toggleBounce(marker) {
	if (marker.getAnimation() !== null) {
		marker.setAnimation(null);
	} else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
	}

	setTimeout(function() {
		//map.panTo(marker.position);
		marker.setAnimation(null);
	}, 1500);

}

function clearMarkers() {
	if (!Object.keys(markers).length)
		return;

	for (var key in markers) {
		// skip loop if the property is from prototype
		if (!markers.hasOwnProperty(key))
			continue;
		markers[key].setMap(null);
	}
	markers = [];
}

function setUpFilters() {
	createDateFilterOptions();

	$('#typeFilter select').change(function(e) {
		cachedTypeEvents = [];
		dateTypeEvents = [];
		var typeIndex = $('#typeFilter select').val();
		var typeVal = $("#typeFilter select option[value='" + typeIndex + "']").text();
		var dateIndex = $('#dateFilter select').val();
		var dateVal = $("#dateFilter select option[value='" + dateIndex + "']").text();
		clearMarkers();
		returnMapState();

		// if type or date are not selected
		if (typeIndex == 0 && dateIndex == 0) {
			$('#sidebar ul').html('');
			$('#sidebar h3').remove();
			clearMarkers();
			return;
		}

		// if type is changed, date not selected
		if (typeIndex != 0 && dateIndex == 0) {
			for (var i = 0; i < eventData.length; i++) {
				if (eventData[i].type && typeVal == getFilterOption(eventData[i].type))
					// cache type filtered events for later use
					cachedTypeEvents.push(getLocation(eventData[i]));
			}
			updateSideBar(typeVal, cachedTypeEvents);
			placeMarkers(cachedTypeEvents);
		} else if (typeIndex != 0 && dateIndex != 0) {
			// if type is changed, date is selected
			// filter cached date events by type
			console.log(cachedDateEvents);
			for (var i = 0; i < cachedDateEvents.length; i++) {
				if (cachedDateEvents[i].type && typeVal == getFilterOption(cachedDateEvents[i].type))
					dateTypeEvents.push(cachedDateEvents[i]);
			}

			placeMarkers(dateTypeEvents);
			updateSideBar(typeVal + ' for ' + dateVal, dateTypeEvents);
		} else if (typeIndex == 0 && dateIndex != 0) {
			if (cachedDateEvents.length) {
				updateSideBar(dateVal, cachedDateEvents);
				placeMarkers(cachedDateEvents);
			} else {
				dateEvents = _.filter(eventData, function(e) {
					return e.date == dateVal;
				});

				if (dateEvents.length && locationData.length) {
					for (var i = 0; i < dateEvents.length; i++) {
						// cache date filtered events for later use
						cachedDateEvents.push(getLocation(dateEvents[i]));
					}
				}
				updateSideBar(dateVal, cachedDateEvents);
				placeMarkers(cachedDateEvents);
			}
		}
	});

	$('#dateFilter select').change(function(e) {
		cachedDateEvents = [];
		typeDateEvents = [];
		var dateIndex = $('#dateFilter select').val();
		var dateVal = $("#dateFilter select option[value='" + dateIndex + "']").text();
		var typeIndex = $('#typeFilter select').val();
		var typeVal = $("#typeFilter select option[value='" + typeIndex + "']").text();
		clearMarkers();
		returnMapState();

		// if date or type are not selected
		if (dateIndex == 0 && typeIndex == 0) {
			$('#sidebar ul').html('');
			$('#sidebar h3').remove();
			clearMarkers();
			return;
		}

		// if date is changed, type not selected
		if (dateIndex != 0 && typeIndex == 0) {
			dateEvents = _.filter(eventData, function(e) {
				return e.date == dateVal;
			});

			if (dateEvents.length && locationData.length) {
				for (var i = 0; i < dateEvents.length; i++) {
					// cache date filtered events for later use
					cachedDateEvents.push(getLocation(dateEvents[i]));
				}
			}

			updateSideBar(dateVal, cachedDateEvents);
			placeMarkers(cachedDateEvents);
		} else if (dateIndex != 0 && typeIndex != 0) {
			// filter cached type events by date
			console.log(cachedTypeEvents);

			typeDateEvents = _.filter(cachedTypeEvents, function(e) {
				return e.date == dateVal;
			});
			updateSideBar(typeVal + ' for ' + dateVal, typeDateEvents);
			placeMarkers(typeDateEvents);
		} else if (dateIndex == 0 && typeIndex != 0) {
			// if cachedTypeEvents is empty
			if (cachedTypeEvents.length) {
				placeMarkers(cachedTypeEvents);
				updateSideBar(typeVal, cachedTypeEvents);
			} else {
				for (var i = 0; i < eventData.length; i++) {
					if (eventData[i].type && typeVal == getFilterOption(eventData[i].type))
						// cache type filtered events for later use
						cachedTypeEvents.push(getLocation(eventData[i]));
				}
			}
			updateSideBar(typeVal, cachedTypeEvents);
			placeMarkers(cachedTypeEvents);
		}
	});
}

function updateSideBar(heading, sideBarEvents) {
	$('#sidebar ul').html('');
	$('#sidebar h3').remove();
	$('#sidebar').prepend('<h3>' + heading + '</h3>');
	sideBarEvents.forEach(function(e) {
		var liFound = $("#sidebar ul li:contains('" + e.name + "')");
		if (liFound.length)
			return;
		$('#sidebar ul').append('<li><span class="name">' + e.name + '</span><span class="details">' + e.locationName + '<br><span class="eventDate">' + e.date + '</span></span></li>');
	});

	$('#sidebar li').click(function() {
		showCard(this);
	});
}

function showCard(ele) {
	if (ele.__name) {
		var name = ele.__name;

		if (markers[name]) {
			$('.pop').show();
			$('#popName').append('<a target="_blank" href="' + markers[name].__link + '">' + name + '</a>');
			$('#popDateType').text(markers[name].__date + ' || ' + markers[name].__type);

			// $(".pop").mouseover(function() {
			// $(".pop").mouseout(function() {
			// $('.pop').hide();
			// });
			// });

		}

		// hover show pop up
		// if mouse over on pop up, show
		// if mouse out, hide after .5 sec

	} else {
		var name = $(ele).find(".name").text();
		if (markers[name]) {
			$('.pop').show();
			$('#popName').append('<a target="_blank" href="' + markers[name].__link + '">' + name + '</a>');
			$('#popDateType').text(markers[name].__date + ' || ' + markers[name].__type);
		}
	}

}

function createDateFilterOptions() {
	var monthDates = getDateFilterOptions();
	for (var i = 0; i < monthDates.length; i++) {
		$('#dateFilter select').append($('<option>', {
			value : i + 1,
			text : monthDates[i]
		}));
	}
}

function getLocation(event) {
	var locationFound = _.find(locationData, function(l) {
		return l.location === event.locationName;
	});

	if (locationFound) {
		event.formattedAddress = locationFound.formattedAddress;
		event.lat = locationFound.lat;
		event.lng = locationFound.lng;
	}
	return event;
}

function returnMapState() {
	var centerLoc = new window.google.maps.LatLng(34.0416, -118.328661);
	var centerMarker = new google.maps.Marker({
		position : centerLoc,
		map : map,
		animation : google.maps.Animation.DROP
	});

	map.panTo(centerMarker.position);
	map.setZoom(11);
	centerMarker.setMap(null);
}

function daysInMonth(month, year) {
	return new Date(year, month, 0).getDate();
}

function getDateFilterOptions() {
	var year = 2017;
	var currentMonth = new Date().getMonth() + 1;
	var currentDay = new Date().getDate();
	var daysInCurrentMonth = daysInMonth(currentMonth, year);
	var days = [];
	var monthsArray = [];

	monthsArray[0] = 'January';
	monthsArray[1] = 'February';
	monthsArray[2] = 'March';
	monthsArray[3] = 'April';
	monthsArray[4] = 'May';
	monthsArray[5] = 'June';
	monthsArray[6] = 'July';
	monthsArray[7] = 'August';
	monthsArray[8] = 'September';
	monthsArray[9] = 'October';
	monthsArray[10] = 'November';
	monthsArray[11] = 'December';

	var date = new Date();
	var monthName = monthsArray[date.getMonth()];

	for (var i = currentDay; i < daysInCurrentMonth + 1; i++) {
		days.push(monthName + ' ' + i);
	}

	return days;
}

function checkDate() {
	var date = new Date();
	var utcDate = new Date(date.toUTCString());
	utcDate.setHours(utcDate.getHours() - 8);
	var usDate = new Date(utcDate);
	var month = usDate.getUTCMonth() + 1;
	month = month.toString();
	if (month.length == 1)
		month = '0' + month;
	var day = usDate.getUTCDate().toString();
	var year = usDate.getUTCFullYear().toString();
	var newdate = month + day + year;
	return newdate;
}

function getMonth() {
	var date = new Date();
	var utcDate = new Date(date.toUTCString());
	utcDate.setHours(utcDate.getHours() - 8);
	var usDate = new Date(utcDate);
	return usDate.getUTCMonth() + 1;
}

function toTitleCase(str) {
	return str.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
}

function getFilterOption(type) {
	if ($.inArray(type, types) == -1) {
		types.push(type);
	}

	var miscKeyWords = ['Miscellaneous', 'Other', 'Shopping', 'Community', 'Promotional', 'Activism', 'Spirituality', 'Religion', 'World', 'Competitions', 'Recreation', 'Games'];
	var musicKeyWords = ['Music', 'Alternative', 'Rock', 'DJ', 'EDM', 'House', 'Country', 'Classical', 'Jazz', 'Funk', 'Punk', 'Latin', 'Rap', 'Pop'];
	var sportsKeyWords = ['Sports', 'Basketball', 'Baseball', 'Hockey'];
	var artKeyWords = ['Gallery', 'Galleries', 'Art', 'Arts'];
	var theaterKeyWords = ['Theatre', 'Theater', 'theater'];

	if (type == "")
		return "Miscellaneous";
	var misc = _.filter(miscKeyWords, function(s) {
		return type.indexOf(s) != -1;
	});
	if (misc.length)
		return "Miscellanous";

	var theater = _.filter(theaterKeyWords, function(s) {
		return type.indexOf(s) != -1;
	});
	if (theater.length)
		return "Theater";

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

	if (type.indexOf('Museum') != -1 || type.indexOf('Museums') != -1)
		return "Museum";
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