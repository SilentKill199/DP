// Bc. Tomáš Jarůšek, 20.3.2020
// Nástroj pro vizualizaci rozsáhlých RDF databází
// Implementováno v JavaScripu za pomoci prvku canvas, načítání databáze probíhá přes REST API (rdf4j API)
// Součást diplomové práce na téma Vizualizace rozsáhlých grafových dat na webu (vedoucí: Ing. Radek Burget Ph.D.), FIT VUTBR 2020

//shluk vsech propojeni mezi dvema uzly
class ConnectionCluster
{
	constructor(nodeA, nodeB, identifier) 
	{
		//umely identifikator
		this.identifier = identifier;
		
		//uzly, ktere jsou propojeny
		this.nodeA = nodeA;
		this.nodeB = nodeB;
		
		//seznam jednotlivych propojeni v clustere
		this.AtoBConnections = [];
		this.BtoAConnections = [];
		this.allConnections = [];
		
		//pocty propjeni
		this.AtoBConnCount = 0;
		this.BtoAConnCount = 0;
		this.totalConnCount = 0;

		//1.2 - 60% prumeru - tohle ridi rozestup jednotlivych propojeni, pokud jich je mezi uzly vice nez jeden
		this.radiusPercentage = 0.6*2;
		
		this.AtoBHighlighted = false;
		this.BtoAHighlighted = false;
	}
	
	//prida propojeni do clusteru
	AddConnection(startNode, endNode, shortPrefix, longPrefix, shortName, longName)
	{
		let connection = new Connection(startNode, endNode, shortPrefix, longPrefix, shortName, longName);
		
		if (this.totalConnCount === 0)
		{
			startNode.totalConnectionClusters++;
			startNode.totalConnections++;
			endNode.totalConnectionClusters++;
			endNode.totalConnections++;
		}
		else
		{
			startNode.totalConnections++;
			endNode.totalConnections++;
		}

		if (startNode === this.nodeA)
		{
			this.AtoBConnections.push(connection);
			this.AtoBConnCount++;
		}
		else
		{
			this.BtoAConnections.push(connection);
			this.BtoAConnCount++;	
		}
		
		this.allConnections.push(connection);
		this.totalConnCount++;
	}
	
	//zjisti, jestli propojeni mezi uzly jiz existuje (existuje takove propojeni, co ma dany identifikator?)
	DoesConnectionAlreadyExist(startNode, newConnectionIdentifier)
	{
		let connectionsInOneDirection;
		let connectionCount;
		
		if (startNode === this.nodeA)
		{
			connectionsInOneDirection = this.AtoBConnections;
			connectionCount = this.AtoBConnCount;
		}
		else
		{
			connectionsInOneDirection = this.BtoAConnections;
			connectionCount = this.BtoAConnCount;
		}
		
		for (let i = 0; i < connectionCount; i++)
		{
			if (connectionsInOneDirection[i].identifier === newConnectionIdentifier)
			{
				return true;
			}
		}

		return false;
	}
	
	//toto slouzi pro znovu vypocteni vektoru, normaly a vzdalenosti mezi uzly na zacatku framu
	CalculateAndUpdateDistanceAndVector()
	{
		this.directionVectorX = this.nodeB.x - this.nodeA.x;
		this.directionVectorY = this.nodeB.y - this.nodeA.y;
		
		this.distanceBetweenNodes = Math.sqrt(this.directionVectorX*this.directionVectorX+this.directionVectorY*this.directionVectorY);
		
		this.directionVectorX = this.directionVectorX/this.distanceBetweenNodes;
		this.directionVectorY = this.directionVectorY/this.distanceBetweenNodes;
		
		this.directionVectorOppositeX = this.directionVectorX*-1;
		this.directionVectorOppositeY = this.directionVectorY*-1;
	}
	
	//vypne nebo zapne highlight clusteru
	ToggleHighlight(identifier)
	{
		if (this.nodeA.identifier === identifier)
		{
			if (this.AtoBConnCount === 0)
			{
				//nezvyraznujeme kdyz zadne spojeni v tomto smeru neexistuje
				return;
			}
			
			if (this.AtoBHighlighted === true)
			{
				this.AtoBHighlighted = false;
				
				if (this.nodeB.IsThisNodeLiteral === true)
				{
					this.nodeB.displayText = false;
				}	
			}
			else
			{
				this.AtoBHighlighted = true;
				
				if (this.nodeB.IsThisNodeLiteral === true)
				{
					this.nodeB.displayText = true;
				}
			}
		}
		else
		{
			if (this.BtoAConnCount === 0)
			{
				//nezvyraznujeme kdyz zadne spojeni v tomto smeru neexistuje
				return;
			}
			
			if (this.BtoAHighlighted === true)
			{
				this.BtoAHighlighted = false;
				
				if (this.nodeA.IsThisNodeLiteral === true)
				{
					this.nodeA.displayText = false;
				}
			}
			else
			{
				this.BtoAHighlighted = true;
				
				if (this.nodeA.IsThisNodeLiteral === true)
				{
					this.nodeA.displayText = true;
				}
			}
		}
	}
	
	//-----DRAW------------------------------------------------------
	
	//vykresleni vsech propojen jako car se sipkami u uzlu (musime vypocitat pruseciky s kruhem)
	DrawWithArrowsNearCircles(context, lineWidth, arrowheadLength, arrowheadHalfThickness, simplifiedConnections)
	{
		if (this.AtoBHighlighted === false && this.BtoAHighlighted === false && simplifiedConnections === true)
		{
			context.lineWidth = lineWidth*this.totalConnCount*2;
			
			context.beginPath();
			context.moveTo(this.nodeA.x, this.nodeA.y);
			context.lineTo(this.nodeB.x, this.nodeB.y);
			context.stroke();
			
			context.lineWidth = lineWidth;
			return;
		}
		
		//vypocitame normalovy vektor - bude jiz take znormalizovany protoze vektor smeru usecky a normala maji stejnou delku
		// https://stackoverflow.com/questions/1243614/how-do-i-calculate-the-normal-vector-of-a-line-segment
		//if we define dx=x2-x1 and dy=y2-y1, then the normals are (-dy, dx) and (dy, -dx).
		let lineDirectionNormalX = (this.directionVectorY)*-1;
		let lineDirectionNormalY = this.directionVectorX;
	
		if (this.totalConnCount === 1)
		{
			if (this.AtoBConnCount === 1)
			{
				if (this.AtoBHighlighted === true)
				{
					context.strokeStyle = "#53adcb";
					context.fillStyle = "#53adcb";
					this.AtoBConnections[0].DrawWithArrowsNearCirclesEqualsOne(context, lineDirectionNormalX, lineDirectionNormalY, this.directionVectorX, this.directionVectorY, arrowheadLength, arrowheadHalfThickness);
					context.strokeStyle = "#CCCCCC";
					context.fillStyle = "#CCCCCC";
				}
				else
				{
					this.AtoBConnections[0].DrawWithArrowsNearCirclesEqualsOne(context, lineDirectionNormalX, lineDirectionNormalY, this.directionVectorX, this.directionVectorY, arrowheadLength, arrowheadHalfThickness);
				}	
			}
			else
			{
				if (this.BtoAHighlighted === true)
				{
					context.strokeStyle = "#53adcb";
					context.fillStyle = "#53adcb";
					this.BtoAConnections[0].DrawWithArrowsNearCirclesEqualsOne(context, lineDirectionNormalX, lineDirectionNormalY, this.directionVectorX, this.directionVectorY, arrowheadLength, arrowheadHalfThickness);
					context.strokeStyle = "#CCCCCC";
					context.fillStyle = "#CCCCCC";
				}
				else
				{
					this.BtoAConnections[0].DrawWithArrowsNearCirclesEqualsOne(context, lineDirectionNormalX, lineDirectionNormalY, this.directionVectorX, this.directionVectorY, arrowheadLength, arrowheadHalfThickness);
				}
				
			}
		}
		else
		{		
			//vypocitame rozestupy usecek podle poctu propojeni mezi uzly
			let smallerRadiusNode = this.nodeA.radius < this.nodeB.radius ? this.nodeA.radius : this.nodeB.radius;
			//-1 protoze bude propojeni na obou okrajich
			let spaceBetweenConnections = smallerRadiusNode*this.radiusPercentage/(this.totalConnCount-1);
			let offsetStart = ((this.totalConnCount-1)*spaceBetweenConnections)/-2;
			
			let j = 0;
			
			for (let i = 0; i < this.AtoBConnections.length; i++)
			{
				if (this.AtoBHighlighted === true)
				{
					context.strokeStyle = "#53adcb";
					context.fillStyle = "#53adcb";
					this.AtoBConnections[i].DrawWithArrowsNearCirclesMoreThanOne(context, lineDirectionNormalX, lineDirectionNormalY, this.directionVectorX, this.directionVectorY, offsetStart+j*spaceBetweenConnections, arrowheadLength, arrowheadHalfThickness);
					context.strokeStyle = "#CCCCCC";
					context.fillStyle = "#CCCCCC";
				}
				else
				{
					this.AtoBConnections[i].DrawWithArrowsNearCirclesMoreThanOne(context, lineDirectionNormalX, lineDirectionNormalY, this.directionVectorX, this.directionVectorY, offsetStart+j*spaceBetweenConnections, arrowheadLength, arrowheadHalfThickness);
				}
				
				j++;
			}
			
			for (let i = 0; i < this.BtoAConnections.length; i++)
			{
				if (this.BtoAHighlighted === true)
				{
					context.strokeStyle = "#53adcb";
					context.fillStyle = "#53adcb";
					this.BtoAConnections[i].DrawWithArrowsNearCirclesMoreThanOne(context, lineDirectionNormalX, lineDirectionNormalY, this.directionVectorOppositeX, this.directionVectorOppositeY, offsetStart+j*spaceBetweenConnections, arrowheadLength, arrowheadHalfThickness);
					context.strokeStyle = "#CCCCCC";
					context.fillStyle = "#CCCCCC";
				}
				else
				{
					this.BtoAConnections[i].DrawWithArrowsNearCirclesMoreThanOne(context, lineDirectionNormalX, lineDirectionNormalY, this.directionVectorOppositeX, this.directionVectorOppositeY, offsetStart+j*spaceBetweenConnections, arrowheadLength, arrowheadHalfThickness);
				}
				
				j++;
			}
		}
	}
	
