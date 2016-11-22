tools = {
	
		//What tools are assigned to each job
		assigned: {
			
		},
		
		getToolBonus: function(key, job) {
			if (key == null || key == undefined) {
				return 1.0;
			}
			if (job == null || job == undefined) {
				return 1.0;
			}
			var tool = manufacturing.recipes[key];
			if (tool.job == null || tool.job == undefined) {
				return 1.0;
			}
			if (tool.job == job) {
				return tool.bonus;
			} else {
				return 1.0;
			}
		},
		
		renderPanel: function() {
			var inuseDiv = $("div#tools-inuse");
			inuseDiv.empty();
			for (var i=0; i<dwarfs.residents.length; i++) {
				var d = dwarfs.residents[i];
				var job = "";
				if (d.job != null) {
					job = d.job;
				}
				var tool = "";
				if (d.tool != null) {
					tool = d.tool;
				}
				inuseDiv.append("<div class='list-select' data-key='" + i + "'><span class='left'>" + d.name + "<br/><span class='dark-grey smaller pad-sides'>" + job + "</span></span><span class='right dark-green'>" + tool + "</span><div class='clear'/><hr/></div>");
			}
			
			var spareDiv = $("div#tools-spare");
			spareDiv.empty();
			
			for (var prop in manufacturing.stock) {
				var inUse = tools.assigned[prop];
				if (inUse === undefined) {
					inUse = 0;
				}
				var stock = manufacturing.stock[prop];
				var spare = stock - inUse;
				if (spare > 0) {
					var item = manufacturing.recipes[prop];
					spareDiv.append("<div class='list-select' data-key='" + item.key + "'>" + item.name + ": " + spare + "</div>");
				}
			}
		}
};

$(document).ready(function() {
	
	$("button#tool-assign").click(function() {
		var resident = $("div#tools-inuse").data("key");
		var tool = $("div#tools-spare").data("key");
		
		if (resident == undefined || tool == undefined) {
			return;
		}
		
		var inUse = tools.assigned[tool];
		if (inUse === undefined) {
			tools.assigned[tool] = 1;
		} else {
			tools.assigned[tool]++;
		}
		
		var d = dwarfs.residents[resident];
		
		//Unassign current tool if the dwarf has one
		if (d.tool != null) {
			tools.assigned[d.tool]--;
		}
		
		//Assign tool
		d.tool = tool;
		
		$("div#tools-inuse").removeData("key");
		$("div#tools-spare").removeData("key");
		
		tools.renderPanel();
	});
	
	
	$("button#tool-unassign").click(function() {
		var resident = $("div#tools-inuse").data("key");
		
		if (resident == undefined) {
			return;
		}
		
		var d = dwarfs.residents[resident];
		if (d.tool != null) {
			tools.assigned[d.tool]--;
			d.tool = null;
			$("div#tools-inuse").removeData("key");
			$("div#tools-spare").removeData("key");
			tools.renderPanel();
		}
		
	});
	
});