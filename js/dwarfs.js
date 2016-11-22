dwarfs = {
		citizens: 0,	// how many dwarfs you have
		capacity: 1,	// max dwarfs in kingdom
		
		//Array of all the dwarfs in the kingdom
		residents: [
		],
		
		addCitizen: function() {
			dwarfs.citizens++;
			var d = new Dwarf();
			dwarfs.residents.push(d);
			tools.renderPanel();
			return d;
		},
		
		//How many dwarfs are doing the job
		jobs: {
			foraging: 1,
			digging: 0,
			tinkering: 0,
			smelting: 0,
			smithing: 0,
			farming: 0
		},
		
		//How many jobs can do the job, -1 means no limit
		workspace: {
			foraging: -1,
			digging: -1,
			tinkering: 0,
			smelting: 0,
			smithing: 0,
			farming: 0
		},
		
		getIdle: function() {
			var idle = dwarfs.citizens;
			for (var prop in dwarfs.jobs) {
				idle -= dwarfs.jobs[prop];
			}
			return idle;
		},
		
		goForaging: function() {
			//Try and find an idle dwarf to go foraging
			for (var i=0; i<dwarfs.residents.length; i++) {
				var d = dwarfs.residents[i];
				if (d.job == null) {
					d.job = "foraging";
					dwarfs.jobs.foraging++;
					return d;
				}
			}
			
			//No idle dwarfs found
			for (var i=0; i<dwarfs.residents.length; i++) {
				var d = dwarfs.residents[i];
				if (d.job != "foraging" && d.job != "farming") {
					var oldJob = d.job;
					dwarfs.jobs[oldJob]--;
					d.job = "foraging";
					dwarfs.jobs.foraging++;
					logEvent(d.name + " is too hungry to continue " + oldJob);
					return d;
				}
			}
		},
		
		assignJob: function(job) {
			for (var i=0; i<dwarfs.residents.length; i++) {
				var d = dwarfs.residents[i];
				if (d.job == null) {
					d.job = job;
					dwarfs.jobs[job]++;
					tools.renderPanel();
					return d;
				}
			}
		},
		
		unassignJob: function(job) {
			for (var i=0; i<dwarfs.residents.length; i++) {
				var d = dwarfs.residents[i];
				if (d.job == job) {
					d.job = null;
					dwarfs.jobs[job]--;
					tools.renderPanel();
					return d;
				}
			}
		},
		
		renderPanel: function() {
			var idle = dwarfs.getIdle();
			$("span#free-dwarfs").text(idle);
			
			$("span#capacity").text(dwarfs.capacity);
			
			for (var prop in dwarfs.jobs) {
				var count = dwarfs.jobs[prop];
				var countTd = $("tr[data-job='" + prop + "']").find("td.count");
				countTd.text(count);
			}

			$("button.plus").each(function() {
				var btn = $(this);
				var job = btn.parents("tr").data("job");
				var curr = dwarfs.jobs[job];
				var max = dwarfs.workspace[job];
				var spaceForWorker = max == -1 ? true : curr < max;
				if (idle == 0 || !spaceForWorker) {
					btn.attr("disabled", true);
				} else {
					btn.removeAttr("disabled");
				}
			});
			
			$("button.minus").each(function() {
				var job = $(this).parents("tr").data("job");
				if (dwarfs.jobs[job] == 0) {
					$(this).attr("disabled", true);
				} else {
					$(this).removeAttr("disabled");
				}
			});

		}
};


//Dwarf class
function Dwarf() {
	this.name = names.generate();
	this.job = null;
	this.tool = null;
}


names = {
	first: [
	        "Bulby",
	        "Donger",
	        "Grub",
	        "Bob",
	        "Runkle",
	        "Hefty",
	        "Thrum",
	        "Finkle",
	        "Boggy",
	        "Dingle",
	        "Biffa",
	        "Dirg",
	        "Frump"
	],
	
	second: [
	         "Thickskull",
	         "Stronginthearm",
	         "Brodebung",
	         "Headcleaver",
	         "Muckshifter",
	         "The Squat",
	         "Thunderpants",
	         "Aleswigger",
	         "Tuffnutt",
	         "Hillman"
	],
	
	generate: function() {
		var f = Math.floor((Math.random() * names.first.length));
		var s = Math.floor((Math.random() * names.second.length));
		return names.first[f] + " " + names.second[s];
	}
};


$(document).ready(function() {
	
	$("button.plus").click(function() {
		var parent = $(this).parents("tr");
		var job = parent.data("job");
		dwarfs.assignJob(job);
		dwarfs.renderPanel();
	});
	
	$("button.minus").click(function() {
		var parent = $(this).parents("tr");
		var job = parent.data("job");
		dwarfs.unassignJob(job);
		dwarfs.renderPanel();
	});
	
	if (cheatmode) {
		$("button#influx").removeClass("hidden");
	}
	
	$("button#influx").click(function() {
		dwarfs.capacity += 10;
		dwarfs.addCitizen();
		dwarfs.addCitizen();
		dwarfs.addCitizen();
		dwarfs.addCitizen();
		dwarfs.addCitizen();
		dwarfs.addCitizen();
		dwarfs.addCitizen();
		dwarfs.addCitizen();
		dwarfs.addCitizen();
		dwarfs.addCitizen();
		dwarfs.renderPanel();
	});
	
});