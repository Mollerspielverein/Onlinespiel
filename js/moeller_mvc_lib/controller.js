/*********************************************************************************

	Controller

*********************************************************************************/

/*********************************

	Startvariablen

*********************************/

var aMitspieler;
var Spiel; // = new spielobject(init_SpielID,init_oBlatt,aMitspieler);
var Spielfeld;  //= new spielfeldobject(aMitspieler);

//var allg_selbst=this;


/*********************************
 *
 *
 * SendeFunktion
 *
 *
 */

function sendPostToGameServerHelfer(sCommand,sMessage){

	//Falls man vergisst das Objekt in einen String umzuwandeln
	if(typeof(sMessage)=="object"){
		sMessage=JSON.stringify(sMessage);
    }

    $.post("http://10.0.18.19:3000", JSON.stringify({ctrl:sCommand,msg:sMessage}),function (data) {
    	//alert(data)

        switch(sCommand){
            case "init_game":
                strg_spielbeginn_client(JSON.parse(data));
                break;
            case "make_move":
                strg_ziehen_client(JSON.parse(data));
                break;
            case "turn_stack":
                strg_bank_umdrehen_client(JSON.parse(data));
                break;
            case "get_results":
                strg_spielende_client(JSON.parse(data));
                break;
            default:
                alert("Kann die verlange Aktion ("+sCommand+") nicht ausführen!");
		}

    }).fail(function () {
        alert("Error bei der Übertragung!");
    });

}



/*********************************

	Ziehen

*********************************/

function strg_ziehen(argZugart,argSpielernummer,argSpielerstapel,argBankstapel) {

    console.log("strg_ziehen: argSpielernummer(" + typeof(argSpielernummer) + "):" + argSpielernummer + " argSpielerstapel(" + typeof(argSpielerstapel) + "):" + argSpielerstapel + " argBankstapel(" + typeof(argBankstapel) + "):" + argBankstapel);

    //das Spielfeld sperren passiert schon im View, das hier nicht, da muss ich mich noch einigen
    Spielfeld.bank_drehen_deaktivieren();

    if ((argZugart === MOE_ZUGART_VonStapelZuStapelGezogen || argZugart === MOE_ZUGART_KarteUndStapelAngeklickt) &&
        typeof(argSpielernummer) == "number" &&
        ( typeof(argSpielerstapel) == "number" && argSpielerstapel > -1 && argSpielerstapel < 3 ) &&
        ( typeof(argBankstapel) == "number" && argBankstapel > -1 && argBankstapel < 3 )/* Alle nötigen Daten übergeben wurden*/) {

        // Zug an das Spiel übergben und die Auswertung zurücknehmen
		// oiZug = Spiel.zug_machen(argSpielernummer, argSpielerstapel, argBankstapel);

        sendPostToGameServerHelfer("make_move",JSON.stringify({playerId:argSpielernummer,playerStack:argSpielerstapel,vindmillStack:argBankstapel}));

	} else {
		// Fehler an das View melden und darstellen lassen.
		var iFehler;
		
		if(argZugart!==MOE_ZUGART_VonStapelZuStapelGezogen && argZugart!==MOE_ZUGART_KarteUndStapelAngeklickt){
			iFehler = 3004;
		} else {
			if(typeof(argSpielernummer)!="number"){
				iFehler=3005;
			} else {
				if(typeof(argSpielerstapel)!="number"){	
					iFehler=3006; 
				} else {
					if(argSpielerstapel<0 || argSpielerstapel>3 ){
						iFehler=3007;
					} else {
						if(typeof(argBankstapel)!="number"){	
							iFehler=3008; 
						} else {
							if(argBankstapel<0 || argBankstapel>3 ){
								iFehler=3009;
							} else {
								iFehler=3010;
							}
						}
					}
				}
			}
		}
		
		//Fehler darstellen, durch eine Nachricht
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        Spielfeld.dialog(Nachrichten.text(iFehler),Nachrichten.titel(iFehler)+"("+iFehler+")");

		//Zug in im View rückgängig machen
		Spielfeld.spieler(argSpielernummer).karte_zurueck_zum_stapel(argSpielerstapel);
		
		//das bankdrehen erlauben, wenn der spieler das darf
		if(Spiel.spieler(argSpielernummer).darf_stapel_drehen()){
			Spielfeld.bank_drehen_aktivieren();
		}
					
		//Spielfeld für den Spieler wieder freischalten
		Spiel.spieler_schaltflaechen_freigeben();				
		
		//Funktion enden lassen
		return void(0);
	}
}

