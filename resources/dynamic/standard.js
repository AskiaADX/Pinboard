(function () {
    var pinboard = new Pinboard({
        instanceId: {%= CurrentADC.InstanceId %},
		maxWidth : '{%= CurrentADC.PropValue("maxWidth") %}',
		controlWidth : '{%= CurrentADC.PropValue("controlWidth") %}',
		controlAlign : '{%= CurrentADC.PropValue("controlAlign") %}',
		imagePath : '{%:= CurrentADC.PropValue("imagePath") %}',
		popupQText : '{%:= CurrentADC.PropValue("popupQText") %}',
		showCounter : {%= (CurrentADC.PropValue("showCounter") = "1") %},
      	askComment : {%= (CurrentADC.PropValue("askComment") = "1") %},
        numberOfMoods : {%= CurrentADC.PropValue("numberOfMoods") %},
        singleMoodState : {%= CurrentADC.PropValue("singleMoodState") %},
      	currentQuestion: '{%:= CurrentQuestion.Shortcut %}',
		items : [
			{%:= CurrentADC.GetContent("dynamic/standard_open.js").ToText()%}
		]
    });
} ());
      