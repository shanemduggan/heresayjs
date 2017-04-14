function setUpButtons() {
	$('#typeFilter select').change(function(e) {
		var index = $('#typeFilter select').val();
		if (index == 0)
			return;
		var val = $("#typeFilter select option[value='" + index + "']").text();
		$("#selectDate").val('0');
		markers.forEach(function(marker) {
			marker.setMap(null);
		});

		markers = [];

		var coordNotFound = 0;
		var typeNotFound = 0;
		if (eventData.length) {
			var typeEvents = [];
			for (var i = 0; i < eventData.length; i++) {
				if (eventData[i].type)
					var type = getFilterOption(eventData[i].type);
				else
					typeNotFound++
				if (type == val) {
					var locationFound = _.find(locationData, function(l) {
						return l.location === eventData[i].locationName;
					});

					if (locationFound) {
						eventData[i].formattedAddress = locationFound.formattedAddress;
						eventData[i].lat = locationFound.lat;
						eventData[i].lng = locationFound.lng;
					} else
						coordNotFound++

					typeEvents.push(eventData[i]);
				}
			}

			console.log(typeEvents);
			console.log('coordinates not found: ' + coordNotFound);
			console.log('type not found: ' + typeNotFound);
			placeMarkers(typeEvents);

			// add to side panel
			$('#sidePanel ul').html('');
			$('#sidePanel h3').remove();
			$('#sidePanel').prepend('<h3>' + val + '</h3>');
			typeEvents.forEach(function(item, i) {
				$('#sidePanel ul').append('<li><a target="_blank" href="' + item.detailPage + '">' + item.name + '</a></li>');
			});
		}
	});

	$('#dateFilter select').change(function(e) {
		var index = $('#dateFilter select').val();
		var val = $("#dateFilter select option[value='" + index + "']").text();
		var notFound = 0;
		if (index == 0)
			return;

		markers.forEach(function(marker) {
			marker.setMap(null);
		});

		markers = [];

		if (eventData.length) {
			var dateEvents = _.filter(eventData, function(e) {
				return e.date == val;
			});

			console.log(dateEvents);
			if (dateEvents.length && locationData.length) {
				console.log(locationData.length);

				for (var i = 0; i < dateEvents.length; i++) {
					var locationFound = _.find(locationData, function(l) {
						return l.location === dateEvents[i].locationName;
					});

					if (locationFound) {
						dateEvents[i].formattedAddress = locationFound.formattedAddress;
						dateEvents[i].lat = locationFound.lat;
						dateEvents[i].lng = locationFound.lng;
					} else
						notFound++
				}
			}
			console.log('coordinates not found: ' + notFound);
			placeMarkers(dateEvents);

			// add to side panel
			$('#sidePanel ul').html('');
			$('#sidePanel h3').remove();
			$('#sidePanel').prepend('<h3>' + val + '</h3>');
			$("#selectType").val('0');
			dateEvents.forEach(function(item, i) {
				$('#sidePanel ul').append('<li><a target="_blank" href="' + item.detailPage + '">' + item.name + '</a></li>');
			});
		}
	});

	var monthDates = getDateFilterOptions();
	for (var i = 0; i < monthDates.length; i++) {
		$('#dateFilter select').append($('<option>', {
			value : i + 2,
			text : monthDates[i]
		}));
	}
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