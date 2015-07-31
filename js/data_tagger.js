/*###################################################################
File: data_tagger.js
Vocabulary:
    • 'Tag': refers to an identification given to a string of words
    • 'Label': refers to actualy name of the identification given to 
               a string of words

        e.g.   The husky ran. --> This is *tagged* with a 'dog' *label* to
                produce the following:

                The <dog> husky </dog> ran.

Function: Affords a user the following functionality:
    • Upload batches of text files
    • Create custom labels of the followng: <'label'></'label'
    • Individually tag each text file by surrounding pieces of
      text with desired tags. This can be done in 1 of 2 ways:
        • Search through the text and tag everything that is highlighted
        • Manually select text and tag it.
    • Copy all json to the clipboard.

###################################################################*/


/*###################################################################*/
/*###################################################################*/
/*#################### Tagging Text Data ############################*/
/*###################################################################*/
/*###################################################################*/


// =====[ Gets selected text and colors it with appropriate label color ]=====
function getSelectionText() {
    if (window.getSelection) {
    	//gets selected text
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        //gets selected text
        text = document.selection.createRange().text;
    }
    return text;
}

//=====[ Returns the name of the label that is currently being used to tag data ]=====
function getCurrentLabel(){
    return $(".labelActive").html();
}

//=====[ Highlights text manually selected by the user  ]=====
function highlightSelection() {
    var range, text;
    var label = getCurrentLabel();
    var color= colors[label];
    var text = getSelectionText();
    //html used to tag the text colors the desired label by surrounding it with a span tag 
    var html =  "<span style=\"color:"+color+"\">&lt;"+label+"&gt;</span>"+text+"<span style=\"color:"+color+"\">&lt;\/"+label+"&gt;</span>";

    //replaces the text with the tagged, colored text
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
    //browser compatability
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        range.pasteHTML(html);
    }
    return text;
}



//=====[ Adds a piece of text to the dictionary mapping labels to strings]=====
function addTag(text){
    if(text=="") return;
    var label = getCurrentLabel();
    
    var filename = $(".fileActive").attr("id");
    var jsonString = fileList[filename][fileIndex.JSON];
    
    //initializes dictionary if it doesn't already exist
    var dict = {};
    if(!jsonString=='') dict = JSON.parse(jsonString);
    if(!dict[label]){
        dict[label] = new Array(text);
    } else {
        dict[label].push(text);
    }
    fileList[filename][fileIndex.JSON] = JSON.stringify(dict);
    $("#tagged_data").html(JSON.stringify(dict));
}


/*###################################################################*/
/*###################################################################*/
/*#################### Adding New Labels ############################*/
/*###################################################################*/
/*###################################################################*/


//=====[ Adds new button for a user-created tagging label  ]=====
function addLabelButton(label, color){

    colors[label] = color;    
    var button = document.createElement("button");

    //Assign different attributes to the button. 
    button.setAttribute("class", "btn btn-default userButton");
    button.setAttribute("id", label);
    button.setAttribute("data-original-title",label);
    button.style.backgroundColor = color;
    button.style.color= "white";
    button.style.fontWeight= "bold";
    button.innerHTML = label;

    //bind event listener to the button
    button.addEventListener("click",function(){
        $(".labelActive").removeClass("labelActive");
        $(this).addClass("labelActive");
        var currLabel = $(this).attr("id");
        $("#current_label").html("<span style=\"color:"+colors[label]+";\">"+label+"</span>");
    });
    
    var parent = $("#labels");
    
    //Append the button to div (in span). 
    parent.append(button);
}

//=====[ Adds user-created label to the list of stored labels as well as creating a new label button  ]=====
function appendNewLabel() {
    var new_label = $("#new_label_label").val();
    var color = $("#color_picker").val();
    
    //makes sure the label exists
    if(new_label){
        labels.push(new_label); //adds label to existing array of labels
        $("#new_label_label").val('');  //resets the input box for the next label
        addLabelButton(new_label, color);
    }
}

/*###################################################################*/
/*###################################################################*/
/*############### Uploading and Managing Files ######################*/
/*###################################################################*/
/*###################################################################*/


//=====[ Used to enumerate through the various fields for each file in fileList  ]=====
var fileIndex = {
    CLEAN: 0,
    TAGGED: 1,
    HTML: 2,
    JSON: 3,
}

//=====[ Adds a new button corresponding to a given file. Allows  ]=====
//=====[ the user to switch between text files  ]=====
function addFileButton(name){
    
    var button = document.createElement("button"); 

    //Assign different attributes to the button. 
    button.setAttribute("class", "btn btn-default userButtonFile");
    button.setAttribute("id", name);
    button.setAttribute("data-original-title",name);
    button.setAttribute("data-toggle","tooltip");
    button.innerHTML = name;

    //binds event to button to display the appropriate file
    button.addEventListener("click",function(){
        displayFile($(this).attr("id"), this);
    });
    
    var parent = $("#files");
    
    //Append the button to div (in span). 
    parent.append(button);

    //sets tooltips to display full filenames when file buttons are hovered over
    $('[data-toggle="tooltip"]').tooltip({
        animated: 'fade',
        placement: 'bottom',
    }); 
}


