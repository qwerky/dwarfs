$(document).ready(function() {
	
	$("a#clear-events").click(function() {
		$("ul#event-list").empty();
	});
	
});

function logEvent(msg) {
	$("ul#event-list").append("<li>" + msg + "</li>");
}