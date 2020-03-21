// Bc. Tomáš Jarůšek, 20.3.2020
// Nástroj pro vizualizaci rozsáhlých RDF databází
// Implementováno v JavaScripu za pomoci prvku canvas, načítání databáze probíhá přes REST API (rdf4j API)
// Součást diplomové práce na téma Vizualizace rozsáhlých grafových dat na webu (vedoucí: Ing. Radek Burget Ph.D.), FIT VUTBR 2020

//celkove zpracovani vstupu a rizeni aplikace
class Controller
{
	constructor() 
	{
		this.lastFrameMouseX = 0;
		this.lastFrameMouseY = 0;
		
		this.lastFrameWheelForwardCount = 0;
		this.lastFrameWheelBackwardCount = 0;
		
		this.drawLoadingText = false;
		this.graphIsLoaded = false;
		
		this.lastFrameLeftMouseButtonIsHeld = false;
		this.lastFrameRightMouseButtonIsHeld = false;
		
		this.mouseoverNodesAtTheTimeOfLeftClick = [];
		this.mouseoverNodesAtTheTimeOfRightClick = [];
		
		this.nodesAreMoving = false;
		
		this.mouseMoved = false;
		
		//ulozeni highlighted uzlu
		this.highlightedNodesSave;
	}	

	//logika behu aplikace
	ManageApplication(deltaTime)
	{	
		graph.ClearCanvas();
		
		graph.simplifiedConnections = checkbox1.GetValue();
		graph.showNodeDescription = checkbox2.GetValue();
		
		if (this.graphIsLoaded === true)
		{
			graph.UpdateAllVariablesOnFrameStart();
			
			this.ProcessMouseInputs();
			
			graph.DrawGraph();
		}
		
		if (this.drawLoadingText === true)
		{
			graph.DrawLoadingText();
		}
		
		graph.DrawFramerate(deltaTime);
	}
	
	//zpracovani vstupu mysi
	ProcessMouseInputs()
	{
		//PRIPRAVA----------------------------------------------------
		let mouseoverNodes = graph.GetMouseoverNodes(mouseX, mouseY);
		
		let mouseDeltaX = mouseX - this.lastFrameMouseX;
		let mouseDeltaY = mouseY - this.lastFrameMouseY;
		
		//LOGIKA------------------------------------------------------
		//pohla se mys?
		if (this.lastFrameMouseX !== mouseX || this.lastFrameMouseY !== mouseY)
		{
			this.mouseMoved = true;
		}
		
		if (this.lastFrameLeftMouseButtonIsHeld === false && leftMouseButtonIsHeld === true)
		{
			this.mouseMoved = false;
			this.mouseoverNodesAtTheTimeOfLeftClick = mouseoverNodes.slice(0);
		}
		
		if (this.lastFrameLeftMouseButtonIsHeld === true && leftMouseButtonIsHeld === false)
		{
			if (this.mouseMoved === false)
			{
				for (let i = 0; i < this.mouseoverNodesAtTheTimeOfLeftClick.length; i++)
				{
					this.mouseoverNodesAtTheTimeOfLeftClick[i].ToggleHighlight(graph.highlightedNodes, this.mouseoverNodesAtTheTimeOfLeftClick[i]);
				}
			}
		}
		
		//-------------------------------------------------------------------------
		
		if (this.lastFrameRightMouseButtonIsHeld === false && rightMouseButtonIsHeld === true)
		{
			this.mouseoverNodesAtTheTimeOfRightClick = mouseoverNodes.slice(0);
			
			if (this.mouseoverNodesAtTheTimeOfRightClick.length > 0)
			{
				this.nodesAreMoving = true;
			}
		}
		
		if (this.lastFrameRightMouseButtonIsHeld === true && rightMouseButtonIsHeld === false)
		{
			this.nodesAreMoving = false;
		}
		
		if (this.nodesAreMoving === true && rightMouseButtonIsHeld === true)
		{
			graph.MoveNodes(this.mouseoverNodesAtTheTimeOfRightClick, mouseDeltaX, mouseDeltaY);
		}
		
		//-------------------------------------------------------------------------
		
		//posouvame jen tehdy kdyz se drzi leve tlacitko mysi
		if (leftMouseButtonIsHeld === true && this.nodesAreMoving === false)
		{
			graph.ChangeWiewWindowPosition(mouseDeltaX, mouseDeltaY);
		}
		
		//kladny je smer dopredu(od uzivatele), zaporny je smer dozadu (k uzivateli)
		let finalWheelMovement = (wheelForwardCount-this.lastFrameWheelForwardCount) - (wheelBackwardCount-this.lastFrameWheelBackwardCount);
		
		//delame neco jen kdyz se pohlo s koleckem
		if (finalWheelMovement !== 0 && this.nodesAreMoving === false)
		{
			graph.ChangeWiewWindowScale(finalWheelMovement, mouseX, mouseY);
		}
		
		//ZAVER-------------------------------------------------------
		this.lastFrameWheelForwardCount = wheelForwardCount;
		this.lastFrameWheelBackwardCount = wheelBackwardCount;
		
		this.lastFrameMouseX = mouseX;
		this.lastFrameMouseY = mouseY;
		
		this.lastFrameLeftMouseButtonIsHeld = leftMouseButtonIsHeld;
		this.lastFrameRightMouseButtonIsHeld = rightMouseButtonIsHeld;
	}
	
