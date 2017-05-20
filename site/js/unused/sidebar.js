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


function largeSidebar() {
	$('#map_canvas').css('width', '59.5%');
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

			// var tooltip;
			// tooltip = new Tooltip(marker.__name);
			//
			// // On mouseover, open the Tooltip
			// google.maps.event.addListener(marker, 'mouseover', function(e) {
			// tooltip.open(map, this);
			// });
			//
			// // On mouseout, close the Tooltip
			// google.maps.event.addListener(marker, 'mouseout', function() {
			// tooltip.close();
			// });

			// var contentString = "<html class='infoWindow'><body><div class='infoWindow' style='text-align: center'><p><h4><a target='_blank' href='" + marker.__link + "'>" + marker.__name + "</a></h4>" + marker.__loc + "<br>" + marker.__date + "</p></div></body></html>";
			// var infowindow = new google.maps.InfoWindow({
			// content : contentString
			// });

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