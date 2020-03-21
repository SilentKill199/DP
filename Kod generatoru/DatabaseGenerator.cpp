/* Bc. Tomáš Jarùšek, 21.3.2020 */
/* Nástroj pro generování RDF databází */
/* Implementováno v C++ */
/* Souèást diplomové práce na téma Vizualizace rozsáhlých grafových dat na webu (vedoucí: Ing. Radek Burget Ph.D.), FIT VUTBR 2020 */

#include <iostream>
#include <vector>
#include <fstream>
#include <string>
#include <time.h>

using namespace std;

//tady muze byt nula, ale lepsi je tam mit alespon 1
int minNumberOfPeopleInCluster = 10;
int maxNumberOfPeopleInCluster = 10;

int clusterTreeDepth = 1;

float connectionsClusterDistribution = 0.5;
//minimum alespon 1, jinak problem s nahodnym
int minNumberOfConnections = 2;
int maxNumberOfConnections = 2;

//zadna ochrana proti preteceni
//max 607
int numberOfCities = 10;
//max 91
int numberOfCompanies = 1;
//max 44
int numberOfHobbies = 1;

//neni ochrana proti podteceni, min musi byt mensi nebo rovno maxu
int personDoesMin = 1;
int personDoesMax = 1;

int citySupportsMin = 1;
int citySupportsMax = 1;

int companyOfficesMin = 1;
int companyOfficesMax = 1;

int cityCooperatesMin = 2;
int cityCooperatesMax = 2;

int cityConnectedViaRailroadMin = 3;
int cityConnectedViaRailroadMax = 3;

int companyTradesMin = 1;
int companyTradesMax = 1;






//----------------------------------------------
//obsahy souboru po radcich
//globalni, aby se to zbytecne nekomplikovalo posilanim pres parametry
vector<string> firstNamesMale;
vector<string> firstNamesFemale;
vector<string> surnamesMale;
vector<string> surnamesFemale;
vector<string> cities;
vector<string> companies;
vector<string> hobbies;

//----------------------------------------------

//nacteme soubor do vectoru stringu
vector<string> ParseFileIntoLines(string fileName)
{
    ifstream file(fileName);
    vector<string> lines;

    if (file.is_open())
    {
        char character;
        string line = "";

        while (file.get(character))
        {
            if (character == '\n')
            {
                lines.push_back(line);
                line = "";
            }
            else
            {
                line += character;
            }
        }

        file.close();
    }
    else
    {
        cout << "Unable to open file " << fileName << "!\n";
    }

    return lines;
}

//vsechny soubory, co jsou potreba nacteme do vectoru
void LoadFilesIntoVectors()
{
    string fileName;

    fileName = "D:/Diplomka/Kod generatoru/Podklady/JmenaMuzi.txt";
    firstNamesMale = ParseFileIntoLines(fileName);

    fileName = "D:/Diplomka/Kod generatoru/Podklady/JmenaZeny.txt";
    firstNamesFemale = ParseFileIntoLines(fileName);

    fileName = "D:/Diplomka/Kod generatoru/Podklady/PrijmeniMuzi.txt";
    surnamesMale = ParseFileIntoLines(fileName);

    fileName = "D:/Diplomka/Kod generatoru/Podklady/PrijmeniZeny.txt";
    surnamesFemale = ParseFileIntoLines(fileName);

    fileName = "D:/Diplomka/Kod generatoru/Podklady/Firmy.txt";
    companies = ParseFileIntoLines(fileName);

    fileName = "D:/Diplomka/Kod generatoru/Podklady/Konicky.txt";
    hobbies = ParseFileIntoLines(fileName);

    fileName = "D:/Diplomka/Kod generatoru/Podklady/Mesta.txt";
    cities = ParseFileIntoLines(fileName);
}

//----------------------------------------------

//nahodne cislo od - do vcetne okrajovych hodnot
int GenerateRandomNumber(int from, int to)
{
    return rand() % (to - from + 1) + from;
}

//nahodne desetinne cislo od - do vcetne okrajovych hodnot
float GenerateRandomDecimalNumber(float from, float to)
{
    return from + static_cast <float> (rand()) / (static_cast <float> (RAND_MAX / (to - from)));
}

//vrati pocet propojeni zavisle na hloubce - osoby blize u sebe budou vice propojeny
//zalozeno na funkci 1/x, napriklad kdyz hloubka je 3, a uzivatel ma mit treba 100 propojeni,
//tak ta stovka bude rozlozena dle pomeru 1/2:1/4:1/8 (connectionsClusterDistribution je 0.5)
vector<int> CreateRandomConnectionsDistribution(int depthNeeded)
{
    //init clusterTreeDepth poctu prvku, vyplneno nulami
    vector<int> distribution(depthNeeded, 0);

    //nahodne zvolime pocet propojeni v danem rozmezi
    int numbersToGenerate = GenerateRandomNumber(minNumberOfConnections, maxNumberOfConnections);
    int numbersGenerated = 0;

    float randomFloat;
    float currentConnectionDistribution;
    float distributionMultiplier;

    //zacneme generovat nahodne floaty, dokud nedostaneme pozadovany pocet cisel
    while (numbersGenerated != numbersToGenerate)
    {
        randomFloat = GenerateRandomDecimalNumber(0.0, 1.0);
        currentConnectionDistribution = connectionsClusterDistribution;
        distributionMultiplier = connectionsClusterDistribution;
        
        //hloubka nam urcuje, do kolika bloku musime cisla roztridit dle distribuce
        for (int i = 0; i < depthNeeded; i++)
        {
            //nahodny float, ktery jsme vygenerovali je v rozmezi od 0 do 1
            //prvne se zeptame jestli lezi v intervalu od 0 do 1/currentConnectionDistribution
            //pokud ano, tak ho vlozime do prvniho bloku a jdeme od znovu
            if (randomFloat < currentConnectionDistribution)
            {
                distribution.at(i)++;
                numbersGenerated++;
                break;
            }
            //pokud nepatrilo do tohoto intervalu, tak posuneme hranici dle funkce 1/x a zkusime se zeptat znovu,
            //jestli nepatri do druheho bloku atd...
            else
            {
                distributionMultiplier *= connectionsClusterDistribution;
                currentConnectionDistribution += distributionMultiplier;
            }
        }
        //pokud nepatri do zadneho bloku, tak smula, aktualni cislo zahazujeme a generujeme nove
    }

    return distribution;
}