/**
 *
 * @param argZugliste integer, zobj
 * @returns {*}
 */

function strg_ziehen_client(argZugliste){

	/* Prüfung, ob der Zug ungültig war */
    //noinspection JSUnresolvedVariable
    if(argZugliste[0].errornr!=0){

        //Zug in im View rückgängig machen
        Spielfeld.zug_zurueckziehen(argZugliste[0].iSpielernummer,argZugliste[0].iSpielerstapel);

        Spielfeld.stapel_zittert(argZugliste[0].iBankstapel);

        //Fehler darstellen, durch eine Nachricht
        Spielfeld.dialog(Nachrichten.text(argZugliste[0].errornr));

        //das bankdrehen erlauben, wenn der spieler das darf
        if(argZugliste[0].bDarfStapelDrehen){
            Spielfeld.bank_drehen_aktivieren();
        }

        Spielfeld.spieler_schaltflaechen_freigeben();
        //Spielfeld für den Spieler wieder freischalten

        //Funktion enden lassen
        return void(0);
    }

	for(var i=0;i<argZugliste.length;i++){

        var oZug=argZugliste[i];

		var argZugart=Spielfeld.get_zugart();
		var argSpielernummer = oZug.iSpielernummer;
		var argSpielerstapel = oZug.iSpielerstapel;
		var argBankstapel = oZug.iBankstapel;

		/* Da der Zug ja gültig ist, werden die Folgen angezeigt!*/

		//Zug im View zu ende führen
		if(argZugart==MOE_ZUGART_VonStapelZuStapelGezogen){
			Spielfeld.karte_auflegen(argSpielernummer,argSpielerstapel,argBankstapel);
		}
		else if(argZugart==MOE_ZUGART_KarteUndStapelAngeklickt){
			Spielfeld.karte_ziehen_und_auflegen(argSpielernummer,argSpielerstapel,argBankstapel);
		}

		//wenn der spieler den stich nehmen muss
		if(oZug.bMussNehmen){
			Spielfeld.spieler_zieht_ein(argSpielernummer,argBankstapel);
		}

		//wenn nachziehen, dann nachziehen veranlassen
		if(oZug.bSpielerHatNachgezogen){
			Spielfeld.spieler_zieht_nach(argSpielernummer,argSpielerstapel,1);
			Spielfeld.spieler_zieht_nach(argSpielernummer,argSpielerstapel,oZug.aNachgezogenerKartenstapel[1]);
			//Spielfeld.spieler_zieht_nach(argSpielernummer,argSpielerstapel,oZug.get_nachgezogenen_kartenstapel().get_obere_karte().get_name());
		} else {
			if(oZug.bSpielerstapelGedreht){
				console.log("strg_ziehen: Spielfeld.spieler_dreht_um("+argSpielernummer+","+oZug.sUmgedrehteKarte+","+argSpielerstapel+")");
				Spielfeld.spieler_dreht_um(argSpielernummer,oZug.sUmgedrehteKarte,argSpielerstapel);
				//Spielfeld.spieler_dreht_um(argSpielernummer,oZug.get_umgedrehte_karte().get_name(),argSpielerstapel);
			}
		}

		//wenn bank nachgezogen hat, dann bank nachziehen
		if(oZug.bBankHatNachgezogen){
			Spielfeld.bank_zieht_nach(1,argBankstapel);
			Spielfeld.bank_zieht_nach(oZug.aNachgezogenerBankstapel[0][oZug.aNachgezogenerBankstapel[0].length-1],argBankstapel);
			//Spielfeld.bank_zieht_nach(oZug.get_nachgezogenen_bankstapel().get_offene_karte().get_name(),argBankstapel);
		} else {
			if(oZug.bBankstapelGedreht){
				//Hier mus snoch eine Änderung rein
				console.log("strg_ziehen: umgedrehter Stapel:"+oZug.aUmgedrehterStapel);
				Spielfeld.bank_dreht_um(argBankstapel,oZug.aUmgedrehterStapel);
				//Spielfeld.bank_dreht_um(argBankstapel,oZug.get_umgedrehten_stapel().get_stapel());
			}
		}

		//Bankstapelpunktes eintragen und offene Karten für Überprüfungen eingeben
		Spielfeld.set_zug_und_auswertung(oZug);

		//nächsten spieler wählen und dessen id laden
		var biNaechsterSpieler = oZug.iNaechsterSpielernummer;

		console.log("Gibt es einen nächsten Spieler?");

		if( typeof(biNaechsterSpieler)=="number" /* Wenn es überhaupt einen nächsten Spieler gibt */){
			console.log("Nächster Spieler ist "+biNaechsterSpieler);

			//nächsten spieler anzeigen
			Spielfeld.aktuellen_spieler_anzeigen(biNaechsterSpieler);

			if(oZug.sNaechsterSpielertyp=="kI" /* wenn der nächste spieler ein kI ist,*/){

				//dann die nach der Art der kI den entsprechenden Controller wählen
				//Spielfeld.ki_zieht_als_naechstes();
				//strg_ki_zug(biNaechsterSpieler);

			} else { /* Wenn es keine kI ist, */

				//das bankdrehen erlauben, wenn der spieler das darf
				if(oZug.bNaechsterSpielerDarfDrehen){
					Spielfeld.bank_drehen_aktivieren();
				}

				//die interaktionsflächen für den spieler erlauben
				Spielfeld.spieler_schaltflaechen_freigeben();

			}

		} else {
			console.log("Das Spielende wird eingeleitet.");
			// Ende Controller aktivieren
			strg_spielende();
			break;
		}
    }
}

