// =====[ Gets selected text and colors it with appropriate label color ]=====
function getSelectionText() {
    var text = "";
    if (window.getSelection) {

    	//gets selected text
        text = window.getSelection().toString();
        
    
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

function getCurrentLabel(){
    return $(".active").html();
}

function highlightSelection() {
    var range, text;
    var label = getCurrentLabel();
    var color= colors[label];
    var text = getSelectionText();
    var html =  "<span style=\"color:"+color+"\">&lt;"+label+"&gt;</span>"+text+"<span style=\"color:"+color+"\">&lt;\/"+label+"&gt;</span>";

    if (window.getSelection()!=0 && window.getSelection().getRangeAt(0)) {
        range = window.getSelection().getRangeAt(0);
        range.deleteContents();
        var div = document.createElement("div");
        div.innerHTML = html;
        var frag = document.createDocumentFragment(), child;
        while ( (child = div.firstChild) ) {
            frag.appendChild(child);
        }
        range.insertNode(frag);

    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        range.pasteHTML(html);
    }
    return text;
}

function addLabel(text){
    if(text=="") return;
    var label = getCurrentLabel();

    if(!labelDict[label]){
        labelDict[label] = new Array(text);
    } else {
        labelDict[label].push(text);
    }
    $("#tagged_data").html(JSON.stringify(labelDict));
}

function disableButton(){
    $(".disabled").removeClass("disable");
    $(this).addClass("disable");
}

function addLabelButton(label, color){

    colors[label] = color;    
    var button = document.createElement("button"); 

    //Assign different attributes to the button. 
    button.setAttribute("class", "btn-sm label_button");
    button.setAttribute("id", label);
    button.style.color=color;
    button.innerHTML = label;
    button.addEventListener("click",function(){
        $(".active").removeClass("active");
        $(this).addClass("active");
    });
    
    var parent = $("#labels");
    
    //Append the button to div (in span). 
    parent.append(button);
}

function appendNewLabel() {
    var new_label = $("#new_label_label").val();
    var color = $("#color_picker").val();
    if(new_label){
    labels.push(new_label);
        $("#new_label_label").val('');
        addLabelButton(new_label, color);
    }
}

function readFiles(files){
    console.log("in read Files");
    console.log(typeof files);
    if (typeof files != "undefined"){
        console.log("Files are not undefined");
        var reader = new FileReader();
        for (var i= 0, l=files.length; i < l; i++){
            console.log("in for loop");
            reader.onload = function (e) {
                console.log("reader loaded");
                output = e.target.result;
                console.log("output is" + output);
                $("#text_area").html(output);
            }
        }        
    }
}

$(document).ready(function(){
	labelDict = {};
    labels = [];
    colors = {};
    cleanText = $("text_area").text();

	$("#get_text").on("click",function(){
        addLabel(highlightSelection());
	})

    $("#add_label").on("click",function(){
        appendNewLabel();
    })


    $(document).keypress(function(e) {
        if (e.which == 97 && $(".active").length > 0 && !$("#search_bar").is(":focus") && !$("#new_label_label").is(":focus")) { // pressed a
            
            //Makes sure div cannot be editted
            if($("#edit_box").is(":checked") && getSelectionText()!=''){
                alert("Please uncheck the edit box before starting to label data!");
                e.preventDefault();
                return;

            } else if($(".highlight").length > 0){
                //adds text that is highlighted through search bar
                var text = document.getElementsByClassName("highlight")[0].innerHTML;
                $("#text_area").removeHighlight();
                $("#text_area").highlight(false, text,colors[getCurrentLabel()]);
                addLabel(text);
                $("#search_bar").val('');
            }
            //adds text that is manually selected by the user
            addLabel(highlightSelection());
        } else if (e.which == 13 && $("#new_label_label").is(":focus")) {
            appendNewLabel();
        }
    });

    $("#edit_box").change(function() {
        if(this.checked) {
            $("#text_area").attr('contenteditable','true');
        } else {
            $("#text_area").attr('contenteditable','false');
        }
    });

    $("#edit_labels").change(function(){
        if(this.checked) {
            $("#tagged_data").attr('contenteditable','true');
        } else {
            $("#tagged_data").attr('contenteditable','false');
        }
    })

    $("#search_bar").keyup(function (e) {
        $("#text_area").removeHighlight();
        var text = $("#search_bar").val();
        $("#text_area").highlight(true, text,"#B1D7FE");
    });

    $("#text_file").on("change",function(){
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            readFiles($(this)[0].files);
        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
    });

});