//vygeneruje nahodne cele jmeno podle jmena a prijmeni ze souboru
string GenerateRandomName()
{
    int firstNamesMaleLength = (int)firstNamesMale.size();
    int firstNamesFemaleLength = (int)firstNamesFemale.size();
    int surnamesMaleLength = (int)surnamesMale.size();
    int surnamesFemaleLength = (int)surnamesFemale.size();

    if (GenerateRandomNumber(0, 1) == 0)
    {
        return firstNamesMale.at(GenerateRandomNumber(0, firstNamesMaleLength - 1)) + " " + surnamesMale.at(GenerateRandomNumber(0, surnamesMaleLength - 1));
    }
    else
    {
        return firstNamesFemale.at(GenerateRandomNumber(0, firstNamesFemaleLength - 1)) + " " + surnamesFemale.at(GenerateRandomNumber(0, surnamesFemaleLength - 1));
    }
}

//----------------------------------------------
//pocet vygenerovanych trojic
int generatedTriplesCounter = 0;

//globalni citace pro id entit
int personIdCounter = 1;
int cityIdCounter = 1;
int companyIdCounter = 1;
int hobbyIdCounter = 1;

//preddefinice kvuli cyklickym zavislostem
struct Cluster;


class Hobby;
class Company;
class City;
class Person;


//mesto
class City
{
    public:
        City(string fileParameters)
        {
            this->id = cityIdCounter;
            cityIdCounter++;

            ParseFileParameters(fileParameters);
        }

        int id;
        string name;
        int population;
        float area;

        vector<Hobby*> supports;
        vector<City*> cooperates;
        vector<City*> connectedViaRailroad;

        string RDFIdentifier;

        void ConstructRDFIdentifier(string prefixLong)
        {
            this->RDFIdentifier = prefixLong + "cityId_" + to_string(this->id);
        }

        void ExportIntoRDFFile(ofstream& file, string prefixShort, string prefixLong);

    private:
        void ParseFileParameters(string fileParameters)
        {
            vector<string> parts;
            string actPart = "";

            for (int i = 0; i < fileParameters.size(); i++)
            {
                if (fileParameters.at(i) == '\t')
                {
                    parts.push_back(actPart);
                    actPart = "";
                }
                else
                {
                    actPart += fileParameters.at(i);
                }
            }
            parts.push_back(actPart);

            this->name = parts.at(0);
            this->population = stoi(parts.at(1));
            this->area = stof(parts.at(2));
        }
};

//firma
class Company
{
    public:
        Company(string fileParameters)
        {
            this->id = companyIdCounter;
            companyIdCounter++;

            ParseFileParameters(fileParameters);
        }

        int id;
        string name;
        string type;
        int profit;

        vector<City*> offices;
        vector<Company*> trades;

        string RDFIdentifier;

        void ConstructRDFIdentifier(string prefixLong)
        {
            this->RDFIdentifier = prefixLong + "companyId_" + to_string(this->id);
        }

        void ExportIntoRDFFile(ofstream& file, string prefixShort, string prefixLong)
        {
            file << "<rdf:Description rdf:about=\"" << this->RDFIdentifier << "\">" << "\n";

            file << "\t<" << prefixShort << ":name>" << this->name << "</" << prefixShort << ":name>" << "\n";
            file << "\t<" << prefixShort << ":type>" << this->type << "</" << prefixShort << ":type>" << "\n";
            file << "\t<" << prefixShort << ":profitInMld rdf:datatype=\"http://www.w3.org/2001/XMLSchema#integer\">" << this->profit << "</" << prefixShort << ":profitInMld>" << "\n";
            generatedTriplesCounter += 3;

            for (int i = 0; i < offices.size(); i++)
            {
                file << "\t<" << prefixShort << ":hasOfficesIn rdf:resource=\"" << offices.at(i)->RDFIdentifier << "\"></ex:hasOfficesIn>" << "\n";
                generatedTriplesCounter++;
            }

            for (int i = 0; i < trades.size(); i++)
            {
                file << "\t<" << prefixShort << ":tradesWith rdf:resource=\"" << trades.at(i)->RDFIdentifier << "\"></ex:tradesWith>" << "\n";
                generatedTriplesCounter++;
            }

            file << "</rdf:Description>\n" << "\n";
        }

    private:
        void ParseFileParameters(string fileParameters)
        {
            vector<string> parts;
            string actPart = "";

            for (int i = 0; i < fileParameters.size(); i++)
            {
                if (fileParameters.at(i) == '\t')
                {
                    parts.push_back(actPart);
                    actPart = "";
                }
                else
                {
                    actPart += fileParameters.at(i);
                }
            }
            parts.push_back(actPart);

            this->name = parts.at(0);
            this->type = parts.at(1);
            this->profit = stoi(parts.at(2));
        }
};

//konicek
class Hobby
{
    public:
        Hobby(string fileParameters)
        {
            this->id = hobbyIdCounter;
            hobbyIdCounter++;

            this->name = fileParameters;
        }