	//primarne ke zmene vykreslovaciho modu, kdy trojice zustanou stejny, ale graf se musi prekreslit
	Redraw()
	{
		if (graph.allNodes.length === 0)
		{
			this.graphIsLoaded = true;
			return;
		}
		
		this.graphIsLoaded = false;
		
		if (dropdownMenu1.GetValue() === "Greedy grid")
		{
			graph.DistributeNodesInPlane_GREEDY();
		}
		else if (dropdownMenu1.GetValue() === "Greedy grid + swaps")
		{
			graph.DistributeNodesInPlane_GREEDYSWAP();
		}
		else if (dropdownMenu1.GetValue() === "Force-directed")
		{
			graph.DistributeNodesInPlane_FORCES();
		}
		
		this.graphIsLoaded = true;
	}
	
	//nactou se namespacy, pak cela databaze
	LoadNamespacesThenWholeDatabase()
	{
		this.graphIsLoaded = false;
		this.drawLoadingText = true;
		
		graph.ClearGraph();
	
		sPARQLAdapter.SetServer(textBoxTextMode3.GetValue());
		sPARQLAdapter.SetRepository(textBoxTextMode1.GetValue());
		
		
		this.LoadNamespacesThenWholeDatabase_TRIGGER_STEP1();
	}
	
	//nactou se namespacy, pak uzel podle vstupu uzivatele
	LoadNamespacesThenLoadNodeFromUserInput()
	{
		this.graphIsLoaded = false;
		this.drawLoadingText = true;

		graph.ClearGraph();
	
		sPARQLAdapter.SetServer(textBoxTextMode3.GetValue());
		sPARQLAdapter.SetRepository(textBoxTextMode1.GetValue());
		
		this.RequestNamespacesThenLoadNodeFromUserInput_TRIGGER_STEP1();
	}
	
	//nactou se sousedi zvyraznenych uzlu
	ExpandHighlightedNodes()
	{
		if (graph.highlightedNodes.size === 0)
		{
			return;
		}
		
		this.graphIsLoaded = false;
		this.drawLoadingText = true;
		
		this.highlightedNodesSave = [];

		let longNameNodesList = [];

		for (let highlightedNode of graph.highlightedNodes.values())
		{
			this.highlightedNodesSave.push(highlightedNode);
			
			longNameNodesList.push(highlightedNode.longName);
			
			highlightedNode.ToggleHighlight(graph.highlightedNodes, highlightedNode);
		}
		
		this.RequestExpansionOfNodes_TRIGGER(longNameNodesList, slider2.GetValue());
	}
	
