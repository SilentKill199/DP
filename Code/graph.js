class Connection
{
	constructor(startNode, description, endNode) 
	{
		this.startNode = startNode;
		this.decription = description;
		this.endNode = endNode;
	}
}

class Node
{
	constructor(name) 
	{
		this.connectionsIn = [];
		this.connectionsOut = [];
		
		// this.x = Math.floor(Math.random()*1250)+100;
		// this.y = Math.floor(Math.random()*750)+100;
		
		this.position = [Math.floor(Math.random()*1250)+100, Math.floor(Math.random()*750)+100];
		this.movementVector;
		
		this.connectionsInCount = 0;
		this.connectionsOutCount = 0;
		this.connectionsCount = 0;
	}
	
	AddConnectionIn(connection)
	{
		this.connectionsIn.push(connection);
		this.connectionsInCount++;
		this.connectionsCount++;
	}
	
	AddConnectionOut(connection)
	{
		this.connectionsOut.push(connection);
		this.connectionsOutCount++;
		this.connectionsCount++;
	}
	
	ResetVector()
	{
		this.movementVector = [0,0];
	}
	
	ConnectedToNode(node)
	{
		let localConnectionsIn = this.connectionsIn;
		let localConnectionsOut = this.connectionsOut;
		
		for (let i = 0; i < localConnectionsOut.length; i++)
		{
			if (localConnectionsOut[i].endNode === node)
			{
				return true;
			}
		}
		
		for (let i = 0; i < localConnectionsIn.length; i++)
		{
			if (localConnectionsIn[i].startNode === node)
			{
				return true;
			}
		}
		
		return false;
	}
}

class ObjectNode extends Node
{	
	constructor(name) 
	{
		super(name);
		
		this.name = name;
	}
	
	ToString()
	{
		return this.name;
	}
}

class LiteralNode extends Node
{
	constructor(value) 
	{
		super(name);
		
		this.value = value;
	}
	
	ToString()
	{
		return this.value;
	}
	
}


//spocitat ty co maji nejvic connections a ty pak dat jako hlavni

class Graph
{
	constructor() 
	{
		this.nodes = [];
		this.connections = [];
		
		
		this.GenerateRandomData();
		this.GenerateRandomData();
		this.GenerateRandomData();
		
		let actConnection;
		
		actConnection = new Connection(this.nodes[0], "test", this.nodes[55]);
		this.nodes[0].AddConnectionOut(actConnection);
		this.nodes[55].AddConnectionIn(actConnection);
		this.connections.push(actConnection);
		
		actConnection = new Connection(this.nodes[0], "test", this.nodes[110]);
		this.nodes[0].AddConnectionOut(actConnection);
		this.nodes[110].AddConnectionIn(actConnection);
		this.connections.push(actConnection);
		
		actConnection = new Connection(this.nodes[110], "test", this.nodes[55]);
		this.nodes[110].AddConnectionOut(actConnection);
		this.nodes[55].AddConnectionIn(actConnection);
		this.connections.push(actConnection);
		
		this.connections.push(new Connection(this.nodes[0], "test", this.nodes[55]));
		this.connections.push(new Connection(this.nodes[0], "test", this.nodes[110]));
		this.connections.push(new Connection(this.nodes[110], "test", this.nodes[55]));
		

		
		// this.nodes[0].position = [700,400];
		
		this.totalForce;
	}	
	