        int id;
        string name;

        string RDFIdentifier;

        void ConstructRDFIdentifier(string prefixLong)
        {
            this->RDFIdentifier = prefixLong + "hobbyId_" + to_string(this->id);
        }

        void ExportIntoRDFFile(ofstream& file, string prefixShort, string prefixLong)
        {
            file << "<rdf:Description rdf:about=\"" << this->RDFIdentifier << "\">" << "\n";

            file << "\t<" << prefixShort << ":name>" << this->name << "</" << prefixShort << ":name>" << "\n";
            generatedTriplesCounter ++;

            file << "</rdf:Description>\n" << "\n";
        }
};

//prvne potrebujeme videt definici hobby (cyklicke zavislosti)
void City::ExportIntoRDFFile(ofstream& file, string prefixShort, string prefixLong)
{
    file << "<rdf:Description rdf:about=\"" << this->RDFIdentifier << "\">" << "\n";

    file << "\t<" << prefixShort << ":name>" << this->name << "</" << prefixShort << ":name>" << "\n";
    file << "\t<" << prefixShort << ":population rdf:datatype=\"http://www.w3.org/2001/XMLSchema#integer\">" << this->population << "</" << prefixShort << ":population>" << "\n";
    file << "\t<" << prefixShort << ":areaInKmSquared rdf:datatype=\"http://www.w3.org/2001/XMLSchema#decimal\">" << this->area << "</" << prefixShort << ":areaInKmSquared>" << "\n";
    generatedTriplesCounter += 3;

    for (int i = 0; i < supports.size(); i++)
    {
        file << "\t<" << prefixShort << ":supports rdf:resource=\"" << supports.at(i)->RDFIdentifier << "\"></ex:supports>" << "\n";
        generatedTriplesCounter++;
    }

    for (int i = 0; i < cooperates.size(); i++)
    {
        file << "\t<" << prefixShort << ":cooperatesWith rdf:resource=\"" << cooperates.at(i)->RDFIdentifier << "\"></ex:cooperatesWith>" << "\n";
        generatedTriplesCounter++;
    }

    for (int i = 0; i < connectedViaRailroad.size(); i++)
    {
        file << "\t<" << prefixShort << ":connectedViaRailroad rdf:resource=\"" << connectedViaRailroad.at(i)->RDFIdentifier << "\"></ex:connectedViaRailroad>" << "\n";
        generatedTriplesCounter++;
    }


    file << "</rdf:Description>\n" << "\n";
}

//osoba
class Person 
{
    public:
        Person(Cluster* myCluster) 
        {
            this->myCluster = myCluster;

            GenerateRandomInfo();
        }

        Cluster* myCluster;

        int id;
        string name;
        int age;
        int weigth;
        int height;

        vector<Person*> knows;
        vector<Company*> works;
        vector<Hobby*> does;
        vector<City*> lives;

        string RDFIdentifier;

        void ConstructRDFIdentifier(string prefixLong)
        {
            this->RDFIdentifier = prefixLong + "personId_" + to_string(this->id);
        }

        void ExportIntoRDFFile(ofstream &file, string prefixShort, string prefixLong)
        {
            file << "<rdf:Description rdf:about=\"" << this->RDFIdentifier << "\">" << "\n";

            file << "\t<" << prefixShort << ":name>" << this->name << "</" << prefixShort << ":name>" << "\n";
            file << "\t<" << prefixShort << ":age rdf:datatype=\"http://www.w3.org/2001/XMLSchema#integer\">" << this->age << "</" << prefixShort << ":age>" << "\n";
            file << "\t<" << prefixShort << ":weigthInKg rdf:datatype=\"http://www.w3.org/2001/XMLSchema#integer\">" << this->weigth << "</" << prefixShort << ":weigthInKg>" << "\n";
            file << "\t<" << prefixShort << ":heightInCm rdf:datatype=\"http://www.w3.org/2001/XMLSchema#integer\">" << this->height << "</" << prefixShort << ":heightInCm>" << "\n";
            generatedTriplesCounter += 4;

            for (int i = 0; i < knows.size(); i++)
            {
                file << "\t<" << prefixShort << ":knows rdf:resource=\"" << knows.at(i)->RDFIdentifier << "\"></ex:knows>" << "\n";
                generatedTriplesCounter++;
            }

            for (int i = 0; i < lives.size(); i++)
            {
                file << "\t<" << prefixShort << ":livesIn rdf:resource=\"" << lives.at(i)->RDFIdentifier << "\"></ex:livesIn>" << "\n";
                generatedTriplesCounter++;
            }

            for (int i = 0; i < works.size(); i++)
            {
                file << "\t<" << prefixShort << ":worksAt rdf:resource=\"" << works.at(i)->RDFIdentifier << "\"></ex:worksAt>" << "\n";
                generatedTriplesCounter++;
            }

            for (int i = 0; i < does.size(); i++)
            {
                file << "\t<" << prefixShort << ":does rdf:resource=\"" << does.at(i)->RDFIdentifier << "\"></ex:does>" << "\n";
                generatedTriplesCounter++;
            }

            file << "</rdf:Description>\n" << "\n";
        }

    private:
        void GenerateRandomInfo()
        {
            this->id = personIdCounter;
            personIdCounter++;

            this->name = GenerateRandomName();
            this->age = GenerateRandomNumber(18, 60);
            this->weigth = GenerateRandomNumber(60, 100);
            this->height = GenerateRandomNumber(160, 200);
        }
};

//jeden uzel, ktery bude tvorit strom clusteru
struct Cluster
{
    //je list
    bool isLeaf;

    //osoby, ktere obsahuje, pokud je list
    vector<Person*> people;