	//vykresleni popisu
	DrawDescriptions(context, simplifiedConnections, localFactor, fillStyle, font)
	{
		if (this.AtoBHighlighted === false && this.BtoAHighlighted === false && simplifiedConnections === true)
		{
			return;
		}
		
		//kdyz je jen jedno propojeni tak chceme text umistit do 1/2 delky - tedy +1 atd...
		let localTotalConnCount = this.totalConnCount+1;
		
		let positionTmpX = this.directionVectorOppositeX*(this.distanceBetweenNodes/localTotalConnCount);
		let positionTmpY = this.directionVectorOppositeY*(this.distanceBetweenNodes/localTotalConnCount);
		
		//rozdelime usecku spojujici uzly na dily podle poctu propojeni a pote rozmistime text rovnomerne po usecce
		let j = 1;	
		for (let i = 0; i < this.AtoBConnections.length; i++)
		{
			if (this.AtoBHighlighted === true)
			{			
				context.fillStyle = fillStyle;
				context.font = font;	
				this.AtoBConnections[i].DrawDescription(context, positionTmpX*j+this.nodeB.x,  positionTmpY*j+this.nodeB.y);
				context.fillStyle = "#000000";
				localFactor = localFactor/1.2;
				context.font = localFactor.toString() + "px Arial";
			}
			else
			{
				this.AtoBConnections[i].DrawDescription(context, positionTmpX*j+this.nodeB.x,  positionTmpY*j+this.nodeB.y);
			}
			
			j++;
		}
			
		for (let i = 0; i < this.BtoAConnections.length; i++)
		{
			if (this.BtoAHighlighted === true)
			{			
				context.fillStyle = fillStyle;
				context.font = font;	
				this.BtoAConnections[i].DrawDescription(context, positionTmpX*j+this.nodeB.x, positionTmpY*j+this.nodeB.y);
				context.fillStyle = "#000000";
				localFactor = localFactor/1.2;
				context.font = localFactor.toString() + "px Arial";
			}
			else
			{
				this.BtoAConnections[i].DrawDescription(context, positionTmpX*j+this.nodeB.x, positionTmpY*j+this.nodeB.y);
			}
			
			j++;
		}
	}
}

// jednotlive orientovane propojeni
class Connection
{
	constructor(startNode, endNode, shortPrefix, longPrefix, shortName, longName) 
	{
		//odkaz na propojovane uzly
		this.startNode = startNode;
		this.endNode = endNode;
		
		this.identifier = shortName;
		this.shortName = shortName;
		this.longName = longName;
		this.shortPrefix = shortPrefix;
		this.longPrefix = longPrefix;
		
		//pokud ma jeden cluster vice propojeni, uchovame si predpocitane hodnoty posunu z funkce pro vykresleni car
		//a pote je pouzijeme pri vykresleni popisu
		this.normalOffsetX = 0;
		this.normalOffsetY = 0;
	}
	
	//reseni kvadraticke rovnice (kvuli pocitani pruseciku primky a kruhu)
	SolveQuadraticEquation(quadraticA, quadraticB, quadraticC)
	{
		let discriminantWithSquareRoot = Math.sqrt(quadraticB*quadraticB-4*quadraticA*quadraticC);
		
		return [(-quadraticB + discriminantWithSquareRoot)/(2*quadraticA),(-quadraticB - discriminantWithSquareRoot)/(2*quadraticA)];
	}

	//DULEZITE - tato funkce pocita s tim, ze usecka a kruh maji jeden prusecik - tedy usecka ma start nebo konec uvnitr kruhu
	//druhe reseni se zahodi - musely by se vracet dve reseni
	CalculateCircleLineSegmentIntersection(lineSegmentStartX, lineSegmentStartY, lineSegmentEndX, lineSegmentEndY, circleCenterX, circleCenterY, circleRadius)
	{
		let lineA;
		let lineB;
		
		let quadraticSolutions;
		
		let intersectionX;
		let intersectionY;
		
		//usecka je kolma
		if (lineSegmentStartX-lineSegmentEndX === 0)
		{	
			quadraticSolutions = this.SolveQuadraticEquation(1, -2*circleCenterY, lineSegmentStartX*lineSegmentStartX - 2*lineSegmentStartX*circleCenterX + circleCenterX*circleCenterX + circleCenterY*circleCenterY - circleRadius*circleRadius);
			
			//muze byt start nebo end - nezalezi na tom
			intersectionX = lineSegmentStartX;
			intersectionY = (quadraticSolutions[0] >= lineSegmentStartY && quadraticSolutions[0] <= lineSegmentEndY) || (quadraticSolutions[0] <= lineSegmentStartY &&  quadraticSolutions[0] >= lineSegmentEndY) ? quadraticSolutions[0] : quadraticSolutions[1];
			
			return[intersectionX, intersectionY];
		}
		else
		{
			lineA = (lineSegmentStartY-lineSegmentEndY)/(lineSegmentStartX-lineSegmentEndX);
			lineB = lineSegmentStartY-lineA*lineSegmentStartX;
			
			quadraticSolutions = this.SolveQuadraticEquation(lineA*lineA + 1, 2*(lineA*lineB - lineA*circleCenterY - circleCenterX), lineB*lineB - 2*lineB*circleCenterY + circleCenterY*circleCenterY + circleCenterX*circleCenterX - circleRadius*circleRadius);
			
			//reseni musi lezet na usecce
			intersectionX = (quadraticSolutions[0] >= lineSegmentStartX && quadraticSolutions[0] <= lineSegmentEndX) || (quadraticSolutions[0] <= lineSegmentStartX &&  quadraticSolutions[0] >= lineSegmentEndX) ? quadraticSolutions[0] : quadraticSolutions[1];
			intersectionY = lineA*intersectionX+lineB;
			
			return [intersectionX, intersectionY];
		}
	}
	
	//-----DRAW------------------------------------------------------
	
	//vykresleni hlavicky sipky
	DrawArrowhead(context, arrowheadTipX, arrowheadTipY, arrowheadBaseX, arrowheadBaseY, lineDirectionNormalX, lineDirectionNormalY, halfThickness)
	{
		context.beginPath();
		context.moveTo(arrowheadTipX, arrowheadTipY);
		//vektor usecky odcitame, protoze pri vyhresleni spicky se musime vratit do startu
		//normalovy vektor je prvne +, pak -, nezalezi na poradi
		context.lineTo(arrowheadBaseX+(lineDirectionNormalX*halfThickness),arrowheadBaseY+(lineDirectionNormalY*halfThickness));
		context.lineTo(arrowheadBaseX-(lineDirectionNormalX*halfThickness),arrowheadBaseY-(lineDirectionNormalY*halfThickness));
		context.closePath();
		
		context.fill();
	}
	
	//vykresleni cary v pripade, ze se jedna o jedine propojeni v clusteru - nemusime pocitat slozite prusecik s kruhem
	//sipka se vykresli u kruhu - takze musime pocitat prusecik
	DrawWithArrowsNearCirclesEqualsOne(context, lineDirectionNormalX, lineDirectionNormalY, lineDirectionVectorX, lineDirectionVectorY, arrowheadLength, arrowheadHalfThickness)
	{
		this.normalOffsetX = 0;
		this.normalOffsetY = 0;
		
		let intersectionX = this.endNode.x-lineDirectionVectorX*this.endNode.radius;
		let intersectionY = this.endNode.y-lineDirectionVectorY*this.endNode.radius;
		
		let arrowheadBaseX = intersectionX-lineDirectionVectorX*arrowheadLength;
		let arrowheadBaseY = intersectionY-lineDirectionVectorY*arrowheadLength;
		
		context.beginPath();
		context.moveTo(this.startNode.x, this.startNode.y);
		context.lineTo(arrowheadBaseX, arrowheadBaseY);
		context.stroke();
		
		this.DrawArrowhead(context, intersectionX, intersectionY, arrowheadBaseX, arrowheadBaseY, lineDirectionNormalX, lineDirectionNormalY, arrowheadHalfThickness);
	}
	
	//vykresleni cary v pripade, ze cluster ma vice propojeni
	//sipka se vykresli u kruhu - takze musime pocitat prusecik
	DrawWithArrowsNearCirclesMoreThanOne(context, lineDirectionNormalX, lineDirectionNormalY, lineDirectionVectorX, lineDirectionVectorY, centerOffset, arrowheadLength, arrowheadHalfThickness)
	{
		let scaledNormalX = lineDirectionNormalX*centerOffset;
		let scaledNormalY = lineDirectionNormalY*centerOffset;
		
		this.normalOffsetX = scaledNormalX;
		this.normalOffsetY = scaledNormalY;
		
		let lineStartX = this.startNode.x+scaledNormalX;
		let lineStartY = this.startNode.y+scaledNormalY;
		let lineEndX = this.endNode.x+scaledNormalX;
		let lineEndY = this.endNode.y+scaledNormalY;
		
		let intersectionStart = this.CalculateCircleLineSegmentIntersection(lineStartX, lineStartY, lineEndX, lineEndY, this.endNode.x, this.endNode.y, this.endNode.radius);

		let arrowheadBaseX = intersectionStart[0]-lineDirectionVectorX*arrowheadLength;
		let arrowheadBaseY = intersectionStart[1]-lineDirectionVectorY*arrowheadLength;
		
		context.beginPath();
		context.moveTo(lineStartX, lineStartY);
		context.lineTo(arrowheadBaseX, arrowheadBaseY);
		context.stroke();

		this.DrawArrowhead(context, intersectionStart[0], intersectionStart[1], arrowheadBaseX, arrowheadBaseY, lineDirectionNormalX, lineDirectionNormalY, arrowheadHalfThickness);
	}
	
	//vykresleni popisu
	DrawDescription(context, positionX, positionY)
	{
		context.fillText(this.shortName, positionX+this.normalOffsetX, positionY+this.normalOffsetY);
	}	
}

//uzel grafu
class Node
{
	constructor() 
	{
		//hash set, ktery ukazuje na connection clustery podle identifikatoru uzlu
		this.connectedNodesClusters = new Map();
		//normalni seznamy pro projeti vsech spojeni rychleji
		this.connectedObjectNodesClusters = [];
		this.connectedLiteralNodesClusters = [];
		
		//pocty clusteru a jednotlivych propojeni tohoto uzlu
		this.totalConnectionClusters = 0;
		this.totalConnections = 0;
		
		this.twoPI = Math.PI*2;
		//polomer pro vykresleni
		this.radius = 1;
		
		//souradnice v prostoru
		this.x = 1;
		this.y = 1;
		
		//vektor posunu - vyuzito pri vypostu fyziky
		this.movementVectorX = 0;
		this.movementVectorY = 0;
		
		//velikost a typ pisma pro popis - musime vypocitat zvlast pro kazdy uzel, tak aby se to veslo to prostoru kruhu
		this.font;
	}
	
	//vypne nebo zapne zvyrazneni uzlu
	ToggleHighlight(highlightedNodes, thisNode)
	{
		//literalnich uzlu se to netyka
		if (this.IsThisNodeLiteral === true)
		{
			return;
		}
		else
		{
			if (this.highlighted === false)
			{
				this.highlighted = true;
				highlightedNodes.set(this.identifier, thisNode);
				
				//zapneme zvyrazneni vsech sousesicich clusteru
				for (let i = 0; i < this.connectedObjectNodesClusters.length; i++)
				{
					this.connectedObjectNodesClusters[i].ToggleHighlight(this.identifier);
				}
				
				let actCluster;
				
				for (let i = 0; i < this.connectedLiteralNodesClusters.length; i++)
				{
					this.connectedLiteralNodesClusters[i].ToggleHighlight(this.identifier);
				}
			}
			else
			{
				this.highlighted = false;
				highlightedNodes.delete(this.identifier);
				
				//vypneme zvyrazneni vsech sousesicich clusteru
				for (let i = 0; i < this.connectedObjectNodesClusters.length; i++)
				{
					this.connectedObjectNodesClusters[i].ToggleHighlight(this.identifier);
				}
				
				for (let i = 0; i < this.connectedLiteralNodesClusters.length; i++)
				{
					this.connectedLiteralNodesClusters[i].ToggleHighlight(this.identifier);
				}
			}
		}
	}
	
