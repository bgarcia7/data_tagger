var isMouseDown = false;
var currentMode = null;
var temp = null;
var active = null;
var activatedIDs = {};
var cellsToAdd = {};
var subclassColorIndex = 1;
var options = ["stats","json","line-item"];
var helpTabs = ["overview","adding","removing","editing","hotkeys"];
var outputJSON = [];
var objectBuild = {}
var sheet_id = null;

/* All the class-names that appear: active, activated */

function clearNavbar(){
	currentMode = null;
	$(".select_toggle").removeClass("active");
}

/* 
 * Get the mode name from the id of the
 */
function modeFromToggleName(toggle_id){
	switch(toggle_id){
		case "nav-title":
			return "title";
		case "nav-locale":
			return "locale";
		case "nav-item":
			return "item";
		case "nav-price":
			return "price";
		case "nav-subclass":
			return "subclass";
		default:
			return null;
	}
}

/*
 * Returns the current mode: title, locale, item, price, subclass
 */
function getCurrentClass(){
	return currentMode;
}

function unhighlightAll(){
	var active_ids = $(".activated").each(function() {
    	return this.id;
	});

	for(var key in active_ids){
		unhighlightAttributes(key, false, false);
	}
}

function resetRound(){
	currentMode = null;
	resetToggles(null);
	unhighlightAll();
	resetMarking('price');
	resetMarking('item');
	resetMarking('subclass1');
	resetMarking('subclass2');
	resetMarking('subclass_1');
	resetMarking('subclass_2');
	resetMarking('locale');
	resetMarking('title');
	subclassColorIndex = 1;
	objectBuild = {};
}

function roundInProgress(){
	for(var key in cellsToAdd){
		if(cellsToAdd[key] > 0) return true;
	}

	return false;
}

/* Called any time the toggle is switched from one mode to another */
function saveState(oldState){
	// console.log("calling save state with old mode: " + oldState);

	switch (oldState){
		case "price":
			objectBuild.price = $(".price");
			cellsToAdd["price"] = $(".price").length;
			return true;
		
		case "item":
			items = $(".item");
			objectBuild.item = items;
			cellsToAdd["item"] = $(".item").length;
			return true;

		case "subclass":
			var subclasses = $(".new_subclass");
			subclasses.removeClass("new_subclass");
			var subclasses_clean = []
			var subclass_tag = "subclass_" + subclassColorIndex;

			for (var i = 0; i < subclasses.length; i++)
			{
				var sub = {}
				sub.loc = subclasses.get(i).id;
				sub.val = subclasses.get(i).innerHTML;
				subclasses_clean.push(sub);
			}

			if (subclasses_clean.length > 0){
				objectBuild[subclass_tag] = subclasses_clean;
				cellsToAdd[subclass_tag] = subclasses_clean.length;
				subclassColorIndex += 1;
			}
			return true;

		case "locale":
			var loc = $(".locale");
			objectBuild.locale = loc;
			cellsToAdd["locale"] = $(".locale").length;
			return true;

		default:
			return false;
	}
}

function resetToggles(currentstate){
	states = ["nav-price", "nav-item", "nav-subclass", "nav-locale",
			   "nav-title", "add"];
    for (state in states){
    	parent = $("#"+states[state]);
    	// .parent()
		parent.removeClass("disabled");
		parent.removeClass("active");
    }
}


function toggleOff(oldState){
	buttonMap = {"price":"nav-price", "item":"nav-item", "subclass":"nav-subclass", "locale":"nav-locale"}
	$("#"+buttonMap[oldState]).removeClass("active");
	// .parent().removeClass("active");
}

function processToggleClick(toggle_id){
	unhighlightAll();
	var isActive = $("#"+toggle_id).hasClass("active");
	// .parent().hasClass("active");
	var oldMode = currentMode;

	if(oldMode){
		var result = saveState(oldMode);
		if (result) {
			toggleOff(oldMode);
			// switchToggles(oldMode);
		}
	}
	clearNavbar();
	if(!isActive){
		currentMode = modeFromToggleName(toggle_id);
		$("#"+toggle_id).addClass("active");
		// .parent().addClass("active");

	}
}

function getTitle(){
	if ($(".title").length > 0){
		return $(".title")[0].innerHTML;
	}else{
		return null;
	}
}

