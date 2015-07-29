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
    var color= colors[getCurrentLabel()];
    var text = getSelectionText();
    var html = "<span style=\"background-color:"+color+"\">"+text+"</span>";

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
    if(text=="" || labels.length==0) return;
    var label = getCurrentLabel();

    if(!labelDict[label]){
        labelDict[label] = new Array(1);
        labelDict[label].push(text);
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

$(document).ready(function(){
	labelDict = {};
    labels = [];
    colors = {};

	$("#get_text").on("click",function(){
        addLabel(highlightSelection());
	})

    $("#add_label").on("click",function(){
        var new_label = $("#new_label_label").val();
        var color = $("#color_picker").val();
        if(new_label){
            labels.push(new_label);
            $("#new_label_label").val('');
            addLabelButton(new_label, color);
        }
    })


    $(document).keypress(function(e) {
        if (e.which == 97) { /* pressed a */
            addLabel(highlightSelection());
        } 
    });

    $("#edit_box").change(function() {
        if(this.checked) {
            $("#text_area").attr('contenteditable','true');
        } else {
            $("#text_area").attr('contenteditable','false');
        }
    });

});



