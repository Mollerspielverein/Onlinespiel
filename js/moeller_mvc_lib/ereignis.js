/**********************************

	Moeller Lib 2
		
	Event-Teil

**********************************/



function nachrichtenobject()
{
	var Ereignisse = new Array();
	Ereignisse[0]={0:0,1:"Beschreibung",2:"Nachricht",3:"Titel"};
	Ereignisse[1]={0:1,1:"Der Index wurde mit einer unvergebenen Nummer aufgerufen.",2:"Der Fehler, der angezeigt werden sollte, wurde noch nicht dokumentiert.<br><br> Fehlernummer:",3:"Error in der Dokumentation"};
	
	//0 Sonderereignisse
	
	//1000 Spielmodell (Model)
	Ereignisse[1001]={0:1001,1:"Die Funktion zobj.set_spieler_zieht_nach wurde aufgerufen, obwohl sie nicht mehr aufgerufen werden darf.",2:"Es sollte gleichzeitig dokumentiert werden, dass ein Spieler die verdeckte Karte aufdeckt und nachzieht. Beides schließt sich jedoch aus.",3:"Fehler in dem Spiel"};
	Ereignisse[1002]={0:1002,1:"Die Funktion zobj.set_spieler_dreht_um wurde aufgerufen, obwohl sie nicht mehr aufgerufen werden darf.",2:"Es sollte gleichzeitig dokumentiert werden, dass ein Spieler die verdeckte Karte aufdeckt und nachzieht. Beides schließt sich jedoch aus.",3:"Fehler in dem Spiel"};
	Ereignisse[2003]={0:2003,1:"Eine Spieler, der nicht tauschen darf, hat versucht die Stiche auf einem Bankstapel zu tauschen.",2:"Der Bankstapel kann nicht getauscht werden.",3:"Fehler in dem Spiel",4:3002};
	Ereignisse[1004]={0:1004,1:"Die Funktion zobj.set_bank_zieht_nach wurde aufgerufen, obwohl sie nicht mehr aufgerufen werden darf.",2:"Es sollte gleichzeitig dokumentiert werden, dass die Bank den verdeckten Stapel aufdeckt und nachzieht. Beides schließt sich jedoch aus.",3:"Fehler in dem Spiel"};
	Ereignisse[1005]={0:1005,1:"Die Funktion zobj.set_bank_dreht_um wurde aufgerufen, obwohl sie nicht mehr aufgerufen werden darf.",2:"Es sollte gleichzeitig dokumentiert werden, dass ein Bank den verdeckten Stapel aufdeckt und nachzieht. Beides schließt sich jedoch aus.",3:"Fehler in dem Spiel"};
	
	Ereignisse[1006]={0:1006,1:"Ein Spieler der nicht an der Reihe ist, versucht zu ziehen.",2:"Es wurde versucht unerlaubt zu ziehen.",3:"Fehler in dem Spiel"};
	Ereignisse[1007]={0:1007,1:"Spieler hat von einem leerem Stapel zu ziehen versucht.",2:"Ein Spieler kann nicht von einem leeren Stapel ziehen. Es wurde gerade versucht.",3:"Fehler in dem Spiel"};
	Ereignisse[1008]={0:1008,1:"Ein Spieler hat falsch bedient.",2:"Es wurde gerade falsch bedient.",3:"Fehler in dem Spiel"};
	
	
	Ereignisse[1201]={0:1201,1:"Es wurden verschiedene Farben gelegt, obwohl Spieler und Bank Karten mit der gleichen Farbe haben. Nur diese dürfen bei dem aktuellen Spielmodus gewählt werden.",2:"Es wurde falsch bedient.",3:"Unerlaubter Spielzug."};

	
	//2000 Anzeige (View)
	Ereignisse[2001]={0:2001,1:"Ein Spieler sollte die Karte umdrehen, obwohl es keinen aktuellen Spieler gibt!",2:"Karte kann nicht umgedreht werden.",3:"Fehler in der Anzeige"};
	Ereignisse[2002]={0:2002,1:"Es sollte ein Stapel an eine Movekarte angehangen werden, aber diese war schon mit einem Stapel oder einer Karte belegt.",2:"Stapel kann nicht verschoben werden.",3:"Fehler in der Anzeige"};
	Ereignisse[2003]={0:2003,1:"Ein Bankstapel (immer dessen oberste Karte) wurde demarkiert. Aber es konnte eben nicht das letzte Kindelement gefunden werden, das hierfür demarkiert werden soll.",2:"Stapel konnte nicht demarkiert werden.",3:"Fehler in der Anzeige"};
	
	//3000 Steuerung (Control)
	Ereignisse[3001]={0:3001,1:"Eine Bankstapelnummer wurde beim Tauschen der Stiche angegeben.",2:"Der Bankstapel kann nicht getauscht werden.",3:"Fehler in der Steuerung"};
	Ereignisse[3002]={0:3002,1:"Eine Spieler, der nicht tauschen darf, hat versucht die Stiche auf einem Bankstapel zu tauschen.",2:"Der Bankstapel kann nicht getauscht werden.",3:"Fehler in der Steuerung"};
	Ereignisse[3003]={0:3003,1:"Eine Spieler, der nicht an der Reihe ist, hat versucht die Stiche auf einem Bankstapel zu tauschen.",2:"Der Bankstapel kann nicht getauscht werden.",3:"Fehler in der Steuerung"};
	Ereignisse[3004]={0:3004,1:"Es wurde keine korrekte Art, den Zug zu aktivieren, übergeben.",2:"Die Karte kann nicht auf den Bankstapel gezogen werden.",3:"Fehler in der Steuerung"};
	Ereignisse[3005]={0:3005,1:"Es wurde keine Spielernummer übergeben.",2:"Die Karte kann nicht auf den Bankstapel gezogen werden.",3:"Fehler in der Steuerung"};
	Ereignisse[3006]={0:3006,1:"Es wurde keine Nummer als Spielerstapelnummer übergeben",2:"Die Karte kann nicht auf den Bankstapel gezogen werden.",3:"Fehler in der Steuerung"};
	Ereignisse[3007]={0:3007,1:"Es wurde keine Nummer von 0 bis 2 für einen Spielerstapel übergeben.",2:"Die Karte kann nicht auf den Bankstapel gezogen werden.",3:"Fehler in der Steuerung"};
	Ereignisse[3008]={0:3008,1:"Es wurde keine Nummer Bankstapelnummer übergeben",2:"Die Karte kann nicht auf den Bankstapel gezogen werden.",3:"Fehler in der Steuerung"};
	Ereignisse[3009]={0:3009,1:"Es wurde keine Nummer von 0 bis 2 für einen Bankstapel übergeben.",2:"Die Karte kann nicht auf den Bankstapel gezogen werden.",3:"Fehler in der Steuerung"};
	Ereignisse[3010]={0:3010,1:"Es zwar zunächst ein Fehler ausgelöst. Doch die nachträgliche Analyse hat nichts erbracht.s",2:"Die Karte kann nicht auf den Bankstapel gezogen werden.",3:"Fehler in der Steuerung"};
	
	
	//4000 Verbindung zum Server
	
	//5000 Spielserver, Ausführung, Ablauf
	
	//6000 Spielerprofil
	
	//7000 Spielprofil
	
	
	
	this.text = function(iN){ // iN = iEreignisnummer
		if(typeof(Ereignisse[iN])=="undefined")return Ereignisse[1]["2"]+" "+iN+"."
		return Ereignisse[iN]["2"];
	}
	
	this.titel = function(iN){
		if(typeof(Ereignisse[iN])=="undefined")return Ereignisse[1]["3"];
		return Ereignisse[iN]["3"];
	}


}


Nachrichten = new nachrichtenobject();