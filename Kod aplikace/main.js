// Bc. Tomáš Jarůšek, 20.3.2020
// Nástroj pro vizualizaci rozsáhlých RDF databází
// Implementováno v JavaScripu za pomoci prvku canvas, načítání databáze probíhá přes REST API (rdf4j API)
// Součást diplomové práce na téma Vizualizace rozsáhlých grafových dat na webu (vedoucí: Ing. Radek Burget Ph.D.), FIT VUTBR 2020

window.onload = Init;

let canvasElement;

let canvasWidth;
let canvasHeight;

let graph;
let sPARQLAdapter;
let controller;

let slider1;
let slider2;
let checkbox1;
let checkbox2;
let textBoxTextMode1;
let textBoxTextMode2;
let textBoxTextMode3;
let button1;
let button2;
let button3;
let button4;
let button5;
let dropdownMenu1;

let previousFrameTime = 0;
let currentFrameTime = 0;
let deltaTime;

//vlozeni html prvku
function InsertHTMLElements()
{
	slider1 = new CompleteInputBox("slider1", 10, 1000, 1, 500, "", "Number of physics iterations:");
	slider2 = new CompleteInputBox("slider2", 1, 5000, 1, 5, "", "Maximum number of triples per request:");
	checkbox1 = new CompleteCheckbox("checkbox1", false, "Show simple connections: ");
	checkbox2 = new CompleteCheckbox("checkbox2", true, "Show node descriptions: ");
	textBoxTextMode1 = new CompleteTextBoxTextMode("input1", "DBpedia1", "Repository name:");
	textBoxTextMode2 = new CompleteTextBoxTextMode("input2", "ex:personId_1", "Node to display (shortPrefix):");
	textBoxTextMode3 = new CompleteTextBoxTextMode("input3", "http://localhost:8080/rdf4j-server/repositories/", "Repositories adress:");
	button1 = new Button("button1", "Button1Function()","Load specific node!");
	button2 = new Button("button2", "Button2Function()","Expand higlighted nodes!");
	button3 = new Button("button3", "Button3Function()","Load whole database!");
	button4 = new Button("button4", "Button4Function()","Load only highlighted nodes!");
	button5 = new Button("button5", "Button5Function()","Redraw!");
	dropdownMenu1 = new CompleteDropdownMenu("dropdownMenu1", ["Greedy grid", "Greedy grid + swaps", "Force-directed"], "Graph distribution method:");
}

//synchronizace ruznych prvku
function SychnronizeHTMLElements()
{
	slider1.SynchronizeInputs();
	slider2.SynchronizeInputs();
}


//pak treba i nejak testovat delku dotazu v zavislosti na velikosti databaze? tedy jen na performance rdf serveru - potvrzeni ze nezalezi na veliksoti databaze


//inicializace po spusteni
function Init()
{
	//deklarovat canvas neni potreba, je deklarovany defaultne globalne
	// canvasElement = document.getElementById('canvas');
	context = canvas.getContext('2d');
	
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;

	//vlozeni html prvku
	InsertHTMLElements();
	
	//aktivace mysi
	ActivateMouse();
	
	//vytvoreni REST API adapteru
	sPARQLAdapter = new SPARQLAdapter();
	
	//vytvoreni grafove strutury
	graph = new Graph();
	
	//vytvoreni kontroleru aplikace
	controller = new Controller();
	
	console.log(graph);
	console.log(sPARQLAdapter);
	console.log(controller);
	
	//zacneme cyklit na 60fps
    window.requestAnimationFrame(processLoop);
}

//aplikacni smycka
function processLoop(timeStamp)
{
	//vypocet delta time
	currentFrameTime = performance.now();
	deltaTime = currentFrameTime-previousFrameTime;
	previousFrameTime = currentFrameTime;
	
	//synchronizace html prvku
	SychnronizeHTMLElements();
	
	controller.ManageApplication(deltaTime);
	
    window.requestAnimationFrame(processLoop);
}

//funkce, na ktere odkazuji HTML tlacitka
function Button1Function() 
{	
	controller.LoadNamespacesThenLoadNodeFromUserInput();
}

function Button2Function() 
{
	controller.ExpandHighlightedNodes();
}

function Button3Function() 
{
	controller.LoadNamespacesThenWholeDatabase();
}

function Button4Function() 
{
	controller.LoadOnlyHighlightedNodes();
}

function Button5Function() 
{
	controller.Redraw();
}
