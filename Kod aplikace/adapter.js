// Bc. Tomáš Jarůšek, 20.3.2020
// Nástroj pro vizualizaci rozsáhlých RDF databází
// Implementováno v JavaScripu za pomoci prvku canvas, načítání databáze probíhá přes REST API (rdf4j API)
// Součást diplomové práce na téma Vizualizace rozsáhlých grafových dat na webu (vedoucí: Ing. Radek Burget Ph.D.), FIT VUTBR 2020

//trida poskytuje rozhrani mezi aplikaci a serverem
class SPARQLAdapter
{
	constructor() 
	{
		this.onloadDecision = 0;
	}
	
	//nastaveni adresy serveru
	SetServer(serverAdress)
	{
		this.serverAdress = serverAdress;
	}
	
	//nastaveni repozitare
	SetRepository(repositoryId)
	{
		this.repositoryId = repositoryId;
	}
	
	//rozhodnuti, ktera funkce se zavola po prijeti dat ze serveru
	OnloadActionDecision(response)
	{
		// console.log(response);
		
		if (this.onloadDecision === 3)
		{
			controller.LoadNamespacesThenWholeDatabase_ACCEPT_STEP2(this.ParseNamespacesInto2DTable(response));
			return;
		}
		
		if (this.onloadDecision === 4)
		{
			controller.LoadNamespacesThenWholeDatabase_ACCEPT_STEP4(this.ParseQueryXMLTriplesInto2DTable(response));
			return;
		}
		
		if (this.onloadDecision === 5)
		{
			controller.RequestExpansionOfNodes_ACCEPT(this.ParseQueryXMLTriplesInto2DTable(response));
			return;
		}
		
		if (this.onloadDecision === 6)
		{
			controller.RequestNamespacesThenLoadNodeFromUserInput_ACCEPT_STEP2(this.ParseNamespacesInto2DTable(response));
			return;
		}
		
		if (this.onloadDecision === 7)
		{
			controller.RequestNamespacesThenLoadNodeFromUserInput_ACCEPT_STEP4(this.ParseQueryXMLTriplesInto2DTable(response));
			return;
		}
		
		if (this.onloadDecision === 8)
		{
			controller.RequestLoadOfHighlightedNodes_ACCEPT(this.ParseQueryXMLTriplesInto2DTable(response));
			return;
		}	
	}
	
	//zakodovani retezce do URI formatu
	EncodeIntoURLFormat(requestString)
	{
		return encodeURI(requestString);
	}
	
	//poslani http requestu
	SendRequest(requestType, requestURL, requestHeaders, requestData)
	{
		let request = new XMLHttpRequest();
		
		request.open(requestType, requestURL, true);
		
		for (let i = 0; i < requestHeaders.length; i++)
		{
			request.setRequestHeader(requestHeaders[i][0], requestHeaders[i][1]);
		}
		
		request.onload = function() 
		{	
			sPARQLAdapter.OnloadActionDecision(this.response);
		}
		
		request.send(requestData);
	}
	
	//request na namespacy
	RequestNameSpaceInfo(onloadDecision)
	{	
		let requestType = "GET";
		let requestURL = this.serverAdress + "/" + this.repositoryId + "/namespaces";
		let requestHeader = [];
		let requestData = "";
		
		this.onloadDecision = onloadDecision;
		
		this.SendRequest(requestType, requestURL, requestHeader, requestData);
	}
	
	//request jakekoliv query
	RequestSPARQLQueryResult(SPARQLQuery, onloadDecision)
	{
		let requestType = "GET";
		let requestURL = this.serverAdress + "/" + this.repositoryId + "?query=" + this.EncodeIntoURLFormat(SPARQLQuery);
		let requestHeaders = [["Accept","application/sparql-results+xml"]];
		let requestData = "";
		
		this.onloadDecision = onloadDecision;
		
		this.SendRequest(requestType, requestURL, requestHeaders, requestData);
	}
	
	//----QUERRY-CREATION-----------------------------------------------------------------------
	
	//vystaveni a provedeni query na ziskani vsech trojic v databazi
	ConstructAndExecuteQuery_LoadAllNodes(tripleLimit, onloadDecision)
	{
		//priklad dotazu - vse je rozepsano pomoci dlouheho prefixu, aby se nemusely do dotazu cpat namespacy
		// SELECT DISTINCT * 
		// WHERE 
		// { 
			// ?a ?b ?c.
		// }
		// LIMIT 100
		
		let finalQuery = `
		SELECT DISTINCT * 
		WHERE 
		{ 
			?subject ?predicate ?object.
		}
		LIMIT `;
				
		finalQuery = finalQuery + tripleLimit.toString();
		
		this.RequestSPARQLQueryResult(finalQuery, onloadDecision);
	}
		