	//prida novou connection clusteru do uzlu
	AddConnectionClusterToNode(nodeToConnectToIdentifier, connectionCluster, connectionPointsToLiteral)
	{
		this.connectedNodesClusters.set(nodeToConnectToIdentifier, connectionCluster);
		
		if (connectionPointsToLiteral === true)
		{
			this.connectedLiteralNodesClusters.push(connectionCluster);
		}
		else
		{
			this.connectedObjectNodesClusters.push(connectionCluster);
		}
	}
	
	//zkontroluje, jestli uzel obsahuje propojeni do literalniho uzlu s konkretni hodnotou
	DoesLiteralConnectionAlreadyExist(connectionIdentifier, value)
	{
		let actConnection;
		
		for (let i = 0; i < this.connectedLiteralNodesClusters.length; i++)
		{
			//literalni uzel ma vzdy jedno propojeni, tedy nemusime cyklit seznamem vsech propojeni
			actConnection = this.connectedLiteralNodesClusters[i].allConnections[0];
			if (actConnection.identifier === connectionIdentifier)
			{
				//literalni uzel je vzdy na konci - tedy end node, nemusime dal resit
				if (actConnection.endNode.value === value)
				{
					return true;
				}
			}
		}
		
		return false;
	}
	
	//posune pozici podle vektoru pohybu
	UpdatePositionAccordingToMovementVector()
	{
		this.x += this.movementVectorX;
		this.y += this.movementVectorY;
	}
	
	//vyresetuje vektor pohybu
	ResetMovementVector()
	{
		this.movementVectorX = 0;
		this.movementVectorY = 0;
	}
	
	//vypocita polomer uzlu z plochy, ktera nalezi jednomu uzlu
	//potreba jen pro rozlozeni podle sil, protoze graf bude mit ruzne velikosti
	//vypocitani polomer vrati
	CalculateRadius_FORCES(areaPerNode)
	{
		let localFactor = 10+areaPerNode/100000;
		
		this.radius = localFactor + (this.connectedObjectNodesClusters.length*(localFactor/10));
		
		return this.radius;
	}
	
	//vypocita polomer, zadklad je uz znamy, tedy se tady jen zvetsuje polomer podle poctu propojeni
	CalculateRadius_GREEDY(baseRadius)
	{
		this.radius = baseRadius + (this.connectedObjectNodesClusters.length*(baseRadius/10));
		
		//spacing mrize je 100 - aby se neprekryvali
		if (this.radius > 40)
		{
			this.radius = 40;
		}
		
		return this.radius;
	}
	
	//-----DRAW------------------------------------------------------
	
	//vykresli kruh reprezentijici uzel bez popisu
	DrawNodeShape(context)
	{
		//zalezi na tom, jestli je uzel zvyraznen
		if (this.highlighted === true)
		{
			context.fillStyle = "#0000FF";
			context.beginPath();
			context.arc(this.x, this.y, this.radius, 0, this.twoPI);
			context.fill();
			context.fillStyle = "#e60000";
		}
		else
		{
			context.beginPath();
			context.arc(this.x, this.y, this.radius, 0, this.twoPI);
			context.fill();
		}
	}
}

//objektovy uzel
class ObjectNode extends Node
{	
	constructor(shortPrefix, longPrefix, shortName, longName) 
	{
		super();
		
		//identifikatory navic
		this.identifier = shortName;
		
		this.shortName = shortName;
		this.longName = longName;
		this.shortPrefix = shortPrefix;
		this.longPrefix = longPrefix;	
		
		this.IsThisNodeLiteral = false;
		
		this.highlighted = false;
	}
	
	//vypocita velikost pisma tak, aby se popis vesel do kruhu
	CalculateFontParameters()
	{
		let localContext = context;
		let localText = this.shortName;
		
		//vypocitame prostor potrebny pro vykresleni testu o velikosti 1px a 2px
		context.font = "1px Arial";
		let onePxLength = context.measureText(localText).actualBoundingBoxLeft+context.measureText(localText).actualBoundingBoxRight;
		context.font = "2px Arial";
		let twoPxLength = context.measureText(localText).actualBoundingBoxLeft+context.measureText(localText).actualBoundingBoxRight;
		
		//spocitame rozdil
		let onePxDifference = twoPxLength-onePxLength;
		
		//dostupny prostor
		let availableWidth = this.radius*1.8;
		
		//velikost v px a delka textu jsou linearne zavisle na sobe - staci tedy jen podelit max delku tou delkou, ktera reprezentuje rozdil pri zmene o jeden pixel
		let fontSize = availableWidth/onePxDifference;
		
		//pokud je text treba jen jedno cislo, precuhovalo by to vrchem - tedy omezime maximalni velikost v pixelech na polovinu polomeru
		if (fontSize > this.radius/2)
		{
			fontSize = this.radius/2;
		}
		
		this.font = fontSize.toString() + "px Arial";	
	}
	
	//-----DRAW------------------------------------------------------
	
	//samotne vypsani textu
	DrawDescription(context, showNodeDescription)
	{
		if (this.highlighted === false && showNodeDescription === false)
		{
			return;
		}
		
		context.font = this.font;
		context.fillText(this.shortName, this.x, this.y);
	}
}

//literalni uzel
class LiteralNode extends Node
{
	constructor(artificialId, value, valueType) 
	{
		super();
		
		//identifikatory navic
		this.identifier = artificialId;
		
		this.value = value;
		this.valueType = valueType;
		
		this.IsThisNodeLiteral = true;
		
		this.displayText = false;
	}
	
	//vypocita velikost pisma tak, aby se popis vesel do kruhu
	CalculateFontParameters()
	{
		let localContext = context;
		let localText = this.value;
		
		//vypocitame prostor potrebny pro vykresleni testu o velikosti 1px a 2px
		context.font = "1px Arial";
		let onePxLength = context.measureText(localText).actualBoundingBoxLeft+context.measureText(localText).actualBoundingBoxRight;
		context.font = "2px Arial";
		let twoPxLength = context.measureText(localText).actualBoundingBoxLeft+context.measureText(localText).actualBoundingBoxRight;
		
		//spocitame rozdil
		let onePxDifference = twoPxLength-onePxLength;
		
		//dostupny prostor
		let availableWidth = this.radius*1.8;
		
		//velikost v px a delka textu jsou linearne zavisle na sobe - staci tedy jen podelit max delku tou delkou, ktera reprezentuje rozdil pri zmene o jeden pixel
		let fontSize = availableWidth/onePxDifference;
		
		//pokud je text treba jen jedno cislo, precuhovalo by to vrchem - tedy omezime maximalni velikost v pixelech na polovinu polomeru
		if (fontSize > this.radius/2)
		{
			fontSize = this.radius/2;
		}
		
		this.font = fontSize.toString() + "px Arial";	
	}
	
	//-----DRAW------------------------------------------------------
	
	//samotne vypsani textu
	DrawDescription(context, showNodeDescription)
	{
		if (this.displayText === false && showNodeDescription === false)
		{
			return;
		}
		
		context.font = this.font;
		context.fillText(this.value, this.x, this.y);
	}
}

//hlavni trida, ktera zastituje manipulaci s grafem a jeho vykresleni
class Graph
{
	constructor() 
	{
		//hash map pro rychle vyhledavani
		this.objectNodes = new Map();
		this.literalNodes = new Map();
		
		//seznam pro rychly vycet
		this.allNodes = [];
		
		//quadtree pro rychle query uzlu v oblasti
		this.nodesQuadTree;
		
		//seznam uzlu vytazenych z quadtree, ktery reprezentuje uzly, ktere jsou aktualne videt v pohledovem okne
		this.nodesInView = [];
		
		this.highlightedNodes = new Map();
		
		//seznam clusteru
		this.connectionClusters = [];
		
		//lookup namespacu
		this.shortFormToLongFormNamespaceLookup = new Map();
		this.longFormToShortFormNamespaceLookup = new Map();
		
		//unikatni umele identifikatory pro literalni uzly a clustery(nemaji vlastni)
		this.literalNodeActIdentifier = 1;
		this.clusterActIdentifier = 1;
		
		//promene, podle kterych se urci parametry vykresleni (tloustka car atd...)
		this.areaPerNode = 1;
		this.biggestRadius = 0;
		this.smallestRadius = Infinity;
		
		//odsazeni od kraju platna
		this.border = 50;
		
		//toto urcuje posun a scale grafu tak, aby se presne vesel do platna
		//graf muze mit ruzne velikosti - nebudeme transformovat body, ale ztraformujeme vykreslovaci matici
		this.translationTwoX = 0;
		this.translationTwoY = 0;

		//X a Y jsou stejny - graf zachovava puvodni proporce
		this.scaleOne = 1;
		
		this.translationOneX = 0;
		this.translationOneY = 0;
		
		//toto urcuje pozici a velikost pohledoveho okna
		this.viewWindowPositionX = 0;
		this.viewWindowPositionY = 0;
		this.viewWindowScale = 1;
		
		this.viewWindowWidth = canvasWidth*this.viewWindowScale;
		this.viewWindowHeight = canvasHeight*this.viewWindowScale;

		// this.simplifiedConnections = true;
		this.simplifiedConnections = false;
		
		// this.showNodeDescription = false;
		this.showNodeDescription = true;
	}
	
