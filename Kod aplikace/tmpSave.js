class ConnectionCluster
{
	constructor(nodeA, nodeB) 
	{
		this.nodeA = nodeA;
		this.nodeB = nodeB;
		
		//taky by asi slo to predelat na Map, predpokladam, ze ale nebude hodne vicenasobnych propojeni uzlu
		this.AtoBConnections = [];
		this.BtoAConnections = [];
		this.allConnections = [];
		
		this.AtoBConnCount = 0;
		this.BtoAConnCount = 0;
		this.totalConnCount = 0;

		//1.2 - 60% prumeru
		this.radiusPercentage = 0.6*2;
		
		this.CalculateAndUpdateDistanceAndVector();
	}
	
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
	
	DrawWithArrowsOnLine(context)
	{
		//neni potreba ------------------------------------------
		//stred usecky
		let lineCenterX = (this.nodeA.x + this.nodeB.x)/2;
		let lineCenterY = (this.nodeA.y + this.nodeB.y)/2;
	}
	
	DrawWithArrowsNearCircles(context, arrowheadLength, arrowheadHalfThickness)
	{	
		//vypocitame normalovy vektor - bude jiz take znormalizovany protoze vektor smeru usecky a normala maji stejnou delku
		// https://stackoverflow.com/questions/1243614/how-do-i-calculate-the-normal-vector-of-a-line-segment
		//if we define dx=x2-x1 and dy=y2-y1, then the normals are (-dy, dx) and (dy, -dx).
		let lineDirectionNormalX = (this.directionVectorY)*-1;
		let lineDirectionNormalY = this.directionVectorX;
	
		if (this.totalConnCount === 1)
		{
			if (this.AtoBConnCount === 1)
			{
				this.AtoBConnections[0].DrawWithArrowsNearCirclesEqualsOne(context, lineDirectionNormalX, lineDirectionNormalY, this.directionVectorX, this.directionVectorY, arrowheadLength, arrowheadHalfThickness);
			}
			else
			{
				this.BtoAConnections[0].DrawWithArrowsNearCirclesEqualsOne(context, lineDirectionNormalX, lineDirectionNormalY, this.directionVectorX, this.directionVectorY, arrowheadLength, arrowheadHalfThickness);
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
				this.AtoBConnections[i].DrawWithArrowsNearCirclesMoreThanOne(context, lineDirectionNormalX, lineDirectionNormalY, this.directionVectorX, this.directionVectorY, offsetStart+j*spaceBetweenConnections, arrowheadLength, arrowheadHalfThickness);
				j++;
			}
			
			for (let i = 0; i < this.BtoAConnections.length; i++)
			{
				this.BtoAConnections[i].DrawWithArrowsNearCirclesMoreThanOne(context, lineDirectionNormalX, lineDirectionNormalY, this.directionVectorOppositeX, this.directionVectorOppositeY, offsetStart+j*spaceBetweenConnections, arrowheadLength, arrowheadHalfThickness);
				j++;
			}
		}
	}
	
	DrawDescriptions(context)
	{	
		let startEndSumX = this.nodeA.x + this.nodeB.x;
		let startEndSumY = this.nodeA.y + this.nodeB.y;
	
		let positionX;
		let positionY;
		
		let localTotalConnCount = this.totalConnCount+1;
	
		let j = 1;
	
		// if (this.totalConnCount === 1)
		// {
			// return;
		// }
		
		// console.log(localTotalConnCount);
	
		for (let i = 0; i < this.AtoBConnections.length; i++)
		{
			this.directionVectorX
			
			positionX = this.directionVectorOppositeX*(this.distanceBetweenNodes/localTotalConnCount)*j+this.nodeB.x;
			positionY = this.directionVectorOppositeY*(this.distanceBetweenNodes/localTotalConnCount)*j+this.nodeB.y;
			
			this.AtoBConnections[i].DrawDescription(context, positionX, positionY);
			j++;
		}
			
		for (let i = 0; i < this.BtoAConnections.length; i++)
		{
			positionX = this.directionVectorOppositeX*(this.distanceBetweenNodes/localTotalConnCount)*j+this.nodeB.x;
			positionY = this.directionVectorOppositeY*(this.distanceBetweenNodes/localTotalConnCount)*j+this.nodeB.y;
			
			this.BtoAConnections[i].DrawDescription(context, positionX, positionY);
			j++;
		}
	}
}

// jednotlive orientovane propojeni
class Connection
{
	constructor(startNode, endNode, shortPrefix, longPrefix, shortName, longName) 
	{
		this.startNode = startNode;
		this.endNode = endNode;
		
		this.identifier = shortName;
		this.shortName = shortName;
		this.longName = longName;
		this.shortPrefix = shortPrefix;
		this.longPrefix = longPrefix;
		
		this.normalOffsetX = 0;
		this.normalOffsetY = 0;
	}
	
	//reseni kvadraticke rovnice
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
	
	DrawArrowhead(context, arrowheadTipX, arrowheadTipY, arrowheadBaseX, arrowheadBaseY, lineDirectionNormalX, lineDirectionNormalY, halfThickness)
	{
		//limit na tloustku u prikladu 5
		//udelat limity stejne
		//predelat tak, aby se sipky neprekryvali s carama
		
		context.beginPath();
		context.moveTo(arrowheadTipX, arrowheadTipY);
		//vektor usecky odcitame, protoze pri vyhresleni spicky se musime vratit do startu
		//normalovy vektor je prvne +, pak -, nezalezi na poradi
		context.lineTo(arrowheadBaseX+(lineDirectionNormalX*halfThickness),arrowheadBaseY+(lineDirectionNormalY*halfThickness));
		context.lineTo(arrowheadBaseX-(lineDirectionNormalX*halfThickness),arrowheadBaseY-(lineDirectionNormalY*halfThickness));
		context.closePath();
		
		// context.stroke();
		context.fill();
	}
	
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
	