function getLocale(){
	if ($(".title").length > 0){
		return  $(".title")[0].innerHTML;
	}else{
		return null;
	}
}

function getItem(){
	var items = $(".item");
	if (items.length > 0){
		return items[0].innerHTML;
	}else{
		return null;
	}
}

function getPrice(){
	var prices = $(".item");
	if (prices.length > 0){
		return prices[0].innerHTML;
	}else{
		return "n/a";
	}
}

function errorCheckElements(){
	errors = [];
	error = false;
	
	if(objectBuild.price == null || objectBuild.item == null){
		errors.push("Please choose at least one price and corresponding item");
		error = true;
	}
	else if (objectBuild.price.length != objectBuild.item.length && objectBuild.item.length != 1){

		errors.push("Please choose one corresponding item for each price chosen or one item for the entire set of prices");
		error = true; 
	}
	
	if(objectBuild.locale && objectBuild.locale.length > 1){
		errors.push("Please choose one locale per set of prices");
		error = true;
	}

	if (objectBuild.subclass_1 && objectBuild.subclass_1.length > 0){
		if (objectBuild.subclass_1.length != 1 && objectBuild.subclass_1.length != objectBuild.price.length){
				errors.push("Please choose one corresponding subclass element for each price chosen or one subclass for the entire set of prices");
				error = true;
		}
	}

	if (objectBuild.subclass_2 && objectBuild.subclass_2.length > 0){
		if (objectBuild.subclass_2.length != 1 && objectBuild.subclass_2.length != objectBuild.price.length){
				errors.push("Please choose one corresponding subclass element for each price chosen or one subclass for the entire set of prices");
				error = true;
		}
	}

	if(error){
		resetRound();
		currentMode = null;
		resetToggles(null);
		alert(errors.join('\n'));
		objectBuild = {}
		return true;
	}

	return false;
}

/* If number of prices in this group is n, then number
 * of fields may be either 1 or n. This method returns either
 * that one field or the i'th field for the i'th price
 */
var get_from_singleton_or_array = function(field,i){
	if (field){
		if (field.length == 1){
			return field[0];
		}else {
			return field[i]
		}
	}
	else {
		return null;
	}
}


function addElements(){
	if(errorCheckElements()) return;	
	var locale = null;
	if (objectBuild.locale === undefined || objectBuild.locale.length == 0){
		objectBuild.locale = null;
	}else {
		locale = {}
		locale.val = objectBuild.locale[0].innerHTML;
		locale.loc = objectBuild.locale[0].id;
	}

	// console.log("Adding:");
	// console.log(objectBuild);
	// console.log("The locale is: ");
	// console.log(objectBuild.locale);
	for (var price_i = 0; price_i < objectBuild.price.length; price_i++){
		if(objectBuild.price.eq(price_i).hasClass("processedPrice")) continue; 
		var price = {val: objectBuild.price[price_i].innerHTML, loc: objectBuild.price[price_i].id};
		var item_i = get_from_singleton_or_array(objectBuild.item,price_i);
		var item = {val: item_i.innerHTML, loc: item_i.id};
		var l = new Label().from_fields(
										price, 
										item,
										get_from_singleton_or_array(objectBuild.subclass_1, price_i),
										get_from_singleton_or_array(objectBuild.subclass_2, price_i),
										locale
										)
		outputJSON.push(l);
	}

	objectBuild = {};
}

function resetMarking(markingName){
	var items = $("." + markingName);
	items.removeClass(markingName);
}

function resetPriceMarkings(){
	prices = $('.price');
	prices.addClass('processedPrice');
	resetRound();
}

function sendAjax(sheet_id, data){
	$.ajax({
	    type : "POST",
	    url : "/upload/" + sheet_id,
	    data: JSON.stringify(data),
	    contentType: 'application/json',
	    success: function(result) {
	    	var saveButton = new Button("#publish", "Save", "saving...");
	    	saveButton.disable();
	    	toastr.success(result, 'Saved!')
	    	saveButton.enable();
	    }
	});
}

/* Button: UI element that changes based on events 
 */ 
function Button(tag, text_on, text_off) {
	this.button = $(tag);
	this.disable = function(){
		this.button.text(text_off)
		this.button.addClass("disabled");
	}
	this.enable = function(){
		this.button.text(text_on)
		this.button.removeClass("disabled");
	}
}