	//puvodne vkladalo trojice do grafu, ted momentalne nefukcni - otazka jestli to vubec dava smysl ponechat, protoze stejne budou vsechny operace nefunkcni
	//eventulne predelet na vytvoreni seznamu trojic a pak standardne zavolat nejakou rozprostitraci funkci
	CreateNamespaceAndInsertTestTriplesIntoDatabase()
	{		
		this.AddNamespaceToGraph("ex", "http://example.org/");
	
		this.AddTripleToGraph("http://example.org/", "bookID1", "http://example.org/", "references0", "http://example.org/", "bookID2", false);
		this.AddTripleToGraph("http://example.org/", "bookID1", "http://example.org/", "references1", "http://example.org/", "bookID2", false);
		this.AddTripleToGraph("http://example.org/", "bookID1", "http://example.org/", "references2", "http://example.org/", "bookID2", false);
		this.AddTripleToGraph("http://example.org/", "bookID2", "http://example.org/", "references1", "http://example.org/", "bookID1", false);
		
		this.AddTripleToGraph("http://example.org/", "bookID2", "http://example.org/", "references0", "http://example.org/", "bookID3", false);
		this.AddTripleToGraph("http://example.org/", "bookID2", "http://example.org/", "references1", "http://example.org/", "bookID3", false);
		this.AddTripleToGraph("http://example.org/", "bookID3", "http://example.org/", "references1", "http://example.org/", "bookID2", false);
		
		this.AddTripleToGraph("http://example.org/", "bookID3", "http://example.org/", "references0", "http://example.org/", "bookID4", false);
		this.AddTripleToGraph("http://example.org/", "bookID4", "http://example.org/", "references0", "http://example.org/", "bookID3", false);
		
		this.AddTripleToGraph("http://example.org/", "bookID4", "http://example.org/", "references0", "http://example.org/", "bookID1", false);
		
		this.AddTripleToGraph("http://example.org/", "bookID4", "http://example.org/", "name0", "name1", "string", true);
		this.AddTripleToGraph("http://example.org/", "bookID4", "http://example.org/", "name0", "name2", "string", true);
		this.AddTripleToGraph("http://example.org/", "bookID4", "http://example.org/", "weight0", 31.1, "decimal", true);
		this.AddTripleToGraph("http://example.org/", "bookID4", "http://example.org/", "numerOfPages0", 14, "integer", true);
		
		this.AddTripleToGraph("http://example.org/", "bookID3", "http://example.org/", "name0", "name3", "string", true);
		this.AddTripleToGraph("http://example.org/", "bookID3", "http://example.org/", "weight0", 314.1, "decimal", true);
		this.AddTripleToGraph("http://example.org/", "bookID3", "http://example.org/", "numerOfPages0", 13, "integer", true);

		this.AddTripleToGraph("http://example.org/", "bookID2", "http://example.org/", "name0", "name4", "decimal", true);
		this.AddTripleToGraph("http://example.org/", "bookID2", "http://example.org/", "numerOfPages0", 120, "integer", true);
		
		this.AddTripleToGraph("http://example.org/", "bookID1", "http://example.org/", "name0", "testName", "string", true);
		
		//cele znova - zadny efekt
		this.AddTripleToGraph("http://example.org/", "bookID1", "http://example.org/", "references0", "http://example.org/", "bookID2", false);
		this.AddTripleToGraph("http://example.org/", "bookID1", "http://example.org/", "references1", "http://example.org/", "bookID2", false);
		this.AddTripleToGraph("http://example.org/", "bookID1", "http://example.org/", "references2", "http://example.org/", "bookID2", false);
		this.AddTripleToGraph("http://example.org/", "bookID2", "http://example.org/", "references1", "http://example.org/", "bookID1", false);
		
		this.AddTripleToGraph("http://example.org/", "bookID2", "http://example.org/", "references0", "http://example.org/", "bookID3", false);
		this.AddTripleToGraph("http://example.org/", "bookID2", "http://example.org/", "references1", "http://example.org/", "bookID3", false);
		this.AddTripleToGraph("http://example.org/", "bookID3", "http://example.org/", "references1", "http://example.org/", "bookID2", false);
		
		this.AddTripleToGraph("http://example.org/", "bookID3", "http://example.org/", "references0", "http://example.org/", "bookID4", false);
		this.AddTripleToGraph("http://example.org/", "bookID4", "http://example.org/", "references0", "http://example.org/", "bookID3", false);
		
		this.AddTripleToGraph("http://example.org/", "bookID4", "http://example.org/", "references0", "http://example.org/", "bookID1", false);
		
		this.AddTripleToGraph("http://example.org/", "bookID4", "http://example.org/", "name0", "name1", "string", true);
		this.AddTripleToGraph("http://example.org/", "bookID4", "http://example.org/", "name0", "name2", "string", true);
		this.AddTripleToGraph("http://example.org/", "bookID4", "http://example.org/", "weight0", 31.1, "decimal", true);
		this.AddTripleToGraph("http://example.org/", "bookID4", "http://example.org/", "numerOfPages0", 14, "integer", true);
		
		this.AddTripleToGraph("http://example.org/", "bookID3", "http://example.org/", "name0", "name3", "string", true);
		this.AddTripleToGraph("http://example.org/", "bookID3", "http://example.org/", "weight0", 314.1, "decimal", true);
		this.AddTripleToGraph("http://example.org/", "bookID3", "http://example.org/", "numerOfPages0", 13, "integer", true);

		this.AddTripleToGraph("http://example.org/", "bookID2", "http://example.org/", "name0", "name4", "decimal", true);
		this.AddTripleToGraph("http://example.org/", "bookID2", "http://example.org/", "numerOfPages0", 120, "integer", true);
		
		this.AddTripleToGraph("http://example.org/", "bookID1", "http://example.org/", "name0", "testName", "string", true);
	}
	
	//vlozeni trojice do grafu dle validnich pravidel RDF modelu
	//tato funkce vyzaduje nezkracene prefixy
	//pripadne by se dala rozsirit, aby brala i kratsi
	AddTripleToGraph(subjectLongPrefix, subjectName, predicateLongPrefix, predicateName, objectFirstParameter, objectSecondParameter, objectIsLiteral)
	{
		let subjectShortPrefix = this.longFormToShortFormNamespaceLookup.get(subjectLongPrefix);
		//subjectLongPrefix; zadano
		let subjectShortName;
		let subjectLongName = subjectLongPrefix + subjectName;
		
		//muze se vlozit uzel nebo propojeni, ktery nema zkracenou fromu prefixu - do kratkeho prefixu vlozime taky dlouhy prefix, short prefix nechame undefined
		if (subjectShortPrefix === undefined)
		{
			subjectShortName = subjectLongName;
		}
		else
		{
			subjectShortName = subjectShortPrefix + ":" + subjectName;
		}
		
		let predicateShortPrefix = this.longFormToShortFormNamespaceLookup.get(predicateLongPrefix);
		//predicateLongPrefix; zadano
		let predicateShortName;
		let predicateLongName = predicateLongPrefix + predicateName;
		
		//muze se vlozit uzel nebo propojeni, ktery nema zkracenou fromu prefixu - do kratkeho prefixu vlozime taky dlouhy prefix, short prefix nechame undefined
		if (predicateShortPrefix === undefined)
		{
			predicateShortName = predicateLongName;
		}
		else
		{
			predicateShortName = predicateShortPrefix + ":" + predicateName;
		}
		
		let objectShortPrefix;
		let objectLongPrefix;
		let objectShortName;
		let objectLongName;
		let objectValue;
		let objectValueType;
		
		//subjekt bude vzdy objektovy uzel
		//pokud nenajdeme existujici, tak vytvorime novy
		let subjectNode = this.objectNodes.get(subjectShortName);
		if (subjectNode === undefined)
		{
			subjectNode = new ObjectNode(subjectShortPrefix, subjectLongPrefix, subjectShortName, subjectLongName);
			this.objectNodes.set(subjectShortName, subjectNode);
			this.allNodes.push(subjectNode);
		}
		
		//najdeme uzel reprezentujici objekt
		//zalezi jestli je objektovy nebo literalni
		let objectNode;
		if (objectIsLiteral === true)
		{
			objectValue = objectFirstParameter;
			objectValueType = objectSecondParameter;
			
			//musime zjistit, jestli toto literalni spojeni uz existuje - jenomze literaly nemaji unikatni identifikator
			//tedy bohuzel musime projit vsechny literalni propojeni uzlu - linearni slozitost - jediny krok u ktereho nejde snizit na konstantni
			if (subjectNode.DoesLiteralConnectionAlreadyExist(predicateShortName, objectValue) === false)
			{
				//pokud je literal, vzdy vytvorime novy - i stejne hodnoty maji rozdilne uzly
				objectNode = new LiteralNode(this.literalNodeActIdentifier, objectValue, objectValueType);
				this.literalNodes.set(objectNode.identifier, objectNode);
				this.literalNodeActIdentifier++;
				this.allNodes.push(objectNode);
				
				//propojeni
				//pocet propojeni s literalnim uzlem bude vzdy 1
				//tedy vytvorime ConnectionCluster s jednim Connection
				let connectionCluster = new ConnectionCluster(subjectNode, objectNode, this.clusterActIdentifier);
				this.clusterActIdentifier++;
				this.connectionClusters.push(connectionCluster);
				connectionCluster.AddConnection(subjectNode, objectNode, predicateShortPrefix, predicateLongPrefix, predicateShortName, predicateLongName);
				//ulozime propojeni do obou uzlu
				subjectNode.AddConnectionClusterToNode(objectNode.identifier, connectionCluster, true);
				objectNode.AddConnectionClusterToNode(subjectShortName, connectionCluster, false);
			}			
		}
		else
		{
			objectLongPrefix = objectFirstParameter;
			objectShortPrefix = this.longFormToShortFormNamespaceLookup.get(objectLongPrefix);
			objectLongName = objectLongPrefix + objectSecondParameter;
			
			//muze se vlozit uzel nebo propojeni, ktery nema zkracenou fromu prefixu - do kratkeho prefixu vlozime taky dlouhy prefix, short prefix nechame undefined
			if (objectShortPrefix === undefined)
			{
				objectShortName = objectLongName;
			}
			else
			{
				objectShortName = objectShortPrefix + ":" + objectSecondParameter;
			}
		
			objectNode = this.objectNodes.get(objectShortName);
			
			if (objectNode === undefined)
			{
				objectNode = new ObjectNode(objectShortPrefix, objectLongPrefix, objectShortName, objectLongName);
				this.objectNodes.set(objectShortName, objectNode);
				this.allNodes.push(objectNode);
			}
			
			//propojeni
			//najdeme jestli subjekt a objekt jsou jiz propojeny
			//muzeme se zeptat bud jestli prvni je propojen s druhym nebo obracene - nezalezi na tom			
			let connectionCluster = this.objectNodes.get(objectShortName).connectedNodesClusters.get(subjectShortName);
			
			if (connectionCluster === undefined)
			{
				connectionCluster = new ConnectionCluster(subjectNode, objectNode, this.clusterActIdentifier);
				this.clusterActIdentifier++;
				connectionCluster.AddConnection(subjectNode, objectNode, predicateShortPrefix, predicateLongPrefix, predicateShortName, predicateLongName);
				this.connectionClusters.push(connectionCluster);
				
				subjectNode.AddConnectionClusterToNode(objectShortName, connectionCluster, false);
				objectNode.AddConnectionClusterToNode(subjectShortName, connectionCluster, false);	
			}
			else
			{
				//pokud uz tam takove propojeni je - tak se nic nestane
				if (connectionCluster.DoesConnectionAlreadyExist(subjectNode, predicateShortName) === false)
				{
					connectionCluster.AddConnection(subjectNode, objectNode, predicateShortPrefix, predicateLongPrefix, predicateShortName, predicateLongName);
				
					//do uzlu uz cluster nepridavame kdyz cluster existuje - odkaz uz tam je
				}
			}
		}
	}
	
	//vlozeni n trojic do grafu
	AddTriplesToGraph(triples)
	{
		let triplesLength = triples.length;
		
		for (let i = 0; i < triplesLength; i++)
		{	
			this.AddTripleToGraph(triples[i][0], triples[i][1], triples[i][2], triples[i][3], triples[i][4], triples[i][5], triples[i][6]);
		}
	}
	
	//vlozeni namespacu
	AddNamespaceToGraph(shortForm, longForm)
	{
		//namespace pridame jen pokud uz neexistuje
		if (this.shortFormToLongFormNamespaceLookup.get(shortForm) === undefined)
		{
			this.shortFormToLongFormNamespaceLookup.set(shortForm, longForm);
			this.longFormToShortFormNamespaceLookup.set(longForm, shortForm);	
		}
	}
	
	//vlozeni n namespacu
	AddNamespacesToGraph(namespaces)
	{
		let namespacesLength = namespaces.length;
		
		for (let i = 0; i < namespacesLength; i++)
		{
			this.AddNamespaceToGraph(namespaces[i][0], namespaces[i][1]);
		}
	}
	
	//vymaze cely graf
	ClearGraph()
	{
		this.objectNodes.clear();
		this.literalNodes.clear();
		this.literalNodeActIdentifier = 1;
		this.allNodes = [];
		
		this.nodesQuadTree = undefined;
		
		this.nodesInView = [];
		
		this.highlightedNodes = new Map();
		
		this.connectionClusters = [];
		
		//clear namespacu
		this.shortFormToLongFormNamespaceLookup.clear();
		this.longFormToShortFormNamespaceLookup.clear();
		
		this.viewWindowPositionX = 0;
		this.viewWindowPositionY = 0;
		this.viewWindowScale = 1;
		
		this.viewWindowWidth = canvasWidth*this.viewWindowScale;
		this.viewWindowHeight = canvasHeight*this.viewWindowScale;
	}
	
