$(document).ready(function() {
	var showData = $('#show-data');

	$.getJSON('data/timeout.json', function(data) {
		var filteredData = [];
		for (var i = 0; i < data.length; i++) {
			if (data[i].date.includes('Until') || data[i].date.includes(' - ')) {
			} else {
				filteredData.push(data[i]);
			}
		}

		var items = filteredData.map(function(item) {
			var index = item.date.indexOf('January');
			var date = item.date.slice(index, item.date.length);

			if (item.date.split(' ').length == 4) {
				if (item.date.split(' ')[2].length == 1) {
					var num = '0' + item.date.split(' ')[2];
					var numDate = '02' + num + '2017';
				} else if (item.date.split(' ')[2].length == 2) {
					var numDate = '02' + item.date.split(' ')[2] + '2017';
				}
			}
			
			return '<span class="itemHeader" id="' + item.name + '"><b>' + item.name + '</b>' + ' (<a target="_blank" href="' + item.locationLink + '">' + item.location + '</a>; <span class="date" id="' + numDate + '">' + item.date + ') ' + '</span></span><br>' + item.summary;
		});
		showData.empty();
		if (items.length) {
			var content = '<li>' + items.join('</li><li>') + '</li>';
			var list = $('<ul />').html(content);
			showData.append(list);
		}
	});

	showData.text('Loading the JSON file.');
	$('#user-data').append('<ul id="user-data-list"></ul>');

	setTimeout(function() {
		var eventNodes = $('#show-data').find('li');
		for (var i = 0; i < eventNodes.length; i++) {
			$(eventNodes[i]).click(function() {
				var headerData = $(this).contents('span').html();
				var split = headerData.split('</b>');
				var name = split[0].replace('<b>', '')
				var nodeCheck = $('#user-data-list').find(":contains(" + name + ")");
				if (nodeCheck.length)
					return;
				$('#user-data-list').append('<li class="user-data-node">' + headerData + '</li>').trigger("appened");
			});
		}
	}, 1000);

	$('body').on('click', 'li.user-data-node', function() {
		$(this).remove();
	});

	$("body").on("appened", "div", function(event) {
		var elems = $(this).find('ul').children();
		elems.sort(function(a, b) {
			return parseInt($(a).find('.date')[0].id) > parseInt($(b).find('.date')[0].id)
		});
		$('#user-data-list').append(elems);
	});
});