/* Called when the "Add" button is pressed. The object build object gets converted 
 * to a list of price labels */
function processAdd(){
	addElements();
	resetPriceMarkings();
	resetToggles(currentMode);
	currentMode = null;

}

function saveAjax(){
	console.log("Saving");
	var sheet_id = $("#sheet_id").html();
	data = {};
	data["labels"] = $.map(outputJSON, function(v,i) { return v.to_flat() });
	// console.log(data['labels']);
	data["vendor"] = $("#new-vendor").val();
	sendAjax(sheet_id, data);
}

function findJSONObject(id){
	for (var key in outputJSON){
		if(outputJSON[key] && outputJSON[key].price.loc == id){
			return outputJSON[key];
		}
	}


}

function unhighlightAttributes(id, active, toDelete){
	if(!active){
		var object = findJSONObject(id);
		for(var key in object){
			if(key == 'locale' && object[key]){
				$("#"+object[key].loc).removeClass('activeLocale');

			} else if (key == 'item' && object[key]){
				$("#"+object[key].loc).removeClass('activeItem');

			} else if (key == 'price' && object[key]){
				// $("#j"+object[key].loc).removeClass('lineItemActive');
				// $("#j"+object[key].loc).removeClass('activePrice');
				$("#j"+object[key].loc).removeClass();
				if(toDelete){
					$("#"+object[key].loc).removeClass();
					$("#"+object[key].loc).addClass('cell');

				} else {
					// $("#"+object[key].loc).removeClass('processedPrice'))
					$("#"+object[key].loc).removeClass();

					$("#"+object[key].loc).addClass('cell');

					$("#"+object[key].loc).addClass('processedPrice');
					// $("#"+object[key].loc).removeClass('activePrice');

				}
			} 
			else if (key == "subclass_1" && object[key]) {
					$("#" + object[key].loc).removeClass();
					$("#j" + object[key].loc).removeClass();
					$("#" + object[key].loc).addClass('cell');
			}
			else if (key == "subclass_2" && object[key]) {
					$("#" + object[key].loc).removeClass();
					$("#j" + object[key].loc).removeClass();
					$("#" + object[key].loc).addClass('cell');
			}
		}
	}

}

function highlightAttributes(id){
	var object = findJSONObject(id);
	for(key in object){
		if(key == 'locale' && object[key]){
			$("#"+object[key].loc).addClass('activeLocale');

		} else if (key == 'item' && object[key]){
			$("#"+object[key].loc).addClass('activeItem');

		} else if (key == 'price' && object[key]){
			$("#"+object[key].loc).removeClass('processedPrice');
			$("#"+object[key].loc).addClass('activePrice');
			$("#j"+object[key].loc).addClass('activePrice');

		} else if (key == 'subclass_1' && object[key]){
			// for(subclass in object[key]){
			$("#" + object[key].loc).addClass('activeSubclass');
		}
		else if (key == 'subclass_2' && object[key]){
			// for(subclass in object[key]){
			$("#" + object[key].loc).addClass('activeSubclass');
		}
		
	}
}