	GenerateRandomData()
	{
		let actNode;
		let actConnection;
		
		let productCount = 10;
		let employeeCount = 5;
		let manufacturerCount = 3;
		
		let storeNodes = [];
		let categoryNodes = [];
		let productNodes = [];
		let employeeNodes = [];
		let manufacturerNodes = [];
		
		
		actNode = new ObjectNode("Store 1")
		this.nodes.push(actNode);
		storeNodes.push(actNode);
		
		for (let i = 1; i <= productCount; i++)
		{
			actNode = new ObjectNode("ProductID " + i.toString());
			this.nodes.push(actNode);
			productNodes.push(actNode);
		}
		
		actNode = new ObjectNode("FoodItem")
		this.nodes.push(actNode);
		categoryNodes.push(actNode);
		
		actNode = new ObjectNode("Toy")
		this.nodes.push(actNode);
		categoryNodes.push(actNode);
		
		actNode = new ObjectNode("Electronics")
		this.nodes.push(actNode);
		categoryNodes.push(actNode);
		
		for (let i = 1; i <= employeeCount; i++)
		{
			actNode = new ObjectNode("Employee " + i.toString());
			this.nodes.push(actNode);
			employeeNodes.push(actNode);
		}
		
		for (let i = 1; i <= manufacturerCount; i++)
		{	
			actNode = new ObjectNode("Manufacturer " + i.toString());
			this.nodes.push(actNode);
			manufacturerNodes.push(actNode);
		}
		
		//---------------------Connections-------------------------
		
		//obchod prodava vsechny produkty
		for (let i = 0; i < productCount; i++)
		{
			actConnection = new Connection(storeNodes[0], "sells", productNodes[i]);
			
			this.connections.push(actConnection);
			storeNodes[0].AddConnectionOut(actConnection);
			productNodes[i].AddConnectionIn(actConnection);
		}
		
		//obchod ma vsechny zamestnance
		for (let i = 0; i < employeeCount; i++)
		{
			actConnection = new Connection(storeNodes[0], "employs", employeeNodes[i]);
			
			this.connections.push(actConnection);
			storeNodes[0].AddConnectionOut(actConnection);
			employeeNodes[i].AddConnectionIn(actConnection);
			
		}
			
		//produkty maji nahodnou kategorii
		for (let i = 0; i < productCount; i++)
		{
			let randomCategoryNode = categoryNodes[Math.floor(Math.random()*categoryNodes.length)];
			
			actConnection = new Connection(productNodes[i], "is type of", randomCategoryNode);
			
			this.connections.push(actConnection);
			productNodes[i].AddConnectionOut(actConnection);
			randomCategoryNode.AddConnectionIn(actConnection);
		}
		
		//produkty maji nahodneho vyrobce
		for (let i = 0; i < productCount; i++)
		{
			let randomManufacturerNode = manufacturerNodes[Math.floor(Math.random()*manufacturerNodes.length)];
			
			actConnection = new Connection(productNodes[i], "is manufactured by", randomManufacturerNode);
			
			this.connections.push(actConnection);
			productNodes[i].AddConnectionOut(actConnection);
			randomManufacturerNode.AddConnectionIn(actConnection);
		}
		
		//literaly
		
		//vek zamestnancu
		for (let i = 0; i < employeeCount; i++)
		{
			actNode = new LiteralNode(Math.floor(Math.random()*20)+20);	
			actConnection = new Connection(employeeNodes[i], "age", actNode);
			
			this.nodes.push(actNode);
			this.connections.push(actConnection);
			employeeNodes[i].AddConnectionOut(actConnection);
			actNode.AddConnectionIn(actConnection);
		}
		
		//jmeno zamestnancu
		for (let i = 0; i < employeeCount; i++)
		{		
			actNode = new LiteralNode("EmployeeName" + i.toString()+1);	
			actConnection = new Connection(employeeNodes[i], "name", actNode);
			
			this.nodes.push(actNode);
			this.connections.push(actConnection);
			employeeNodes[i].AddConnectionOut(actConnection);
			actNode.AddConnectionIn(actConnection);
		}
		
		//jmeno vyrobcu
		for (let i = 0; i < manufacturerCount; i++)
		{
			actNode = new LiteralNode("ManufacturerName" + i.toString()+1);	
			actConnection = new Connection(manufacturerNodes[i], "name", actNode);
			
			this.nodes.push(actNode);
			this.connections.push(actConnection);
			manufacturerNodes[i].AddConnectionOut(actConnection);
			actNode.AddConnectionIn(actConnection);
		}
		
		//jmeno produktu
		for (let i = 0; i < productCount; i++)
		{
			actNode = new LiteralNode("ProductName" + i.toString()+1);	
			actConnection = new Connection(productNodes[i], "name", actNode);
			
			this.nodes.push(actNode);
			this.connections.push(actConnection);
			productNodes[i].AddConnectionOut(actConnection);
			actNode.AddConnectionIn(actConnection);
		}
		
		//cena produktu
		for (let i = 0; i < productCount; i++)
		{
			actNode = new LiteralNode(Math.floor(Math.random()*100)+1);	
			actConnection = new Connection(productNodes[i], "price", actNode);
			
			this.nodes.push(actNode);
			this.connections.push(actConnection);
			productNodes[i].AddConnectionOut(actConnection);
			actNode.AddConnectionIn(actConnection);
		}
	}
	
	
	LoadDatabaseFromRequest(database)
	{
		console.log(database);
		
		
	}
	
	
	