/*********************************

	Bankstapel umdrehen

*********************************/	

function strg_bank_umdrehen(argBankstapelnummer, iSpielernummer) {
    // bank drehen von Modell machen lassen und die Karten, die nun offen liegen laden
    //oiDrehZug = Spiel.bankstapel_drehen(argBankstapelnummer);
    sendPostToGameServerHelfer("turn_stack",JSON.stringify({vindmillStack:argBankstapelnummer,playerId:iSpielernummer}));
}

function strg_bank_umdrehen_client(oiDrehZug){
	
	if(typeof(oiDrehZug)!="number"){
		// bank drehen im view darstellen mit den neuen offenliegenden Karten
		Spielfeld.bank_drehen(oiDrehZug.iBankstapel,oiDrehZug.aUmgedrehterStapel);
		
		//Wenn er drehen durfte, muss es nun wieder deaktiviert werden!!!
		//Dies sollte eigentlich automatisch auch deaktiviert werden im Modell zum Test wird es ausgegeben
		if(oiDrehZug.bDarfStapelDrehen){
			console.log("strg_bank_umdrehen: Hier läuft etwas falsch!!! Spieler darf nicht mehr drehen, weil er es gerade gemacht hat und so sieht es aber aus: Spiel.spieler(Spiel.get_aktuellen_spieler()).darf_stapel_drehen():"+Spiel.spieler(Spiel.get_aktuellen_spieler()).darf_stapel_drehen());
		} else {
			Spielfeld.bank_drehen_deaktivieren();
		}
		
		//die nun offenen Karten aktualisieren
		Spielfeld.set_zug_und_auswertung(oiDrehZug);
		
		//die interaktionsflächen für den spieler erlauben
		Spielfeld.spieler_schaltflaechen_freigeben();
		
	} else {
		/* Fehler im View ausgeben --> Entweder darf er nicht, oder es geht nicht */
		Spielfeld.dialog(Nachrichten.text(oiDrehZug),Nachrichten.titel(oiDrehZug)+"("+oiDrehZug+")");	
	}
	return void 1;
}

/*********************************
	
	kI-Zug

*********************************/

function strg_ki_zug(argSpielernummer){
	
	if(Spiel.spieler(argSpielernummer).get_spielertyp()=="kI"){
	
		//Variablen initialisieren
		var argkI = Spiel.spieler(argSpielernummer).get_spielerid();
	
		//dann aus der kI-ID die kI-Engine wählen
		if(typeof(o_kI_Engines[argkI])!="undefined" ){
		
			//kI-Engine aufrufen und den Zug zurück laden

		} else {
			console.log("strg_ki_zug: unbekannte kI("+argkI+") aufgerufen. Rufe stattdessen kI/Nora auf.");
			argkI="kI/Nora";
		}
		
		var aZug = o_kI_Engines[argkI].apply(o_kI_Engines[argkI],new Array(Spiel,argSpielernummer));
		
		iComputerstapel=aZug[0];
		iBankstapel=aZug[1];
		
		//den Zug an den Controller "Ziehen" melden!
		strg_ziehen(MOE_ZUGART_ComputerZiehtEineKarte,argSpielernummer,iComputerstapel,iBankstapel);
		
	} else throw "Fehler: kI-Zug-Funktion aufgerufen, obwohl der Spieler "+argSpielernummer+" keine kI ist.";
}