	//technicky bych jeste mohl flipnout vysledky, protoze to je symetricky - kdyztak uvidime
	DrawWithArrowsNearCirclesMoreThanOne(context, lineDirectionNormalX, lineDirectionNormalY, lineDirectionVectorX, lineDirectionVectorY, centerOffset, arrowheadLength, arrowheadHalfThickness)
	{
		//moznost s center sipeckama aby se nemusel pocitat prusecik
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
		
		//dat tu primku jen od tech pruseciku???
		context.beginPath();
		context.moveTo(lineStartX, lineStartY);
		context.lineTo(arrowheadBaseX, arrowheadBaseY);
		context.stroke();

		
		this.DrawArrowhead(context, intersectionStart[0], intersectionStart[1], arrowheadBaseX, arrowheadBaseY, lineDirectionNormalX, lineDirectionNormalY, arrowheadHalfThickness);
	}
	
	DrawDescription(context, positionX, positionY)
	{
		context.fillText(this.shortName, positionX+this.normalOffsetX, positionY+this.normalOffsetY);
	}
	
}

class Node
{
	constructor() 
	{
		this.connectedNodesClusters = new Map();
		//jen seznamy pro snadnejsi vycet
		this.connectedObjectNodesClusters = [];
		this.connectedLiteralNodesClusters = [];
		
		
		this.twoPI = Math.PI*2;
		
		this.radius = 10;
		
		this.x = Math.floor(Math.random()*1250*100);
		this.y = Math.floor(Math.random()*750*100);
		
		this.totalConnectionClusters = 0;
		this.totalConnections = 0;
		
		this.movementVectorX = 0;
		this.movementVectorY = 0;
		
		this.movementAllowed = true;
		
		this.font;
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
		if (this.movementAllowed === true)
		{
			this.x += this.movementVectorX;
			this.y += this.movementVectorY;
		}
	}
	
	//vyresetuje vektor pohybu
	ResetMovementVector()
	{
		this.movementVectorX = 0;
		this.movementVectorY = 0;
	}
	
	CalculateRadiusAndDrawParameters_FORCES(areaPerNode)
	{
		let localFactor = 10+areaPerNode/100000;
		
		this.radius = localFactor + (this.connectedObjectNodesClusters.length*(localFactor/10));
		
		this.CalculateDrawParameters();
		
		return this.radius;
	}
	
	DrawNodeShape(context)
	{
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, this.twoPI);
		context.fill();
		// context.stroke();
	}
}

class ObjectNode extends Node
{	
	constructor(shortPrefix, longPrefix, shortName, longName) 
	{
		super();
		
		this.identifier = shortName;
		
		this.shortName = shortName;
		this.longName = longName;
		this.shortPrefix = shortPrefix;
		this.longPrefix = longPrefix;	
		
		this.IsThisNodeLiteral = false;
	}
	
	/*
	CalculateDrawParameters()
	{
		let localContext = context;
		let localText = this.shortName;
		
		let availableWidth = this.radius*1.5;
		
		let lowerBound = 0.01;
		let upperBound = 100;
		let absDifference = Infinity;

		let midpoint;
		let midpointValue;
		
		// console.log(availableWidth);
		// console.log("-----------------------");
		while(absDifference > 0.1)
		{			
			midpoint = (lowerBound + upperBound)/2;
			localContext.font = midpoint.toString() + "px Arial";
			midpointValue = localContext.measureText(localText).width;
			
			// console.log(midpointValue);
			
			if (midpointValue > availableWidth)
			{
				upperBound = midpoint;
				absDifference = midpointValue - availableWidth;
			}
			else
			{
				lowerBound = midpoint;
				absDifference = availableWidth - midpointValue;
			}
			
			// console.log([midpoint, midpointValue, absDifference]);
		}
		
		if (midpoint > this.radius/2)
		{
			midpoint = this.radius/2;
		}
		
		if (midpoint > 30)
		{
			midpoint = 30;
		}
		
		
		this.font = midpoint.toString() + "px Arial";
	}*/
	
	CalculateDrawParameters()
	{
		let localContext = context;
		let localText = this.shortName;
		
		context.font = "1px Arial";
		let onePxLength = context.measureText(localText).actualBoundingBoxLeft+context.measureText(localText).actualBoundingBoxRight;
		context.font = "2px Arial";
		let twoPxLength = context.measureText(localText).actualBoundingBoxLeft+context.measureText(localText).actualBoundingBoxRight;
		
		let onePxDifference = twoPxLength-onePxLength;
		
		let availableWidth = this.radius*1.8;
		
		let fontSize = availableWidth/onePxDifference;
		
		// console.log(fontSize);
		
		if (fontSize > this.radius/2)
		{
			fontSize = this.radius/2;
		}
		
		this.font = fontSize.toString() + "px Arial";
		
	}
	
	DrawDescription(context)
	{
		// console.log(this.font);
		
		context.font = this.font;
		context.fillText(this.shortName, this.x, this.y);
	}
}