	ResetVectorNodeValue()
	{
		let localNodes = this.nodes;
		
		for (let i = 0; i < localNodes.length; i++)
		{
			localNodes[i].ResetVector();
		}
	}
	
	//benchmark?
	CalculateConnectionLength(connection)
	{
		let diffX = connection.startNode.position[0]-connection.endNode.position[0];
		let diffY = connection.startNode.position[1]-connection.endNode.position[1];
		
		return Math.sqrt(diffX*diffX+diffY*diffY);
	}
	
	CalculateVectorLength(vector)
	{
		return Math.sqrt(vector[0]*vector[0]+vector[1]*vector[1]);
	}
	
	CalculateLengthBetweenTwoNodes(firstNode, secondNode)
	{
		let diffX = firstNode.position[0]-secondNode.position[0];
		let diffY = firstNode.position[1]-secondNode.position[1];
		
		return Math.sqrt(diffX*diffX+diffY*diffY);
	}
	
	NormalizeVector(vector)
	{
		let vectorLength = this.CalculateVectorLength(vector);
		
		return [vector[0]/vectorLength, vector[1]/vectorLength];
	}
	
	CalculateVectorFromPositions(firstPosition, secondPosition)
	{
		return [secondPosition[0]-firstPosition[0], secondPosition[1]-firstPosition[1]];
	}
	
	MultiplyVector(vector, number)
	{
		return [vector[0]*number, vector[1]*number];
	}
	
