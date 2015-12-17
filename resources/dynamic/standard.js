/* standard_default.js */
$(window).load(function() {
	$('#adc_{%= CurrentADC.InstanceId %}').adcPinboard({
		
		maxWidth : '{%= CurrentADC.PropValue("maxWidth") %}',
		controlWidth : '{%= CurrentADC.PropValue("controlWidth") %}',
		controlAlign : '{%= CurrentADC.PropValue("controlAlign") %}',
		imagePath : '{%= CurrentADC.PropValue("imagePath") %}',
		popupQText : '{%= CurrentADC.PropValue("popupQText") %}',
		showCounter : {%= (CurrentADC.PropValue("showCounter") = "1") %},
		items : [
			{%:= CurrentADC.GetContent("dynamic/standard_open.js").ToText()%}
		]
	});
});