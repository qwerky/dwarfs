Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};

game = {
		saveDwarfs: function() {
			localStorage.setObject("dwarfs", dwarfs);
			
			var unlockedJobs = [];
			$("div#dwarfs-panel").find("tr").each(function() {
				var tr = $(this);
				if (!tr.hasClass("hidden")) {
					var job = tr.data("job");
					unlockedJobs.push(job);
				}
			});
			localStorage.setObject("unlockedJobs", unlockedJobs);
		},
		
		loadDwarfs: function() {
			var loadedDwarfs = localStorage.getObject("dwarfs");
			dwarfs.citizens = loadedDwarfs.citizens;
			dwarfs.capacity = loadedDwarfs.capacity;
			dwarfs.residents = loadedDwarfs.residents;
			dwarfs.jobs = loadedDwarfs.jobs;
			dwarfs.workspace = loadedDwarfs.workspace;
			
			var unlockedJobs = localStorage.getObject("unlockedJobs");
			for (var i=0; i<unlockedJobs.length; i++) {
				var job = unlockedJobs[i];
				$("tr[data-job='" + job + "']").removeClass("hidden");
			}
			$("span#numSmiths").text(dwarfs.jobs.smithing);
		},
		
		saveKingdom: function() {
			localStorage.setObject("kingdom", kingdom);
		},
		
		loadKingdom: function() {
			var loadedKingdom = localStorage.getObject("kingdom");
			kingdom.sizeUsed = loadedKingdom.sizeUsed;
			kingdom.freeSpace = loadedKingdom.freeSpace;
			
			$("div#kingdom-buildings").empty();
			
			for (var i=0; i<kingdom.buildings.length; i++) {
				var a = kingdom.buildings[i];
				var b = loadedKingdom.buildings[i];
				
				//Only need to set things that change
				a.owned = b.owned;
				a.appeared = b.appeared;
				a.unlocked = b.unlocked;
				a.spaceRequired = b.spaceRequired;
				a.cost = b.cost;
				
				if (a.appeared) {
					kingdom.show(a.name, i);
				}
			}
			
			if (kingdom.buildings[1].owned > 0) {
				$("a.tab-header[data-tab='research-panel']").removeClass("hidden");
			}
			if (kingdom.buildings[3].owned > 0) {
				$("a.tab-header[data-tab='smithing-panel']").removeClass("hidden");
			}
		},
		
		saveManufacturing: function() {
			localStorage.setObject("manufacturing", manufacturing);
		},
		
		loadManufacturing: function() {
			var loadedManufacturing = localStorage.getObject("manufacturing");
			manufacturing.stock = loadedManufacturing.stock;
			
			for (var prop in manufacturing.recipes) {
				var a = manufacturing.recipes[prop];
				var b = loadedManufacturing.recipes[prop];
				
				//Only need to set things that change
				a.visible = b.visible;
				
				if (a.visible) {
					$("div#smithing-recipes").append('<div data-recipe="' + a.key + '" class="recipe no-select">' + a.name + '<span class="right">' + manufacturing.stock[prop] + '</span></div>');
				}
			}
			//TODO save/load items that are currently in progress, ie are in the queue
		},
		
		saveResearch: function() {
			localStorage.setObject("research", research);
		},
		
		loadResearch: function() {
			var loadedResearch = localStorage.getObject("research");

			$("div#research-items").empty();
			for (var prop in research.ideas) {
				var a = research.ideas[prop];
				var b = loadedResearch.ideas[prop];
				
				//Only need to set things that change
				a.researched = b.researched;
				a.visible = b.visible;
				
				if (a.visible && !a.researched) {
					$("div#research-items").append('<div data-idea="' + a.key + '" class="research no-select">' + a.name + '</div>');
				}
			}
			
			if (research.ideas.coppertools.researched) {
				$("a.tab-header[data-tab='tools-panel']").removeClass("hidden");
			}
		},
		
		saveResources: function() {
			localStorage.setObject("resources", resources);
			
			var unlockedResources = [];
			$("div#resource-panel").find("tr").each(function() {
				var tr = $(this);
				if (!tr.hasClass("hidden")) {
					var resource = tr.data("resource");
					unlockedResources.push(resource);
				}
			});
			localStorage.setObject("unlockedResources", unlockedResources);
		},
		
		loadResources: function() {
			var loadedResources = localStorage.getObject("resources");
			resources.foundMountain = loadedResources.foundMountain;
			resources.stuff = loadedResources.stuff;
			
			if (resources.foundMountain) {
				$("div#kingdom-panel").removeClass("hidden");
			}
			
			var unlockedResources = localStorage.getObject("unlockedResources");
			for (var i=0; i<unlockedResources.length; i++) {
				var resource = unlockedResources[i];
				$("tr[data-resource='" + resource + "']").removeClass("hidden");
			}
		},
		
		saveTools: function() {
			localStorage.setObject("tools", tools);
		},
		
		loadTools: function() {
			var loadedTools = localStorage.getObject("tools");
			tools.assigned = loadedTools.assigned;
		},
};

function autosave() {
	save();
	$("span#autosave").show();
	$("span#autosave").fadeOut("slow");
}

function save() {
	game.saveDwarfs();
	game.saveKingdom();
	game.saveManufacturing();
	game.saveResearch();
	game.saveResources();
	game.saveTools();
}

function load() {
	game.loadDwarfs();
	game.loadKingdom();
	game.loadManufacturing();
	game.loadResearch();
	game.loadResources();
	game.loadTools();
	renderPanels();
}

$(document).ready(function() {
	
	$("a#save").click(function() {
		save();
	});
	
	$("a#load").click(function() {
		load();
	});
	
	setInterval(autosave, 180000);
});