    //ukazatele na vsechny deti a rodice
    Cluster* parentCluster;
    vector<Cluster*> children;
};

//strom clusteru osob - hlavni struktura databaze
class ClusterTree
{
    public:
        //obsahuje vsechny osoby
        Cluster* rootCluster;

        //lidi ve stromu
        vector<Person*> people;

        ClusterTree()
        {
            //inicializace korene
            this->rootCluster = new Cluster;
            this->rootCluster->isLeaf = false;
            this->rootCluster->parentCluster = NULL;

            //vystaveni a vyplneni stromu
            ConstructTree(this->rootCluster, 1);

            //propojeni osob podle stromove struktury
            CreateConnections();
        }

        //dealokace stromu
        void DeallocClusterTree(Cluster* thisCluster)
        {
            if (thisCluster->isLeaf == false)
            {
                for (int i = 0; i < thisCluster->children.size(); i++)
                {
                    DeallocClusterTree(thisCluster->children.at(i));
                }
            }

            delete thisCluster;
        }

        //vrati seznam vsech osob, ktere spadaji do tohoto clusteru
        vector<Person*> GetAllPeopleFromSpecificCluster(Cluster* cluster)
        {
            //je to list
            if (cluster->isLeaf == true)
            {
                //proste vratime seznam
                return cluster->people;
            }
            //neni to list
            else
            {
                //seznam osob ve vsech subclusterech
                vector<Person*> peopleInSubclusters;
                //osoby v aktualne zpracovavanem subclusteru
                vector<Person*> peopleInCurrentSubcluster;

                //projdeme vsechny subclustery a spojime jejich seznamy
                for (int i = 0; i < cluster->children.size(); i++)
                {
                    peopleInCurrentSubcluster = GetAllPeopleFromSpecificCluster(cluster->children.at(i));
                    peopleInSubclusters.insert(peopleInSubclusters.end(), peopleInCurrentSubcluster.begin(), peopleInCurrentSubcluster.end());
                }

                return peopleInSubclusters;
            }
        }

        //vrati seznam osob, ktere ale nejsou ve stejnem clusteru jako dana osoba v dane urovni
        //napriklad pro uroven nula, vratime seznam clusteru osoby bez dane osoby
        //pro uroven dva se presuneme o dve urovne nahoru ve strome, pote vratime vsechny uzivatele,
        //ktere jsou ve vsech ostatnich clusterech, krome te kterou jsme se dostali do aktualni
        vector<Person*> GetAllPeopleFromOtherClustersForSpecificPersonAndLevel(int levelsToBacktrack, Person* person)
        {
            Cluster* minLevelClusterPredecessor = NULL;
            Cluster* minLevelCluster = person->myCluster;

            //projdeme stromem smerem ke koreni
            for (int i = 0; i < levelsToBacktrack; i++)
            {
                minLevelClusterPredecessor = minLevelCluster;
                minLevelCluster = minLevelCluster->parentCluster;
            }

            //jsme v listu - vracime primo seznam
            if (minLevelClusterPredecessor == NULL)
            {
                vector<Person*> allPeopleInCluster = minLevelCluster->people;
                vector<Person*> otherPeopleInCluster;
                Person* actPerson;

                for (int i = 0; i < allPeopleInCluster.size(); i++)
                {
                    actPerson = allPeopleInCluster.at(i);

                    if (person != actPerson)
                    {
                        otherPeopleInCluster.push_back(actPerson);
                    }
                }

                return otherPeopleInCluster;
            }
            //nejsme v listu, vracime lidi v ostatnich clusterech
            else
            {
                vector<Person*> peopleInSubclusters;
                vector<Person*> peopleInCurrentSubcluster;

                vector<Cluster*> children = minLevelCluster->children;
                Cluster* child;

                for (int i = 0; i < children.size(); i++)
                {
                    child = children.at(i);

                    if (minLevelClusterPredecessor != child)
                    {
                        peopleInCurrentSubcluster = GetAllPeopleFromSpecificCluster(child);
                        peopleInSubclusters.insert(peopleInSubclusters.end(), peopleInCurrentSubcluster.begin(), peopleInCurrentSubcluster.end());
                    }
                }

                return peopleInSubclusters;
            }
        }
        
    private:
        //rekurzivni vystaveni stromu clusteru a vyplneni listu osobami
        void ConstructTree(Cluster* thisCluster, int actDepth)
        {
            //vytvarime list
            if (actDepth == clusterTreeDepth)
            {
                //ted vime, ze jsme na konci, tak zmenime status tohoto clusteru na listovy
                thisCluster->isLeaf = true;

                //pocet lidi v clusteru
                int numberOfPeople = GenerateRandomNumber(minNumberOfPeopleInCluster, maxNumberOfPeopleInCluster);
                
                //vytvorime pozadovany pocet osob
                for (int j = 0; j < numberOfPeople; j++)
                {
                    Person* actPerson = new Person(thisCluster);

                    this->people.push_back(actPerson);

                    thisCluster->people.push_back(actPerson);
                }
            }
            //nevytvarime list
            else
            {
                Cluster* actCluster;
                //pocet clusteru v clusteru
                int numberOfClusters = GenerateRandomNumber(minNumberOfPeopleInCluster, maxNumberOfPeopleInCluster);

                //vytvorime pozadovany pocet clusteru
                for (int i = 0; i < numberOfClusters; i++)
                {
                    actCluster = new Cluster;
                    
                    actCluster->isLeaf = false;
                    actCluster->parentCluster = thisCluster;

                    thisCluster->children.push_back(actCluster);

                    ConstructTree(actCluster, actDepth + 1);
                }
            }
        }

