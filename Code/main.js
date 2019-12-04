
window.onload = init;

let canvasElement;
let context;

let canvasWidth;
let canvasHeight;

let graph;
let sPARQLAdapter;

let force1;
let force2;
let force3;


let frameCounter = 0;



function InsertHTMLElements()
{
	force1 = new CompleteInputBox("force1", 1, 10, 0.01, 1, "", "Force 1:");
	force2 = new CompleteInputBox("force2", 1, 10, 0.01, 1, "", "Force 2:");
	force3 = new CompleteInputBox("force3", 1, 10, 0.01, 1, "", "Force 3:");
	button1 = new Button("button1", "Button1Function()","Button1!");
	button2 = new Button("button2", "Button2Function()","Button2!");
}

function SychnronizeHTMLElements()
{
	force1.SynchronizeInputs();
	force2.SynchronizeInputs();
	force3.SynchronizeInputs();
}


function init()
{
	canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
	
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;

	InsertHTMLElements();
	
	graph = new Graph();
	console.log(graph);
	
	// sPARQLAdapter = new SPARQLAdapter("http://localhost:8080/rdf4j-server/repositories/","rdf1");
	sPARQLAdapter = new SPARQLAdapter("http://localhost:8080/rdf4j-server/repositories/","RDFTestOneID");
	console.log(sPARQLAdapter);
	
	
	
	context.transform(1,0,0,1,0,0);

    window.requestAnimationFrame(processLoop);
}

//lokalni promenne?
function processLoop(timeStamp)
{
	SychnronizeHTMLElements();

	frameCounter++;

	draw();
	
    window.requestAnimationFrame(processLoop);
}



function draw()
{
	context.clearRect(0, 0, 1000, 1000);
	
	context.fillStyle = "#EEEEEE";
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	graph.CalculateForcesForAllNodes();
	graph.MoveAccordingToForces();
	
	graph.DrawGraph();
}


let test1 =` 
PREFIX ex: <http://example/>
INSERT DATA
{
	ex:bookID1	ex:price	10;
				ex:author 	"author10";
    			ex:type		ex:book.
}`;


let test2 = `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">

  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar"
             dc:title="RDF1.1 XML Syntax">
    <ex:editor>
      <rdf:Description ex:fullName="Dave Beckett">
        <ex:homePage rdf:resource="http://purl.org/net/dajobe/" />
      </rdf:Description>
    </ex:editor>
  </rdf:Description>

</rdf:RDF>`


function Button1Function() 
{
	sPARQLAdapter.RequestWholeDatabase();
}

function Button2Function() 
{
	// graph.LoadDatabaseFromRequest(sPARQLAdapter.GetRequestResponse());
	
	sPARQLAdapter.RequestNameSpaceInfo()
}