	//nactou se pouze zvyraznene uzly
	LoadOnlyHighlightedNodes()
	{
		if (graph.highlightedNodes.size === 0)
		{
			return;
		}
		
		this.graphIsLoaded = false;
		this.drawLoadingText = true;
		
		let longNameNodesList = [];

		for (let highlightedNode of graph.highlightedNodes.values())
		{
			longNameNodesList.push(highlightedNode.longName);
		}
		
		graph.ClearGraphExceptNamespaces();
		
		this.RequestLoadOfHighlightedNodes_TRIGGER(longNameNodesList, slider2.GetValue());
	}
	
	//jednotlive kroky komunikace s adapterem
	//funkce s koncovkou TRIGGER vytvareji pozadavky na server pomoci http dotazu,
	//ten pote asynchrone zpetne zavola funkce typu ACCEPT, ktere prijmou data a vlozi je do databaze
	//----------------------------------------------------------------------
	
	//request na namespace, a pote na celou databazi
	LoadNamespacesThenWholeDatabase_TRIGGER_STEP1()
	{
		console.log("LoadNamespacesThenWholeDatabase_TRIGGER_STEP1");
		
		sPARQLAdapter.RequestNameSpaceInfo(3);
	}
	
	LoadNamespacesThenWholeDatabase_ACCEPT_STEP2(data)
	{
		console.log("LoadNamespacesThenWholeDatabase_ACCEPT_STEP2");
		
		graph.AddNamespacesToGraph(data);
		
		this.LoadNamespacesThenWholeDatabase_TRIGGER_STEP3()
	}
	
	LoadNamespacesThenWholeDatabase_TRIGGER_STEP3()
	{
		console.log("LoadNamespacesThenWholeDatabase_TRIGGER_STEP3");
		
		sPARQLAdapter.ConstructAndExecuteQuery_LoadAllNodes(slider2.GetValue(), 4);
	}
	
	LoadNamespacesThenWholeDatabase_ACCEPT_STEP4(data)
	{
		console.log("LoadNamespacesThenWholeDatabase_ACCEPT_STEP4");
		
		if (data.length === 0)
		{
			this.graphIsLoaded = true;
			this.drawLoadingText = false;
			return;
		}
		
		graph.AddTriplesToGraph(data);
		
		if (dropdownMenu1.GetValue() === "Greedy grid")
		{
			graph.DistributeNodesInPlane_GREEDY();
		}
		else if (dropdownMenu1.GetValue() === "Greedy grid + swaps")
		{
			graph.DistributeNodesInPlane_GREEDYSWAP();
		}
		else if (dropdownMenu1.GetValue() === "Force-directed")
		{
			graph.DistributeNodesInPlane_FORCES();
		}

		this.graphIsLoaded = true;
		this.drawLoadingText = false;
	}

	//----------------------------------------------------------------------
	
	//request na rozsireni uzlu
	RequestExpansionOfNodes_TRIGGER(longNameNodesList, tripleLimit)
	{
		console.log("RequestExpansionOfNodes_TRIGGER");
		
		sPARQLAdapter.ConstructAndExecuteQuery_LoadAnyNumberOfNodes(longNameNodesList, tripleLimit, 5);
	}
	
	RequestExpansionOfNodes_ACCEPT(data)
	{
		console.log("RequestExpansionOfNodes_ACCEPT");
		
		if (data.length === 0)
		{
			this.graphIsLoaded = true;
			this.drawLoadingText = false;
			return;
		}
		
		graph.AddTriplesToGraph(data);
		
		if (dropdownMenu1.GetValue() === "Greedy grid")
		{
			graph.DistributeNodesInPlane_GREEDY();
		}
		else if (dropdownMenu1.GetValue() === "Greedy grid + swaps")
		{
			graph.DistributeNodesInPlane_GREEDYSWAP();
		}
		else if (dropdownMenu1.GetValue() === "Force-directed")
		{
			graph.DistributeNodesInPlane_FORCES();
		}
		
		for (let i = 0; i < this.highlightedNodesSave.length; i++)
		{
			this.highlightedNodesSave[i].ToggleHighlight(graph.highlightedNodes, this.highlightedNodesSave[i]);
		}
		
		this.graphIsLoaded = true;
		this.drawLoadingText = false;
	}
	
	//----------------------------------------------------------------------
	