	/*
	//vystaveni a provedeni query na ziskani vsech trojic, ktere maji objekt nebo subjekt roven identifikatoru v seznamu
	//PRO UZEL SE VRATI SPOJENI, KTEE VEDOU POUZE Z UZLU
	ConstructAndExecuteQuery_LoadAnyNumberOfNodes(longNameNodesList, tripleLimit, onloadDecision)
	{
		//priklad dotazu - vse je rozepsano pomoci dlouheho prefixu, aby se nemusely do dotazu cpat namespacy
		// SELECT DISTINCT * 
		// WHERE 
		// { 
			// ?a ?b ?c.
			// FILTER 
			// (
				// ?a IN 
				// (
					// <http://example.org/personId_50>, <http://example.org/personId_100>
				// )
			// )
		// }
		// LIMIT 100
		
		let queryPartOne = `
		SELECT DISTINCT *
		WHERE
		{
			?subject ?predicate ?object.
			FILTER 
			(
				?subject IN 
				(
					`;
		
		queryPartOne = queryPartOne + "<" + longNameNodesList[0] + ">";
		
		//prvni je bez carky, dalsi v tomto cyklu s carkou - pokud je delka pole rovna 1 - cyklus se neprovede
		for (let i = 1; i < longNameNodesList.length; i++)
		{
			queryPartOne = queryPartOne + "," + "<" + longNameNodesList[i] + ">";
		}
			
		let queryPartTwo = `
				)
			)
		}
		LIMIT `;
		
		queryPartTwo = queryPartTwo + tripleLimit.toString();
		
		let finalQuery = queryPartOne + queryPartTwo; 
		
		// console.log(finalQuery);
		
		this.RequestSPARQLQueryResult(finalQuery, onloadDecision);
	}
	*/
	
	//vystaveni a provedeni query na ziskani vsech trojic, ktere maji objekt nebo subjekt roven identifikatoru v seznamu
	//PRO UZEL SE VRATI SPOJENI, KTERE VEDOU DO UZLU I Z UZLU
	ConstructAndExecuteQuery_LoadAnyNumberOfNodes(longNameNodesList, tripleLimit, onloadDecision)
	{
		//priklad dotazu - vse je rozepsano pomoci dlouheho prefixu, aby se nemusely do dotazu cpat namespacy
		// SELECT DISTINCT * 
		// WHERE 
		// { 
		  // {
			// ?a ?b ?c.
			// FILTER (?a IN (<http://example.org/personId_1>))
		  // }
		  // UNION
		  // {
			// ?a ?b ?c.
			// FILTER (?c IN (<http://example.org/personId_1>))
		  // }
		// }
		// LIMIT 100
		
		let queryPartOne = `
		SELECT DISTINCT *
		WHERE
		{
			{
				?subject ?predicate ?object.
				FILTER 
				(
					?subject IN 
					(
						`;
		
		queryPartOne = queryPartOne + "<" + longNameNodesList[0] + ">";
		
		//prvni je bez carky, dalsi v tomto cyklu s carkou - pokud je delka pole rovna 1 - cyklus se neprovede
		for (let i = 1; i < longNameNodesList.length; i++)
		{
			queryPartOne = queryPartOne + "," + "<" + longNameNodesList[i] + ">";
		}
		
		let queryPartTwo = `
					)
				)
			}
			UNION
			{
				?subject ?predicate ?object.
				FILTER 
				(
					?object IN 
					(
						`;
		
		queryPartTwo = queryPartTwo + "<" + longNameNodesList[0] + ">";
		
		//prvni je bez carky, dalsi v tomto cyklu s carkou - pokud je delka pole rovna 1 - cyklus se neprovede
		for (let i = 1; i < longNameNodesList.length; i++)
		{
			queryPartTwo = queryPartTwo + "," + "<" + longNameNodesList[i] + ">";
		}
		
		let queryPartThree = `
					)
				)
			}
		}
		LIMIT `;
		
		queryPartThree = queryPartThree + tripleLimit.toString();
		
		let finalQuery = queryPartOne + queryPartTwo + queryPartThree; 
		
		this.RequestSPARQLQueryResult(finalQuery, onloadDecision);
	}
	
	//----PROCESSING----------------------------------------------------------------------------
	
