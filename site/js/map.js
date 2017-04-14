function initMap() {
	var losAngeles = {
		lat : 34.0416,
		lng : -118.328661
	}
	map = new google.maps.Map(document.getElementById('mapContainer'), {
		zoom : 11,
		center : losAngeles,
		/*scrollwheel : false,*/
		mapTypeControl : false
	});
}

function placeMarkers(events) {
	//console.log(events);
	//console.log(events.length);

	for (var i = 0; i < events.length; i++) {
		if (!events[i].lat)
			continue;

		(function(i) {
			var myLatlng = new google.maps.LatLng(events[i].lat, events[i].lng);
			var marker = new google.maps.Marker({
				position : myLatlng,
				map : map,
				animation : google.maps.Animation.DROP
			});

			var contentString = "<html><body><div><p><h4>" + events[i].name + "</h4>" + events[i].date + "<br>" + events[i].locationName + "</p></div></body></html>";
			var infowindow = new google.maps.InfoWindow({
				content : contentString
			});

			marker.addListener('mouseover', function() {
				infowindow.open(map, this);
			});

			marker.addListener('mouseout', function() {
				infowindow.close();
			});

			markers.push(marker);
			// markers[item.index] = marker;
		})(i);
	}
}

function show(id) {
	myid = id;
	if (markers[myid]) {
		setTimeout(function() {
			new google.maps.event.trigger(markers[myid], 'mouseover');
		}, 200);
		// mouseout, click
		hide(myid);
	}
}

function hide(id) {
	setTimeout(function() {
		new google.maps.event.trigger(markers[id], 'mouseout');
	}, 2000);
}