//=====[ Displays the file corresponding to the given filename in the text data div  ]=====
function displayFile(fileName){
    //Saves edits made to the active file
    if(fileActive){
        (fileList[$(".fileActive").attr("id")])[fileIndex.TAGGED] = $("#text_area").text();
        console.log($("#text_area").text());
        (fileList[$(".fileActive").attr("id")])[fileIndex.HTML] = $("#text_area").html();
        (fileList[$(".fileActive").attr("id")])[fileIndex.JSON] = $("#tagged_data").html();
        $(".fileActive").removeClass("fileActive");
    }

    var file = "#"+fileName;
    $(file).addClass("fileActive");
    fileActive = true;

    //Sets the appropriate fields to display the current file
    $("#file_name").html("Raw Data: <b>"+ fileName+"</br>");
    $("#text_area").html(fileList[fileName][fileIndex.HTML]);
    $("#tagged_data").html(fileList[fileName][fileIndex.JSON]);
}

//=====[ Loops through an array of files and adds each one to the dashboard  ]=====
function readFiles(files){
    setupReader(files[0],true)
    for (var i = 1; i < files.length; i++) {
        setupReader(files[i], false);
    }
}

//=====[ Reads in a file and adds its contents to the fileList container.  ]=====
//=====[ Adds a new fileButton for each file read in  ]=====
function setupReader(file, display) {
    var name = file.name;
    
    //cuts the prefix off of the filename
    var index = name.indexOf(".")
    if(index <=0) index = name.length;
    name = name.substring(0,index);


    var reader = new FileReader(); 
    console.log("outside of onload"); 
    reader.onload = function(e) {  
        // get file content 
        var text = e.target.result;
        //populates the fileList with a key:val where the key is the filename
        //and the val is [original_text,html_tagged_text,string_tagged_text,json]
        fileList[name] = [text,text,text,''];

        addFileButton(name);
        
        //displays the first file read in
        if(display) displayFile(name);
    }
    reader.readAsText(file, "UTF-8");
}

/*###################################################################*/
/*###################################################################*/
/*############## Document onload initializations ####################*/
/*###################################################################*/
/*###################################################################*/

$(document).ready(function(){

    //initializes global variables
	labelDict = {};    //holds all the json label tags
    labels = [];       //holds a list of all unique labels created by the user
    colors = {};       //maps labels to correspnding colors
    fileList = {};     //holds text data corresponding to each file
    fileActive = false;//recognizes that there is initially no active file
    
    //Adds initial text as a file
    var defaultText = $("#text_area").text();
    var defaultHTML = $("#text_area").html();
    var defaultFileName = "Default";
    fileList[defaultFileName] = [defaultText,defaultText,defaultHTML,''];
    addFileButton(defaultFileName);
    displayFile(defaultFileName);
   
    //===============[ File Initializations  ]===============

    //Called when the file input is triggered. Uploads files.
    $("#text_files").on("change",function(e){
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            readFiles($(this)[0].files);
        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
    });

    //Triggers the file input. Used for stylistic purposes.
    $("#upload_files").on("click",function(){
        $("#text_files").trigger("click");
    });

    //===============[ Label Initializations  ]===============

    //Adds new Label to list of existing user-created labels
    $("#add_label").on("click",function(){
        appendNewLabel();
    })


    //===============[ Tag Initializations  ]===============

    //Called when a key is pressed
    $(document).keypress(function(e) {

        //Checks to make sure a label is selected, and that no text input fields are focused
        if (e.which == 97 && $(".labelActive").length > 0 && !$("#search_bar").is(":focus") && !$("#new_label_label").is(":focus")) { // pressed a
            //Called when 'a' is pressed. Tags highlighted text (both manually and through search)
            //Checks to make sure the div is not currently editable
            if($("#edit_box").is(":checked") && getSelectionText()!=''){
                alert("Please uncheck the edit box before starting to label data!");
                e.preventDefault();
                return;

            } else if($(".highlight").length > 0){
                //adds text that is highlighted through search bar
                var text = document.getElementsByClassName("highlight")[0].innerHTML;
                $("#text_area").removeHighlight();
                $("#text_area").highlight(false, text,colors[getCurrentLabel()], getCurrentLabel());
                addTag(text);
                $("#search_bar").val('');
            }
            //adds text that is manually selected by the user
            addTag(highlightSelection());
        } else if (e.which == 13 && $("#new_label_label").is(":focus")) {
            //Called when 'enter' is pressed. Adds new label.
            appendNewLabel();
        }
    });

    //Called when the edit text data checkbox is changed. Makes the div contentEditable="true"/"false"
    $("#edit_box").change(function() {
        if(this.checked) {
            $("#text_area").attr('contenteditable','true');
        } else {
            $("#text_area").attr('contenteditable','false');
        }
    })

    //Called when the edit labels checkbox is changed. Makes the div contentEditable="true"/"false"
    $("#edit_labels").change(function(){
        if(this.checked) {
            $("#tagged_data").attr('contenteditable','true');
        } else {
            $("#tagged_data").attr('contenteditable','false');
        }
    });

    //Called when a user starts typing in the search bar
    $("#search_bar").keyup(function (e) {
        $("#text_area").removeHighlight();
        var text = $("#search_bar").val();
        $("#text_area").highlight(true, text,"#B1D7FE");
    });

    //Prompts the user with the option to copy relevant json to clipboard
    $("#copy").on("click",function(){
         window.prompt("Copy to clipboard: Ctrl+C, Enter", fileList);
    });

});