function cleanHTML(elemID){
	var h = $(elemID).html();
	
	var s = h.replace(/\\\"/g,'\"');
	s = s.trim();
	s = s.replace(/NaN/g, "null");
	if (s.charAt(0)=='\"') s=s.substring(1,s.length - 1);
	if (s.charAt(s.length - 1)=='\"') s=s.substring(0,s.length -1);
	return s;
}

function initializeJSONCells(){
	try{
		// console.log("Entering Initialize");
		// console.log("There are " + outputJSON.length + " labels");
		for (var key in outputJSON){
			if(outputJSON[key] && outputJSON[key].price){
				$("#"+outputJSON[key].price.loc).addClass('processedPrice');
			}
		}
		
		
	} catch(err){
		// console.log("Error in initializing JSON cells")
	}
}


function deleteObjects(){
	objectsToDelete = document.getElementsByClassName("activated");
    for(object in objectsToDelete){

    	var objID = objectsToDelete[object].id;
    	if(objID){
			for (var key=0; key < outputJSON.length; key++){
				if(outputJSON[key] && outputJSON[key].price.loc == objID){
					unhighlightAttributes(objID,false, true);
					outputJSON.splice(key, 1);
					key--;
				}
			}
    	}
   	}
   	var sheet_id = $("#sheet_id").html();
	// saveAjax();
}

function switchOption(id){
	for(key in options){
		$("#"+options[key]).addClass("invisible");
		$("#options-"+options[key]).removeClass("active");
	}
	$("#"+id).removeClass("invisible");
	$("#options-"+id).addClass("active");

}

function switchHelpTabs(id){
	for(key in helpTabs){
		$("#"+helpTabs[key]).addClass("invisible");
		$("#help-"+helpTabs[key]).removeClass("active");
	}
	$("#"+id).removeClass("invisible");
	$("#help-"+id).addClass("active");

}

function adjustHeight(){
	adjustFactor = 0.8;
	if ($(window).height() < 400) adjustFactor = 0.65;
	height = $(window).height()*adjustFactor;
	$("#spreadsheet_container").height(height);
	$(".options").height(height);
}


/* represents the label object */
function Label() {
	this.get_loc = function(el1, el2){
		if (el1 != null && el2 != null){
			return "" + Math.floor(el1) + "_" + Math.floor(el2);
		}else{
			return null;
		}	
	}
	this.empty_subclass = function(){ return {'val' : null, 'loc': null} };
	this.option = function(field){ if (field) {return field} else {return this.empty_subclass()}}
	this.optionExtract = function(field) {if (field) {return {'val': field.innerHTML, 'loc': field.id}} else {return this.empty_subclass()}} 
	this.loc_y = function(val){
		if (val == null) return null;
		return parseInt(val.split("_")[0])
	}

	this.loc_x = function(val){
		if (val == null) return null;
		return parseInt(val.split("_")[1])
	}

	/* create a Label object from a flat representation of the label */
	this.from_flat = function(f){
		this.price = {val: f.price_val, loc: this.get_loc(f.price_y, f.price_x)}
		this.subclass_1 = {val: f.subclass_1_val, loc: this.get_loc(f.subclass_1_y, f.subclass_1_x)}
		this.subclass_2 = {val: f.subclass_2_val, loc: this.get_loc(f.subclass_2_y, f.subclass_2_x)}
		this.locale = {val: f.locale_val, loc: this.get_loc(f.locale_y, f.locale_x)}
		this.item = {val: f.item_val, loc: this.get_loc(f.item_y, f.item_x)}
		this.category_val = f.category_val;
		this.category_confidence = f.category_confidence;
		this.confidence = f.confidence;

		this._flat = f;

		return this;
	}

	/* pass in subset of the variables to create the object */
	this.from_fields = function(price, item, subclass_1, subclass_2, loc){

		this.price = price;
		this.item = item;
		this.subclass_1 = this.option(subclass_1);
		this.subclass_2 = this.option(subclass_2);

		// alert(JSON.stringify(loc));
		var added_loc = this.option(loc);
		// console.log("As it appears in the Label object:")
		// console.log(added_loc);
		this.locale = this.option(loc);
		this.category_val = null;
		this.category_confidence = 0;
		this.confidence = 1;
		// console.log(this);
		return this;
	}

	/* create flat representation of this Label object */
	this.to_flat = function(){
		flat = {}
		flat.price_val = this.price.val
		flat.price_x = this.loc_x(this.price.loc)
		flat.price_y = this.loc_y(this.price.loc)

		flat.item_val = this.item.val;
		flat.item_x = this.loc_x(this.item.loc)
		flat.item_y = this.loc_y(this.item.loc)

		flat.subclass_1_val = this.subclass_1.val;
		flat.subclass_1_x = this.loc_x(this.subclass_1.loc)
		flat.subclass_1_y = this.loc_y(this.subclass_1.loc)

		flat.subclass_2_val = this.subclass_2.val;
		flat.subclass_2_x = this.loc_x(this.subclass_2.loc)
		flat.subclass_2_y = this.loc_y(this.subclass_2.loc)

		flat.locale_val = this.locale.val;
		flat.locale_x = this.loc_x(this.locale.loc)
		flat.locale_y = this.loc_y(this.locale.loc)

		flat.category_val = this.category_val;
		flat.category_confidence = this.category_confidence;
		flat.confidence = this.confidence;

		flat.sheet_id = sheet_id
		return flat;
	}
}

ajax_label_data = undefined;

function read_data(sheet_id){
	//html = cleanHTML('#line-item');
	$.ajax({
	   	 	type : "GET",
	    	url : "/labels/" + sheet_id,
	    	success: function(result) {
	        	var received_data = JSON.parse(result);
	        	ajax_label_data = received_data;
				var data_array = [];

	        	$.each(received_data, function(i, v) {
					data_array.push((new Label()).from_flat(v));
				});
				outputJSON = data_array;

				/* initialize cells, add processedPrice class name to the prices */
			  	initializeJSONCells();
			  	resetRound();
	    	}
		});
}	


$(document).ready(function(){
	/* fit the spreadsheet to the window */
	adjustHeight();

	/* read in the data, hidden in the div, then update the global variable */
	sheet_id = $("#sheet_id").html();

	read_data(sheet_id);
	//outputJSON = read_data(sheet_id);

	/* initialize cells, add processedPrice class name to the prices */
  	//initializeJSONCells();
  	//resetRound();

  	$('.paginated').each(function() {
	    var currentPage = 0;
	    var numPerPage = 50;
	    var $table = $(this);
	    $table.bind('repaginate', function() {
	        $table.find('tbody tr').hide().slice(currentPage * numPerPage, (currentPage + 1) * numPerPage).show();
	    });
	    $table.trigger('repaginate');
	    var numRows = $table.find('tbody tr').length;
	    var numPages = Math.ceil(numRows / numPerPage);
	    var $pager = $('<div class="pager"></div>');
	    for (var page = 0; page < numPages; page++) {
	        $('<span class="page-number"></span>').text(page + 1).bind('click', {
	            newPage: page
	        }, function(event) {
	            currentPage = event.data['newPage'];
	            $table.trigger('repaginate');
	            $(this).addClass('active_page').siblings().removeClass('active_page');
	        }).appendTo($pager).addClass('clickable');
	    }
	    $pager.insertAfter($table).find('span.page-number:first').addClass('active_page');
	})

  	
  	$(window).resize(function(){
  		adjustHeight();
  	}) 

  	$(".cell").mousedown(function () {
      isMouseDown = true;

      	$(this).toggleClass(getCurrentClass());
     	if (getCurrentClass() == "subclass"){
        	$(this).toggleClass("subclass_" + subclassColorIndex );
        	$(this).toggleClass("new_subclass");
        } else if($(this).hasClass("selected")){
    		highlightAttributes($(this).attr("id"));
    		$("#find").text(String("Search: "+$(this).attr("id")));
    		$("#find").attr("href", "#j" + $(this).attr("id"));

    		$(this).addClass("activated");
    		activatedIDs[$(this).attr("id")] = $(this).attr("id");
      	} else if ($(this).hasClass("activated")){
      	 	unhighlightAttributes($(this).attr("id"), false, false);
      	 	$(this).removeClass("activated");
      	 	delete activatedIDs[$(this).attr("id")];

      	} else if ( $(this).hasClass("processedPrice") && getCurrentClass()) {
      		isMouseDown = false;
      		$(this).toggleClass(getCurrentClass());
      		alert("This cell has already been listed as a price. If you wish to edit it, delete it and add it once more.");
      	}
     return false; // prevent text selection

    })
    .mouseover(function () {
      if (isMouseDown) {
      	$(this).toggleClass(getCurrentClass());
        if (getCurrentClass() == "subclass"){
        	$(this).toggleClass("subclass_" + subclassColorIndex );
        	$(this).toggleClass("new_subclass");
        } else if($(this).hasClass("processedPrice") && getCurrentClass() == null 
        		&& !$(this).hasClass("activated")){
    		highlightAttributes($(this).attr("id"));
      		$(this).addClass("activated");
    		activatedIDs[$(this).attr("id")] = $(this).attr("id");

      		$("#find").text(String("Search: "+$(this).attr("id")));
      		$("#find").attr("href", "#j" + $(this).attr("id"));
      	} else if($(this).hasClass("activated")){
      		$(this).removeClass("activated");
      	 	unhighlightAttributes($(this).attr("id"), false, false);
      		delete activatedIDs[$(this).attr("id")];

      	}
      } else if($(this).hasClass("processedPrice") && getCurrentClass() == null && !roundInProgress()){ /* mouse not down */
      		$(this).addClass("selected");
      		highlightAttributes($(this).attr("id"));
      }
    })
    .mouseout(function(){
    	if($(this).hasClass("selected")){
    		$(this).removeClass("selected");
    		unhighlightAttributes($(this).attr("id"), $(this).hasClass("activated"), false);
    	}
    });

    $(document).keypress(function(e) {
    	if (e.which == 97) { /* pressed a */
    		processToggleClick("nav-price");
    	} else if (e.which == 115) { /* pressed s */
    		processToggleClick("nav-item");
    	} else if (e.which == 100) { /* pressed d */
    		processToggleClick("nav-locale");
    	} else if (e.which == 102) { /* pressed f */
    		processToggleClick("nav-subclass");
    	} 
    	else if (e.which == 120) { /* pressed x */
    		processToggleClick(getCurrentClass());
    		processAdd();
    		cellsToAdd = {};
    	} else if (e.which == 116){
    		deleteObjects();
    		// saveAjax();

    	}
	});

    $('#nav-price').on("click",function(){
		processToggleClick("nav-price");
		return false;
	});

	$('#nav-item').on("click",function(){
		processToggleClick("nav-item");
		return false;
	});

	$('#nav-locale').on("click",function(){
		processToggleClick("nav-locale");
		return false;
	});

	$('#nav-subclass').on("click",function(){
		processToggleClick("nav-subclass");
		return false;
	});


	$("#add").on("click", function(){
    	processToggleClick(getCurrentClass());
		processAdd();
		cellsToAdd = {};
		// saveAjax();
		return false; // prevent default
	});

	$("#reset").on("click", function(){
		resetRound();
		currentMode = null;
		resetToggles(null);
		return false; // prevent default
	});

	$(".navlink").on("click", function(){
		return false;
	});

	$("#delete").on("click",function(){
		deleteObjects();
		// saveAjax();
		return false;
	});

	$("#options-stats").on("click",function(){
		switchOption("stats");
	});

	$("#options-json").on("click",function(){
		switchOption("json");
	});

	$("#options-line-item").on("click",function(){
		switchOption("line-item");
	});

	$("#help").on("click",function(){
		$("#helpModal").modal(options);
	})

	$("#help-overview").on("click",function(){
		switchHelpTabs("overview");
	})

	$("#help-adding").on("click",function(){
		switchHelpTabs("adding");
	})

	$("#help-removing").on("click",function(){
		switchHelpTabs("removing");
	})	

	$("#help-editing").on("click",function(){
		switchHelpTabs("editing");
	})


	$("#help-hotkeys").on("click",function(){
		switchHelpTabs("hotkeys");
	})

	$("#delete_all").on("click",function(){
		$("#deleteAllModal").modal();
	})

	$('#ok-delete-all').on("click",function(){
		$(".processedPrice").each(function(){
				$(this).addClass("activated");
		});
		deleteObjects();
	})

	$("#publish").on("click",function(){
		saveAjax();
	})

	$("#new-vendor-btn").on("click",function(){
		$('#addVendorModal').modal(options);
    })

    $("#ok-vendor").on("click",function(){
    	vendorToAdd = $("#vendor-name").val();
    	if(vendorToAdd != null && vendorToAdd.trim() != ''){
            $("#new-vendor").append("<option value='"+vendorToAdd
            +"' selected='selected'>"+vendorToAdd+"</option>");
        } 
        // saveAjax();
    })


    $("#new-vendor").on("change",function(){
    	// saveAjax();
    })


    $("#new-product").on("click",function(){
        var productToAdd = prompt("What is the name of the product you would like to add?", "e.g. Cabbage 24 Wrap");
        if(productToAdd != null){
            $(".product_list").append("<option value='"+productToAdd
            +"' selected='selected'>"+productToAdd+"</option>");
            $(this).parent().find(".custom-combobox").find(".custom-combobox-input").val(productToAdd);
        }
        // saveAjax(); NEED TO SAVE AJAX FOR PRODUCTS
    })


    $("#product_list").on("change",function(){
        // saveAjax(); NEED TO SAVE AJAX FOR PRODUCTS
    })

    $("#category_list").on("change",function(){
        // saveAjax(); NEED TO SAVE AJAX FOR CATEGORIES
    })

    

    

    $("#pull").on("click", function(){

    	$.ajax({
	   	 	type : "GET",
	    	url : "/pull",
	    	success: function(result) {
	        	alert(result);
	    	}
		});
    })

    $(".ready_check").on("click",function(){
    	if( $(this).is(":checked")){
    		$(this).parent().parent().find(".category").removeClass("low_conf");
    		$(this).parent().parent().find(".product_name").removeClass("low_conf");
    	} else {
    		$(this).parent().parent().find(".category").addClass("low_conf");
    		$(this).parent().parent().find(".product_name").addClass("low_conf");
    	}

    })

    $("#machine_label_btn").on("click",function(){
		$('#restoreMachineModal').modal(options);
    // 	window.setTimeout(location.reload(),1000);
    // 	return confirm("If you restore the machine labels, you'll lose any edits you've made in the past. Press 'OK' if you wish to continue.")
    })

    $("#ok-machine-labels").on("click",function(){
    	window.location.href="/file/{{id}}/machine/use";
    })

});

$(document)
.mouseup(function () {
  isMouseDown = false;
});

$(document).ready(function(){


(function( $ ) {
    $.widget( "custom.combobox", {
      _create: function() {
        this.wrapper = $( "<span>" )
          .addClass( "custom-combobox" )
          .insertAfter( this.element );
 
        this.element.hide();
        this._createAutocomplete();
        this._createShowAllButton();
      },
 
      _createAutocomplete: function() {
        var selected = this.element.children( ":selected" ),
          value = selected.val() ? selected.text() : "";
 
        this.input = $( "<input>" )
          .appendTo( this.wrapper )
          .val( value )
          .attr( "title", "" )
          .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
          .autocomplete({
            delay: 0,
            minLength: 0,
            source: $.proxy( this, "_source" )
          })
          .tooltip({
            tooltipClass: "ui-state-highlight"
          });
 
        this._on( this.input, {
          autocompleteselect: function( event, ui ) {
            ui.item.option.selected = true;
            this._trigger( "select", event, {
              item: ui.item.option
            });
          },
 
          autocompletechange: "_removeIfInvalid"
        });
      },
 
      _createShowAllButton: function() {
        var input = this.input,
          wasOpen = false;
 
        $( "<a>" )
          .attr( "tabIndex", -1 )
          .attr( "title", "Show All Items" )
          .tooltip()
          .appendTo( this.wrapper )
          .button({
            icons: {
              primary: "ui-icon-triangle-1-s"
            },
            text: false
          })
          .removeClass( "ui-corner-all" )
          .addClass( "custom-combobox-toggle ui-corner-right" )
          .mousedown(function() {
            wasOpen = input.autocomplete( "widget" ).is( ":visible" );
          })
          .click(function() {
            input.focus();
 
            // Close if already visible
            if ( wasOpen ) {
              return;
            }
 
            // Pass empty string as value to search for, displaying all results
            input.autocomplete( "search", "" );
          });
      },
 
      _source: function( request, response ) {
        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
        response( this.element.children( "option" ).map(function() {
          var text = $( this ).text();
          if ( this.value && ( !request.term || matcher.test(text) ) )
            return {
              label: text,
              value: text,
              option: this
            };
        }) );
      },
 
      _removeIfInvalid: function( event, ui ) {
 
        // Selected an item, nothing to do
        if ( ui.item ) {
          return;
        }
 
        // Search for a match (case-insensitive)
        var value = this.input.val(),
          valueLowerCase = value.toLowerCase(),
          valid = false;
        this.element.children( "option" ).each(function() {
          if ( $( this ).text().toLowerCase() === valueLowerCase ) {
            this.selected = valid = true;
            return false;
          }
        });
 
        // Found a match, nothing to do
        if ( valid ) {
          return;
        }
 
        // Remove invalid value
        this.input
          .val( "" )
          .attr( "title", value + " didn't match any item" )
          .tooltip( "open" );
        this.element.val( "" );
        this._delay(function() {
          this.input.tooltip( "close" ).attr( "title", "" );
        }, 2500 );
        this.input.autocomplete( "instance" ).term = "";
      },
 
      _destroy: function() {
        this.wrapper.remove();
        this.element.show();
      }
    });
  })( jQuery );
 
  $(function() {
    $( ".combobox" ).combobox();
    $( "#toggle" ).click(function() {
      $( ".combobox" ).toggle();
    });
  });
});

