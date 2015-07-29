// =====[ Gets selected text and colors it with appropriate label color ]=====
function getSelectionText() {
    var text = "";
    if (window.getSelection) {

    	//gets selected text
        text = window.getSelection().toString();
        
        //highlights with appropriate color
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode("<span class=\"color\">"+text+"</span>"));
        }
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
        range.text = "<span class=\"color\">"+text+"</span>";
    }
    return text;
}

function replaceSelectedText(replacementText) {
    var sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
        	console.log("ok");
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(replacementText));
        }
    } else if (document.selection && document.selection.createRange()) {
    	console.log("ok");
        range = document.selection.createRange();
        range.text = replacementText;
}
	
function replaceSelectionWithHtml(html) {
    var range, html;
    if (window.getSelection && window.getSelection().getRangeAt(0)) {
        range = window.getSelection().getRangeAt(0);
        range.deleteContents();
        var div = document.createElement("div");
        div.innerHTML = html;
        var frag = document.createDocumentFragment(), child;
        while ( (child = div.firstChild) ) {
            frag.appendChild(child);
        }
        range.insertNode(frag);
    } else if (document.selection && document.selection.createRange()) {
        range = document.selection.createRange();
        range.pasteHTML(html);
    }
}




$(document).ready(function(){
	
	$("#get_text").on("click",function(){

		// var text = getSelectionText();
		// var text = getSelectionText();
		// console.log(text);
		replaceSelectedText("<span>hi</span>");
	})
});

