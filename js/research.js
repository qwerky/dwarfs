research = {
		ideas: {
			mining: {
				key: "mining",
				researched: false,
				visible: false,
				cost: {
					research: 20
				},
				name: "Mining",
				description: "Dwarfs are the best miners!",
				bonustooltip: "Diggers product basic ore and unlocks Smelting",
				action: function() {
					$("td#resource-copperore").parent("tr").removeClass("hidden");
					research.unlock(research.ideas.smelting);
				}
			},
			smelting: {
				key: "smelting",
				researched: false,
				visible: false,
				cost: {
					research: 50
				},
				name: "Smelting",
				description: "Smelting is the process of turning ores into metals",
				bonustooltip: "Unlocks Smelter and Smithing",
				action: function() {
					kingdom.buildings[2].unlocked = true;
					research.unlock(research.ideas.smithing);
				}
			},
			smithing: {
				key: "smithing",
				researched: false,
				visible: false,
				cost: {
					research: 100
				},
				name: "Smithing",
				description: "Opens the basics of metal working",
				bonustooltip: "Unlocks Smithy, Brewing and Tool Making",
				action: function() {
					kingdom.buildings[3].unlocked = true;
					research.unlock(research.ideas.brewing);
					research.unlock(research.ideas.toolmaking);
				}
			},
			brewing: {
				key: "brewing",
				researched: false,
				visible: false,
				cost: {
					research: 200
				},
				name: "Brewing",
				description: "Dwarfs are renown for their strong ales",
				bonustooltip: "",
				action: function() {
					
				}
			},
			toolmaking: {
				key: "toolmaking",
				researched: false,
				visible: false,
				cost: {
					research: 250
				},
				name: "Tool Making",
				description: "Allows your smiths to make simple tools",
				bonustooltip: "Unlocks weapon making and copper pickaxes",
				action: function() {
					research.unlock(research.ideas.weaponmaking);
					research.unlock(research.ideas.coppertools);
					research.unlock(research.ideas.farming);
				}
			},
			weaponmaking: {
				key: "weaponmaking",
				researched: false,
				visible: false,
				cost: {
					research: 500
				},
				name: "Weapon Making",
				description: "Allows your smiths to make simple weapons",
				bonustooltip: "",
				action: function() {
					
				}
			},
			coppertools: {
				key: "coppertools",
				researched: false,
				visible: false,
				cost: {
					research: 1000,
					copper: 40
				},
				name: "Basic Copper Tools",
				description: "..better than using your hands!",
				bonustooltip: "Unlocks basic copper tools for smiths",
				action: function() {
					manufacturing.unlock(manufacturing.recipes.copperpickaxe);
					manufacturing.unlock(manufacturing.recipes.coppershovel);
					manufacturing.unlock(manufacturing.recipes.copperhoe);
					$("a.tab-header[data-tab='tools-panel']").removeClass("hidden");
				}
			},
			farming: {
				key: "farming",
				researched: false,
				visible: false,
				cost: {
					research: 1500
				},
				name: "Underground Farming",
				description: "Farming produces more food that foraging",
				bonustooltip: "Unlocks farms and farmers",
				action: function() {
					$("tr#farming-prof").removeClass("hidden");
					kingdom.buildings[4].unlocked = true;
					kingdom.buildings[4].appeared = true;
				}
			}
		},
		
		renderPanel: function() {
			$("div#research-items").children().each(function() {
				var key = $(this).data("idea");
				var idea = research.ideas[key];
				if (research.canAfford(idea)) {
					$(this).removeClass("too-expensive");
					$(this).addClass("affordable");
				} else {
					$(this).removeClass("affordable");
					$(this).addClass("too-expensive");
				}
			});
		},
		
		canAfford: function(idea) {
			for (var prop in idea.cost) {
				var have = resources.stuff[prop];
				var need = idea.cost[prop];
				if (have < need) {
					return false;
				}
			}
			
			return true;
		},
		
		doResearch: function(idea) {
			if (!research.canAfford(idea)) {
				return false;
			}
			for (var prop in idea.cost) {
				resources.stuff[prop] -= idea.cost[prop];
			}
			idea.researched = true;
			idea.action();
			renderPanels();
			return true;
		},
		
		//Adds an idea to the research panel
		unlock: function(idea) {
			if (!idea.researched && !idea.visible) {
				$("div#research-items").append('<div data-idea="' + idea.key + '" class="research no-select">' + idea.name + '</div>');
				idea.visible = true;
			}
		},
		
		//Sets the content of the research tooltip
		setToolTipContent: function(idea, tooltip) {
			tooltip.html("<span>" + idea.description + "</span><br/>");
			tooltip.append("<span class='dark-grey smaller'>" + idea.bonustooltip + "</span><hr/>");
			for (var prop in idea.cost) {
				tooltip.append("<span>" + prop + ": " + idea.cost[prop] + "</span><br/>");
			}
			tooltip.removeClass("hidden");
		}
};

$(document).ready(function() {
	//Handle building click
	$("div#research-items").on("click", "div", function() {
		var key = $(this).data("idea");
		var idea = research.ideas[key];
		if (research.doResearch(idea)) {
			$(this).addClass("hidden");
		}
	});
	
	//Show tooltip for building
	$("div#research-items").on("mouseenter", "div", function() {
		var key = $(this).data("idea");
		var idea = research.ideas[key];
		var offset = $(this).offset();
		var tooltip = $("div#research-tooltip");
		research.setToolTipContent(idea, tooltip);
		tooltip.offset({top: offset.top + 50, left: offset.left - 10});
	});
	
	//Hide tooltip for building
	$("div#research-items").on("mouseleave", "div", function() {
		var tooltip = $("div#research-tooltip");
		tooltip.addClass("hidden");
	});
});