	//zpracovani namespacu
	//sloupce oddeluje carka
	//radky oddeluje \r\n
	//prvni radek se zahazuje - obsahuje nazvy sloupcu
	//asi to taky bylo lepsi udelat regexem :D - kdyz toto by melo byt rychlejsi
	ParseNamespacesInto2DTable(data)
	{
		let lines = [];
		let actLine = [];
		let actString = "";
		
		let dataLength = data.length-1;
		
		let i = 1;
		let procesingFirstLine = true;
		
		let actSymbol = data[0];
		let nextSymbol = data[i];
		
		let actSymbolCharCode = actSymbol.charCodeAt(0);
		let nextSymbolCharCode = nextSymbol.charCodeAt(0);
		
		while (i < dataLength)
		{
			//\r
			if (actSymbolCharCode === 13)
			{
				//\n
				if (nextSymbolCharCode === 10)
				{
					actLine.push(actString);
					
					//ignorujeme prvni radek
					if (procesingFirstLine === true)
					{
						procesingFirstLine = false;
					}
					else
					{
						lines.push(actLine);
					}
					
					actLine = [];
					actString = "";

					i += 2;
					
					actSymbol = data[i-1];
					nextSymbol = data[i];
					
					actSymbolCharCode = actSymbol.charCodeAt(0);
					nextSymbolCharCode = nextSymbol.charCodeAt(0);
					
					continue;
				}
			}
			//,
			if (actSymbolCharCode === 44)
			{
				actLine.push(actString);
				actString = "";
				
				i++;
			
				actSymbol = nextSymbol;
				nextSymbol = data[i];
				
				actSymbolCharCode = nextSymbolCharCode;
				nextSymbolCharCode = nextSymbol.charCodeAt(0);
				
				continue;
			}
			
			actString += actSymbol;
			
			i++;
			
			actSymbol = nextSymbol;
			nextSymbol = data[i];
			
			actSymbolCharCode = nextSymbolCharCode;
			nextSymbolCharCode = nextSymbol.charCodeAt(0);
		}
		
		actString += actSymbol;
		actLine.push(actString);
		lines.push(actLine);
		
		return lines;
	}
	
	//funkce rozparsuje vysledek query - ktera je ve formatu xml
	//priklad vysledku:
	// ["http://example.org/", "personId_1", "http://example.org/", "name", "Liboslav Král", "string", false]
	// ["http://example.org/", "personId_1", "http://example.org/", "age", "19", "integer", false]
	// ["http://example.org/", "personId_1", "http://example.org/", "knows", "http://example.org/", "personId_2", true]
	//DULEZITE - protoze v xml jsou promennce vraceny v abecednim poradi a promenne v nasem vytvornem dotazu
	//se nazyvaji ?subject, ?predicate, ?object, tak funkce s tim pocita a prohazuje vysledky tak, aby byly ve spravnem poradi (subjekt, predikat, objekt)
	ParseQueryXMLTriplesInto2DTable(data)
	{
		let triples = [];
		
		let singleResults = data.split("<result>");
		
		// let regexPatternString = /^(?:.|\r\n)*<uri>(.*\/)(.*)<\/uri>(?:.|\r\n)*<uri>(.*\/)(.*)<\/uri>(?:.|\r\n)*(?:<literal>(.*)<\/literal>)(?:.|\r\n)*$/;
		// let regexPatternOtherLiterals = /^(?:.|\r\n)*<uri>(.*\/)(.*)<\/uri>(?:.|\r\n)*<uri>(.*\/)(.*)<\/uri>(?:.|\r\n)*(?:<literal.*#(.*)\'>(.*)<\/literal>)(?:.|\r\n)*$/;
		// let regexPatternObject = /^(?:.|\r\n)*<uri>(.*\/)(.*)<\/uri>(?:.|\r\n)*<uri>(.*\/)(.*)<\/uri>(?:.|\r\n)*<uri>(.*\/)(.*)<\/uri>(?:.|\r\n)*$/;
		
		let regexPatternString = /^(?:.|\r\n)*<uri>(.*\/)(.*)<\/uri>(?:.|\r\n)*<uri>(.*\/)(.*)<\/uri>(?:.|\r\n)*(?:<literal.*>(.*)<\/literal>)(?:.|\r\n)*$/;
		let regexPatternOtherLiterals = /^(?:.|\r\n)*<uri>(.*\/)(.*)<\/uri>(?:.|\r\n)*<uri>(.*\/)(.*)<\/uri>(?:.|\r\n)*(?:<literal.*#(.*)\'>(.*)<\/literal>)(?:.|\r\n)*$/;
		let regexPatternObject = /^(?:.|\r\n)*<uri>(.*\/)(.*)<\/uri>(?:.|\r\n)*<uri>(.*\/)(.*)<\/uri>(?:.|\r\n)*<uri>(.*\/)(.*)<\/uri>(?:.|\r\n)*$/;
		
		let matchedGroups;
		
		//od 1 - hlavicka nas nezajima
		for (let i = 1; i < singleResults.length; i++)
		{
			matchedGroups = regexPatternString.exec(singleResults[i]);
			
			if (matchedGroups === null)
			{
				matchedGroups = regexPatternOtherLiterals.exec(singleResults[i]);
				
				if (matchedGroups === null)
				{
					matchedGroups = regexPatternObject.exec(singleResults[i]);
					
					if (matchedGroups === null)
					{
						return false;
					}
					else
					{
						triples.push([matchedGroups[3],matchedGroups[4],matchedGroups[1],matchedGroups[2],matchedGroups[5],matchedGroups[6], false]);
					}
				}
				else
				{
					triples.push([matchedGroups[3],matchedGroups[4],matchedGroups[1],matchedGroups[2],matchedGroups[6],matchedGroups[5], true]);
				}
			}
			else
			{
				triples.push([matchedGroups[3],matchedGroups[4],matchedGroups[1],matchedGroups[2],matchedGroups[5],"string", true]);
			}
		}

		return triples;
	}	
}




