        //vytvoreni propojeni mezi osobami dle parametru
        void CreateConnections()
        {
            for (int i = 0; i < this->people.size(); i++)
            {
                CreateConnectionsForPerson(this->people.at(i));
            }
        }

        //propojeni jedne osoby
        void CreateConnectionsForPerson(Person* person)
        {     
            //ziskame cluster, do ktereho patri osoba
            Cluster* personCluster = person->myCluster;
            //vygenerujeme distribuci, ktera urcuje, jak moc bude uzivatel propojen s ruznymi urovnemi clusteru
            vector<int> connectionsDistribution = CreateRandomConnectionsDistribution(clusterTreeDepth);
            //vsechny osoby, se kterymi je mozno se spojit pres danou hloubku
            vector<Person*> peopleAvailableForConnection;

            //cout << "   A: " << connectionsDistribution.at(0) << ", " << connectionsDistribution.at(1) << ", " << connectionsDistribution.at(2) << ", " << "\n";

            //zacneme vytvaret propojeni, ktere budou mit clusterTreeDepth urovni
            for (int i = 0; i < clusterTreeDepth; i++)
            {
                //ziskame vsechny osoby v clusteru dane urovne, ve kterem je aktualni osoba, tento seznam ale nebsahuje nasi osobu nebo cluster(zalezi na urovni)
                vector<Person*> peopleAvailableForConnection = GetAllPeopleFromOtherClustersForSpecificPersonAndLevel(i, person);

                //ted musime vyresit problem, co delat kdyz pocet pozadovanych propojeni pro cluster je vetsi nez pocet validnich osob v clusteru
                //to udelame tak, ze preneseme ten pocet do dalsi urovne
                if (connectionsDistribution.at(i) > peopleAvailableForConnection.size())
                {
                    //pokud se jedna o posledni uroven, tak zbytek zahodime
                    if (i == clusterTreeDepth - 1)
                    {
                        connectionsDistribution.at(i) = peopleAvailableForConnection.size();
                    }
                    else
                    {
                        connectionsDistribution.at((size_t)i + 1) += connectionsDistribution.at(i) - peopleAvailableForConnection.size();
                        connectionsDistribution.at(i) = peopleAvailableForConnection.size();
                    }
                }

                //cout << "      B: " << connectionsDistribution.at(0) << ", " << connectionsDistribution.at(1) << ", " << connectionsDistribution.at(2) << ", " << "\n";

                //vytvorime vektor o delce, ktera je rovna maximalnimu moznemu poctu propojeni pro aktualni uroven
                //bude reprezentovat indexy do pole moznych osob na propojeni
                //potom z nej budeme odebirat nahodne indexy a tim propojime osoby nahodne
                vector<int> availableIndexes;
                //nainicializujeme ho hodnotami rovnymi indexum
                for (int j = 0; j < peopleAvailableForConnection.size(); j++)
                {
                    availableIndexes.push_back(j);
                }

                //nahodny index
                int randomIndex;

                //tolikrat, kolikrat to je naplanovano v distribuci provedeme propojeni
                for (int k = 0; k < connectionsDistribution.at(i); k++)
                {
                    //vygenerujeme nahodny index, ktery stale zbyva v poli indexu
                    randomIndex = GenerateRandomNumber(0, availableIndexes.size() - 1);
                    //cout << randomIndex << "\n"; 
                    //cout << availableIndexes.size() << "\n";
                    //propojime aktualni osobu s osobou, ktera se nachazi na indexu
                    ConnectTwoPeople(person, peopleAvailableForConnection.at(availableIndexes.at(randomIndex)));

                    availableIndexes.erase(availableIndexes.begin() + randomIndex);
                }

                personCluster = personCluster->parentCluster;
            }
        }

        //vytvoreni propojeni mezi dvema osobami
        void ConnectTwoPeople(Person* startPerson, Person* endPerson)
        {
            //cout << startPerson->id << " knows " << endPerson->id << "\n";
            startPerson->knows.push_back(endPerson);
        }
};

//----------------------------------------------

//vytvoreni pozadovaneho poctu mest
vector<City*> GenerateCities()
{
    vector<City*> generatedCities;

    vector<int> availableIndexes;
    for (int i = 0; i < cities.size(); i++)
    {
        availableIndexes.push_back(i);
    }
    
    int randomIndex;
    
    for (int i = 0; i < numberOfCities; i++)
    {   
        randomIndex = GenerateRandomNumber(0, availableIndexes.size() - 1);

        generatedCities.push_back(new City(cities.at(availableIndexes.at(randomIndex))));
        
        availableIndexes.erase(availableIndexes.begin() + randomIndex);
    }

    return generatedCities;
}

//vytvoreni pozadovaneho poctu firem
vector<Company*> GenerateCompanies()
{
    vector<Company*> generatedCompanies;

    vector<int> availableIndexes;
    for (int i = 0; i < companies.size(); i++)
    {
        availableIndexes.push_back(i);
    }

    int randomIndex;

    for (int i = 0; i < numberOfCompanies; i++)
    {
        randomIndex = GenerateRandomNumber(0, availableIndexes.size() - 1);

        generatedCompanies.push_back(new Company(companies.at(availableIndexes.at(randomIndex))));

        availableIndexes.erase(availableIndexes.begin() + randomIndex);
    }

    return generatedCompanies;
}

//vytvoreni pozadovaneho poctu konicku
vector<Hobby*> GenerateHobbies()
{
    vector<Hobby*> generatedHobbies;

    vector<int> availableIndexes;
    for (int i = 0; i < hobbies.size(); i++)
    {
        availableIndexes.push_back(i);
    }
    
    int randomIndex;
    
    for (int i = 0; i < numberOfHobbies; i++)
    {
        randomIndex = GenerateRandomNumber(0, availableIndexes.size() - 1);

        generatedHobbies.push_back(new Hobby(hobbies.at(availableIndexes.at(randomIndex))));

        availableIndexes.erase(availableIndexes.begin() + randomIndex);
    }

    return generatedHobbies;
}