/*********************************

	Spielbeginn

*********************************/

function strg_spielbeginn(	/*SpielId*/ argSpielID, argKartenblatt, /*Mitspieler und deren IDS und Positionen*/ argMitspieler, argSpielmodus,argSpieltyp,argSpieloptionen) {


    //if(typeof(argSpieloptionen)!="object")var argSpieloptionen={showPoints:true,showTrump:false,gameSpeed:8.3,analizeTurn:true,giveAdvice:false};

    //Spiel und Spielfeld initialisieren

    //init_SpielID ist eine automatisch zufällig generierte SpielID
    //init_oBlatt ist ein automatisch generiertes Spielblatt

    aMitspieler = argMitspieler;

    initGameData = sendPostToGameServerHelfer("init_game", JSON.stringify({
        player: argMitspieler,
        modus: argSpielmodus,
        options:argSpieloptionen,
		type:argSpieltyp
    }));
}

function strg_spielbeginn_client(initGameData){

	var aKarten  = initGameData.offeneKarten;
    var iNachziehstapelKartenzahl = initGameData.kartenAufDemNachziehStapel;
	var iErsterSpieler = initGameData.ersterSpieler;
    var typDesErstenSpielers = initGameData.ersterSpielerTyp;
    var ersterSpielerDarfStapelDrehen = initGameData.ersterSpielerDarfStapelDrehen;

    var aMitspieler = initGameData.alleMitspieler;
    var spielOptionen = initGameData.spielOptionen;
    var spielModus = initGameData.spielModus;
    var spielType = initGameData.spielType;



    Spielfeld = new spielfeldobject(aMitspieler,spielOptionen,spielModus);
    Spielfeld.spieltyp_anzeige(spielType);

	//ersten spieler im Spielfeld festlegen
	Spielfeld.aktuellen_spieler_anzeigen(iErsterSpieler);
	
	//Nur Debug: Zeigt die offenen Karten im Debugfeld an.
	$("#offene_karten_nach_letztem_zug").text(aKarten.join("/"));
	
	//Gibt die Karten aus
	console.log("strg_spielbeginn: karten geben:"+aKarten.join("/"));
	Spielfeld.karten_geben(aKarten,rotate_anticlockwise(0,aMitspieler.length,iErsterSpieler),iNachziehstapelKartenzahl);
	
	//Bankstapelpunktes eintragen und offene Karten für Überprüfungen eingeben

	oStartZug = new zobj(999,0,0,0,0);
	oStartZug.set_offene_karten(aKarten);
	Spielfeld.set_zug_und_auswertung(oStartZug);

	/*erster spieler ein mensch*/
    if( typDesErstenSpielers=="Mensch" ){

		//Ggf. Tauschen der Bankstapel erlauben
		if(ersterSpielerDarfStapelDrehen)Spielfeld.bank_drehen_aktivieren();
		
		//Interaktion freigeben
		Spielfeld.spieler_schaltflaechen_freigeben();
	
	} else {
		
		//console.log("strg_spielbeginn:kI Fehlt!!!");
		//strg_ki_zug(iErsterSpieler);
		Spielfeld.ki_zieht_als_naechstes();
		
	}
		
}

/*********************************

	Spielende

*********************************/

function strg_spielende() {

    sendPostToGameServerHelfer("get_results",JSON.stringify({}));
}