	//vymaze cely graf krome namespacu
	ClearGraphExceptNamespaces()
	{
		this.objectNodes.clear();
		this.literalNodes.clear();
		this.literalNodeActIdentifier = 1;
		this.allNodes = [];
		
		this.nodesQuadTree = undefined;
		
		this.nodesInView = [];
		
		this.highlightedNodes = new Map();
		
		this.connectionClusters = [];
		
		this.viewWindowPositionX = 0;
		this.viewWindowPositionY = 0;
		this.viewWindowScale = 1;
		
		this.viewWindowWidth = canvasWidth*this.viewWindowScale;
		this.viewWindowHeight = canvasHeight*this.viewWindowScale;
	}
	
	//tato funkce provede na startu framu reset vsech potrebnych promennych
	UpdateAllVariablesOnFrameStart()
	{	
		let localConnectionClusters = this.connectionClusters;
	
		for (let i = 0; i < localConnectionClusters.length; i++)
		{
			localConnectionClusters[i].CalculateAndUpdateDistanceAndVector();
		}
	}
	
	//-----TRANSFORMS--------------------------------------------------------------------------------------------------------------------------
	
	//funkce vrati krajni souradnice grafu
	ReturnEdgeCoordinatesOfAllNodes(localAllNodes, localAllNodesLength)
	{
		let actNode;
		
		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;
		
		for (let i = 0; i < localAllNodesLength; i++)
		{
			actNode = localAllNodes[i];
			
			if (actNode.x < minX)
			{
				minX = actNode.x;
			}
			
			if (actNode.x > maxX)
			{
				maxX = actNode.x;
			}
			
			if (actNode.y < minY)
			{
				minY = actNode.y;
			}
			
			if (actNode.y > maxY)
			{
				maxY = actNode.y;
			}
		}
		
		return [minX,maxX,minY,maxY];
	}
	
	//funkce vrati krajni souradnice grafu se zapocitanymi polomery uzlu
	ReturnEdgeCoordinatesOfAllNodesWithRadii(localAllNodes, localAllNodesLength)
	{
		let actNode;
		
		let xMinusRadius;
		let xPlusRadius;
		let yMinusRadius;
		let yPlusRadius;
		
		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;
		
		for (let i = 0; i < localAllNodesLength; i++)
		{
			actNode = localAllNodes[i];
			
			xMinusRadius = actNode.x - actNode.radius;
			xPlusRadius = actNode.x + actNode.radius;
			yMinusRadius = actNode.y - actNode.radius;
			yPlusRadius = actNode.y + actNode.radius;
			
			if (xMinusRadius < minX)
			{
				minX = xMinusRadius;
			}
			
			if (xPlusRadius > maxX)
			{
				maxX = xPlusRadius;
			}
			
			if (yMinusRadius < minY)
			{
				minY = yMinusRadius;
			}
			
			if (yPlusRadius > maxY)
			{
				maxY = yPlusRadius;
			}
		}
		
		return [minX,maxX,minY,maxY];
	}
	
	//-----WIEW-WINDOW-------------------------------------------------------------------------------------------------------------------------
	
	//posunuti aktualniho pohledoveho okna
	ChangeWiewWindowPosition(deltaX, deltaY)
	{
		let localCanvasWidth = canvasWidth;
		let localCanvasHeight = canvasHeight;
		
		let localViewWindowScale = this.viewWindowScale;
		
		let localViewWindowPositionX = this.viewWindowPositionX;
		let localViewWindowPositionY = this.viewWindowPositionY;
		
		let localViewWindowWidth = this.viewWindowWidth;
		let localViewWindowHeight = this.viewWindowHeight;
		
		//krome scalu take otocime smer - tak mi to prijde prirozenejsi
		let scaledDeltaX = -1*deltaX*localViewWindowScale;
		let scaledDeltaY = -1*deltaY*localViewWindowScale;
		
		let newXposition = localViewWindowPositionX+scaledDeltaX;
		let newYposition = localViewWindowPositionY+scaledDeltaY;
		
		
		//indexy jsou 0 az canvasWidth-1
		if (newXposition < 0)
		{
			newXposition = 0;
		}
		else if (newXposition+localViewWindowWidth >= localCanvasWidth)
		{
			newXposition = localCanvasWidth-localViewWindowWidth;
		}
		
		//indexy jsou 0 az canvasHeight-1
		if (newYposition < 0)
		{
			newYposition = 0;
		}
		else if (newYposition+localViewWindowHeight >= localCanvasHeight)
		{
			newYposition = localCanvasHeight-localViewWindowHeight;
		}
		
		this.viewWindowPositionX = newXposition;
		this.viewWindowPositionY = newYposition;
		
		//upraveni mnoziny uzlu, ktere vidime
		this.QueryNodesInView();
	}
	
	//priblizeni nebo oddaleni na to misto, kde je kurzor
	//okopirovane google maps
	//objekt, na ktery ukazuje kurzor zustava ve stejne relativni pozici vuci oknu
	//zvetseni/oddaleni jednoho posunu kolecka misi je 20% (vuci aktualni hodnote, tam se to mozna lisi od google maps)
	ChangeWiewWindowScale(wheelMovement, mouseX, mouseY)
	{
		let magnification = 1.25;
		
		let localCanvasWidth = canvasWidth;
		let localCanvasHeight = canvasHeight;
		
		let localViewWindowScale = this.viewWindowScale;
		
		//realna pozice pocatku okna
		let localViewWindowPositionX = this.viewWindowPositionX;
		let localViewWindowPositionY = this.viewWindowPositionY;
	
		// realna pozice mysi
		let transformedMouseX = this.viewWindowPositionX + mouseX*localViewWindowScale;
		let transformedMouseY = this.viewWindowPositionY + mouseY*localViewWindowScale;
		
		//realne rozmery okna
		let localViewWindowWidth = this.viewWindowWidth;
		let localViewWindowHeight = this.viewWindowHeight;
		
		//vypocitame v jake relativni pozici je mys vuci oknu (jako zlomek delky X a Y)
		//jednoduche - okno ma rozmery canvasu a normalni pozice je dana vuci canvasu - nemusime resit priblizeni
		let mouseRelativeX = mouseX/localCanvasWidth;
		let mouseRelativeY = mouseY/localCanvasHeight;
		
		//otocime znamenko (trochu nesikovny, ze to vyslo tak ze forward je kladny)
		//pote muzem pouzit primo umocneni na priblizeni i oddaleni - zaporny exponent vyusti v deleni
		let finalMagnification = magnification**(-1*wheelMovement);
		
		//ted vypocitame nove delky okna a scale
		localViewWindowScale *= finalMagnification;	
		localViewWindowWidth *= finalMagnification;
		localViewWindowHeight *= finalMagnification;
		
		//ted zbyva pouze urcit pozici okna
		//tu vypocitame tak, ze zjistime relativni pozici vuci novym rozmerum a posuneme obracene vuci realne pozici mysi
		localViewWindowPositionX = transformedMouseX - mouseRelativeX*localViewWindowWidth;
		localViewWindowPositionY = transformedMouseY - mouseRelativeY*localViewWindowHeight;
		
		//nemuzeme oddalit vic, nez je maximalni(defaultni) oddaleni
		//priblizeni tento problem nema
		if (wheelMovement < 0)
		{
			if (localViewWindowScale > 1)
			{
				localViewWindowScale = 1;
				localViewWindowWidth = localCanvasWidth;
				localViewWindowHeight = localCanvasHeight;
			}
			
			//indexy jsou 0 az canvasWidth-1
			if (localViewWindowPositionX < 0)
			{
				localViewWindowPositionX = 0;
			}
			else if (localViewWindowPositionX+localViewWindowWidth >= localCanvasWidth)
			{
				localViewWindowPositionX = localCanvasWidth-localViewWindowWidth-1;
			}
			
			//indexy jsou 0 az canvasHeight-1
			if (localViewWindowPositionY < 0)
			{
				localViewWindowPositionY = 0;
			}
			else if (localViewWindowPositionY+localViewWindowHeight >= localCanvasHeight)
			{
				localViewWindowPositionY = localCanvasHeight-localViewWindowHeight-1;
			}
		}
		
		this.viewWindowPositionX = localViewWindowPositionX;
		this.viewWindowPositionY = localViewWindowPositionY;
		this.viewWindowScale = localViewWindowScale;
		this.viewWindowWidth = localViewWindowWidth;
		this.viewWindowHeight = localViewWindowHeight;
		
		//upraveni mnoziny uzlu, ktere vidime
		this.QueryNodesInView();
	}

	//-----GRAPH-MANIPULATION------------------------------------------------------------------------------------------------------------------
	
	//funkce vrati z quad tree vsechny uzly, ktery jsou aktualne viditelny
	QueryNodesInView()
	{	
		//v podstate inverzni trasformace oproti vykresleni grafu
		let realViewWindowPositionLeftBorder = this.viewWindowPositionX;

		realViewWindowPositionLeftBorder = realViewWindowPositionLeftBorder-this.translationTwoX;
		realViewWindowPositionLeftBorder = realViewWindowPositionLeftBorder/this.scaleOne;
		realViewWindowPositionLeftBorder = realViewWindowPositionLeftBorder-this.translationOneX;
		
		let realViewWindowPositionTopBorder = this.viewWindowPositionY;

		realViewWindowPositionTopBorder = realViewWindowPositionTopBorder-this.translationTwoY;
		realViewWindowPositionTopBorder = realViewWindowPositionTopBorder/this.scaleOne;
		realViewWindowPositionTopBorder = realViewWindowPositionTopBorder-this.translationOneY;
		
		let realScale = this.viewWindowScale/this.scaleOne;
		
		let realViewWindowPositionRightBorder = realViewWindowPositionLeftBorder+this.viewWindowWidth/this.scaleOne;
		let realViewWindowPositionBottomBorder = realViewWindowPositionTopBorder+this.viewWindowHeight/this.scaleOne;
		
		realViewWindowPositionLeftBorder -= this.biggestRadius;
		realViewWindowPositionTopBorder -= this.biggestRadius;
		realViewWindowPositionRightBorder += this.biggestRadius;
		realViewWindowPositionBottomBorder += this.biggestRadius;
		
		this.nodesInView = this.nodesQuadTree.Query(realViewWindowPositionLeftBorder, realViewWindowPositionRightBorder, realViewWindowPositionTopBorder, realViewWindowPositionBottomBorder);
	}
	
	//vrati seznam uzlu, na ktere ukazuje kurzor, kdyz na nic tak prazdny seznam
	GetMouseoverNodes(mouseX, mouseY)
	{
		mouseX = mouseX*this.viewWindowScale;
		mouseX = mouseX+this.viewWindowPositionX;
		mouseX = mouseX-this.translationTwoX;
		mouseX = mouseX/this.scaleOne;
		mouseX = mouseX-this.translationOneX;
		
		let realMouseXInGraph = mouseX;
		
		mouseY = mouseY*this.viewWindowScale;
		mouseY = mouseY+this.viewWindowPositionY;
		mouseY = mouseY-this.translationTwoY;
		mouseY = mouseY/this.scaleOne;
		mouseY = mouseY-this.translationOneY;
		
		let realMouseYInGraph = mouseY;
		
		let localNodesInView = this.nodesInView;
		let localNodesInViewLength = localNodesInView.length;

		let actNode;
		let distanceFromNodeToCursor;
		
		let deltaX;
		let deltaY;
		
		let mouseoverNodes = [];

		for (let i = 0; i < localNodesInViewLength; i++)
		{
			actNode = localNodesInView[i];
			
			deltaX = actNode.x - realMouseXInGraph;
			deltaY = actNode.y - realMouseYInGraph;
			
			distanceFromNodeToCursor = Math.sqrt(deltaX*deltaX+deltaY*deltaY);
			
			if (distanceFromNodeToCursor < actNode.radius)
			{
				mouseoverNodes.push(actNode);
			}
		}
		
		return mouseoverNodes;
	}
	