class LiteralNode extends Node
{
	constructor(artificialId, value, valueType) 
	{
		super();
		
		this.identifier = artificialId;
		
		this.value = value;
		this.valueAsString = valueType === "string" ? value : value.toString();
		this.valueType = valueType;
		
		this.IsThisNodeLiteral = true;
	}
	
	CalculateFontSizeForDrawing()
	{
		let localContext = context;
		let localText = this.valueAsString;
		
		let availableWidth = this.radius*1.8;
		
		let lowerBound = 0.01;
		let upperBound = 100;
		let absDifference = Infinity;

		let midpoint;
		let midpointValue;
		
		while(absDifference > 0.1)
		{
			midpoint = (lowerBound + upperBound)/2;
			localContext.font = midpoint.toString() + "px Arial";
			midpointValue = localContext.measureText(localText).width;
			
			if (midpointValue > availableWidth)
			{
				upperBound = midpoint;
				absDifference = midpointValue - availableWidth;
			}
			else
			{
				lowerBound = midpoint;
				absDifference = availableWidth - midpointValue;
			}
		}
		
		if (midpoint > this.radius/2)
		{
			midpoint = this.radius/2;
		}
		
		if (midpoint > 30)
		{
			midpoint = 30;
		}
		
		this.font = midpoint.toString() + "px Arial";
	}
	
	CalculateDrawParameters()
	{
		let localContext = context;
		let localText = this.valueAsString;
		
		
		context.font = "1px Arial";
		let onePxLength = context.measureText(localText).actualBoundingBoxLeft+context.measureText(localText).actualBoundingBoxRight;
		context.font = "2px Arial";
		let twoPxLength = context.measureText(localText).actualBoundingBoxLeft+context.measureText(localText).actualBoundingBoxRight;
		
		let onePxDifference = twoPxLength-onePxLength;
		
		let availableWidth = this.radius*1.8;
		
		let fontSize = availableWidth/onePxDifference;
		
		// console.log(fontSize);
		if (fontSize > this.radius/2)
		{
			fontSize = this.radius/2;
		}
		
		this.font = fontSize.toString() + "px Arial";
		
	}
	
	DrawDescription(context)
	{
		context.font = this.font;
		context.fillText(this.valueAsString, this.x, this.y);
	}
}

class Graph
{
	constructor() 
	{
		//vyzkouset length pred polem asi predelat
		
		this.objectNodes = new Map();
		this.literalNodes = new Map();
		this.literalNodeActIdentifier = 1;
		//jen kdyz chceme provest neco nad vsemy uzly (napr fyzika)
		this.allNodes = [];
		
		this.connectionClusters = [];
		
		this.nodesQuadTree;
		
		//namespacy
		this.shortFormToLongFormNamespaceLookup = new Map();
		this.longFormToShortFormNamespaceLookup = new Map();
		
		
		
		
		this.areaPerNode = 1;
		this.biggestRadius = 0;
		this.smallestRadius = Infinity;
		
		this.translationTwoX = 0;
		this.translationTwoY = 0;

		this.scaleOneX = 1;
		this.scaleOneY = 1;
		
		this.translationOneX = 0;
		this.translationOneY = 0;
		
		//REALTIME
		this.minX;
		this.maxX;
		this.minY;
		this.maxY;

		this.border = 50;
		
		this.viewWindowPositionX = 0;
		this.viewWindowPositionY = 0;
		this.viewWindowScale = 1;
		
		this.viewWindowWidth = canvasWidth*this.viewWindowScale;
		this.viewWindowHeight = canvasHeight*this.viewWindowScale;
		
		// this.CreateNamespaceAndInsertTestTriplesIntoDatabase();
	}	
	
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
		