function strg_spielende_client(oErgebnisse){

    if(typeof(oErgebnisse)!=="number"){

        var aPunktestand= oErgebnisse.allePunkte; //Spiel.get_spieler_punkte()
        var aAblagestapel=oErgebnisse.alleAblagestapel; // Spiel.spieler(i).ablagestapel().get_stapel();


        // Alle Eingabemöglichkeiten deaktivieren
        Spielfeld.spielfeld_sperren();

        //Anzeige des letzten Stiches deaktivieren und ausblenden
        Spielfeld.letzterstich_deaktiveren();

        //Spielstatus auf Ende setzen
        //Spiel.spiel_ist_zuende();  wird nun im Modell erledigt

        //Ergebis ausgeben
        Spielfeld.spiel_ist_zuende(aPunktestand);

        var iBestePunkte=aPunktestand[0];
        var biGewinnerNummer=0;
        var biGleichstandGewinner=false;

        //Sieger ermitteln
        for(var i=1;i<aPunktestand.length;i++)
        {
            if(aPunktestand[i]<iBestePunkte)
            {
                iBestePunkte=aPunktestand[i];
                biGewinnerNummer=i;
                biGleichstandGewinner=false;
            } else if(aPunktestand[i]==iBestePunkte){
                biGleichstandGewinner=i;
            }
        }



        //Punktestand angeben
        var sPunktestand = "";
        for(var i=0;i<aPunktestand.length;i++)
        {
            if(i===biGewinnerNummer || i===biGleichstandGewinner)sPunktestand=sPunktestand+"<p>"+aMitspieler[i][1]+"(Sieg):"+aPunktestand[i]+"</p>";
            else sPunktestand=sPunktestand+"<p>"+aMitspieler[i][1]+":"+aPunktestand[i]+"</p>";
        }


        Spielfeld.sieger_anzeigen(sPunktestand,biGewinnerNummer,biGleichstandGewinner,aPunktestand);

        //Stichkarten aufdecken für jeden spieler einzeln
        for(var i=0;i<3;i++){

            //Ablagestapelkarten laden
            //var aAblagestapel = Spiel.spieler(i).ablagestapel().get_stapel();
            console.log("strg_spielende: Spieler "+i+" Ablagestapel:"+aAblagestapel )

            //Karten verschieben
            Spielfeld.karte_vom_ablagestapel_aufdecken(i,aAblagestapel);

        }
    } else {
        alert("Das Spiel ist noch nicht zu Ende! Die Ergebnisse können noch nicht abgerufen werden.");
    }
}

/*********************************
	
	einen Zug empfehlen
	
*********************************/

function strg_zug_empfehlen(argSpielernummer){
	
	var argkI="kI2/Clara";

	var aZug = o_kI_Engines[argkI].apply(o_kI_Engines[argkI],new Array(Spiel,argSpielernummer));
		
	var iSpielerstapel=aZug[0];
	var iBankstapel=aZug[1];
		
	Spielfeld.zeige_zug_empfehlung(iSpielerstapel,iBankstapel);
		
}

/*********************************
 * 
 * den Player ausführen 
 * 
 *********************************/

