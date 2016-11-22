var cheatmode = true;

$(document).ready(function() {
	//init
	var d = dwarfs.addCitizen();
	d.job = "foraging";
	setInterval(tick, 1000);
	
	//Handle list select click
	$("div.list-holder").on("click", "div", function() {
		$(this).parent().children().each(function () {
			$(this).removeClass("list-selected");
		});
		var key = $(this).data("key");
		$(this).addClass("list-selected");
		$(this).parent().data("key", key);
	});
});


function tick() {
	
	if (dwarfs.capacity > dwarfs.citizens) {
		if (roll(1, 10)) {
			var d = dwarfs.addCitizen();
			logEvent(d.name + " wanders into your kingdom and takes up residence");
		}
	}
	
	resources.tick();
	kingdom.tick();
}

// rolls a dice to determine if chance a in b succeeds
function roll(a, b) {
	var score = Math.floor((Math.random() * b) + 1);
	return a >= score;
}


function renderPanels() {
	kingdom.renderPanel();
	research.renderPanel();
	resources.renderPanel();
	dwarfs.renderPanel();
	manufacturing.renderPanel();
	tools.renderPanel();
}