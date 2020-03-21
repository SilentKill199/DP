// Bc. Tomáš Jarůšek, 20.3.2020
// Nástroj pro vizualizaci rozsáhlých RDF databází
// Implementováno v JavaScripu za pomoci prvku canvas, načítání databáze probíhá přes REST API (rdf4j API)
// Součást diplomové práce na téma Vizualizace rozsáhlých grafových dat na webu (vedoucí: Ing. Radek Burget Ph.D.), FIT VUTBR 2020

//vystaveni a vyhledani v QuadTree
function QuadTree(startPoint, width, height, maximumCapacity)
{	
	//souradnice prostoru
	this.startPoint = startPoint;
	this.width = width;
	this.height = height;
	this.maximumCapacity = maximumCapacity;
	
	//hotnota hranic pro rozdeleni
	this.verticalSplit = this.width/2;
	this.horizontalSplit = this.height/2;
	
	//hranice prostoru ohranicujici tento quadtree
	this.leftBoundary = this.startPoint[0];
	this.rightBoundary = this.startPoint[0] + this.width;
	this.topBoundary = this.startPoint[1];
	this.bottomBoundary = this.startPoint[1] + this.height;
	
	//je strom rozdelen?
	this.divided = false;
	//seznam dat v tomhle stromu
	this.itemList = [];
	
	//odkazy na pod quadtree
	this.topLeftTree = false;
	this.topRightTree = false;
	this.bottomLeftTree = false;
	this.bottomRightTree = false;
	
	this.numberOfPointsInTree = 0;

	//vlozeni bodu do stromu - pozice bodu v prostoru a data ktere jsou v tom bodu obsazena
	//vrati true kdyz vlozeni bylo uspesne
	this.InsertPoint = function(x, y, data)
	{
		//je strom rozdelen na podstormy?
		if (this.divided)
		{
			//pokud ano, tak porovname v jakem kvadrantu se bod vyskytuje a podle toho ho vlozime do spravneho podstromu
			let verticalCondition = x <= this.startPoint[0]+this.verticalSplit;
			let horizontalCondition = y <= this.startPoint[1]+this.horizontalSplit;
			
			let retValue;
			
			if (verticalCondition)
			{
				if (horizontalCondition)
				{
					retValue = this.topLeftTree.InsertPoint(x,y,data);
				}
				else
				{
					retValue = this.bottomLeftTree.InsertPoint(x,y,data);
				}
			}
			else
			{
				if (horizontalCondition)
				{
					retValue = this.topRightTree.InsertPoint(x,y,data);
				}
				else
				{
					retValue = this.bottomRightTree.InsertPoint(x,y,data);
				}
			}
			
			// pri navratu z rekurze pricteme +1 do vsech nadrazenych stromu
			if (retValue === true)
			{
				this.numberOfPointsInTree++;
				return true;
			}
			else
			{
				return false;
			}
		}
		else
		{		
			//pokud ne, tak vlozime bod do seznamu bodu, ktery obsahuje tento podstom
			
			//zkontrolujeme, jestli se na stejne pozici uz nenachazi prvek - jinak nedelame nic - v quad tree nemuzou byt dva prvky se stejnymi souradnicemi
			let actItem;
			
			for (let i = 0; i < this.itemList.length; i++)
			{
				actItem = this.itemList[i];
				
				if (actItem[0] === x && actItem[1] === y)
				{
					return false;
				}
			}
		
			this.itemList.push([x,y,data]);
			
			this.numberOfPointsInTree++;
			
			//pokud seznam bodu prekrocil limit, musime strom rozstepit
			if (this.itemList.length > this.maximumCapacity)
			{
				//vytvorime podstromy
				this.topLeftTree = new QuadTree([this.startPoint[0],this.startPoint[1]], this.verticalSplit, this.horizontalSplit, this.maximumCapacity);
				this.topRightTree = new QuadTree([this.startPoint[0]+this.verticalSplit,this.startPoint[1]], this.verticalSplit, this.horizontalSplit, this.maximumCapacity);	
				this.bottomLeftTree = new QuadTree([this.startPoint[0],this.startPoint[1]+this.horizontalSplit], this.verticalSplit, this.horizontalSplit, this.maximumCapacity);
				this.bottomRightTree = new QuadTree([this.startPoint[0]+this.verticalSplit,this.startPoint[1]+this.horizontalSplit], this.verticalSplit, this.horizontalSplit, this.maximumCapacity);
				
				//pro kazdy prvek ze seznamu tohoto stromu zjistime, do ktereho patri kvadrantu a podle toho ho vlozime do korektniho stromu
				for (let i = 0; i < this.itemList.length; i++)
				{
					actItem = this.itemList[i];
					
					let verticalCondition = actItem[0] <= this.startPoint[0]+this.verticalSplit;
					let horizontalCondition = actItem[1] <= this.startPoint[1]+this.horizontalSplit;
					
					if (verticalCondition)
					{
						if (horizontalCondition)
						{
							this.topLeftTree.InsertPoint(actItem[0],actItem[1],actItem[2]);
						}
						else
						{
							this.bottomLeftTree.InsertPoint(actItem[0],actItem[1],actItem[2]);
						}
					}
					else
					{
						if (horizontalCondition)
						{
							this.topRightTree.InsertPoint(actItem[0],actItem[1],actItem[2]);
						}
						else
						{
							this.bottomRightTree.InsertPoint(actItem[0],actItem[1],actItem[2]);
						}
					}
				}
				
				//zrusime seznam prvku tohoto stromu a nastavime ze je rozstepen
				this.itemList = [];
				this.divided = true;
				this.divided = true;
			}
			
			//nemusime testovat returny z insertu co rozdeluji strom - ty budou vzdy validni - jsou az po kontrole unikatnosti
			return true;
		}
	}
	
	//vrati vsechny body v oblasti ohranicene obdelnikem
	this.Query = function(selectorLeftBoundary, selectorRightBoundary, selectorTopBoundary, selectorBottomBoundary)
	{
		//pripravime si vystupni pole, do ktereho budeme pridavat body
		let result = [];
	
		//protina se obdelnik ohranicujici prostor stromu a obdelnik selectoru?
		if (selectorLeftBoundary <= this.rightBoundary && selectorRightBoundary >= this.leftBoundary && selectorTopBoundary <= this.bottomBoundary && selectorBottomBoundary >= this.topBoundary)
		{
			//pokud ano, tak se zeptame, zda je strom dale rozdelen na podstromy
			if (this.divided)
			{	
				//kdyz ano, preposleme pozadavek do dalsich ctyrech podstromu a spojime jejich vystupy
				result = result.concat(this.topLeftTree.Query(selectorLeftBoundary, selectorRightBoundary, selectorTopBoundary, selectorBottomBoundary));
				result = result.concat(this.topRightTree.Query(selectorLeftBoundary, selectorRightBoundary, selectorTopBoundary, selectorBottomBoundary));
				result = result.concat(this.bottomLeftTree.Query(selectorLeftBoundary, selectorRightBoundary, selectorTopBoundary, selectorBottomBoundary));
				result = result.concat(this.bottomRightTree.Query(selectorLeftBoundary, selectorRightBoundary, selectorTopBoundary, selectorBottomBoundary));
			}
			else
			{
				//pokud ne, tak se jedna o nejmensi podstrom
				
				//podivame se na vsechny body v tomto strome
				let tmpY;
				let tmpX;
				
				for (let i = 0; i < this.itemList.length; i++)
				{
					tmpX = this.itemList[i][0];
					tmpY = this.itemList[i][1];
					
					// zjistime, zda patri do obdelniku selectoru
					if (tmpX >= selectorLeftBoundary && tmpX <= selectorRightBoundary && tmpY >= selectorTopBoundary && tmpY <= selectorBottomBoundary)
					{
						//pokud ano vlozime je do pole vysledku
						result.push(this.itemList[i][2]);
					}			
				}
			}
			//vratime vysledek
			return result;
		}
		else
		{
			//pokud ne - dal nas tyto podstromy nezajimaji
			return [];
		}	
	}
	
	//vymazeme pod ze stromu, ktery lezi an souradnicich x,y
	//vrati true, pokud se podarilo bod uspesne smazat
	this.DeletePoint = function(x, y)
	{
		//je strom rozdelen na podstormy?
		if (this.divided)
		{
			//pokud ano, tak porovname v jakem kvadrantu se bod vyskytuje a podle toho ho vlozime do spravneho podstromu
			let verticalCondition = x <= this.startPoint[0]+this.verticalSplit;
			let horizontalCondition = y <= this.startPoint[1]+this.horizontalSplit;
			
			let retValue;
			
			if (verticalCondition)
			{
				if (horizontalCondition)
				{
					retValue = this.topLeftTree.DeletePoint(x, y);
				}
				else
				{
					retValue = this.bottomLeftTree.DeletePoint(x, y);
				}
			}
			else
			{
				if (horizontalCondition)
				{
					retValue = this.topRightTree.DeletePoint(x, y);
				}
				else
				{
					retValue = this.bottomRightTree.DeletePoint(x, y);
				}
			}
			
			//podarilo se uspesne zrusit bod
			if (retValue === true)
			{		
				//ted se zaciname vynorovat - musime pritom kontrolovat, jestli nemuzeme podstromy zrusit
				//a predelat body z podstromu do aktualniho stromu
				let numberOfPointsInSubtrees = this.topLeftTree.numberOfPointsInTree + this.topRightTree.numberOfPointsInTree + this.bottomLeftTree.numberOfPointsInTree + this.bottomRightTree.numberOfPointsInTree;
				
				//pokud se vejdou - dame body z podstromu do aktualniho stromu a podstromy zrusime
				if (numberOfPointsInSubtrees <= maximumCapacity)
				{
					this.itemList = this.itemList.concat(this.topLeftTree.itemList);
					this.itemList = this.itemList.concat(this.topRightTree.itemList);
					this.itemList = this.itemList.concat(this.bottomLeftTree.itemList);
					this.itemList = this.itemList.concat(this.bottomRightTree.itemList);
					
					this.divided = false;
		
					this.topLeftTree = false;
					this.topRightTree = false;
					this.bottomLeftTree = false;
					this.bottomRightTree = false;
					
					this.numberOfPointsInTree = numberOfPointsInSubtrees;
				}
				else
				{
					this.numberOfPointsInTree--;
				}
				
				return true;
			}
			else
			{
				return false;
			}
		}
		else
		{
			//dosli jsme az na dno do stromu, ktery obsahuje nas bod
			let i = 0;
			let actItem = this.itemList[i];

			//bod ktery chceme zrusit neexistuje - nedelame nic
			if (i >= this.itemList.length)
			{
				return false;
			}
			
			while (!(actItem[0] === x && actItem[1] === y))
			{
				i++;
				
				//bod ktery chceme zrusit neexistuje - nedelame nic
				if (i >= this.itemList.length)
				{
					return false;
				}
				
				actItem = this.itemList[i];
			}
			
			//odebereme ho ze seznamu prvku tohoto stromu
			this.itemList.splice(i, 1);
			this.numberOfPointsInTree--;
			
			return true;
		}
	}
}




