function strg_player_laden_starten(argZugProtokoll){

	//alert("Player spielt ab!");
	
	//Zugprotokoll parsen
	
	sZugProtokoll = new String(argZugProtokoll);
	sZugProtokoll = sZugProtokoll.replace(/\r\n|\n/g,"");
	sZugProtokoll = sZugProtokoll.replace(/ /g,"");
	
    aZugProtokoll = JSON && JSON.parse(sZugProtokoll) || $.parseJSON(sZugProtokoll);
	
	//0. Zug ist die Spielfeldvorbereitung
		//if(typeof(argSpieloptionen)!="object")var argSpieloptionen={showPoints:true,showTrump:false,gameSpeed:8.3,analizeTurn:true,giveAdvice:false};
	
	//Spiel und Spielfeld initialisieren
	
	//init_SpielID ist eine automatisch zufällig generierte SpielID
	//init_oBlatt ist ein automatisch generiertes Spielblatt
	var argMitspieler = new Array(new Array(0,"Spieler/-in","mitte"),new Array("kI/Nora","Gegner links","links"),new Array("kI2/Clara","Gegner Rechts","rechts"));
	
	//sorgt dafür, das die Standardeinstellungen geladen werden
	var argSpielfeldOptionen;
	
	oMfxQueue.queue(function(){
	
		Spielfeld = new spielfeldobject(argMitspieler,argSpielfeldOptionen,MOE_SPIELTYP_Video);
		Spielfeld.spieltyp_anzeige("Møller");

		//geben und im view anzeigen
		var aKarten  = aZugProtokoll[0]["aOffeneKarten"];
		var iNachziehstapelKartenzahl = 48;

		//ersten spieler im Spielfeld festlegen
		iErsterSpieler=aZugProtokoll[1]["iSpielernummer"];
		Spielfeld.aktuellen_spieler_anzeigen(iErsterSpieler);

		//Gibt die Karten aus
		Spielfeld.karten_geben(aKarten,rotate_anticlockwise(0,argMitspieler.length,iErsterSpieler),iNachziehstapelKartenzahl);
		
		$('#moe_mplayer_queuesteps').text(oMfxQueue.get_queue().length);
		
		Spielfeld.spielfeld().queue(function(){
		Spielfeld.spielfeld().dequeue();
		oMfxQueue.dequeue();
		});
	
	});

	//Alle Züge in das mfxQueueObjekt eingeben
	for(var i=1;i<aZugProtokoll.length;i++){
		
		//alert(typeof(aZugProtokoll[i].iSpielerstapel)+" "+aZugProtokoll[i].iSpielerstapel+" "+i);
		
		//Bank umdrehen Zug?
		if(typeof(aZugProtokoll[i].iSpielerstapel)!=="number"){
			
			oMfxQueue.queue(function(oAktuellerZug){
				return function(){
					Spielfeld.aktuellen_spieler_anzeigen(oAktuellerZug.iSpielernummer);
					// bank drehen im view darstellen mit den neuen offenliegenden Karten
					Spielfeld.bank_drehen(oAktuellerZug.iBankstapel,oAktuellerZug.aUmgedrehterStapel);
					
					$('#moe_mplayer_queuesteps').text(oMfxQueue.get_queue().length);
					
					Spielfeld.spielfeld().queue(function(){
						Spielfeld.spielfeld().dequeue();
						oMfxQueue.dequeue();
					});
				};
			}(aZugProtokoll[i]));

		//wenn es ein vollwertiger Zug ist
		} else {


			oMfxQueue.queue(function(oAktuellerZug){
				return function(){
					Spielfeld.aktuellen_spieler_anzeigen(oAktuellerZug.iSpielernummer);

					/* Da der Zug ja gültig ist, werden die Folgen angezeigt!*/

					//Zug im View zu ende führen
					Spielfeld.karte_ziehen_und_auflegen(oAktuellerZug.iSpielernummer,oAktuellerZug.iSpielerstapel,oAktuellerZug.iBankstapel);
					
					//wenn der spieler den stich nehmen muss
					if(oAktuellerZug.bMussNehmen){
						Spielfeld.spieler_zieht_ein(oAktuellerZug.iSpielernummer,oAktuellerZug.iBankstapel);
					}

					//wenn nachziehen, dann nachziehen veranlassen
					if(oAktuellerZug.bSpielerHatNachgezogen){
						Spielfeld.spieler_zieht_nach(oAktuellerZug.iSpielernummer,oAktuellerZug.iSpielerstapel,1);
						Spielfeld.spieler_zieht_nach(oAktuellerZug.iSpielernummer,oAktuellerZug.iSpielerstapel,oAktuellerZug.aNachgezogenerKartenstapel[1]);
					} else {
						if(oAktuellerZug.bSpielerstapelGedreht){
							Spielfeld.spieler_dreht_um(oAktuellerZug.iSpielernummer,oAktuellerZug.sUmgedrehteKarte,oAktuellerZug.iSpielerstapel);
						}
					}

					//wenn bank nachgezogen hat, dann bank nachziehen
					if(oAktuellerZug.bBankHatNachgezogen){
						Spielfeld.bank_zieht_nach(1,oAktuellerZug.iBankstapel);
						Spielfeld.bank_zieht_nach(oAktuellerZug.aNachgezogenerBankstapel[1][0],oAktuellerZug.iBankstapel);
					} else {
						if(oAktuellerZug.bBankstapelGedreht){
							//Hier mus snoch eine Änderung rein
							//console.log("strg_ziehen: umgedrehter Stapel:"+oAktuellerZug.get_umgedrehten_stapel().get_stapel());
							Spielfeld.bank_dreht_um(oAktuellerZug.iBankstapel,oAktuellerZug.aUmgedrehterStapel);
						}
					}
					
					$('#moe_mplayer_queuesteps').text(oMfxQueue.get_queue().length);
					
					Spielfeld.spielfeld().queue(function(){Spielfeld.spielfeld().dequeue();oMfxQueue.dequeue();});
				};
			}(aZugProtokoll[i]));
	

		}
		
	}
	
	
}

/*********************************
 * 
 * den Player pausieden und weitermachen 
 * 
 *********************************/

function strg_player_stop_weiter(argAktion){
	
	//wenn die aktion stop ist, das mfxobjekt pausieren
	if(argAktion=="stop"){
		oMfxQueue.pause();
	}
	
	//wenn die aktion weiter ist das mfxobjekt weiterführen
	if(argAktion=="weiter"){
		oMfxQueue.play();
	}
}