	//posune uzel o danou vzdalenost
	MoveNodes(nodesToMove, deltaX, deltaY)
	{		
		let realScale = this.viewWindowScale/this.scaleOne;
		
		let realDeltaX = realScale*deltaX;
		let realDeltaY = realScale*deltaY;
		
		let actNode;
		
		//posunuti v quadtree se udela tak, ze se uzel vydela, posune a pak znovu vlozi do quad tree
		for (let i = 0; i < nodesToMove.length; i++)
		{
			actNode = nodesToMove[i];
			
			this.nodesQuadTree.DeletePoint(actNode.x, actNode.y);
			
			nodesToMove[i].x += realDeltaX;
			nodesToMove[i].y += realDeltaY;
			
			this.nodesQuadTree.InsertPoint(actNode.x, actNode.y, actNode);
		}
	}
	
	//-----GREEDY------------------------------------------------------------------------------------------------------------------------------
	
	//rozlozi uzly v prostoru podle greedy metody
	DistributeNodesInPlane_GREEDY()
	{
		let localAllNodes = this.allNodes;
		let localAllNodesLength = localAllNodes.length;
		
		let radius = 10;
		
		let availableCoordinates = this.PrepareCoordinatesArray_GREEDY(localAllNodesLength);
		
		let availableNodes = new Map();
		
		let actNode;
		for (let i = 0; i < localAllNodesLength; i++)
		{
			actNode = localAllNodes[i];
			availableNodes.set(actNode.identifier, actNode);
		}
		
		actNode = availableNodes.get(localAllNodes[0].identifier);
		
		//prvni uzel dame zhruba do prostred
		availableCoordinates[Math.floor(localAllNodesLength/2)][2] = true;
			
		actNode.x = availableCoordinates[Math.floor(localAllNodesLength/2)][0];
		actNode.y = availableCoordinates[Math.floor(localAllNodesLength/2)][1];

		let nodesToExpand = [actNode];
		availableNodes.delete(actNode.identifier);
		
		let connectedNode;
		
		let minLength;
		let minIndex;
		
		let deltaX;
		let deltaY;
		let actLength;
		
		let actCoordinate;
		
		while (nodesToExpand.length !== 0)
		{
			//linearni
			actNode = nodesToExpand.shift();
			// actNode = nodesToExpand.pop();
			
			//projdeme vsemi uzly, ktere jsou spojeny s s aktualnim
			for (let cluster of actNode.connectedNodesClusters.values())
			{
				if (cluster.nodeA === actNode)
				{
					connectedNode = cluster.nodeB;
				}
				else
				{
					connectedNode = cluster.nodeA;
				}
				
				//overime, zda uzel uz neni vlozen v plose
				if (availableNodes.get(connectedNode.identifier) !== undefined)
				{
					//pro kazdy vypocitame nejblissi volnou souradnici
					minLength = Infinity;
					
					for (let i = 0; i < localAllNodesLength; i++)
					{
						actCoordinate = availableCoordinates[i];
						
						// neni pouzita
						if (actCoordinate[2] === false)
						{
							deltaX = actCoordinate[0] - actNode.x;
							deltaY = actCoordinate[1] - actNode.y;
							
							actLength = deltaX*deltaX+deltaY*deltaY;
							
							if (actLength < minLength)
							{
								minLength = actLength;
								minIndex = i;
							}
						}
					}
					
					availableCoordinates[minIndex][2] = true;
					
					connectedNode.x = availableCoordinates[minIndex][0];
					connectedNode.y = availableCoordinates[minIndex][1];
					
					nodesToExpand.push(connectedNode);
					availableNodes.delete(connectedNode.identifier);
				}
			}

			//pokud je graf nespojity, tak vlozime nahodny zbyvajici prvek na nahodne zbyvajici misto a ten pak expandujeme
			if (nodesToExpand.length === 0 && availableNodes.size !== 0)
			{				
				for (let node of availableNodes.values())
				{
					for (let i = 0; i < localAllNodesLength; i++)
					{
						actCoordinate = availableCoordinates[i];
						
						// neni pouzita
						if (actCoordinate[2] === false)
						{
							node.x =  actCoordinate[0];
							node.y =  actCoordinate[1];
							
							actCoordinate[2] = true;
							
							break;
						}
					}
					
					nodesToExpand.push(node);
					availableNodes.delete(node.identifier);
					break;
				}
			}
		}

		//zjistime nejvetsi a nejmensi polomer (kvuli pozdejsi query do quadtree)
		this.biggestRadius = 0;
		this.smallestRadius = Infinity;
		
		let actRadius;
		for (let i = 0; i < localAllNodesLength; i++)
		{
			actRadius = localAllNodes[i].CalculateRadius_GREEDY(radius);
			
			if (actRadius > this.biggestRadius)
			{
				this.biggestRadius = actRadius;
			}
			
			if (actRadius < this.smallestRadius)
			{
				this.smallestRadius = actRadius;
			}
			
			localAllNodes[i].CalculateFontParameters();
		}
		
		//dopocitame parametry transformace
		let edgeCoordinatesWithRadii = this.ReturnEdgeCoordinatesOfAllNodesWithRadii(localAllNodes, localAllNodesLength);
		let graphWidth = edgeCoordinatesWithRadii[1]-edgeCoordinatesWithRadii[0];
		let graphHeight = edgeCoordinatesWithRadii[3]-edgeCoordinatesWithRadii[2];
		
		let canvasWithoutBorderWidth = canvasWidth-this.border*2;
		let canvasWithoutBorderHeight = canvasHeight-this.border*2;
		
		this.translationTwoX = canvasWidth/2;
		this.translationTwoY = canvasHeight/2;
		
		if (canvasWithoutBorderWidth/graphWidth > canvasWithoutBorderHeight/graphHeight)
		{
			this.scaleOne = canvasWithoutBorderHeight/graphHeight;
		}
		else
		{
			this.scaleOne = canvasWithoutBorderWidth/graphWidth;
		}
		
		this.translationOneX = -(edgeCoordinatesWithRadii[0]+edgeCoordinatesWithRadii[1])/2;
		this.translationOneY = -(edgeCoordinatesWithRadii[2]+edgeCoordinatesWithRadii[3])/2;
		
		//quadTree
		//DULEZITE - quadtree musi zahrnovat celou plochu canvasu + nejaky previs
		//mysi je mozne posunout uzly mimo original hranice grafu a i trochu za hranice canvasu
		//previs dame + 50% vysky/sirky - kdyby tam nahodou byl nejakej uzel s obrovskym polomerem
		let quadTreeOriginX = (((-canvasWidth/2)-this.translationTwoX)/this.scaleOne)-this.translationOneX;
		let quadTreeOriginY = (((-canvasHeight/2)-this.translationTwoY)/this.scaleOne)-this.translationOneY;
		let quadTreeWidth = canvasWidth*2/this.scaleOne;
		let quadTreeHeight = canvasHeight*2/this.scaleOne;
		
		this.nodesQuadTree = new QuadTree([quadTreeOriginX, quadTreeOriginY], quadTreeWidth, quadTreeHeight, 1);

		for (let i = 0; i < localAllNodesLength; i++)
		{
			this.nodesQuadTree.InsertPoint(localAllNodes[i].x, localAllNodes[i].y, localAllNodes[i]);
		}
		
		this.QueryNodesInView();	
	}
	
	//vrati dvourozmerne pole souradnic, na ktere budeme vkldat uzly
	PrepareCoordinatesArray_GREEDY(requiredSize)
	{
		let nextSquareNumberBase = Math.ceil(Math.sqrt(requiredSize));
		
		let index = 0;
		let spacing = 100;
		
		let coordinates = [];
		
		for (let i = 1; i <= nextSquareNumberBase; i++)
		{
			for (let j = 1; j <= nextSquareNumberBase; j++)
			{
				if (index >= requiredSize)
				{
					return coordinates;
					break;
				}
				
				coordinates.push([spacing*j, spacing*i, false]);
				
				index++;
			}
		}
		
		return coordinates;
	}
	
	//-----GREEDYSWAP--------------------------------------------------------------------------------------------------------------------------
	