	AddVectors(firstVector, secondVector)
	{
		return [firstVector[0]+secondVector[0], firstVector[1]+secondVector[1]];
	}
	
	
	CalculateForcesForAllNodes()
	{
		let localNodes = this.nodes;
		//let localConnections = this.connections;
		
		let distanceBetweenNodes;
		
		this.ResetVectorNodeValue();
		
		let firstNode;
		let secondNode;
		
		this.totalForce = 0;
		
		for (let i = 0; i < localNodes.length; i++)
		{
			firstNode = localNodes[i];
			
			for (let j = i+1; j < localNodes.length; j++)
			{
				secondNode = localNodes[j];
						
				let vectorFirstSecond = this.CalculateVectorFromPositions(firstNode.position, secondNode.position);
				let vectorSecondFirst = this.CalculateVectorFromPositions(secondNode.position, firstNode.position);
				
				let vectorFirstSecondLength = this.CalculateVectorLength(vectorFirstSecond);
				let vectorSecondFirstLength = this.CalculateVectorLength(vectorSecondFirst);


				vectorFirstSecond = this.NormalizeVector(vectorFirstSecond);
				vectorSecondFirst = this.NormalizeVector(vectorSecondFirst);
				
				
				// let springLength = force2.GetValue()*(firstNode.connectionsCount+secondNode.connectionsCount);
				let springLength = 50*force3.GetValue();

				distanceBetweenNodes = this.CalculateLengthBetweenTwoNodes(firstNode, secondNode);
				
				// if (i === 0 && j === 55)
				// {
					// console.log(distanceBetweenNodes);
					// console.log(frameCounter);
					// forceMultiplier = forceMultiplier*1.5;
				// }
				
				
				
				
				
				
				
				let forceMultiplier;
				
				
				
				

				if (firstNode.ConnectedToNode(secondNode) === true)
				{					
					if (distanceBetweenNodes > springLength)
					{
						forceMultiplier = distanceBetweenNodes - springLength;
						
						// if (forceMultiplier > springLength)
						// {
							// forceMultiplier = springLength;
							
						// }
						// forceMultiplier = forceMultiplier*forceMultiplier*force1.GetValue()/10000;
						
					}
					else
					{
						forceMultiplier = (springLength - distanceBetweenNodes)*-1;
						
						// forceMultiplier = forceMultiplier*forceMultiplier*force1.GetValue()/-10;
					}
					
					// (firstNode.connectionsCount+secondNode.connectionsCount)
					
					
					// forceMultiplier = forceMultiplier + (forceMultiplier/1000)*(forceMultiplier/1000)*(forceMultiplier/1000);
					
					// console.log(distanceBetweenNodes);
					
				
					// if (distanceBetweenNodes > 800 && frameCounter > 300)
					// {
					
						// forceMultiplier = forceMultiplier*2;
					// }
					
					
					vectorFirstSecond = this.MultiplyVector(vectorFirstSecond, forceMultiplier);
					vectorSecondFirst = this.MultiplyVector(vectorSecondFirst, forceMultiplier);
						
					firstNode.movementVector = this.AddVectors(firstNode.movementVector, vectorFirstSecond);
					secondNode.movementVector = this.AddVectors(secondNode.movementVector, vectorSecondFirst);					
				}
				else
				{
					forceMultiplier = -10000*force1.GetValue()/(distanceBetweenNodes*distanceBetweenNodes*force2.GetValue());
					
					vectorFirstSecond = this.MultiplyVector(vectorFirstSecond, forceMultiplier);
					vectorSecondFirst = this.MultiplyVector(vectorSecondFirst, forceMultiplier);
					
					firstNode.movementVector = this.AddVectors(firstNode.movementVector, vectorFirstSecond);
					secondNode.movementVector = this.AddVectors(secondNode.movementVector, vectorSecondFirst);
				}
				
				this.totalForce += forceMultiplier;
				
				
				
			}		
		}
	}
	
	
	MoveAccordingToForces()
	{
		
		let localNodes = this.nodes;
		let actNode;
		
		
		for (let i = 0; i < localNodes.length; i++)
		{
			actNode = localNodes[i];
			
			// actNode.movementVector = this.NormalizeVector(actNode.movementVector);
			
			// console.log(this.CalculateVectorLength(actNode.x, actNode.y));
			
			// actNode.x += actNode.vectorX/1000;
			// actNode.y += actNode.vectorY/1000;
			
			// console.log(this.totalForce);
			
			actNode.position = this.AddVectors(actNode.position, this.MultiplyVector(actNode.movementVector, 1/10));
		}
	}
	
	
	//clocal context, aby to bylo rychlejsi???
	DrawGraph()
	{
		let localNodes = this.nodes;
		let localConnections = this.connections;
		
		let currentNode;
		let currentConnection;
		
		for (let i = 0; i < localConnections.length; i++)
		{
			currentConnection = localConnections[i];

			this.DrawConnection(currentConnection);
		}
		
		
		for (let i = 0; i < localNodes.length; i++)
		{
			currentNode = localNodes[i];
			this.DrawNode(currentNode);
			
		}
	}
	
	//oddelit postupne, abych furt nestridal barvy?
	DrawNode(node)
	{
		
		context.beginPath();
		
		context.fillStyle = "#F9785C";
		context.strokeStyle = "#000000";
		context.lineWidth = 1;
				
		context.arc(node.position[0], node.position[1], 5+node.connectionsCount, 0, 2 * Math.PI);
		
		context.fill();
		
		context.stroke();
		
		
		//begin path???
		context.beginPath();
		
		context.fillStyle = "#000000";
		// context.strokeStyle =  "#000000";
		
		context.font = "bold 15px Arial";
		context.textAlign = "center";
		context.fillText(node.ToString(), node.position[0], node.position[1]-5);
		
		// context.strokeText(node.ToString(), node.x, node.y-5);
		// context.stroke();
	}
	
	DrawConnection(connection)
	{
		context.beginPath();
		context.moveTo(connection.startNode.position[0], connection.startNode.position[1]);
		context.lineTo(connection.endNode.position[0], connection.endNode.position[1]);
		context.lineWidth = (connection.startNode.connectionsCount+connection.endNode.connectionsCount)/2;
		context.strokeStyle = "#999999";
		context.stroke();
	}
}


























