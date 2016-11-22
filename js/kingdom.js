kingdom = {
		sizeUsed: 0,
		freeSpace: 0,
		
		renderPanel: function() {
			$("td#used-space").text(kingdom.sizeUsed.toFixed(2));
			$("td#free-space").text(kingdom.freeSpace.toFixed(2));
			
			$("div#kingdom-buildings").children().each(function() {
				var index = $(this).data("index");
				var b = kingdom.buildings[index];
				if (kingdom.canAfford(b)) {
					$(this).removeClass("too-expensive");
					$(this).addClass("affordable");
				} else {
					$(this).removeClass("affordable");
					$(this).addClass("too-expensive");
				}
			});
		},
		
		tick: function() {
			var digAmt = dwarfs.jobs.digging * constants.baseDig;
			kingdom.freeSpace += digAmt;
			
			kingdom.checkAppearances();
			kingdom.renderPanel();
		},
		
		//Checks to see if new buildings should appear in the panel
		checkAppearances: function () {
			var arrayLength = kingdom.buildings.length;
			for (var i=0; i < arrayLength; i++) {
				var b = kingdom.buildings[i];
				if (b.owned == 0 && b.appeared == false && kingdom.shouldAppear(b)) {
					kingdom.show(b.name, i);
					b.appeared = true;
				}
			}
		},

		//Checks to see if a building should appear
		shouldAppear: function (b) {
			if (!b.unlocked) {
				return false;
			}
			if (kingdom.freeSpace < b.spaceRequired * constants.appearanceRequirements) {
				return false;
			}
			
			for (var prop in b.cost) {
				var have = resources.stuff[prop];
				var need = b.cost[prop];
				if (have < need * constants.appearanceRequirements) {
					return false;
				}
			}
			
			return true;
		},

		//Makes a building appear on the kingdom panel
		show: function (name, index) {
			var qty = kingdom.buildings[index].owned;
			$("div#kingdom-buildings").append('<div data-index="' + index + '" class="building no-select">' + name + ' (' + qty + ')</div>');
		},
		
		buildings:[{
				//0 Living space
				owned: 0,
				appeared: false,
				unlocked: true,
				spaceRequired: 1.0,
				cost: {
					stone: 5.0
				},
				name: "Quarters",
				tooltip: "A place for dwarves to rest their heads",
				bonustooltip: "+1 max dwarf capacity",
				action: function() {
					dwarfs.capacity++;
				}
			},{
				//1 Workshop
				owned: 0,
				appeared: false,
				unlocked: true,
				spaceRequired: 2.0,
				cost: {
					stone: 7.0
				},
				name: "Tinker's Workshop",
				tooltip: "Dwarfs are forever tinkering and fiddling",
				bonustooltip: "Unlocks research",
				action: function() {
					$("tr#tinker-prof").removeClass("hidden");
					$("td#resource-research").parent("tr").removeClass("hidden");
					$("a.tab-header[data-tab='research-panel']").removeClass("hidden");
					research.unlock(research.ideas.mining);
					dwarfs.workspace.tinkering++;
				}
			},{
				//2 Smelter
				owned: 0,
				appeared: false,
				unlocked: false,
				spaceRequired: 3.0,
				cost: {
					stone: 10.0
				},
				name: "Smelter",
				tooltip: "Now we're talking, lets make some metal!",
				bonustooltip: "Allows smelting, diggers produce coal",
				action: function() {
					$("tr#smelter-prof").removeClass("hidden");
					$("td#resource-coal").parent("tr").removeClass("hidden");
					$("td#resource-copper").parent("tr").removeClass("hidden");
					dwarfs.workspace.smelting++;
				}
			},{
				//3 Smithy
				owned: 0,
				appeared: false,
				unlocked: false,
				spaceRequired: 6.0,
				cost: {
					stone: 50.0
				},
				name: "Smithy",
				tooltip: "A place for dwarfs to work metal into useful items.",
				bonustooltip: "Unlocks smithing profession",
				action: function() {
					$("tr#smith-prof").removeClass("hidden");
					$("a.tab-header[data-tab='smithing-panel']").removeClass("hidden");
					dwarfs.workspace.smithing++;
				}
			},{
				//4 Farm
				owned: 0,
				appeared: false,
				unlocked: false,
				spaceRequired: 20.0,
				cost: {
					stone: 50.0
					//TODO cost tools as well
				},
				name: "Underground Farm",
				tooltip: "Spread some mud on the cavern floor and you can cultivate all sorts of dwarven delights.",
				bonustooltip: "Allows 1 farmer",
				action: function() {
					dwarfs.workspace.farming++;
				}
			}
		],
		
		//Purchases a building and sets the new escalated prices
		purchase: function (b) {
			if (!kingdom.canAfford(b)) {
				return;
			}
			
			kingdom.sizeUsed += b.spaceRequired;
			kingdom.freeSpace -= b.spaceRequired;
			for (var prop in b.cost) {
				resources.stuff[prop] -= b.cost[prop];
			}
			
			b.owned++;
			b.spaceRequired = b.spaceRequired * constants.pricesEscalate;
			for (var prop in b.cost) {
				b.cost[prop] = b.cost[prop] * constants.pricesEscalate;
			}
			b.action();
			
			var tooltip = $("div#building-tooltip");
			kingdom.setToolTipContent(b, tooltip);
			
			renderPanels();
		},
		
		//Checks to see if a building is affordable
		canAfford: function(b) {
			if (kingdom.freeSpace < b.spaceRequired) {
				return false;
			}
			
			for (var prop in b.cost) {
				var have = resources.stuff[prop];
				var need = b.cost[prop];
				if (have < need) {
					return false;
				}
			}
			
			return true;
		},
		
		//Sets the content of the building tooltip
		setToolTipContent: function(b, tooltip) {
			tooltip.html("<span>" + b.tooltip + "</span><br/>");
			tooltip.append("<span class='dark-grey smaller'>" + b.bonustooltip + "</span><hr/>");
			tooltip.append("<span>space required: " + b.spaceRequired.toFixed(2) + "</span>");
			for (var prop in b.cost) {
				tooltip.append("<br/><span>" + prop + ": " + b.cost[prop].toFixed(2) + "</span>");
			}
			tooltip.removeClass("hidden");
		}
};

$(document).ready(function() {
	//Handle building click
	$("div#kingdom-buildings").on("click", "div", function() {
		var index = $(this).data("index");
		var b = kingdom.buildings[index];
		kingdom.purchase(b);
		$(this).text(b.name + " (" + b.owned + ")");
	});
	
	//Show tooltip for building
	$("div#kingdom-buildings").on("mouseenter", "div", function() {
		var index = $(this).data("index");
		var b = kingdom.buildings[index];
		var offset = $(this).offset();
		var tooltip = $("div#building-tooltip");
		kingdom.setToolTipContent(b, tooltip);
		tooltip.offset({top: offset.top + 50, left: offset.left - 10});
	});
	
	//Hide tooltip for building
	$("div#kingdom-buildings").on("mouseleave", "div", function() {
		var tooltip = $("div#building-tooltip");
		tooltip.addClass("hidden");
	});
	
	//Handle tab clicks
	$("a.tab-header").on("click", function() {
		var tab = $(this).data("tab");
		$(this).parent().addClass("hidden");
		$("div#" + tab).removeClass("hidden");
	});
});