	//stejne jak greedy, provedeme ale prohozy nad greedy vysledkem
	DistributeNodesInPlane_GREEDYSWAP()
	{
		let localAllNodes = this.allNodes;
		let localAllNodesLength = localAllNodes.length;
		
		let radius = 10;
		
		let availableCoordinates = this.PrepareCoordinatesArray_GREEDY(localAllNodesLength);
		
		let availableNodes = new Map();
		
		let actNode;
		for (let i = 0; i < localAllNodesLength; i++)
		{
			actNode = localAllNodes[i];
			availableNodes.set(actNode.identifier, actNode);
		}
		
		actNode = availableNodes.get(localAllNodes[0].identifier);
		
		//prvni uzel dame zhruba do prostred
		availableCoordinates[Math.floor(localAllNodesLength/2)][2] = true;
			
		actNode.x = availableCoordinates[Math.floor(localAllNodesLength/2)][0];
		actNode.y = availableCoordinates[Math.floor(localAllNodesLength/2)][1];

		let nodesToExpand = [actNode];
		availableNodes.delete(actNode.identifier);
		
		let connectedNode;
		
		let minLength;
		let minIndex;
		
		let deltaX;
		let deltaY;
		let actLength;
		
		let actCoordinate;
		
		while (nodesToExpand.length !== 0)
		{
			//linearni
			actNode = nodesToExpand.shift();
			// actNode = nodesToExpand.pop();
			
			//projdeme vsemi uzly, ktere jsou spojeny s s aktualnim
			for (let cluster of actNode.connectedNodesClusters.values())
			{
				if (cluster.nodeA === actNode)
				{
					connectedNode = cluster.nodeB;
				}
				else
				{
					connectedNode = cluster.nodeA;
				}
				
				//overime, zda uzel uz neni vlozen v plose
				if (availableNodes.get(connectedNode.identifier) !== undefined)
				{
					//pro kazdy vypocitame nejblissi volnou souradnici
					minLength = Infinity;
					
					for (let i = 0; i < localAllNodesLength; i++)
					{
						actCoordinate = availableCoordinates[i];
						
						// neni pouzita
						if (actCoordinate[2] === false)
						{
							deltaX = actCoordinate[0] - actNode.x;
							deltaY = actCoordinate[1] - actNode.y;
							
							actLength = deltaX*deltaX+deltaY*deltaY;
							
							if (actLength < minLength)
							{
								minLength = actLength;
								minIndex = i;
							}
						}
					}
					
					availableCoordinates[minIndex][2] = true;
					
					connectedNode.x = availableCoordinates[minIndex][0];
					connectedNode.y = availableCoordinates[minIndex][1];
					
					nodesToExpand.push(connectedNode);
					availableNodes.delete(connectedNode.identifier);
				}
			}
			
			//pokud je graf nespojity, tak vlozime nahodny zbyvajici prvek na nahodne zbyvajici misto a ten pak expandujeme
			if (nodesToExpand.length === 0 && availableNodes.size !== 0)
			{
				for (let node of availableNodes.values())
				{
					for (let i = 0; i < localAllNodesLength; i++)
					{
						actCoordinate = availableCoordinates[i];
						
						// neni pouzita
						if (actCoordinate[2] === false)
						{
							node.x =  actCoordinate[0];
							node.y =  actCoordinate[1];
							
							actCoordinate[2] = true;
							
							break;
						}
					}
					
					nodesToExpand.push(node);
					availableNodes.delete(node.identifier);
					break;
				}
			}
		}
		
		let totalNumberOfSwaps;
		
		//provadime prohozeni, pokud lze najit takove, ktere snizi celkovou delku propojeni v grafu
		do
		{
			totalNumberOfSwaps = this.SwapSingleStep_GREEDYSWAP(localAllNodes, localAllNodesLength);
			console.log(totalNumberOfSwaps);
		}
		while (totalNumberOfSwaps !== 0)
	
		//zjistime nejvetsi a nejmensi polomer (kvuli pozdejsi query do quadtree)
		this.biggestRadius = 0;
		this.smallestRadius = Infinity;
		
		let actRadius;
		for (let i = 0; i < localAllNodesLength; i++)
		{
			actRadius = localAllNodes[i].CalculateRadius_GREEDY(radius);
			
			if (actRadius > this.biggestRadius)
			{
				this.biggestRadius = actRadius;
			}
			
			if (actRadius < this.smallestRadius)
			{
				this.smallestRadius = actRadius;
			}
			
			localAllNodes[i].CalculateFontParameters();
		}
		
		//dopocitame parametry transformace
		let edgeCoordinatesWithRadii = this.ReturnEdgeCoordinatesOfAllNodesWithRadii(localAllNodes, localAllNodesLength);
		let graphWidth = edgeCoordinatesWithRadii[1]-edgeCoordinatesWithRadii[0];
		let graphHeight = edgeCoordinatesWithRadii[3]-edgeCoordinatesWithRadii[2];
		
		let canvasWithoutBorderWidth = canvasWidth-this.border*2;
		let canvasWithoutBorderHeight = canvasHeight-this.border*2;
		
		this.translationTwoX = canvasWidth/2;
		this.translationTwoY = canvasHeight/2;
		
		if (canvasWithoutBorderWidth/graphWidth > canvasWithoutBorderHeight/graphHeight)
		{
			this.scaleOne = canvasWithoutBorderHeight/graphHeight;
		}
		else
		{
			this.scaleOne = canvasWithoutBorderWidth/graphWidth;
		}
		
		this.translationOneX = -(edgeCoordinatesWithRadii[0]+edgeCoordinatesWithRadii[1])/2;
		this.translationOneY = -(edgeCoordinatesWithRadii[2]+edgeCoordinatesWithRadii[3])/2;
		
		//quadTree
		//DULEZITE - quadtree musi zahrnovat celou plochu canvasu + nejaky previs
		//mysi je mozne posunout uzly mimo original hranice grafu a i trochu za hranice canvasu
		//previs dame + 50% vysky/sirky - kdyby tam nahodou byl nejakej uzel s obrovskym polomerem
		let quadTreeOriginX = (((-canvasWidth/2)-this.translationTwoX)/this.scaleOne)-this.translationOneX;
		let quadTreeOriginY = (((-canvasHeight/2)-this.translationTwoY)/this.scaleOne)-this.translationOneY;
		let quadTreeWidth = canvasWidth*2/this.scaleOne;
		let quadTreeHeight = canvasHeight*2/this.scaleOne;
		
		this.nodesQuadTree = new QuadTree([quadTreeOriginX, quadTreeOriginY], quadTreeWidth, quadTreeHeight, 1);

		for (let i = 0; i < localAllNodesLength; i++)
		{
			this.nodesQuadTree.InsertPoint(localAllNodes[i].x, localAllNodes[i].y, localAllNodes[i]);
		}
		
		this.QueryNodesInView();
	}
	
	//jeden krok prohozu
	SwapSingleStep_GREEDYSWAP(allNodes, allNodesLength)
	{
		let totalNumberOfSwaps = 0;
		
		let firstNode;
		let secondNode;
		
		let firstNodePositionX;
		let firstNodePositionY;
		
		let secondNodePositionX;
		let secondNodePositionY;
		
		let tmpX;
		let tmpY;
		
		let beforeTotalLength;
		let afterTotalLength;
		let actLength;
		
		let deltaX;
		let deltaY;
		
		let affectedClusters;
		
		//zkusime prohodit kazdy s kazdym a zkousime, jestli to snizi celkovou delku propojeni v grafu
		for (let i = 0; i < allNodesLength; i++)
		{
			firstNode = allNodes[i];
			
			for (let j = i+1; j < allNodesLength; j++)
			{
				secondNode = allNodes[j];
				
				//vytvorime mnozinu vsech unikatnich clusteru, ktere prohoz ovlivni
				affectedClusters = new Map();
		
				for (let cluster of firstNode.connectedNodesClusters.values())
				{
					affectedClusters.set(cluster.identifier, cluster);
				}
				
				for (let cluster of secondNode.connectedNodesClusters.values())
				{
					affectedClusters.set(cluster.identifier, cluster);
				}
				
				//spocitame delky pred a po prohozu
				
				beforeTotalLength = 0;
				
				for (let cluster of affectedClusters.values())
				{	
					deltaX = cluster.nodeB.x - cluster.nodeA.x;
					deltaY = cluster.nodeB.y - cluster.nodeA.y;
		
					actLength = Math.sqrt(deltaX*deltaX+deltaY*deltaY);
					
					if (cluster.nodeA.IsThisNodeLiteral === true || cluster.nodeB.IsThisNodeLiteral === true)
					{
						actLength *= 1.5;
					}
					
					beforeTotalLength += actLength;
		
					// beforeTotalLength += Math.sqrt(deltaX*deltaX+deltaY*deltaY);
				}
				
				tmpX = firstNode.x;
				tmpY = firstNode.y;
				
				firstNode.x = secondNode.x;
				firstNode.y = secondNode.y;
				
				secondNode.x = tmpX;
				secondNode.y = tmpY;
				
				afterTotalLength = 0;
				
				for (let cluster of affectedClusters.values())
				{	
					deltaX = cluster.nodeB.x - cluster.nodeA.x;
					deltaY = cluster.nodeB.y - cluster.nodeA.y;
					
					actLength = Math.sqrt(deltaX*deltaX+deltaY*deltaY);
					
					if (cluster.nodeA.IsThisNodeLiteral === true || cluster.nodeB.IsThisNodeLiteral === true)
					{
						actLength *= 1.5;
					}
					
					afterTotalLength += actLength;
					
					// afterTotalLength += Math.sqrt(deltaX*deltaX+deltaY*deltaY);
				}

				//pokud je lepsi nechame, jinak prehodime zpet
				if (afterTotalLength < beforeTotalLength)
				{
					totalNumberOfSwaps++;
				}
				else
				{
					tmpX = firstNode.x;
					tmpY = firstNode.y;
				
					firstNode.x = secondNode.x;
					firstNode.y = secondNode.y;
					
					secondNode.x = tmpX;
					secondNode.y = tmpY;
				}
			}
		}
		
		return totalNumberOfSwaps;
	}
	
	//-----FORCES------------------------------------------------------------------------------------------------------------------------------
	
	//funkce rozlozi pozice vsech uzlu do ctvercove site - musime zabranit situaci aby se pri startu fyziky uzly prekryvaly
	DistributeNodesEvenlyInPlane_FORCES(allNodes)
	{
		let allNodesLength = allNodes.length;
		
		let nextSquareNumberBase = Math.ceil(Math.sqrt(allNodesLength));
		
		let nodeIndex = 0;
		let actNode;
		
		let spacing = 500;
		
		for (let i = 1; i <= nextSquareNumberBase; i++)
		{
			for (let j = 1; j <= nextSquareNumberBase; j++)
			{
				if (nodeIndex >= allNodesLength)
				{
					return;
				}
				
				actNode = allNodes[nodeIndex];
				
				actNode.x = spacing*i;
				actNode.y = spacing*j;
				
				nodeIndex++;
			}
		}
	}
	
	//funkce rozlozi uzly do plochy podle siloveho modelu
	DistributeNodesInPlane_FORCES()
	{
		let localAllNodes = this.allNodes;
		let localAllNodesLength = localAllNodes.length;
		
		//rozlozime uzly do pocatecni pozice
		this.DistributeNodesEvenlyInPlane_FORCES(localAllNodes);
		
		//provedeme predem dany pocet iteraci siloveho modelu
		// let numberOfIterations = 500;
		let numberOfIterations = slider1.GetValue();

		for (let i = 0; i < numberOfIterations; i++)
		{
			console.log(i);
			this.CalculateSinglePhysicsStep_FORCES(localAllNodes);
		}
		
		let edgeCoordinatesWithoutRadii = this.ReturnEdgeCoordinatesOfAllNodes(localAllNodes, localAllNodesLength);
		
		//zatim bez polomeru
		//maxX-minX
		let graphWidth = edgeCoordinatesWithoutRadii[1]-edgeCoordinatesWithoutRadii[0];
		//maxY-minY
		let graphHeight = edgeCoordinatesWithoutRadii[3]-edgeCoordinatesWithoutRadii[2];
		
		let graphArea = graphWidth*graphHeight;
		
		//proporcialni k plose, ktera nalezi jednomu uzlu
		this.areaPerNode = graphArea/localAllNodesLength;
		
		//podle faktoru vsem uzlum vypocitame polomer a zjisctime, jaky je nejvetsi (kvuli pozdejsi query do quadtree)
		this.biggestRadius = 0;
		this.smallestRadius = Infinity;
		
		let actRadius;
		for (let i = 0; i < localAllNodesLength; i++)
		{
			actRadius = localAllNodes[i].CalculateRadius_FORCES(this.areaPerNode);
			
			if (actRadius > this.biggestRadius)
			{
				this.biggestRadius = actRadius;
			}
			
			if (actRadius < this.smallestRadius)
			{
				this.smallestRadius = actRadius;
			}
			
			localAllNodes[i].CalculateFontParameters();
		}
		
		//dopocitame parametry transformace
		let edgeCoordinatesWithRadii = this.ReturnEdgeCoordinatesOfAllNodesWithRadii(localAllNodes, localAllNodesLength);
		graphWidth = edgeCoordinatesWithRadii[1]-edgeCoordinatesWithRadii[0];
		graphHeight = edgeCoordinatesWithRadii[3]-edgeCoordinatesWithRadii[2];
		
		let canvasWithoutBorderWidth = canvasWidth-this.border*2;
		let canvasWithoutBorderHeight = canvasHeight-this.border*2;
		
		this.translationTwoX = canvasWidth/2;
		this.translationTwoY = canvasHeight/2;
		
		if (canvasWithoutBorderWidth/graphWidth > canvasWithoutBorderHeight/graphHeight)
		{
			this.scaleOne = canvasWithoutBorderHeight/graphHeight;
		}
		else
		{
			this.scaleOne = canvasWithoutBorderWidth/graphWidth;
		}
		
		this.translationOneX = -(edgeCoordinatesWithRadii[0]+edgeCoordinatesWithRadii[1])/2;
		this.translationOneY = -(edgeCoordinatesWithRadii[2]+edgeCoordinatesWithRadii[3])/2;
		
		//quadTree
		//DULEZITE - quadtree musi zahrnovat celou plochu canvasu + nejaky previs
		//mysi je mozne posunout uzly mimo original hranice grafu a i trochu za hranice canvasu
		//previs dame + 50% vysky/sirky - kdyby tam nahodou byl nejakej uzel s obrovskym polomerem
		let quadTreeOriginX = (((-canvasWidth/2)-this.translationTwoX)/this.scaleOne)-this.translationOneX;
		let quadTreeOriginY = (((-canvasHeight/2)-this.translationTwoY)/this.scaleOne)-this.translationOneY;
		let quadTreeWidth = canvasWidth*2/this.scaleOne;
		let quadTreeHeight = canvasHeight*2/this.scaleOne;
		
		this.nodesQuadTree = new QuadTree([quadTreeOriginX, quadTreeOriginY], quadTreeWidth, quadTreeHeight, 1);

		try 
		{
			for (let i = 0; i < localAllNodesLength; i++)
			{
				this.nodesQuadTree.InsertPoint(localAllNodes[i].x, localAllNodes[i].y, localAllNodes[i]);
			}
		}
		catch(error) 
		{
			alert("Physics went unstable!");
			this.ClearGraph();
			return;
		}
		
		this.QueryNodesInView();
	}
	