//----------------------------------------------

//generace spojeni mezi entitami ruzneho typu
void GeneratePersonWorksConnections(vector<Person*>& currentPeople, vector<Company*>& currentCompanies)
{
    int numberOfPeople = currentPeople.size();
    int numberOfCompanies = currentCompanies.size();

    int numberOfConnections;
    int randomIndex;

    //spojeni udelame pro vsechny entity
    for (int i = 0; i < numberOfPeople; i++)
    {
        //pocet kolik spojeni bude entita mit(pracuje v jedne firme)
        numberOfConnections = 1;
        
        //cout << "Connections:" << numberOfConnections << "\n";

        //proces vybirani nahodneho indexu ze zbylych entit - entita nemuze mit stejne spojeni vicekrat
        vector<int> availableIndexes;
        for (int j = 0; j < numberOfCompanies; j++)
        {
            availableIndexes.push_back(j);
        }

        //vytvoreni konkretnich napojeni
        for (int j = 0; j < numberOfConnections; j++)
        {
            randomIndex = GenerateRandomNumber(0, availableIndexes.size() - 1);

            currentPeople.at(i)->works.push_back(currentCompanies.at(availableIndexes.at(randomIndex)));

            //cout << currentPeople.at(i)->name << " works " << currentCompanies.at(availableIndexes.at(randomIndex))->name << "\n";

            availableIndexes.erase(availableIndexes.begin() + randomIndex);
        }
    }
}

//generace spojeni mezi entitami ruzneho typu
void GeneratePersonLivesConnections(vector<Person*>& currentPeople, vector<City*>& currentCities)
{
    int numberOfPeople = currentPeople.size();
    int numberOfCities = currentCities.size();

    int numberOfConnections;
    int randomIndex;

    //spojeni udelame pro vsechny entity
    for (int i = 0; i < numberOfPeople; i++)
    {
        //pocet kolik spojeni bude entita mit (osoba bydli v jednom meste)
        numberOfConnections = 1;

        //cout << "Connections:" << numberOfConnections << "\n";

        //proces vybirani nahodneho indexu ze zbylych entit - entita nemuze mit stejne spojeni vicekrat
        vector<int> availableIndexes;
        for (int j = 0; j < numberOfCities; j++)
        {
            availableIndexes.push_back(j);
        }

        //vytvoreni konkretnich napojeni
        for (int j = 0; j < numberOfConnections; j++)
        {
            randomIndex = GenerateRandomNumber(0, availableIndexes.size() - 1);

            currentPeople.at(i)->lives.push_back(currentCities.at(availableIndexes.at(randomIndex)));

            //cout << currentPeople.at(i)->name << " lives " << currentCities.at(availableIndexes.at(randomIndex))->name << "\n";

            availableIndexes.erase(availableIndexes.begin() + randomIndex);
        }
    }
}

//generace spojeni mezi entitami ruzneho typu
void GeneratePersonDoesConnections(vector<Person*>& currentPeople, vector<Hobby*>& currentHobbies)
{
    int numberOfPeople = currentPeople.size();
    int numberOfHobbies = currentHobbies.size();

    int numberOfConnections;
    int randomIndex;

    //spojeni udelame pro vsechny entity
    for (int i = 0; i < numberOfPeople; i++)
    {
        //pocet kolik spojeni bude entita mit
        numberOfConnections = GenerateRandomNumber(personDoesMin <= numberOfHobbies ? personDoesMin : numberOfHobbies, personDoesMax <= numberOfHobbies ? personDoesMax : numberOfHobbies);

        //cout << "Connections:" << numberOfConnections << "\n";

        //proces vybirani nahodneho indexu ze zbylych entit - entita nemuze mit stejne spojeni vicekrat
        vector<int> availableIndexes;
        for (int j = 0; j < numberOfHobbies; j++)
        {
            availableIndexes.push_back(j);
        }

        //vytvoreni konkretnich napojeni
        for (int j = 0; j < numberOfConnections; j++)
        {
            randomIndex = GenerateRandomNumber(0, availableIndexes.size() - 1);

            currentPeople.at(i)->does.push_back(currentHobbies.at(availableIndexes.at(randomIndex)));

            //cout << currentPeople.at(i)->name << " does " << currentHobbies.at(availableIndexes.at(randomIndex))->name << "\n";

            availableIndexes.erase(availableIndexes.begin() + randomIndex);
        }
    }
}

//generace spojeni mezi entitami ruzneho typu
void GenerateCitySupportsConnections(vector<City*> &currentCities, vector<Hobby*> &currentHobbies)
{
    int numberOfCities = currentCities.size();
    int numberOfHobbies = currentHobbies.size();

    int numberOfConnections;
    int randomIndex;

    //spojeni udelame pro vsechny entity
    for (int i = 0; i < numberOfCities; i++)
    {
        //pocet kolik spojeni bude entita mit
        numberOfConnections = GenerateRandomNumber(citySupportsMin <= numberOfHobbies ? citySupportsMin : numberOfHobbies, citySupportsMax <= numberOfHobbies ? citySupportsMax : numberOfHobbies);

        //cout << "Connections:" << numberOfConnections << "\n";

        //proces vybirani nahodneho indexu ze zbylych entit - entita nemuze mit stejne spojeni vicekrat
        vector<int> availableIndexes;
        for (int j = 0; j < numberOfHobbies; j++)
        {
            availableIndexes.push_back(j);
        }

        //vytvoreni konkretnich napojeni
        for (int j = 0; j < numberOfConnections; j++)
        {
            randomIndex = GenerateRandomNumber(0, availableIndexes.size() - 1);

            currentCities.at(i)->supports.push_back(currentHobbies.at(availableIndexes.at(randomIndex)));

            //cout << currentCities.at(i)->name << " supports " << currentHobbies.at(availableIndexes.at(randomIndex))->name << "\n";

            availableIndexes.erase(availableIndexes.begin() + randomIndex);
        }
    }
}

