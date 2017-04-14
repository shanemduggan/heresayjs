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

function placeMarkers(events) {
	console.log(events);
	console.log(events.length);

	for (var i = 0; i < events.length; i++) {
		if (!events[i].lat)
			continue;
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
	}
}

// function placeMarkerAndGeoCode(address, item) {
// console.log(address);
// if (!address)
// return;
// var geocoder = new google.maps.Geocoder();
// geocoder.geocode({
// 'address' : address
// }, function(results, status) {
// if (!results)
// return;
// if (status == google.maps.GeocoderStatus.OK) {
// var lat = results[0].geometry.location.lat();
// var lng = results[0].geometry.location.lng();
//
// //console.log(results[0].address_components[5].long_name);
// // var state = _.find(results[0].address_components, function(data) {
// // return data.long_name == "California";
// // });
// // console.log(state.long_name);
// // if (state.long_name != "California")
// // console.log(results)
//
// var myLatlng = new google.maps.LatLng(lat, lng);
// var marker = new google.maps.Marker({
// position : myLatlng,
// map : map,
// animation : google.maps.Animation.DROP
// });
//
// //markers.push(marker);
// markers[item.index] = marker;
//
// if (!item)
// return;
// var contentString = "<html><body><div><p><h4>" + item.name + "</h4>" + item.date + "<br>" + item.location + "</p></div></body></html>";
// var infowindow = new google.maps.InfoWindow({
// content : contentString
// });
//
// marker.addListener('mouseover', function() {
// infowindow.open(map, this);
// });
//
// marker.addListener('mouseout', function() {
// infowindow.close();
// });
//
// //console.log(item.index);
// var node = $('#sidePanel').find('li:contains("' + item.name + '")');
// $(node).hover(function() {
// show(item.index);
// });
//
// //console.log(map);
// }
// });
// }

// function addMarkerOnLoad(item) {
// //console.log(item.locationAddress);
// //var timer = Math.floor((Math.random() * 60000) + 1);
// var timer = Math.floor((Math.random() * 60000) + 500);
// //console.log(timer);
// setTimeout(function() {
// placeMarkerAndGeoCode(item.locationAddress, item);
// }, timer);
// }