	//vypocitani jednoho kroku fyziky
	CalculateSinglePhysicsStep_FORCES(nodes)
	{
		let nodesLength = nodes.length;

		let firstNode;
		let secondNode;
		
		let actConnectionCluster;
		
		let firstToSecondVectorX;
		let firstToSecondVectorY;
		
		let secondToFirstVectorX;
		let secondToFirstVectorY;
		
		let distanceBetweenNodes;
		
		let forceFirstPart;
		let forceSecondPart;
		
		let forceTotalStrength;
		
		for (let i = 0; i < nodesLength; i++)
		{
			firstNode = nodes[i];
			
			for (let j = i+1; j < nodesLength; j++)
			{
				secondNode = nodes[j];
				
				actConnectionCluster = firstNode.connectedNodesClusters.get(secondNode.identifier);

				//resetovat??
				forceFirstPart = 0;
				forceSecondPart = 0;

				//musime to tady vypocitat rucne i pro propojene uzly, protoze tady neni nic predpocitano ze zacatku framu
				firstToSecondVectorX = secondNode.x - firstNode.x;
				firstToSecondVectorY = secondNode.y - firstNode.y;
				
				distanceBetweenNodes = Math.sqrt(firstToSecondVectorX*firstToSecondVectorX+firstToSecondVectorY*firstToSecondVectorY);
				
				firstToSecondVectorX = firstToSecondVectorX/distanceBetweenNodes;
				firstToSecondVectorY = firstToSecondVectorY/distanceBetweenNodes;
				
				secondToFirstVectorX = firstToSecondVectorX*-1;
				secondToFirstVectorY = firstToSecondVectorY*-1;	
		
				//jsou propojeny
				if (actConnectionCluster !== undefined)
				{
					forceFirstPart = distanceBetweenNodes;
					
					//pokud je jeden z uzlu literal - pritahujeme 20x vetsi silou
					if (firstNode.IsThisNodeLiteral === true || secondNode.IsThisNodeLiteral === true)
					{
						forceFirstPart = forceFirstPart*5;
					}
					//kdyz neni literal, tak muze nastat situace, ze jsou uzly propojeny vicekrat
					//silu vynasobime poctem propojeni
					else
					{
						forceFirstPart = forceFirstPart*actConnectionCluster.totalConnCount;
					}	
				}
				
				forceSecondPart = -10*(firstNode.totalConnections+secondNode.totalConnections)/(distanceBetweenNodes);
	
				if (actConnectionCluster === undefined)
				{
					if (firstNode.IsThisNodeLiteral === true && secondNode.IsThisNodeLiteral === true)
					{
						forceSecondPart *= 3;
					}
				}

				forceTotalStrength = forceFirstPart*0.01 + forceSecondPart;
				
				//pricteme sily k jednotlivym uzlum
				firstNode.movementVectorX += firstToSecondVectorX*forceTotalStrength;
				firstNode.movementVectorY += firstToSecondVectorY*forceTotalStrength;
					
				secondNode.movementVectorX += secondToFirstVectorX*forceTotalStrength;
				secondNode.movementVectorY += secondToFirstVectorY*forceTotalStrength;	
			}	
			
			//na konci vnitrniho cyklu se uz nikdy prvnim uzlem nebudeme zabyvat - udelame reset uz v teto funkci
			firstNode.UpdatePositionAccordingToMovementVector();
			firstNode.ResetMovementVector();
		}
	}
	
	//-----DRAW--------------------------------------------------------------------------------------------------------------------------------
	
	//vymazani canvasu
	ClearCanvas()
	{
		let localContext = context;
		
		//vycistime platno
		localContext.fillStyle = "#F5F5F5";
		localContext.fillRect(0, 0, canvasWidth, canvasHeight);
	}
	
	//vykresleni grafu
	DrawGraph()
	{
		let localContext = context;
		
		//vypocet parametru transformace viewWindow
		let transfromScale = 1/this.viewWindowScale;
		let transformMoveX = -this.viewWindowPositionX;
		let transformModeY = -this.viewWindowPositionY;
		
		//prvne posuneme graf do platna
		localContext.transform(transfromScale, 0, 0, transfromScale, 0, 0, 0);
		localContext.transform(1, 0, 0, 1, transformMoveX, transformModeY);
		
		//pote transformujeme podle toho kam ukazuje okno
		localContext.transform(1, 0, 0, 1, this.translationTwoX, this.translationTwoY);
		localContext.transform(this.scaleOne, 0, 0, this.scaleOne, 0, 0);
		localContext.transform(1, 0, 0, 1, this.translationOneX, this.translationOneY);		
		
		//vykresleni sipek spojeni
		this.DrawConnectionClustersArrowsNearCircles(localContext);
		
		//vykresleni tvaru uzlu
		this.DrawNodeShapes(localContext);
	
		//vykresleni popisu spojeni
		this.DrawConnectionClustersDescription(localContext);
	
		//vykresleni popisu uzlu
		this.DrawNodeDescriptions(localContext);
	
		//reset transformaci pred dalsim framem
		localContext.resetTransform();
	}
	
	//vykresleni tvaru uzlu
	DrawNodeShapes(context)
	{
		let localObjectNodes = this.objectNodes;
		let localLiteralNodes = this.literalNodes;

		//objektove uzly - tvar
		context.fillStyle = "#e60000";
		
		for (let objectNode of localObjectNodes.values())
		{
			objectNode.DrawNodeShape(context);
		}
		
		//literalni uzly - tvar
		context.fillStyle = "#009900";
		
		for (let literalNode of localLiteralNodes.values())
		{
			literalNode.DrawNodeShape(context);
		}
	}
	
	//vykresleni popisu uzlu
	DrawNodeDescriptions(context)
	{
		let localObjectNodes = this.objectNodes;
		let localLiteralNodes = this.literalNodes;

		context.fillStyle = "#FFFFFF";
		context.strokeStyle = "#000000";
		context.textAlign = "center";
		context.textBaseline = "middle";

		//objektove uzly - popis
		for (let objectNode of localObjectNodes.values())
		{
			objectNode.DrawDescription(context, this.showNodeDescription);
		}
		
		//literalni uzly - popis
		for (let literalNode of localLiteralNodes.values())
		{
			literalNode.DrawDescription(context, this.showNodeDescription);
		}
	}
	
	//vykresleni sipek spojeni
	DrawConnectionClustersArrowsNearCircles(context)
	{
		let localConnectionClusters = this.connectionClusters;
		
		let localFactor = this.smallestRadius;
		
		let lineWidth = localFactor/3;
		
		context.fillStyle = "#CCCCCC";
		context.strokeStyle = "#CCCCCC";
		context.lineWidth = lineWidth;
		let arrowheadLength = localFactor;
		let arrowheadHalfThickness = localFactor/3;
		
		let actCluster;
		let higlightedClusters = [];
		
		//prvne vykreslime nezvyraznene aby byly pod zvyraznenyma, zvyraznene ulozime do zvlastniho pole
		for (let i = 0; i < localConnectionClusters.length; i++)
		{
			actCluster = localConnectionClusters[i];
			
			if (actCluster.AtoBHighlighted === false && actCluster.BtoAHighlighted === false)
			{
				actCluster.DrawWithArrowsNearCircles(context, lineWidth, arrowheadLength, arrowheadHalfThickness, this.simplifiedConnections);
			}
			else
			{
				higlightedClusters.push(actCluster);
			}
		}
		
		//vykreslime zvyraznene
		for (let i = 0; i < higlightedClusters.length; i++)
		{
			higlightedClusters[i].DrawWithArrowsNearCircles(context, lineWidth, arrowheadLength, arrowheadHalfThickness, this.simplifiedConnections);
		}
		
	}
	
	//vykresleni popisu spojeni
	DrawConnectionClustersDescription(context)
	{
		let localConnectionClusters = this.connectionClusters;
		
		let localFactor = this.smallestRadius/1.5;
		let fillStyle = "#000000";
		let font = localFactor.toString() + "px Arial";
	
		context.fillStyle = fillStyle;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = font;
		
		let actCluster;
		let higlightedClusters = [];
		
		//prvne vykreslime nezvyraznene aby byly pod zvyraznenyma, zvyraznene ulozime do zvlastniho pole
		for (let i = 0; i < localConnectionClusters.length; i++)
		{
			actCluster = localConnectionClusters[i];
			
			if (actCluster.AtoBHighlighted === false && actCluster.BtoAHighlighted === false)
			{
				actCluster.DrawDescriptions(context, this.simplifiedConnections, localFactor, fillStyle, font);
			}
			else
			{
				higlightedClusters.push(actCluster);
			}
		}
		
		//vykreslime zvyraznene
		fillStyle = "#0000FF";
		localFactor = localFactor*1.2;
		font = "bold " + localFactor.toString() + "px Arial";
		
		for (let i = 0; i < higlightedClusters.length; i++)
		{
			higlightedClusters[i].DrawDescriptions(context, this.simplifiedConnections, localFactor, fillStyle, font);
		}
		
		
	}
	
	//vykresleni frameratu
	DrawFramerate(deltaTime)
	{
		let localContext = context;
		
		localContext.fillStyle = "#000000";
		localContext.beginPath();
		localContext.font = "bold 30px Arial";
		localContext.textAlign = "center";
		localContext.fillText((Math.ceil(1000/deltaTime)).toString(), canvasWidth-40, canvasHeight-20);
		localContext.fill();
	}

	//vykresleni loading textu
	DrawLoadingText()
	{
		let localContext = context;
		
		localContext.fillStyle = "#000000";
		localContext.beginPath();
		localContext.font = "bold 60px Arial";
		localContext.textAlign = "center";
		localContext.fillText("Loading graph!", canvasWidth/2, canvasHeight/2);
		localContext.fill();
	}
}


