//generace spojeni mezi entitami ruzneho typu
void GenerateCompanyOfficesConnections(vector<Company*>& currentCompanies, vector<City*>& currentCities)
{
    int numberOfCompanies = currentCompanies.size();
    int numberOfCities = currentCities.size();

    int numberOfConnections;
    int randomIndex;

    //spojeni udelame pro vsechny entity
    for (int i = 0; i < numberOfCompanies; i++)
    {
        //pocet kolik spojeni bude entita mit
        numberOfConnections = GenerateRandomNumber(companyOfficesMin <= numberOfCities ? companyOfficesMin : numberOfCities, companyOfficesMax <= numberOfCities ? companyOfficesMax : numberOfCities);

        //cout << "Connections:" << numberOfConnections << "\n";

        //proces vybirani nahodneho indexu ze zbylych entit - entita nemuze mit stejne spojeni vicekrat
        vector<int> availableIndexes;
        for (int j = 0; j < numberOfCities; j++)
        {
            availableIndexes.push_back(j);
        }

        //vytvoreni konkretnich napojeni
        for (int j = 0; j < numberOfConnections; j++)
        {
            randomIndex = GenerateRandomNumber(0, availableIndexes.size() - 1);

            currentCompanies.at(i)->offices.push_back(currentCities.at(availableIndexes.at(randomIndex)));

            //cout << currentCompanies.at(i)->name << " has office in " << currentCities.at(availableIndexes.at(randomIndex))->name << "\n";

            availableIndexes.erase(availableIndexes.begin() + randomIndex);
        }
    }
}

//generace spojeni mezi entitami stejneho typu
void GenerateCityCooperatesConnections(vector<City*>& currentCities)
{
    int numberOfCities = currentCities.size();

    int numberOfConnections;
    int randomIndex;

    //spojeni udelame pro vsechny entity
    for (int i = 0; i < numberOfCities; i++)
    {
        //pocet kolik spojeni bude entita mit
        numberOfConnections = GenerateRandomNumber(cityCooperatesMin <= numberOfCities-1 ? cityCooperatesMin : numberOfCities-1, cityCooperatesMax <= numberOfCities-1 ? cityCooperatesMax : numberOfCities-1);

        //cout << "Connections:" << numberOfConnections << "\n";

        //proces vybirani nahodneho indexu ze zbylych entit - entita nemuze mit stejne spojeni vicekrat
        vector<int> availableIndexes;
        for (int j = 0; j < numberOfCities; j++)
        {
            //entita nemuze byt napojena na samu sebe
            if (j != i)
            {
                availableIndexes.push_back(j);
            }
        }

        //vytvoreni konkretnich napojeni
        for (int j = 0; j < numberOfConnections; j++)
        {
            randomIndex = GenerateRandomNumber(0, availableIndexes.size() - 1);

            currentCities.at(i)->cooperates.push_back(currentCities.at(availableIndexes.at(randomIndex)));

            //cout << currentCities.at(i)->name << " cooperates with " << currentCities.at(availableIndexes.at(randomIndex))->name << "\n";

            availableIndexes.erase(availableIndexes.begin() + randomIndex);
        }
    }
}

//generace spojeni mezi entitami stejneho typu
void GenerateCityConnectedViaRailroadConnections(vector<City*>& currentCities)
{
    int numberOfCities = currentCities.size();

    int numberOfConnections;
    int randomIndex;

    //spojeni udelame pro vsechny entity
    for (int i = 0; i < numberOfCities; i++)
    {
        //pocet kolik spojeni bude entita mit
        numberOfConnections = GenerateRandomNumber(cityConnectedViaRailroadMin <= numberOfCities - 1 ? cityConnectedViaRailroadMin : numberOfCities - 1, cityConnectedViaRailroadMax <= numberOfCities - 1 ? cityConnectedViaRailroadMax : numberOfCities - 1);

        //cout << "Connections:" << numberOfConnections << "\n";

        //proces vybirani nahodneho indexu ze zbylych entit - entita nemuze mit stejne spojeni vicekrat
        vector<int> availableIndexes;
        for (int j = 0; j < numberOfCities; j++)
        {
            //entita nemuze byt napojena na samu sebe
            if (j != i)
            {
                availableIndexes.push_back(j);
            }
        }

        //vytvoreni konkretnich napojeni
        for (int j = 0; j < numberOfConnections; j++)
        {
            randomIndex = GenerateRandomNumber(0, availableIndexes.size() - 1);

            currentCities.at(i)->connectedViaRailroad.push_back(currentCities.at(availableIndexes.at(randomIndex)));

            availableIndexes.erase(availableIndexes.begin() + randomIndex);
        }
    }
}

