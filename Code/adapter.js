
//performance
class SPARQLAdapter
{
	constructor(serverAdress, repositoryId) 
	{
		this.serverAdress = serverAdress;
		this.repositoryId = repositoryId;
		
		// this.requestResponse = "";
		this.onloadDecision = 0;
	}
	
	OnloadActionDecision(response)
	{
		if (this.onloadDecision === 1)
		{
			graph.ProcessNamespaceData(response);
			return;
		}
		if (this.onloadDecision === 2)
		{
			graph.LoadGraphForSpecificNodeTriggerProcess(response);
			return;
		}
		
		console.log(response);
	}
	
	EncodeIntoURLFormat(requestString)
	{
		return encodeURI(requestString);
	}
	
	
	
	SendRequest(requestType, requestURL, requestHeader, requestData)
	{
		this.requestResponse = "";
		
		let request = new XMLHttpRequest();
		
		request.open(requestType, requestURL, true);
		
		request.setRequestHeader("Content-type", requestHeader);
		
		request.onload = function() 
		{
			// sPARQLAdapter.requestResponse = this.response;
			
			sPARQLAdapter.OnloadActionDecision(this.response);

		}
		
		request.send(requestData);
	}
	


	RequestNameSpaceInfo()
	{
		let requestType = "GET";
		let requestURL = this.serverAdress + "/" + this.repositoryId + "/namespaces";
		let requestHeader = "";
		let requestData = "";
		
		this.SendRequest(requestType, requestURL, requestHeader, requestData);
	}
	
	RequestWholeDatabase()
	{
		let requestType = "GET";
		let requestURL = this.serverAdress + "/" + this.repositoryId + "/statements";
		let requestHeader = "";
		let requestData = "";
		
		this.SendRequest(requestType, requestURL, requestHeader, requestData);
	}
	
	RequestSPARQLQueryResult(SPARQLQuery)
	{
		let requestType = "GET";
		let requestURL = this.serverAdress + "/" + this.repositoryId + "?query=" + this.EncodeIntoURLFormat(SPARQLQuery);
		let requestHeader = "";
		let requestData = "";
		
		this.SendRequest(requestType, requestURL, requestHeader, requestData);
	}
	
	//database size
	
	//test function
	/*
	SendRequest(requestType, requestString)
	{
		let request = new XMLHttpRequest();
		
		// let URLText = this.serverAdress+"/"+this.repositoryId+"?"+requestType+"="+this.EncodeIntoURLFormat(requestString);
		
		// URLText = "http://localhost:8080/rdf4j-server/repositories/RDFTestOneID?query=PREFIX%20ex%3A%20%3Chttp%3A%2F%2Fexample%2F%3E%0ASELECT%20%3FbookID%0AWHERE%0A%7B%0A%20%20%3FbookID%20ex%3Aauthor%20%22author1%22.%0A%7D";
		
		// console.log(URLText);
		
		
		// request.open("GET", "http://localhost:8080/rdf4j-server/repositories/rdf1/statements", true);
		
		//request.open("DELETE", "http://localhost:8080/rdf4j-server/repositories/rdf1/statements", true);
		
		// request.open("POST", "http://localhost:8080/rdf4j-server/repositories/rdf1/statements", true);
		
		// request.setRequestHeader('Content-type', 'application/rdf+xml;charset=UTF-8');
		
		request.open("POST", "http://localhost:8080/rdf4j-server/repositories/rdf1/statements", true);
		
		request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		
		request.onload = function() 
		{
			console.log(this.response);
			// console.log("ok");
		}

		request.send("update=INSERT%20{?s%20?p%20?o}%20WHERE%20{?s%20?p%20?o}"");
		// request.send("update=INSERT%20{?s%20?p%20?o}%20WHERE%20{?s%20?p%20?o}");	
		
		// request.open("POST", "http://localhost:8080/rdf4j-server/repositories/rdf1", true);
		// request.setRequestHeader("Content-type", "application/sparql-query");
		// request.send(this.EncodeIntoURLFormat(requestString));
	}*/
}




/*
function UserAction() {
    var request = new XMLHttpRequest();

// Open a new connection, using the GET request on the URL endpoint
// request.open('GET', 'http://localhost:8080/rdf4j-server/repositories/RDFTestOneID?query=select%20%3Cfoo:bar%3E&queryLn=serql', true);

let URLText = "PREFIX%20ex%3A%20%3Chttp%3A%2F%2Fexample%2F%3E%0ASELECT%20%3FbookID%0AWHERE%0A%7B%0A%20%20%3FbookID%20ex%3Aauthor%20%22author1%22.%0A%7D";

request.open('GET', "http://localhost:8080/rdf4j-server/repositories/RDFTestOneID?query="+URLText, true);



// PREFIX ex: <http://example/>
// SELECT ?bookID
// WHERE
// {
  // ?bookID ex:author "author1".
// }

// PREFIX%20ex%3A%20%3Chttp%3A%2F%2Fexample%2F%3E%0ASELECT%20%3FbookID%0AWHERE%0A%7B%0A%20%20%3FbookID%20ex%3Aauthor%20%22author1%22.%0A%7D




request.onload = function() {
  console.log(this.response);
}

// Send request
request.send();
}
*/