		// this.allNodes[0].x = 500;
		// this.allNodes[0].y = 500;
	}
	
	
	//tato funkce vyzaduje nezkracene prefixy
	//pripadne by se dala rozsirit, aby brala i kratsi
	AddTripleToGraph(subjectLongPrefix, subjectName, predicateLongPrefix, predicateName, objectFirstParameter, objectSecondParameter, objectIsLiteral)
	{
		let subjectShortPrefix = this.longFormToShortFormNamespaceLookup.get(subjectLongPrefix);
		//subjectLongPrefix; zadano
		let subjectShortName = subjectShortPrefix + ":" + subjectName;
		let subjectLongName = subjectLongPrefix + subjectName;
		
		let predicateShortPrefix = this.longFormToShortFormNamespaceLookup.get(predicateLongPrefix);
		//predicateLongPrefix; zadano
		let predicateShortName = predicateShortPrefix + ":" + predicateName;
		let predicateLongName = predicateLongPrefix + predicateName;
		
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
			// console.log(subjectShortPrefix);
			// console.log(subjectLongPrefix);
			// console.log(subjectShortName);
			// console.log(subjectLongName);
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
				let connectionCluster = new ConnectionCluster(subjectNode, objectNode);
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
			objectShortName = objectShortPrefix + ":" + objectSecondParameter;
			objectLongName = objectLongPrefix + objectSecondParameter;
		
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
				connectionCluster = new ConnectionCluster(subjectNode, objectNode);
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
				
					subjectNode.AddConnectionClusterToNode(objectShortName, connectionCluster, false);
					objectNode.AddConnectionClusterToNode(subjectShortName, connectionCluster, false);
				}
			}
		}
		
		
		// console.log(this.objectNodes);
		// console.log(this.literalNodes);
		// console.log(this.connectionClusters);
	}
	
	AddTriplesToGraph(triples)
	{
		let triplesLength = triples.length;
		
		for (let i = 0; i < triplesLength; i++)
		{
			// if (triples[i][6] === false)
			// {
				// this.AddTripleToGraph(triples[i][0], triples[i][1], triples[i][2], triples[i][3], triples[i][4], triples[i][5], triples[i][6]);
			// }
			
			this.AddTripleToGraph(triples[i][0], triples[i][1], triples[i][2], triples[i][3], triples[i][4], triples[i][5], triples[i][6]);
		}
	}
	
	AddNamespaceToGraph(shortForm, longForm)
	{
		//namespace pridame jen pokud uz neexistuje
		if (this.shortFormToLongFormNamespaceLookup.get(shortForm) === undefined)
		{
			this.shortFormToLongFormNamespaceLookup.set(shortForm, longForm);
			this.longFormToShortFormNamespaceLookup.set(longForm, shortForm);	
		}
	}
	
	AddNamespacesToGraph(namespaces)
	{
		let namespacesLength = namespaces.length;
		
		for (let i = 0; i < namespacesLength; i++)
		{
			this.AddNamespaceToGraph(namespaces[i][0], namespaces[i][1]);
		}
	}
	
	ClearGraph()
	{
		this.objectNodes.clear();
		this.literalNodes.clear();
		this.literalNodeActIdentifier = 1;
		this.allNodes = [];
		
		this.connectionClusters = [];
		
		//clear namespacu
		this.shortFormToLongFormNamespaceLookup.clear();
		this.longFormToShortFormNamespaceLookup.clear();
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
	
	//funkce vrati krajni souradnice grafu se zapocitanym polomerem uzlu
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
	
	TransformAllNodesIntoCanvasBoundaries(localAllNodes, localAllNodesLength, edgeCoordinates)
	{	
		let nodesWidth = edgeCoordinates[1] - edgeCoordinates[0];
		let nodesHeight = edgeCoordinates[3] - edgeCoordinates[2];
		
		let centerXNodes = (edgeCoordinates[1] + edgeCoordinates[0])/2;
		let centerYNodes = (edgeCoordinates[3] + edgeCoordinates[2])/2;
		
		let centerXCanvas = (canvasWidth)/2;
		let centerYCanvas = (canvasHeight)/2;
		
		let scaleWidth = (canvasWidth-this.border)/nodesWidth;
		let scaleHeigth = (canvasHeight-this.border)/nodesHeight;
		
		let actNode;
		
		//chceme zachovat pomer u trasformace - tedy musime scalovat obe dimenze podle te delsi
		if (scaleWidth > scaleHeigth)
		{
			for (let i = 0; i < localAllNodesLength; i++)
			{
				actNode = localAllNodes[i];
				
				actNode.x = scaleHeigth*actNode.x+(centerXCanvas-scaleHeigth*centerXNodes);
				actNode.y = scaleHeigth*actNode.y+(centerYCanvas-scaleHeigth*centerYNodes);
				actNode.radius = actNode.radius*scaleHeigth;
			}
		}
		else
		{
			for (let i = 0; i < localAllNodesLength; i++)
			{
				actNode = localAllNodes[i];
				
				actNode.x = scaleWidth*actNode.x+(centerXCanvas-scaleWidth*centerXNodes);
				actNode.y = scaleWidth*actNode.y+(centerYCanvas-scaleWidth*centerYNodes);
				actNode.radius = actNode.radius*scaleWidth;
			}
		}
	}
	
	//-----WIEW-WINDOW-------------------------------------------------------------------------------------------------------------------------
	
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
			newXposition = localCanvasWidth-localViewWindowWidth-1;
		}
		else
		{
			this.viewWindowPositionX = newXposition;
		}
		
		//indexy jsou 0 az canvasHeight-1
		if (newYposition < 0)
		{
			newYposition = 0;
		}
		else if (newYposition+localViewWindowHeight >= localCanvasHeight)
		{
			newYposition = localCanvasHeight-localViewWindowHeight-1;
		}
		else
		{
			this.viewWindowPositionY = newYposition;
		}
	}
	
	//priblizeni nebo oddaleni na to misto, kde je kurzor
	//okopirovane google maps
	//objekt, na ktery ukazuje kurzor zustava ve stejne relativni pozici vuci oknu
	//zvetseni/oddaleni jednoho posunu kolecka misi je 20%
	ChangeWiewWindowScale(wheelMovement, mouseX, mouseY)
	{
		let magnification = 1.2;
		
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
	}
	
	//-------------------------------------------------------------------------------------------------
	
	//REALTIME
	UpdateAllVariablesOnFrameStart()
	{	
		let localConnectionClusters = this.connectionClusters;
	
		for (let i = 0; i < localConnectionClusters.length; i++)
		{
			localConnectionClusters[i].CalculateAndUpdateDistanceAndVector();
		}
		
		let localAllNodes = this.allNodes;
	
		for (let i = 0; i < localAllNodes.length; i++)
		{
			localAllNodes[i].ResetMovementVector();
		}
	}
	
	CalculateForcesForAllNodes()
	{
		let localAllNodes = this.allNodes;
		let localAllNodesLength = localAllNodes.length;

		//benchmark - je to rychlejsi vevnitr nebo venku??
		let firstNode;
		let secondNode;
		
		let actConnectionCluster;

		let springLength = 50;
		
		let forceStrength;

		let firstToSecondVectorX;
		let firstToSecondVectorY;
		
		let secondToFirstVectorX;
		let secondToFirstVectorY;
		
		let distanceBetweenNodes;
		
		let forceFirstPart;
		let forceSecondPart;
		
	
		for (let i = 0; i < localAllNodesLength; i++)
		{
			firstNode = localAllNodes[i];
			
			for (let j = i+1; j < localAllNodesLength; j++)
			{
				//kardinalita
				//literalni uzly
				
				secondNode = localAllNodes[j];
				
				actConnectionCluster = firstNode.connectedNodesClusters.get(secondNode.identifier);

				forceFirstPart = 0;
				forceSecondPart = 0;

				if (actConnectionCluster === undefined)
				{
					firstToSecondVectorX = secondNode.x - firstNode.x;
					firstToSecondVectorY = secondNode.y - firstNode.y;
					
					distanceBetweenNodes = Math.sqrt(firstToSecondVectorX*firstToSecondVectorX+firstToSecondVectorY*firstToSecondVectorY);
					
					firstToSecondVectorX = firstToSecondVectorX/distanceBetweenNodes;
					firstToSecondVectorY = firstToSecondVectorY/distanceBetweenNodes;
					
					secondToFirstVectorX = firstToSecondVectorX*-1;
					secondToFirstVectorY = firstToSecondVectorY*-1;
					
					//----------------------------------------------------------------------------
					
					// forceStrength = distanceBetweenNodes-springLength;
					
					// forceStrength = distanceBetweenNodes > springLength ? forceStrength : 0;

					// forceStrength = 0.001*forceStrength;
					
					// forceStrength = 100000/distanceBetweenNodes;
					
					// forceStrength = 0;
					
					// *distanceBetweenNodes
					
					// test1 = firstToSecondVectorX;
					// test2 = forceStrength;
					// test5 = distanceBetweenNodes;			
				}
				else
				{
					if (firstNode === actConnectionCluster.nodeA)
					{
						firstToSecondVectorX = actConnectionCluster.directionVectorX;
						firstToSecondVectorY = actConnectionCluster.directionVectorY;
						
						secondToFirstVectorX = actConnectionCluster.directionVectorOppositeX;
						secondToFirstVectorY = actConnectionCluster.directionVectorOppositeY;
						
						distanceBetweenNodes = actConnectionCluster.distanceBetweenNodes;
					}
					else
					{
						firstToSecondVectorX = actConnectionCluster.directionVectorOppositeX;
						firstToSecondVectorY = actConnectionCluster.directionVectorOppositeY;
						
						secondToFirstVectorX = actConnectionCluster.directionVectorX;
						secondToFirstVectorY = actConnectionCluster.directionVectorY;
						
						distanceBetweenNodes = actConnectionCluster.distanceBetweenNodes;
					}
					
					//-------------------------------------------------------------------------
					
					// forceStrength = distanceBetweenNodes-springLength;
					
					// forceStrength = distanceBetweenNodes > springLength ? forceStrength : -2500/(distanceBetweenNodes);

					// forceStrength = forceStrength;
					
					// if (firstNode.IsThisNodeLiteral === true || secondNode.IsThisNodeLiteral === true)
					// {
						// forceStrength = forceStrength*20;
					// }

					// forceStrength = forceStrength*actConnectionCluster.totalConnCount;
					
					// test3 = firstToSecondVectorX;
					// test4 = forceStrength;
					
					
					if (distanceBetweenNodes > springLength)
					{
						forceFirstPart = distanceBetweenNodes-springLength;
					}
					
					if (firstNode.IsThisNodeLiteral === true || secondNode.IsThisNodeLiteral === true)
					{
						forceFirstPart = forceFirstPart*20;
					}
					else
					{
						//literal ma vzdycky jen jedno spojeni
						forceFirstPart = forceFirstPart*actConnectionCluster.totalConnCount;
					}
					
					
					
					
				}
				
				// forceStrength = forceStrength/100;
				
				// forceStrength = -1/distanceBetweenNodes;
				
				// console.log([firstNode.identifier, firstNode.x, firstNode.y, secondNode.identifier, secondNode.x, secondNode.y, firstToSecondVectorX, firstToSecondVectorY, secondToFirstVectorX, secondToFirstVectorY, distanceBetweenNodes]);
				
				// forceSecondPart = -1*(firstNode.totalConnections+secondNode.totalConnections)/distanceBetweenNodes;
				forceSecondPart = -1*(firstNode.totalConnections+secondNode.totalConnections)/distanceBetweenNodes;
				
				forceFirstPart = forceFirstPart*1;
				forceSecondPart = forceSecondPart*1000;
				
				forceStrength = forceFirstPart + forceSecondPart;
				
				forceStrength = forceStrength*0.01;
				
				firstNode.movementVectorX += firstToSecondVectorX*forceStrength;
				firstNode.movementVectorY += firstToSecondVectorY*forceStrength;
					
				secondNode.movementVectorX += secondToFirstVectorX*forceStrength;
				secondNode.movementVectorY += secondToFirstVectorY*forceStrength;
				
				
				// console.log([firstNode.movementVectorX, firstNode.movementVectorY, secondNode.movementVectorX, secondNode.movementVectorY]);
				
				// if (isNaN(firstNode.movementVectorX) === true)
				// {
					// console.log([tmp,firstToSecondVectorX,forceStrength, test1, test2, test3, test4, test5, test6, test7, test8, test9]);
				// }
				
				/*
				if (isNaN(firstNode.movementVectorX) === false)
				{
					
				}
				else
				{
					console.log(1);
				}*/
				
				
				
			}	
		}
		
		
		
		// console.log(test);
	}
	
	MoveAccordingToForces()
	{
		let localObjectNodes = this.objectNodes;
		let localLiteralNodes = this.literalNodes;
		
		this.minX = Infinity;
		this.maxX = -Infinity;
		this.minY = Infinity;
		this.maxY = -Infinity;
		
		for (let objectNode of localObjectNodes.values())
		{
			objectNode.UpdatePositionAccordingToMovementVector();
			
			//LITERRRRRRRRRRRRRRRRRRRRRAAAAAAAAAAAAAAAAAAAAAAAALLLLLLLLLLLLLLLLLLLLL
			if (objectNode.x < this.minX)
			{
				this.minX = objectNode.x;
			}
			
			if (objectNode.x > this.maxX)
			{
				this.maxX = objectNode.x;
			}
			
			if (objectNode.y < this.minY)
			{
				this.minY = objectNode.y;
			}
			
			if (objectNode.y > this.maxY)
			{
				this.maxY = objectNode.y;
			}
		}
		
		for (let literalNode of localLiteralNodes.values())
		{
			literalNode.UpdatePositionAccordingToMovementVector();
			
			if (literalNode.x < this.minX)
			{
				this.minX = literalNode.x;
			}
			
			if (literalNode.x > this.maxX)
			{
				this.maxX = literalNode.x;
			}
			
			if (literalNode.y < this.minY)
			{
				this.minY = literalNode.y;
			}
			
			if (literalNode.y > this.maxY)
			{
				this.maxY = literalNode.y;
			}
		}
	}

	



	
	//-----FORCES------------------------------------------------------------------------------------------------------------------------------
	
	//funkce rozlozi pozice vsech uzlu do ctvercove site - musime zabranit situaci aby se pri startu fyziky uzly prekryvaly
	DistributeNodesEvenlyInPlane_FORCES(allNodes)
	{
		let allNodesLength = allNodes.length;
		
		let nextSquareNumberBase = Math.ceil(Math.sqrt(allNodesLength));
		
		let nodeIndex = 0;
		let actNode;
		
		let spacing = 100;
		
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
		//odeelat nasobic u liralu???
		
		let localAllNodes = this.allNodes;
		let localAllNodesLength = localAllNodes.length;
		
		//rozlozime uzly do pocatecni pozice
		this.DistributeNodesEvenlyInPlane_FORCES(localAllNodes);
		
		//provedeme predem dany pocet iteraci siloveho modelu
		let numberOfIterations = 1000;

		for (let i = 0; i < numberOfIterations; i++)
		{
			this.CalculateSinglePhysicsStep_FORCES(localAllNodes);
		}
		console.log(this.ReturnEdgeCoordinatesOfAllNodes(localAllNodes, localAllNodesLength));
		
		let edgeCoordinatesWithoutRadii = this.ReturnEdgeCoordinatesOfAllNodes(localAllNodes, localAllNodesLength);
		
		//zatim bez polomeru
		//maxX-minX
		let graphWidth = edgeCoordinatesWithoutRadii[1]-edgeCoordinatesWithoutRadii[0];
		//maxY-minY
		let graphHeight = edgeCoordinatesWithoutRadii[3]-edgeCoordinatesWithoutRadii[2];
		
		//vsechny uzly maji ted danou pozici - takze je vlozime do quad tree
		this.nodesQuadTree = new QuadTree([edgeCoordinatesWithoutRadii[0], edgeCoordinatesWithoutRadii[2]], graphWidth, graphHeight, 1);
		
		for (let i = 0; i < localAllNodesLength; i++)
		{
			this.nodesQuadTree.InsertPoint(localAllNodes[i].x, localAllNodes[i].y, localAllNodes[i]);
		}
		
		console.log(this.nodesQuadTree);
		
		let graphArea = graphWidth*graphHeight;
		
		//proporcialni k plose, ktera nalezi jednomu uzlu
		this.areaPerNode = graphArea/localAllNodesLength;
		
		//podle faktoru vsem uzlum vypocitame polomer a zjisctime, jaky je nejvetsi (kvuli pozdejsi query do quadtree)
		this.biggestRadius = 0;
		this.smallestRadius = Infinity;
		
		let actRadius;
		for (let i = 0; i < localAllNodesLength; i++)
		{
			actRadius = localAllNodes[i].CalculateRadiusAndDrawParameters_FORCES(this.areaPerNode);
			
			if (actRadius > this.biggestRadius)
			{
				this.biggestRadius = actRadius;
			}
			
			if (actRadius < this.smallestRadius)
			{
				this.smallestRadius = actRadius;
			}
		}
		
		console.log(this.biggestRadius);
		
		let edgeCoordinatesWithRadii = this.ReturnEdgeCoordinatesOfAllNodesWithRadii(localAllNodes, localAllNodesLength);
		graphWidth = edgeCoordinatesWithRadii[1]-edgeCoordinatesWithRadii[0];
		graphHeight = edgeCoordinatesWithRadii[3]-edgeCoordinatesWithRadii[2];
		
		let canvasWithoutBorderWidth = canvasWidth-this.border*2;
		let canvasWithoutBorderHeight = canvasHeight-this.border*2;
		
		this.translationTwoX = canvasWidth/2;
		this.translationTwoY = canvasHeight/2;
		
		if (canvasWithoutBorderWidth/graphWidth > canvasWithoutBorderHeight/graphHeight)
		{
			this.scaleOneX = canvasWithoutBorderHeight/graphHeight;
			this.scaleOneY = canvasWithoutBorderHeight/graphHeight;
		}
		else
		{
			this.scaleOneX = canvasWithoutBorderWidth/graphWidth;
			this.scaleOneY = canvasWithoutBorderWidth/graphWidth;
		}
		
		this.translationOneX = -(edgeCoordinatesWithRadii[0]+edgeCoordinatesWithRadii[1])/2;
		this.translationOneY = -(edgeCoordinatesWithRadii[2]+edgeCoordinatesWithRadii[3])/2;
		
		/*
		//po provodeni modelu muze byt graf ruzne velky,
		//tedy ho ztranformujeme do prostoru canvasu
		this.TransformAllNodesIntoCanvasBoundaries(localAllNodes, localAllNodesLength, this.ReturnEdgeCoordinatesOfAllNodes(localAllNodes, localAllNodesLength));
		
		//vypocteme faktor, bude urcovat velikost uzlu, propojeni a vsech dalsich prvku
		// this.baseScaleFactor = (((canvasHeight-this.border)*(canvasWidth-this.border))/localAllNodesLength)/1000;
		this.baseScaleFactor = (((canvasHeight-this.border)*(canvasWidth-this.border))/localAllNodesLength);
		
		//podle faktoru vsem uzlum vypocitame polomer
		for (let i = 0; i < localAllNodesLength; i++)
		{
			localAllNodes[i].CalculateRadiusAndFontSize(this.baseScaleFactor);
		}
		
		//posledni problem je ten, ze se graf prvne ztransformuje podle souradnic uzlu a pak podle toho vypocitame polomer uzlu,
		//to ale zpusobi, ze vykreslene uzlu budou precuhovat danou hranici - proto je znovu ztransformuje, vezmeme ale v uvahu i jejich polomery
		this.TransformAllNodesIntoCanvasBoundaries(localAllNodes, localAllNodesLength, this.ReturnEdgeCoordinatesOfAllNodesWithRadii(localAllNodes, localAllNodesLength));*/
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
				
				
				/*
				//vsechny uzly se odpuzuji silou danou vzdalenosti podle vzorce 1/x
				forceSecondPart = -1*(firstNode.totalConnections+secondNode.totalConnections)/distanceBetweenNodes;
				
				//vahy slozek
				forceFirstPart = forceFirstPart*1;
				forceSecondPart = forceSecondPart*1000;
				
				//slozky secteme
				forceTotalStrength = forceFirstPart + forceSecondPart;
				
				//vaha celkove sily - jeste se na to podvat - muzeme zakonponovat do slozek
				//zkusit to postupne snizit
				//delit n*n???
				forceTotalStrength = forceTotalStrength*0.01;
				*/
				
				//stejne jak predchozi zakomentovany kod - jen rychlejsi
				
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

	DrawGraph(deltaTime)
	{
		let localContext = context;
		
		localContext.fillStyle = "#F5F5F5";
		localContext.fillRect(0, 0, canvasWidth, canvasHeight);
		
		//transformujeme podle toho kam ukazuje okno
		let transfromScale = 1/this.viewWindowScale;
		let transformMoveX = -this.viewWindowPositionX;
		let transformModeY = -this.viewWindowPositionY;
		
		localContext.transform(transfromScale, 0, 0, transfromScale, 0, 0, 0);
		localContext.transform(1, 0, 0, 1, transformMoveX, transformModeY);


		
		localContext.transform(1, 0, 0, 1, this.translationTwoX, this.translationTwoY);
		localContext.transform(this.scaleOneX, 0, 0, this.scaleOneY, 0, 0);
		localContext.transform(1, 0, 0, 1, this.translationOneX, this.translationOneY);		
		
		
		

		/*
		context.beginPath();
		context.moveTo(300, 300);
		context.lineTo(600, 300);
		context.stroke();	
		
		context.fillStyle = "#000000";
		context.strokeStyle = "#000000";
		context.textAlign = "center";
		context.textBaseline = "middle";
		
		// context.font = "86px Arial";
		// console.log(context.measureText("TOMAS").actualBoundingBoxLeft+context.measureText("TOMAS").actualBoundingBoxRight);
		// context.font = "85px Arial";
		// console.log(context.measureText("TOMAS").actualBoundingBoxLeft+context.measureText("TOMAS").actualBoundingBoxRight);
		// context.font = "84px Arial";
		// console.log(context.measureText("TOMAS").actualBoundingBoxLeft+context.measureText("TOMAS").actualBoundingBoxRight);
		
		context.fillText("TOMAS", 450, 300);
		*/
		// vykresleni propojeni
		this.DrawConnectionClusters(context)
		
		//vykreslime uzly
		this.DrawNodes(localContext);

		
		//reset transformaci pred dalsim framem
		localContext.resetTransform();
		
		//framerate
		this.DrawFrameRate(localContext);
	}
	
	DrawFrameRate(context)
	{
		context.fillStyle = "#000000";
		context.beginPath();
		context.font = "bold 30px Arial";
		context.textAlign = "center";
		context.fillText((Math.ceil(1000/deltaTime)).toString(), canvasWidth-40, canvasHeight-20);
		context.fill();
	}
	
	
	DrawNodes(context)
	{
		let localObjectNodes = this.objectNodes;
		let localLiteralNodes = this.literalNodes;
		
		let lineWidth = this.baseScaleFactor/20000;
		
		//objektove uzly - tvar
		context.fillStyle = "#e60000";
		context.strokeStyle = "#000000";
		context.lineWidth = lineWidth;
		
		for (let objectNode of localObjectNodes.values())
		{
			objectNode.DrawNodeShape(context);
		}
		
		//literalni uzly - tvar
		context.fillStyle = "#009900";
		context.strokeStyle = "#000000";
		context.lineWidth = lineWidth;
		
		for (let literalNode of localLiteralNodes.values())
		{
			literalNode.DrawNodeShape(context);
		}
		
		
		//objektove uzly - popis
		context.fillStyle = "#FFFFFF";
		context.strokeStyle = "#000000";
		context.textAlign = "center";
		context.textBaseline = "middle";
		
		for (let objectNode of localObjectNodes.values())
		{
			objectNode.DrawDescription(context);
		}
		
		//literalni uzly - popis
		context.fillStyle = "#FFFFFF";
		context.strokeStyle = "#000000";
		context.textAlign = "center";
		context.textBaseline = "middle";
		
		for (let literalNode of localLiteralNodes.values())
		{
			literalNode.DrawDescription(context);
		}
	}
	
	
	DrawConnectionClusters(context)
	{
		let localConnectionClusters = this.connectionClusters;
		
		// let lineWidth = this.baseScaleFactor/5000
		
		// let localFactor = this.areaPerNode/5000;
		let localFactor = this.smallestRadius;
		
		context.fillStyle = "#CCCCCC";
		context.strokeStyle = "#CCCCCC";
		context.lineWidth = localFactor/3;
		let arrowheadLength = localFactor;
		let arrowheadHalfThickness = localFactor/3;
		
		for (let i = 0; i < localConnectionClusters.length; i++)
		{
			localConnectionClusters[i].DrawWithArrowsNearCircles(context, arrowheadLength, arrowheadHalfThickness);
		}
		
		context.fillStyle = "#000000";
		context.textAlign = "center";
		context.textBaseline = "middle";
		localFactor = localFactor/2;
		context.font = localFactor.toString() + "px Arial";
		
		for (let i = 0; i < localConnectionClusters.length; i++)
		{
			localConnectionClusters[i].DrawDescriptions(context);
		}
		
	}
	
	//clocal context, aby to bylo rychlejsi???
	DrawGraph_REALTIME(deltaTime)
	{
		let localContext = context;
		
		context.clearRect(0, 0, 1000, 1000);
		
		
	
		context.fillStyle = "#EEEEEE";
		//moje promenne
		context.fillRect(0, 0, canvas.width, canvas.height);
		
		let maxWidth = this.maxX - this.minX;
		let maxHeight = this.maxY - this.minY;
		
		
		// console.log(this.maxX);
		
		// context.transform(force2.GetValue(), 0, 0, force2.GetValue(), 0, 0);

		if (maxWidth !== Infinity && maxHeight !== Infinity && maxWidth !== -Infinity && maxHeight !== -Infinity)
		{
			// context.transform(1, 0, 0, 1, -this.minX, -this.minY);
			
			context.transform(1, 0, 0, 1, 1450/2, 950/2);
			
			if (1450/maxWidth > 950/maxHeight)
			{
				context.transform(950/maxHeight, 0, 0, 950/maxHeight, 0, 0);
			}
			else
			{
				context.transform(1450/maxWidth, 0, 0, 1450/maxWidth, 0, 0);
			}
			
			context.transform(1, 0, 0, 1, -(this.minX+this.maxX)/2, -(this.minY+this.maxY)/2);		
		}
		

		this.DrawConnectionClusters_REALTIME(context);
		this.DrawObjectNodes(context);
		this.DrawLiteralNodes(context);
		
		context.resetTransform();
	}
	
	//REALTIME
	//oddelit postupne, abych furt nestridal barvy?
	DrawObjectNodes(context)
	{
		let localObjectNodes = this.objectNodes;
		
		context.fillStyle = "#FF0000";
		context.strokeStyle = "#000000";
		context.lineWidth = 1;
		
		for (let objectNode of localObjectNodes.values())
		{
			objectNode.DrawNodeShape(context);
		}
		
		context.fillStyle = "#000000";
		
		for (let objectNode of localObjectNodes.values())
		{
			// objectNode.DrawDescription(context);
		}
		
		
		
	}
	
	DrawLiteralNodes(context)
	{	
		let localLiteralNodes = this.literalNodes;
		
		context.fillStyle = "#FFFF00";
		context.strokeStyle = "#000000";
		context.lineWidth = 1;
		
		for (let literalNode of localLiteralNodes.values())
		{
			literalNode.DrawNodeShape(context);
		}
		
		context.fillStyle = "#000000";
		
		for (let literalNode of localLiteralNodes.values())
		{
			// literalNode.DrawDescription(context);
		}
	}
	
	
	
	
	
	DrawConnectionClusters_REALTIME(context)
	{
		let localConnectionClusters = this.connectionClusters;
		
		// context.fillStyle = "#000000";
		// context.strokeStyle = "#000000";
		
		context.fillStyle = "#CCCCCC";
		context.strokeStyle = "#CCCCCC";
		
		context.lineWidth = 2;
		
		for (let i = 0; i < localConnectionClusters.length; i++)
		{
			localConnectionClusters[i].DrawWithArrowsNearCircles(context);
			//uvidime, jestli to bude potreba
			// localConnectionClusters[i].DrawWithArrowsOnLine(context);
		}
	}
}


