//generace spojeni mezi entitami stejneho typu
void GenerateCompanyTradesConnections(vector<Company*>& currentCompanies)
{
    int numberOfCompanies = currentCompanies.size();

    int numberOfConnections;
    int randomIndex;

    //spojeni udelame pro vsechny entity
    for (int i = 0; i < numberOfCompanies; i++)
    {
        //pocet kolik spojeni bude entita mit
        numberOfConnections = GenerateRandomNumber(companyTradesMin <= numberOfCompanies - 1 ? companyTradesMin : numberOfCompanies - 1, companyTradesMax <= numberOfCompanies - 1 ? companyTradesMax : numberOfCompanies - 1);

        //cout << "Connections:" << numberOfConnections << "\n";

        //proces vybirani nahodneho indexu ze zbylych entit - entita nemuze mit stejne spojeni vicekrat
        vector<int> availableIndexes;
        for (int j = 0; j < numberOfCompanies; j++)
        {
            //entita nemuze byt napojena na samu sebe
            if (j != i)
            {
                availableIndexes.push_back(j);
            }
        }

        //vytvoreni konkretnich napojeni
        for (int j = 0; j < numberOfConnections; j++)
        {
            randomIndex = GenerateRandomNumber(0, availableIndexes.size() - 1);

            currentCompanies.at(i)->trades.push_back(currentCompanies.at(availableIndexes.at(randomIndex)));

            //cout << currentCompanies.at(i)->name << " cooperates with " << currentCompanies.at(availableIndexes.at(randomIndex))->name << "\n";

            availableIndexes.erase(availableIndexes.begin() + randomIndex);
        }
    }
}

//----------------------------------------------

void ExportGraphDatabaseIntoRDFFile(string filename, vector<Person*> currentPeople, vector<City*> currentCities, vector<Company*> currentCompanies, vector<Hobby*> currentHobbies)
{
    //vystupni soubor
    ofstream file;
    file.open(filename);

    //definice prefixu
    string prefixShort = "ex";
    string prefixLong = "http://example.org/";

    //vytvoreni rdf itentifikatoru pro vsechny entity
    for (int i = 0; i < currentPeople.size(); i++)
    {
        currentPeople.at(i)->ConstructRDFIdentifier(prefixLong);
    }

    for (int i = 0; i < currentCities.size(); i++)
    {
        currentCities.at(i)->ConstructRDFIdentifier(prefixLong);
    }

    for (int i = 0; i < currentCompanies.size(); i++)
    {
        currentCompanies.at(i)->ConstructRDFIdentifier(prefixLong);
    }

    for (int i = 0; i < currentHobbies.size(); i++)
    {
        currentHobbies.at(i)->ConstructRDFIdentifier(prefixLong);
    }

    //hlavicka rdf souboru s prefixy
    file << "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" << "\n";
    file << "<rdf:RDF" << "\n";
    file << "\txmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"" << "\n";
    file << "\txmlns:" << prefixShort << "=\"" << prefixLong << "\"" << "\n";
    file << ">\n" << "\n";

    //vypis jednotlivych trojic
    for (int i = 0; i < currentPeople.size(); i++)
    {
        currentPeople.at(i)->ExportIntoRDFFile(file, prefixShort, prefixLong);
    }

    for (int i = 0; i < currentCities.size(); i++)
    {
        currentCities.at(i)->ExportIntoRDFFile(file, prefixShort, prefixLong);
    }

    for (int i = 0; i < currentCompanies.size(); i++)
    {
        currentCompanies.at(i)->ExportIntoRDFFile(file, prefixShort, prefixLong);
    }

    for (int i = 0; i < currentHobbies.size(); i++)
    {
        currentHobbies.at(i)->ExportIntoRDFFile(file, prefixShort, prefixLong);
    }

    file << "</rdf:RDF>" << "\n";

    file.close();
}

//dealokace vsech entit
void DeallocAllEntities(vector<Person*> currentPeople, vector<City*> currentCities, vector<Company*> currentCompanies, vector<Hobby*> currentHobbies)
{
    for (int i = 0; i < currentPeople.size(); i++)
    {
        delete currentPeople.at(i);
    }

    for (int i = 0; i < currentCities.size(); i++)
    {
        delete currentCities.at(i);
    }

    for (int i = 0; i < currentCompanies.size(); i++)
    {
        delete currentCompanies.at(i);
    }

    for (int i = 0; i < currentHobbies.size(); i++)
    {
        delete currentHobbies.at(i);
    }
}

//zajistit souvislost?
int main()
{
    srand((unsigned int)time(NULL));

    //nacteme soubory
    LoadFilesIntoVectors();

    //vytvorime a propojime osoby
    ClusterTree* clusterTree = new ClusterTree();

    cout << "Tree has " << clusterTree->people.size() << " people!\n";
    
    //ziskame seznamy vsech vygenerovanych entit
    vector<Person*> currentPeople = clusterTree->people;
    vector<City*> currentCities = GenerateCities();
    vector<Company*> currentCompanies = GenerateCompanies();
    vector<Hobby*> currentHobbies = GenerateHobbies();

    //propojime entity
    GenerateCitySupportsConnections(currentCities, currentHobbies);
    GenerateCompanyOfficesConnections(currentCompanies, currentCities);
    GenerateCityCooperatesConnections(currentCities);
    GenerateCityConnectedViaRailroadConnections(currentCities);
    GenerateCompanyTradesConnections(currentCompanies);
    GeneratePersonLivesConnections(currentPeople, currentCities);
    GeneratePersonDoesConnections(currentPeople, currentHobbies);
    GeneratePersonWorksConnections(currentPeople, currentCompanies);

    //export do rdf souboru

    string outputFileName = "D:/Diplomka/Datasety/Generovane/GeneratedRDF_Cities0.rdf";
    ExportGraphDatabaseIntoRDFFile(outputFileName, currentPeople, currentCities, currentCompanies, currentHobbies);

    cout << "Vygenerovano " << generatedTriplesCounter << " trojic!\n";

    //dealokace pameti
    
    clusterTree->DeallocClusterTree(clusterTree->rootCluster);
    delete clusterTree;
    DeallocAllEntities(currentPeople, currentCities, currentCompanies, currentHobbies);
}