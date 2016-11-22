resources = {
		foundMountain: false,
		
		stuff: {
			food: 0.00,
			stone: 0.00,
			research: 0.00,
			coal: 0.00,
			copperore: 0.00,
			copper: 0.00
		},
		
		renderPanel: function(delta) {
			for (var prop in resources.stuff) {
				var td = $("td#resource-" + prop);
				td.text(resources.stuff[prop].toFixed(2));
				
				if (delta != undefined) {
					var change = delta[prop];
					var sign = "";
					if (change > 0) {
						sign = "+";
					}
					td.next().html("<span class='dark-grey'>" + sign + change.toFixed(2) + "</span>");
				}
			}
		},
		
		tick: function() {
			
			//Create a delta for all the resource change this tick
			delta = {
				food: 0,
				stone: 0,
				research: 0,
				coal: 0,
				copperore: 0,
				copper: 0
			};
			
			var farmers = [];
			var smelters = [];
			var others = [];
			
			//Sort dwarfs into profession groups
			for (var i=0; i<dwarfs.residents.length; i++) {
				var d = dwarfs.residents[i];
				if (d.job == "farming") {
					farmers.push(d);
				} else if (d.job == "smelting") {
					smelters.push(d);
				} else {
					others.push(d);
				}
			}
			
			//Food
			var foodEaten = dwarfs.citizens * constants.baseFoodEat;
			do {
				//Calculate food produced by farmers
				var foodProduced = dwarfs.jobs.foraging * constants.baseForage;
				for (var i=0; i<farmers.length; i++) {
					var d = farmers[i];
					var bonus = 1;
					if (d.tool != null) {
						var tool = manufacturing.recipes[d.tool];
						if (tool.job == "farming") {
							bonus = tool.bonus;
						}
					}
					var foodFromThisDwarf = constants.baseFarming * bonus;
					foodProduced += foodFromThisDwarf;

				}
				

				var foodAvailThisTick = resources.stuff.food + foodProduced;
				
				//If not enough food to go around
				if (foodEaten > foodAvailThisTick) {
					var d = dwarfs.goForaging();
					logEvent(d.name + " starts foraging");
				}
			} while (foodEaten > foodAvailThisTick);
			delta["food"] = foodProduced - foodEaten;
			
			//Digging and tinkering
			for (var i=0; i<others.length; i++) {
				var d = others[i];
				
				if (d.job == null) {
					continue;
				} else if (d.job == "digging") {
					
					var digAmt = constants.baseDig * tools.getToolBonus(d.tool, "digging");
					delta["stone"] += digAmt;
					
					if (research.ideas.mining.researched) {
						var copperOreAmt = constants.baseOre * tools.getToolBonus(d.tool, "mining");
						delta["copperore"] += copperOreAmt;
					}
					
					if (kingdom.buildings[2].owned > 0) {
						var coalAmt = constants.baseOre * tools.getToolBonus(d.tool, "mining");
						delta["coal"] += coalAmt;
					}
						
				} else if (d.job == "tinkering") {
					
					var researchAmt = constants.baseResearch * tools.getToolBonus(d.tool, "tinkering");
					delta["research"] += researchAmt;
						
				}
			}
			
			//Smelting; have to work this out after we've figured out the ore/coal delta
			
			//This is the total amount of smelting we can do per tick, over all ores.
			var smeltPower = dwarfs.jobs.smelting * constants.baseSmelt;
			
			//Can't smelt more than we have the resources for
			var copperAmt = Math.min.apply(Math, [smeltPower, resources.stuff.copperore, resources.stuff.coal]);
			
			delta["coal"] -= copperAmt;
			delta["copperore"] -= copperAmt;
			delta["copper"] += copperAmt;
			
			for (var prop in delta) {
				resources.stuff[prop] += delta[prop];
			}
			
			// Unlock kingdom and stone once enough food has been foraged
			if (resources.stuff.food > 20 && !resources.foundMountain) {
				$("div#kingdom-panel").removeClass("hidden");
				$("tr#digging-prof").removeClass("hidden");
				$("td#resource-stone").parent("tr").removeClass("hidden");
				logEvent("You come accross a rocky mountain. Looks like a nice place to start digging.");
				resources.foundMountain = true;
			}
			
			resources.renderPanel(delta);
			research.renderPanel();
			dwarfs.renderPanel();
		}
};

$(document).ready(function() {

	if (cheatmode) {
		$("button#boon").removeClass("hidden");
	}
	
	$("button#boon").click(function() {
		for (var prop in resources.stuff) {
			resources.stuff[prop] += 1000;
		};
	});

});