	//request na nacteni pouze zvyraznenych uzlu
	RequestLoadOfHighlightedNodes_TRIGGER(longNameNodesList, tripleLimit)
	{
		console.log("RequestLoadOfHighlightedNodes_TRIGGER");
		
		sPARQLAdapter.ConstructAndExecuteQuery_LoadAnyNumberOfNodes(longNameNodesList, tripleLimit, 8);
	}
	
	RequestLoadOfHighlightedNodes_ACCEPT(data)
	{
		console.log("RequestLoadOfHighlightedNodes_ACCEPT");
		
		if (data.length === 0)
		{
			this.graphIsLoaded = true;
			this.drawLoadingText = false;
			return;
		}
		
		graph.AddTriplesToGraph(data);
		
		if (dropdownMenu1.GetValue() === "Greedy grid")
		{
			graph.DistributeNodesInPlane_GREEDY();
		}
		else if (dropdownMenu1.GetValue() === "Greedy grid + swaps")
		{
			graph.DistributeNodesInPlane_GREEDYSWAP();
		}
		else if (dropdownMenu1.GetValue() === "Force-directed")
		{
			graph.DistributeNodesInPlane_FORCES();
		}
		
		this.graphIsLoaded = true;
		this.drawLoadingText = false;
	}

	//----------------------------------------------------------------------
	
	//request na namespace, a pote uzel zadany uzivatelem
	RequestNamespacesThenLoadNodeFromUserInput_TRIGGER_STEP1()
	{
		console.log("RequestNamespacesThenLoadNodeFromUserInput_TRIGGER_STEP1");

		sPARQLAdapter.RequestNameSpaceInfo(6);
	}
	
	RequestNamespacesThenLoadNodeFromUserInput_ACCEPT_STEP2(data)
	{
		console.log("RequestNamespacesThenLoadNodeFromUserInput_ACCEPT_STEP2");
		
		graph.AddNamespacesToGraph(data);
		
		this.RequestNamespacesThenLoadNodeFromUserInput_TRIGGER_STEP3();
	}
	
	RequestNamespacesThenLoadNodeFromUserInput_TRIGGER_STEP3()
	{
		console.log("RequestNamespacesThenLoadNodeFromUserInput_TRIGGER_STEP3");
		
		let userInput = textBoxTextMode2.GetValue();
		
		let regexPatternOne = /^(.*):(.*)$/;
		let regexPatternTwo = /^http:\/\/.*$/;
		
		if (regexPatternOne.test(userInput) === true && regexPatternTwo.test(userInput) === false)
		{
			let matchedGroups = regexPatternOne.exec(userInput);
			let longPrefix = graph.shortFormToLongFormNamespaceLookup.get(matchedGroups[1]);
			let nodeName = matchedGroups[2];
		
			if (longPrefix === undefined)
			{
				alert("Prefix does not exist!");
			
				this.graphIsLoaded = true;
				this.drawLoadingText = false;
				return;
			}
			
			sPARQLAdapter.ConstructAndExecuteQuery_LoadAnyNumberOfNodes([longPrefix+nodeName], slider2.GetValue(), 7);
		}
		else
		{
			sPARQLAdapter.ConstructAndExecuteQuery_LoadAnyNumberOfNodes([userInput], slider2.GetValue(), 7);
		}
	}
	
	RequestNamespacesThenLoadNodeFromUserInput_ACCEPT_STEP4(data)
	{
		console.log("RequestNamespacesThenLoadNodeFromUserInput_ACCEPT_STEP4");
		
		if (data.length === 0)
		{
			this.graphIsLoaded = true;
			this.drawLoadingText = false;
			return;
		}
		
		graph.AddTriplesToGraph(data);
		
		if (dropdownMenu1.GetValue() === "Greedy grid")
		{
			graph.DistributeNodesInPlane_GREEDY();
		}
		else if (dropdownMenu1.GetValue() === "Greedy grid + swaps")
		{
			graph.DistributeNodesInPlane_GREEDYSWAP();
		}
		else if (dropdownMenu1.GetValue() === "Force-directed")
		{
			graph.DistributeNodesInPlane_FORCES();
		}
		
		this.graphIsLoaded = true;
		this.drawLoadingText = false;
	}
}



