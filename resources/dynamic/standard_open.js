/* standard_open.js */
{% 
Dim i
Dim arr = CurrentQuestion.ParentLoop.ParentLoop.AvailableResponses
Dim ar = CurrentQuestion.ParentLoop.AvailableResponses
Dim inputName
For i = 1 To arr.Count
	inputName = CurrentQuestion.Iteration(ar[1].Index,arr[i].Index).InputName()
	%}
	{element : $('#{%= inputName%}')},
	{%
	inputName = CurrentQuestion.Iteration(ar[2].Index,arr[i].Index).InputName()
	%}
	{element : $('#{%= inputName%}')},
	{%
	inputName = CurrentQuestion.Iteration(ar[3].Index,arr[i].Index).InputName()
	%}
	{element : $('#{%= inputName%}')},
	{%
	inputName = CurrentQuestion.Iteration(ar[4].Index,arr[i].Index).InputName()
	%}
	{element : $('#{%= inputName%}')}{%= On(i < arr.Count, ",", "") %}
{% Next %}