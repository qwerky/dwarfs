manufacturing = {
		
		//List of stuff we've made
		stock: {
			
		},
		
		//How many things are currently being smithed
		inProgress: 0,
		
		unlock: function(recipe) {
			if (!recipe.visible) {
				$("div#smithing-recipes").append('<div data-recipe="' + recipe.key + '" class="recipe no-select">' + recipe.name + '<span class="right">0</span></div>');
				recipe.visible = true;
				manufacturing.stock[recipe.key] = 0;
			}
		},
		
		renderPanel: function() {
			//Render the plans
			$("div#smithing-recipes").children().each(function() {
				var key = $(this).data("recipe");
				var recipe = manufacturing.recipes[key];
				if (manufacturing.canAfford(recipe)) {
					$(this).removeClass("too-expensive");
					$(this).addClass("affordable");
				} else {
					$(this).removeClass("affordable");
					$(this).addClass("too-expensive");
				}
				var count = manufacturing.stock[key];
				$(this).find("span").text(count);
			});
		},
		
		canAfford: function(recipe) {
			for (var prop in recipe.cost) {
				var have = resources.stuff[prop];
				var need = recipe.cost[prop];
				if (have < need) {
					return false;
				}
			}
			
			return true;
		},
		
		//Makes an item 
		make: function(recipe) {
			if (!manufacturing.canAfford(recipe)) {
				return false;
			}
			
			//Check to see if there is space in the smithing queue
			var maxQueueLength = dwarfs.jobs.smithing;
			if (manufacturing.inProgress >= maxQueueLength) {
				return false;
			}
			
			//Disable smithing items if queue is full
			manufacturing.inProgress++;
			if (manufacturing.inProgress == maxQueueLength) {
				$("div.recipe").addClass("busy");
			}
			
			for (var prop in recipe.cost) {
				resources.stuff[prop] -= recipe.cost[prop];
			}
			manufacturing.addToQueue(recipe);
		},
		
		//Adds an item to the smithing queue
		addToQueue: function(recipe) {
			
			//TODO fix bug where you can start a job then reduce the number of smiths
			
			var queue = $("div#smithing-queue");
			var item = $("<div class='smith-item'><div class='left'>" + recipe.name + "</div></div>");
			var progress = $("<div class='smith-progress'></div>");
			item.append(progress);
			queue.append(item);
			progress.animate({
					width: "0%",
				},
				recipe.time,
				"linear",
				function() {
					manufacturing.inProgress--;
					$("div.recipe").removeClass("busy");
					item.remove();
					manufacturing.stock[recipe.key]++;
					manufacturing.renderPanel();
					tools.renderPanel();
				}).css("overflow", "visible");
		},
		
		//Sets the content of the research tooltip
		setToolTipContent: function(recipe, tooltip) {
			tooltip.html("<span>" + recipe.description + "</span><br/>");
			tooltip.append("<span class='dark-grey smaller'>" + recipe.tooltip + "</span><hr/>");

			for (var prop in recipe.cost) {
				tooltip.append("<span>" + prop + ": " + recipe.cost[prop] + "</span><br/>");
			}
			tooltip.removeClass("hidden");
		},
		
		// All the things that can be made
		recipes: {
			copperpickaxe: {
				key: "copperpickaxe",
				visible: false,
				cost: {
					stone: 20,
					copper: 20
				},
				time: 30000,
				bonus: 1.1,
				job: "mining",
				name: "Copper Pick Axe",
				description: "..better than mining with your hands!",
				tooltip: "10% bonus to ore and coal"
			},
			coppershovel: {
				key: "coppershovel",
				visible: false,
				cost: {
					stone: 20,
					copper: 20
				},
				time: 20000,
				bonus: 1.1,
				job: "digging",
				name: "Copper Shovel",
				description: "..better than digging with your hands!",
				tooltip: "10% bonus to stone"
			},
			copperhoe: {
				key: "copperhoe",
				visible: false,
				cost: {
					stone: 20,
					copper: 20
				},
				time: 20000,
				bonus: 1.1,
				job: "farming",
				name: "Copper Hoe",
				description: "..better than farming with your hands!",
				tooltip: "10% bonus to farming"
			}
		}
};

$(document).ready(function() {
	//Handle building click
	$("div#smithing-recipes").on("click", "div", function() {
		var key = $(this).data("recipe");
		var recipe = manufacturing.recipes[key];
		manufacturing.make(recipe);
	});
	
	//Enable/Disable recipes when number of smiths changes
	$("tr#smith-prof td button").click(function() {
		var maxQueueLength = dwarfs.jobs.smithing;
		if (manufacturing.inProgress >= maxQueueLength) {
			$("div.recipe").addClass("busy");
		} else {
			$("div.recipe").removeClass("busy");
		}
		$("span#numSmiths").text(maxQueueLength);
	});
	
	//Show tooltip for building
	$("div#smithing-recipes").on("mouseenter", "div", function() {
		var key = $(this).data("recipe");
		var recipe = manufacturing.recipes[key];
		var offset = $(this).offset();
		var tooltip = $("div#manufacturing-tooltip");
		manufacturing.setToolTipContent(recipe, tooltip);
		tooltip.offset({top: offset.top + 50, left: offset.left - 10});
	});
	
	//Hide tooltip for building
	$("div#smithing-recipes").on("mouseleave", "div", function() {
		var tooltip = $("div#manufacturing-tooltip");
		tooltip.addClass("hidden");
	});
});