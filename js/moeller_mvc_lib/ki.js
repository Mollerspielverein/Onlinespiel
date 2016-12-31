/*********************************************************************************

	kI Engines

*********************************************************************************/

/*********************************

	2dZ-kI Nora (kI/Nora)

*********************************/

function logik_ki(argSpiel,argSpielernummer) // Nora (2d1D-kI)
{
	// Alle Spielbaren karten Laden
	//
	//
	//	sKarten = new Array(	Array("Karte","Stapel",	Array(	Array(Karte, Bankstapel), ...) , ... )
	// der Array(Bankstapel) ist leer, wenn man alle karten spielen kann
	
	// Karten mit bedienpflicht
	
	var rComputer = argSpiel.spieler(argSpielernummer);
	var rBank = argSpiel.bank();
	
	var aKarten=new Array();
	
	for(var i=0;i<3;i++)
	{
		//if(aAlleSpielerStapel[iAktuellerSpieler][i]!=sMoeller && aAlleSpielerStapel[iAktuellerSpieler][i]!="")
		if(!rComputer.kartenstapel(i).ist_leer()) //Wenn die Karte der Möller ist kann sie machen, was sie will, dadurch kann sie jede beliebige Kombination eingehen!
		{
			aKarten.push( new Array(i, new Array()));
			
			for(var j=0;j<3;j++)
			{
				//Wenn der bankstapel nicht leer ist
				if(!rBank.bankstapel(j).ist_leer())
				{
					if(
						(  	argSpiel.get_spielmodus()!=MOE_SPIELTYP_WildesSpiel && (rBank.bankstapel(j).get_offene_karte().get_farbe()==rComputer.kartenstapel(i).get_obere_karte().get_farbe() || rComputer.kartenstapel(i).get_obere_karte().ist_moeller())) ||
						(	argSpiel.get_spielmodus()==MOE_SPIELTYP_WildesSpiel	) //Bei einem Wilden Spiel ist es egal, was man auf der Hand hat
					)
					{
						//protokoll("logik_ki: Spieler "+argSpielernummer+" "+i+"("+rComputer.kartenstapel(i).get_obere_karte().get_name()+") "+j+"("+rBank.bankstapel(j).get_offene_karte().get_name()+")");
						aKarten[(aKarten.length-1)][1].push(j);
					}
				}
			}
			
			
			if(aKarten[ (aKarten.length-1) ][1].length==0){
				//protokoll("logik_ki: Schmeiße i="+aKarten[ (aKarten.length-1) ][0]+" wieder heraus, weil j="+aKarten[ (aKarten.length-1) ][1].join(","));
				aKarten.pop();
			}
			else {
				//protokoll("logik_ki: behalte i="+aKarten[ (aKarten.length-1) ][0]+" bei, weil j="+aKarten[ (aKarten.length-1) ][1].join(","));				
			}
		}
	}
	
	//protokoll("logik_ki: kI-Bedienpflicht("+aKarten.length+"):"+aKarten.join("/"));
	
	//Wenn eindeutige Bedienpflicht
	if(aKarten.length==1 && aKarten[0][1].length==1)
	{
		//protokoll("logik_ki: Gezwungene Entscheidung nach Indizes:"+aKarten[0][0]+" auf "+aKarten[0][1][0]);
		return new Array(aKarten[0][0],aKarten[0][1][0]);
	}

	//Gar keine Bedienpflicht, dann wird irgendeine gespielt
	if(aKarten.length==0)
	{
		//Suchen aller möglichen Spielerstapel
		var aMoeglicheSpielerstapel = new Array();
		for(var i=0;i<3;i++)if(!rComputer.kartenstapel(i).ist_leer())aMoeglicheSpielerstapel.push(i);
		//Suchen aller möglichen Bankstapel
		var aMoeglicheBankstapel = new Array();
		for(var i=0;i<3;i++)if(!rBank.bankstapel(i).ist_leer())aMoeglicheBankstapel.push(i);
		if(aMoeglicheBankstapel.length==0)aMoeglicheBankstapel=[0,1,2];
	
		var iStapelIndex=ma_z_rand_intv_0e(aMoeglicheSpielerstapel.length-1); 
		var iSpielerstapelnummer = aMoeglicheSpielerstapel[iStapelIndex];
		var iBankStapelIndex=ma_z_rand_intv_0e(aMoeglicheBankstapel.length-1);
		var iBankstapelnummer = aMoeglicheBankstapel[iBankStapelIndex];
	
		//protokoll("logik_ki: Zufallsentscheidung nach Indizes:"+iSpielerstapelnummer+" auf "+iBankstapelnummer);
		return new Array(iSpielerstapelnummer,iBankstapelnummer);
	}
	
	//Sonst aus den zu bedienenden Karten irgendeine gespielt
	var iStapelIndex=ma_z_rand_intv_0e(aKarten.length-1); 
	var iSpielerstapelnummer = aKarten[iStapelIndex][0];
	var iBankStapelIndex=ma_z_rand_intv_0e(aKarten[iStapelIndex][1].length-1);
	var iBankstapelnummer = aKarten[iStapelIndex][1][iBankStapelIndex];
	//protokoll("logik_ki: Entscheidung nach Indizes:"+iStapelIndex+" auf "+iBankStapelIndex);
	return new Array(iSpielerstapelnummer,iBankstapelnummer);

	//protokoll("logik_ki(Schwerer kI-Fehler): Entscheidungslücke. Kein Ergebnis.");
}

/*********************************

	Clara

*********************************/

function logik_ki2(argSpiel,argSpielernummer) // Clara (2d4D-kI)
{
	//Grundlagenvariablen einfügen
	var rComputer = argSpiel.spieler(argSpielernummer);
	var rBank = argSpiel.bank();
	
	var i=0;
	var j=0;
	// Alle Spielbaren karten Laden
	//
	//
	//	sKarten = new Array(	Array("Karte","Stapel",	Array(	Array(Karte, Bankstapel, ZugWert), ...) , ... )
	// der Array(Bankstapel) ist leer, wenn man alle karten spielen kann
	
	// Karten mit bedienpflicht
	
	var iMaxWert=0;
	var aMaxWertKoordinaten=new Array();
	var diZugwert=0;
	var dsSpielerkarte="";
	var diBankstapelAugen=0;
	var dsBankstapelDeckKarte="";
	
	
	//Bewertung der Pflichtzüge!
	
	
	for(i=0;i<3;i++)
	{
		//Nimmt den Moeller aus der Bedienpflicht heraus. Er muss nachträglich ermittelt werden und denn den möglichen Stichen hinzugefügt werden
		if( !rComputer.kartenstapel(i).get_obere_karte().ist_moeller() && !rComputer.kartenstapel(i).ist_leer())
		{
			for(j=0;j<3;j++)
			{
				//Wenn der bankstapel nicht leer ist
				if(!rBank.bankstapel(j).ist_leer())
				{
					//wenn bedienpflicht besteht
					if(	argSpiel.get_spielmodus()!=MOE_SPIELTYP_WildesSpiel && (rBank.bankstapel(j).get_offene_karte().get_farbe()==rComputer.kartenstapel(i).get_obere_karte().get_farbe() || rComputer.kartenstapel(i).get_obere_karte().ist_moeller()) )
					{
						//(sKartenStaerke,sKartenWert,sBankStapelwert,sBankStapelDeckkartenStaerke,sKartenfarbe,sBankDeckkartenfarbe)
						
						diZugwert=logik_ki2_wertungsfunktion(
							argSpiel,
							rComputer.kartenstapel(i).get_obere_karte().get_staerke(),
							rComputer.kartenstapel(i).get_obere_karte().get_augenzahl(),
							rBank.bankstapel(j).get_offenen_stich().get_punkte(),
							rBank.bankstapel(j).get_offene_karte().get_staerke(), 
							rComputer.kartenstapel(i).get_obere_karte().get_farbe(),
							rBank.bankstapel(j).get_offene_karte().get_farbe());
								
						
						//Neuer maximaler Wert, alles leeren, ab jetzt gezählt
						if(diZugwert>iMaxWert)
						{
							aMaxWertKoordinaten=new Array();
							aMaxWertKoordinaten.push(new Array(i,j));
							iMaxWert=diZugwert;
							//protokoll("neuer Spitzenwert");
						}
						else
						{	//Wenn genau wie Maximaler Wert, dann bitte aufnehmen
							if(diZugwert==iMaxWert)
							{
								aMaxWertKoordinaten.push(new Array(i,j));
								//protokoll("genommen;")
							}
							else //Wenn kleinerer Wert, dann passiert nix
							{
								//protokoll("ignoriert;")
							}
						}
					}
				}
			}
		}
	}
	

	//protokoll("keine Bedienpflicht ("+aMaxWertKoordinaten.length+") iMaxWert:"+iMaxWert);
	
	//Gar keine Bedienpflicht, dann werden alle neun Züge bewertet
	if(aMaxWertKoordinaten.length==0)
	{
		for(var i=0;i<3;i++)
		{
			//protokoll("i:"+i+" Moeller:"+rComputer.kartenstapel(i).get_obere_karte().ist_moeller()+"=0 && Leer:"+rComputer.kartenstapel(i).ist_leer()+"=0");
			if(!rComputer.kartenstapel(i).get_obere_karte().ist_moeller() && !rComputer.kartenstapel(i).ist_leer())
			{
				//protokoll()
				//Wenn alle Stapel leer sind, immer den mittleren Stapel benutzen
				if(rBank.bankstapel(0).ist_leer() && rBank.bankstapel(1).ist_leer() && rBank.bankstapel(2).ist_leer())
				{
		
					//(sKartenStaerke,sKartenWert,sBankStapelwert,sBankStapelDeckkartenStaerke,sKartenfarbe,sBankDeckkartenfarbe)

						
						diZugwert=logik_ki2_wertungsfunktion(
							argSpiel,
							rComputer.kartenstapel(i).get_obere_karte().get_staerke(),
							rComputer.kartenstapel(i).get_obere_karte().get_augenzahl(),
							0,
							0, 
							rComputer.kartenstapel(i).get_obere_karte().get_farbe(),
							" "
						);

					//protokoll("Spielkarte "+rComputer.kartenstapel(i).get_obere_karte().get_name()+" auf Bankstapelkarte "+j+" Zugwert:"+diZugwert);

					//Neuer maximaler Wert, alles leeren, ab jetzt gezählt
					if(diZugwert>iMaxWert)
					{
						aMaxWertKoordinaten=new Array();
						aMaxWertKoordinaten.push(new Array(i,1));
						iMaxWert=diZugwert;

						//protokoll("neuer Spitzenwert");
					}
					else
					{	//Wenn genau wie Maximaler Wert, dann bitte aufnehmen
						if(diZugwert==iMaxWert)
						{
							aMaxWertKoordinaten.push(new Array(i,1));
							//protokoll("genommen;")
						}
						else //Wenn kleinerer Wert, dann passiert nix
						{
							//protokoll("ignoriert;")
						}
					}							
				}
				else // Wenn nicht alle leer sind, nur die nicht leere überprüfen
				{
					for(var j=0;j<3;j++)
					{
						if(!rBank.bankstapel(j).ist_leer())
						{
						
					
							//(sKartenStaerke,sKartenWert,sBankStapelwert,sBankStapelDeckkartenStaerke,sKartenfarbe,sBankDeckkartenfarbe)
						
							diZugwert=logik_ki2_wertungsfunktion(
								argSpiel,
								rComputer.kartenstapel(i).get_obere_karte().get_staerke(),
								rComputer.kartenstapel(i).get_obere_karte().get_augenzahl(),
								rBank.bankstapel(j).get_offenen_stich().get_punkte(),
								rBank.bankstapel(j).get_offene_karte().get_staerke(), 
								rComputer.kartenstapel(i).get_obere_karte().get_farbe(),
								rBank.bankstapel(j).get_offene_karte().get_farbe());

								//protokoll("Spielkarte "+rComputer.kartenstapel(i).get_obere_karte().get_name()+" auf Bankstapelkarte "+rBank.bankstapel(j).get_offene_karte().get_name()+"("+rBank.bankstapel(j).get_offenen_stich().get_punkte()+") Zugwert:"+diZugwert);
							
							//Neuer maximaler Wert, alles leeren, ab jetzt gezählt
							if(diZugwert>iMaxWert)
							{
								aMaxWertKoordinaten=new Array();
								aMaxWertKoordinaten.push(new Array(i,j));
								iMaxWert=diZugwert;
								//protokoll("neuer Spitzenwert");
							}
							else
							{	//Wenn genau wie Maximaler Wert, dann bitte aufnehmen
								if(diZugwert==iMaxWert)
								{
									aMaxWertKoordinaten.push(new Array(i,j));
									//protokoll("genommen;")
								}
								else //Wenn kleinerer Wert, dann passiert nix
								{
									//protokoll("ignoriert;")
								}
							}	
						}
					}
				}
			}
		}
	}
	//protokoll("Moellerzüge!");

	var i,j=0;
	//Prüft auf den Moeller und fügt die Zugmöglichkeiten hinten an.
	for(i=0;i<3;i++)
	{
		if(!rComputer.kartenstapel(i).ist_leer()){
			//protokoll(i+": "+aAlleSpielerStapel[iAktuellerSpieler][i]+"=="+sMoeller);
			if(rComputer.kartenstapel(i).get_obere_karte().ist_moeller())
			{
			
				//protokoll("Moeller an Position "+i);
				for(j=0;j<3;j++)
				{
					var diZugwert=0;
					
					if(!rBank.bankstapel(j).ist_leer())
					{
						diZugwert=logik_ki2_wertungsfunktion(
							argSpiel,
							rComputer.kartenstapel(i).get_obere_karte().get_staerke(),
							rComputer.kartenstapel(i).get_obere_karte().get_augenzahl(),
							rBank.bankstapel(j).get_offenen_stich().get_punkte(),
							rBank.bankstapel(j).get_offene_karte().get_staerke(), 
							rComputer.kartenstapel(i).get_obere_karte().get_farbe(),
							rBank.bankstapel(j).get_offene_karte().get_farbe());
						
						//(sKartenStaerke,sKartenWert,sBankStapelwert,sBankStapelDeckkartenStaerke,sKartenfarbe,sBankDeckkartenfarbe)
					}
					else if (rBank.bankstapel(0).ist_leer() && rBank.bankstapel(1).ist_leer() && rBank.bankstapel(2).ist_leer())	//Wenn der Möller auf den leeren Bankstapel soll, soll er zufällig wählen
					{
						diZugwert=logik_ki2_wertungsfunktion(
							argSpiel,
							rComputer.kartenstapel(i).get_obere_karte().get_staerke(),
							rComputer.kartenstapel(i).get_obere_karte().get_augenzahl(),
							0,
							0, 
							rComputer.kartenstapel(i).get_obere_karte().get_farbe(),
							" ");
					}
					
					//protokoll("Spielkarte "+rComputer.kartenstapel(i).get_obere_karte().get_name()+" auf Bankstapelkarte "+rBank.bankstapel(j).get_offene_karte().get_name()+"("+rBank.bankstapel(j).get_offenen_stich().get_punkte()+") Zugwert:"+diZugwert);
					
					//Neuer maximaler Wert, alles vorher war schlechter, ab jetzt neu gezählt
					if(diZugwert>iMaxWert)
					{
						aMaxWertKoordinaten=new Array();
						aMaxWertKoordinaten.push(new Array(i,j));
						iMaxWert=diZugwert;
						//protokoll("neuer Spitzenwert");
					}
					else
					{	//Wenn genau wie Maximaler Wert, dann bitte aufnehmen
						if(diZugwert==iMaxWert)
						{
							aMaxWertKoordinaten.push(new Array(i,j));
							//protokoll("genommen;")
						}
						else //Wenn kleinerer Wert, dann passiert nix
						{
							//protokoll("ignoriert;")
						}
					}
				}
			}
		}
	}

	//Wenn eindeutige Bedienpflicht
	if(aMaxWertKoordinaten.length==1)
	{
		return new Array(aMaxWertKoordinaten[0][0],aMaxWertKoordinaten[0][1]); //Das ändert sicht nicht
	}
	else if(aMaxWertKoordinaten.length==0)
	{
		throw "Fehler: Es gibt immer die Möglichkeit eine Karte zu legen. Es ist ein Fehler aufgetreten.";
	}
	
	iStapelIndex=ma_z_rand_intv_0e(aMaxWertKoordinaten.length-1);
	return new Array(aMaxWertKoordinaten[iStapelIndex][0],aMaxWertKoordinaten[iStapelIndex][1]);



}

function logik_ki2_wertungsfunktion(oSpiel,sKartenStaerke,sKartenWert,sBankStapelwert,sBankStapelDeckkartenStaerke,sKartenfarbe,sBankDeckkartenfarbe) // W13
{
	if( (sBankStapelDeckkartenStaerke < sKartenStaerke && sKartenfarbe==sBankDeckkartenfarbe) || (sKartenfarbe==oSpiel.moeller().get_trumpffarbe() && sKartenfarbe!=sBankDeckkartenfarbe)) 
	{
		//hier kann nie eine neuen drin stehen, da die neun niemals stärker als irgendeine karte ist, außer es ist eine trumpf neun, deshalb wird ein fach mal eine 1 addiert
		diErgebnis=100/(sKartenWert+sBankStapelwert+1); // D1, D2*D3, iD4 (100)
	}
	else
	{	
		diErgebnis=100+(sKartenStaerke); //D3 * D2, iD4 (+100)
	}
	if(sKartenfarbe==oSpiel.moeller().get_trumpffarbe())diErgebnis=diErgebnis+56; //iD3;
		
	//Beim Normal dreht sich die Wichtung um, da der Algorithmus auf Ramsch gemünzt ist
	if(oSpiel.get_spielmodus()==MOE_SPIELTYP_KeinRamsch)diErgebnis=1/diErgebnis;
	
	return Math.round(diErgebnis);
}

/*********************************

	Laurina (Vorform von Laura) B5

*********************************/

function logik_ki2_09(argSpiel,argSpielernummer) // Laurina = Clara (2d4D-kI) mit Wertungsfunktion von Laura
{
	//Grundlagenvariablen einfügen
	var rComputer = argSpiel.spieler(argSpielernummer);
	var rBank = argSpiel.bank();
	
	var i=0;
	var j=0;
	// Alle Spielbaren karten Laden
	//
	//
	//	sKarten = new Array(	Array("Karte","Stapel",	Array(	Array(Karte, Bankstapel, ZugWert), ...) , ... )
	// der Array(Bankstapel) ist leer, wenn man alle karten spielen kann
	
	// Karten mit bedienpflicht
	
	var iMaxWert=0;
	var aMaxWertKoordinaten=new Array();
	var diZugwert=0;
	var dsSpielerkarte="";
	var diBankstapelAugen=0;
	var dsBankstapelDeckKarte="";
	
	var bAufLeerenStapelsetzen=false;
	var aSpielerkarten=argSpiel.get_offene_karten()[2+argSpielernummer];
	var aBankkarten=argSpiel.get_offene_karten()[1];
	var aBanksstiche = new Array( argSpiel.bank().bankstapel(0).get_offenen_stich(), argSpiel.bank().bankstapel(1).get_offenen_stich(),argSpiel.bank().bankstapel(2).get_offenen_stich() );
	var aBankstich, sBankkarte;
	
	if(argSpiel.get_nachziehstapel_kartenzahl()==0 && argSpiel.bank().bankstapel(0).ist_leer() && argSpiel.bank().bankstapel(1).ist_leer() && argSpiel.bank().bankstapel(2).ist_leer())bAufLeerenStapelsetzen=true;
	
	
	var aMoeglicheZuege=logik_ki3_moegliche_zuege(aBankkarten,aSpielerkarten,argSpiel,bAufLeerenStapelsetzen);
	
	protokoll("logik_ki2_09: Moegliche Züge Spieler("+argSpielernummer+"):"+aMoeglicheZuege.join("/"));
	
	for(var i=0;i<aMoeglicheZuege.length;i++){
		if(aBankkarten[ aMoeglicheZuege[i][1]]==""){
			oiBankstich=0;
			oiBankkarte=0;
		} else {
			oiBankkarte=argSpiel.create_karte(aBankkarten[ aMoeglicheZuege[i][1]]);
			oiBankstich=argSpiel.create_stich(aBanksstiche[ aMoeglicheZuege[i][1]]);
		}
		

		
		diZugwert=logik_ki3_wertungsfunktion(
			argSpiel,
			argSpiel.create_karte(aSpielerkarten[aMoeglicheZuege[i][0]]),
			oiBankstich,
			oiBankkarte
		);
	
		protokoll("Bewertete Zug "+aMoeglicheZuege[i][0]+"("+aSpielerkarten[aMoeglicheZuege[i][0]]+") auf "+aMoeglicheZuege[i][1]+"("+aBanksstiche[ aMoeglicheZuege[i][1]]+") mit "+diZugwert);
		
		//Neuer maximaler Wert, alles leeren, ab jetzt gezählt
		if(diZugwert>iMaxWert)
		{
			aMaxWertKoordinaten=new Array();
			aMaxWertKoordinaten.push(aMoeglicheZuege[i]);
			iMaxWert=diZugwert;
			//protokoll("neuer Spitzenwert");
		}
		else
		{	//Wenn genau wie Maximaler Wert, dann bitte aufnehmen
			if(diZugwert==iMaxWert)
			{
				aMaxWertKoordinaten.push(aMoeglicheZuege[i]);
				//protokoll("genommen;")
			}
			else //Wenn kleinerer Wert, dann passiert nix
			{
				//protokoll("ignoriert;")
			}
		}
	
	}

	//Wenn eindeutige Bedienpflicht
	if(aMaxWertKoordinaten.length==1)
	{
		return new Array(aMaxWertKoordinaten[0][0],aMaxWertKoordinaten[0][1]); //Das ändert sicht nicht
	}
	else if(aMaxWertKoordinaten.length==0)
	{
		throw "Fehler: Es gibt immer die Möglichkeit eine Karte zu legen. Es ist ein Fehler aufgetreten.";
	}
	
	iStapelIndex=ma_z_rand_intv_0e(aMaxWertKoordinaten.length-1);
	return new Array(aMaxWertKoordinaten[iStapelIndex][0],aMaxWertKoordinaten[iStapelIndex][1]);



}

var a_Logik_Gefaehrlichkeit = 	{	"M":48,
									"tA":47,
									"tK":45,
									"tO":43,
									"tU":41,
									"tt":39,
									"t9":37,
									"fA":11,
									"fK":9,
									"fO":7,
									"fU":5,
									"ft":3,
									"f9":1	};	
								


function logik_ki3_wertungsfunktion(oSpiel,oSpielerkarte,oBankstich,oBankkarte) // B5
{
	

	//e-Fall
	if( oBankstich!==0 && oBankkarte!==0){
	
		//protokoll("logik_ki3_wertungsfunktion: "+oSpielerkarte.get_name()+" auf "+oBankstich.get_stapel()+"("+oBankkarte.get_name()+")" );
		if( ( oBankkarte.get_staerke() < oSpielerkarte.get_staerke() && oSpielerkarte.get_farbe()==oBankkarte.get_farbe() ) || ( oSpielerkarte.ist_trumpf() && oSpielerkarte.get_farbe()!=oBankkarte.get_farbe() )) 
		{
			//Gefaehrlichkeit
			if(oSpielerkarte.ist_moeller()){
				diErgebnis=a_Logik_Gefaehrlichkeit[ "M"                                                           ] / ( ( (oSpielerkarte.get_augenzahl() + oBankstich.get_punkte())^2.1) + 1 );
			} else {
				diErgebnis=a_Logik_Gefaehrlichkeit[ (oSpielerkarte.ist_trumpf()?"t":"f")+oSpielerkarte.get_bild() ] / ( ( (oSpielerkarte.get_augenzahl() + oBankstich.get_punkte())^2.1) + 1 );
			}
		}
		else //a-Fall
		{	
			if(oSpielerkarte.ist_moeller()){
				diErgebnis=a_Logik_Gefaehrlichkeit[ "M" ];
			} else {
				diErgebnis=a_Logik_Gefaehrlichkeit[ (oSpielerkarte.ist_trumpf()?"t":"f")+oSpielerkarte.get_bild() ];
			}
		}	
	}
	else //a-Fall
	{	
		//protokoll("logik_ki3_wertungsfunktion: "+oSpielerkarte.get_name()+" auf leere Bank" );
		if(oSpielerkarte.ist_moeller()){
			diErgebnis=a_Logik_Gefaehrlichkeit[ "M" ];
		} else {
			diErgebnis=a_Logik_Gefaehrlichkeit[ (oSpielerkarte.ist_trumpf()?"t":"f")+oSpielerkarte.get_bild() ];
		}
	}

		
	//Beim Normal dreht sich die Wichtung um, da der Algorithmus auf Ramsch gemünzt ist
	if(oSpiel.get_spielmodus()==MOE_SPIELTYP_KeinRamsch)diErgebnis=1/diErgebnis;
		//protokoll("logik_ki3_wertungsfunktion: "+diErgebnis);
	return diErgebnis;
}					

/*********************************

	Laura B5

*********************************/



function logik_ki3(argSpiel,argSpielernummer) // Laura (4d4D-kI)
{

	//Kopie aller offenen Karten, die als Referenz übergeben wird
	var aKartendeck = argSpiel.get_offene_karten();
/*	var aKartendeck =	[	daDeck[0],
							[
								daDeck[1][0],daDeck[1][1],daDeck[1][2]
							],
							[
								daDeck[2][0],daDeck[2][1],daDeck[2][2]
							],
							[
								daDeck[3][0],daDeck[3][1],daDeck[3][2]
							],
							[
								daDeck[4][0],daDeck[4][1],daDeck[4][2]
							]
						];*/
	var aBankstiche =   [argSpiel.bank().bankstapel(0).get_offenen_stich().get_stapel(),argSpiel.bank().bankstapel(1).get_offenen_stich().get_stapel(),argSpiel.bank().bankstapel(2).get_offenen_stich().get_stapel()];
	
	//Startspieler
	var iStartspieler = argSpielernummer;
	
	//die besten Zugvarianten herausfinden
	var aBesteZuege = logik_ki3_n1(iStartspieler , 0, aKartendeck, aBankstiche, argSpiel, iStartspieler, argSpiel.get_nachziehstapel_kartenzahl() );
	
	//den Besten zurückgeben
	var aErgebnisZuege=logik_beste_zuege_heraussuchen(aBesteZuege);
	
	protokoll("logik_ki3: Der oder die besten Züge:"+aErgebnisZuege);
	
	if(aErgebnisZuege.length==1){
		return aBesteZuege[aErgebnisZuege[0]][0];
	} else {
		
		return aBesteZuege[aErgebnisZuege[ma_z_rand_intv_0e(aErgebnisZuege.length-1)]][0];
	}
	

}

function logik_beste_zuege_heraussuchen(argZuege){
	//den Besten zurückgeben
	var aIndexBesterZuege=new Array();
	var iMaxWert=0;

	for(var i=0;i<argZuege.length;i++){
		if(argZuege[i][1]>iMaxWert)
		{
			aIndexBesterZuege = new Array();
			aIndexBesterZuege.push(i);
			iMaxWert=argZuege[i][1];
			//protokoll("logik_ki3: neuer Spitzenwert:"+iMaxWert+" Zug:"+aBesteZuege[i][0]);
		} else if(argZuege[i][1]==iMaxWert){
			aIndexBesterZuege.push(i);
			//protokoll("logik_ki3: weiterer bester Zug:"+iMaxWert+" Zug:"+aBesteZuege[i][0]);
		}
	}
	return aIndexBesterZuege;
}

function logik_ki3_aestezahl(argBewertung){
	var aAnzahlderAeste = new Array(argBewertung.length,0,0,0);
	for(var i=0;i<argBewertung.length;i++){
		//Wenn es in diesem Ast Unteräste gibt
		if(argBewertung[i][1].length>0){
			aAnzahlderAeste[1]+=argBewertung[i][1].length;
			for(var j=0;j<argBewertung[i][1].length;j++){
				if(argBewertung[i][1][j][1].length>0){
					aAnzahlderAeste[2]+=argBewertung[i][1][j][1].length;
					for(var k=0;k<argBewertung[i][1][j][1].length;k++){
						if(argBewertung[i][1][j][1][k][1].length>0){
							aAnzahlderAeste[3]+=argBewertung[i][1][j][1][k][1].length;
						}
					}
				}
			}
		}
	}
	return aAnzahlderAeste;
}

function logik_ki3_pfadwerte(aAnzahlderAeste,aTeilbaum,iEbene){
	
	var aTeilbaumsumme=new Array();
	for(var i=0;i<aTeilbaum.length;i++){
		aTeilbaumsumme.push((aTeilbaum[i][0])/aTeilbaum.length);

		if(iEbene<3 && aTeilbaum[i][1].length>0){
			var aUnterTeilbaumsummen = logik_ki3_pfadwerte(aAnzahlderAeste,aTeilbaum[i][1],iEbene+1)
			var iUnterTeilbaumsummen = 0;
			for(var j=0;j<aUnterTeilbaumsummen.length;j++){
				iUnterTeilbaumsummen+=aUnterTeilbaumsummen[j];
			}
			aTeilbaumsumme[aTeilbaumsumme.length-1]*=iUnterTeilbaumsummen;
		}
	}
	return aTeilbaumsumme;
}

function logik_ki3_moegliche_zuege(argBankkarten,argSpielerkarten,argSpiel,argAufLeerenBankstapelSetzenErlaubt){ //Für das Endspiel muss es erlaubt werden, dass wenn kein Hachziehstapel mehr da ist, auch Züge berechnet werden, die darauf beruhen, dass der Spieler bei seinem nächsten Zug auf den leeren Bankstapel setzen darf. Sonst müssten diese Züge verweorfen werden, da die Leerstellen nur für  die neuen Bankkarten stehen, die nicht bekannt sind. Sonst stehen sie für freiwerdenen Platz, der belegt werden kann, wenn de Bedingungen stimmt, dass alle Stapel leer sind.

	if(typeof(argAufLeerenBankstapelSetzenErlaubt)=="undefined")var argAufLeerenBankstapelSetzenErlaubt=false;
	else if(argAufLeerenBankstapelSetzenErlaubt!==true)var argAufLeerenBankstapelSetzenErlaubt=false;

	//Alle Möglichen Züge, die der Spieler machen können, werden ermittelt ohne, dass man sie auswertet
	
	var aKarten=new Array();
	
	for(var i=0;i<3;i++)
	{
		//if(aAlleSpielerStapel[iAktuellerSpieler][i]!=sMoeller && aAlleSpielerStapel[iAktuellerSpieler][i]!="")
		if(argSpielerkarten[i]!="") //Wenn die Karte der Möller ist kann sie machen, was sie will, dadurch kann sie jede beliebige Kombination eingehen!
		{
			for(var j=0;j<3;j++)
			{
				//Wenn der bankstapel nicht leer ist
				if(argBankkarten[j]!="")
				{
					if(
						(  	argSpiel.get_spielmodus()!=MOE_SPIELTYP_WildesSpiel && (argSpielerkarten[i][0]==argBankkarten[j][0] || argSpiel.moeller().ist_moeller(argSpielerkarten[i]) ) ) ||
						(	argSpiel.get_spielmodus()==MOE_SPIELTYP_WildesSpiel	) //Bei einem Wilden Spiel ist es egal, was man auf der Hand hat
					)
					{
						//protokoll("logik_ki3_moegliche_zuege: "+i+"("+argSpielerkarten[i]+") "+j+"("+argBankkarten[j]+")");
						//aKarten[(aKarten.length-1)][1].push(j);
						aKarten.push( new Array(i, j));
					}
				}
			}
		}
	}
	
	//protokoll("logik_ki: kI-Bedienpflicht("+aKarten.length+"):"+aKarten.join("/"));
	
	//Wenn eindeutige Bedienpflichten bestehen
	if(aKarten.length>0)
	{
		return aKarten;
	}

	//Gar keine Bedienpflicht, dann werden alle Kombinationen eingegeben
	if(aKarten.length==0)
	{
		//Suchen aller möglichen Spielerstapel
		var aMoeglicheSpielerstapel = new Array();
		for(var i=0;i<3;i++)if(argSpielerkarten[i]!="")aMoeglicheSpielerstapel.push(i);
		//Suchen aller möglichen Bankstapel
		var aMoeglicheBankstapel = new Array();
		for(var i=0;i<3;i++)if(argBankkarten[j]!="")aMoeglicheBankstapel.push(i);
		if(aMoeglicheBankstapel.length==0)aMoeglicheBankstapel=[0,1,2];
	
		for(var i=0;i<3;i++){
			if(argSpielerkarten[i]!=""){
				for(var j=0;j<3;j++){
					if(argBankkarten[j]!="" || (argBankkarten[0]=="" && argBankkarten[1]=="" && argBankkarten[2]=="" && argAufLeerenBankstapelSetzenErlaubt)){
						aKarten.push(new Array(i,j));
					}
				}
			}
		}
	}
	
	return aKarten;

}


function logik_ki3_n1(argSpieler, argEbene, argKartendeck, argBankstiche, oSpiel, argStartspieler,iNachziehkarten){

	//protokoll("logik_ki3_n1: Spieler:"+argSpieler+" Ebene:"+argEbene+" Kartendeck:"+argKartendeck.join("/")+" Bankstiche:"+argBankstiche.join("/"));

	//Bewertungsarray des Zuges erzeugen
	var aZuegeMitBewertung = new Array();
	var iMaximaleNuetzlichkeit = 0;
	
	//möglichen nächsten Spieler der nächsten unteren Ebene heraus

	var iNaechsterSpieler=argSpieler;
	var bKeinNaechsterSpieler = true;
	
	do
	{
		//nächster Spieler mit Überlaufkontrolle
		iNaechsterSpieler++;
		if(iNaechsterSpieler==oSpiel.get_spieler_anzahl()){iNaechsterSpieler=0;}
		
		//protokoll("Vorschlag nächster Spieler "+iNaechsterSpieler);
		
		//Wenn der Spielerstapel nicht leer ist, darf erspielen!
		if(! argKartendeck[2+iNaechsterSpieler][0]=="" || ! argKartendeck[2+iNaechsterSpieler][1]=="" || ! argKartendeck[2+iNaechsterSpieler][2]=="")
		{
			bKeinNaechsterSpieler=false;
		}
	}
	while(iNaechsterSpieler!=argSpieler && bKeinNaechsterSpieler == true)
	
	//protokoll("logik_ki3_n1: Nächster Spieler:"+iNaechsterSpieler+" Nicht gültig:"+bKeinNaechsterSpieler);
	var bDarfAufLeerenStapelZiehen = false;
	if(iNachziehkarten==0 && argKartendeck[1][0]==""  && argKartendeck[1][1]==""  && argKartendeck[1][2]=="")bDarfAufLeerenStapelZiehen=true;

	//Mögliche Züge laden
	var aMoeglicheZuege = logik_ki3_moegliche_zuege(argKartendeck[1],argKartendeck[2+argSpieler],oSpiel,bDarfAufLeerenStapelZiehen); //Muss noch geändert werden (!)
	var iAnzahlderMoeglichenZuege = aMoeglicheZuege.length;
	
	protokoll("logik_ki3_n1: Ebene:"+argEbene+" Anzahl der Möglichkeiten:"+iAnzahlderMoeglichenZuege);
	
	if(iAnzahlderMoeglichenZuege==1){
			//Zug daten
		var sAusgangsBankkarte = argKartendeck[1][ aMoeglicheZuege[0][1] ];
		var aAusgangsBankstich = argBankstiche[aMoeglicheZuege[0][1]];
		var sAusgangsSpielerkarte = argKartendeck[2+argSpieler][ aMoeglicheZuege[0][0] ];
		
		if(sAusgangsBankkarte!==""){
			var oAusgangsBankkarte = oSpiel.create_karte(argKartendeck[1][ aMoeglicheZuege[0][1] ]);
			var oAusgangsBankstich = oSpiel.create_stich(argBankstiche[aMoeglicheZuege[0][1]]);
		} else {
			var oAusgangsBankkarte = 0;
			var oAusgangsBankstich = 0;
		}
		var oAusgangsSpielerkarte = oSpiel.create_karte(argKartendeck[2+argSpieler][ aMoeglicheZuege[0][0] ]);

		//lokale Nützlichkeit des Zuges
		var iLokaleNuetzlichkeit = logik_ki3_wertungsfunktion(oSpiel, oAusgangsSpielerkarte, oAusgangsBankstich,oAusgangsBankkarte); // (oSpiel,oSpielerkarte,oBankstich,oBankkarte)
		
		return new Array(new Array(aMoeglicheZuege[0],iLokaleNuetzlichkeit));
	}

	//Für jeden Zug berechnen
	for(var i=0;i<iAnzahlderMoeglichenZuege;i++){


		//Zug daten
		var sAusgangsSpielerkarte = argKartendeck[2+argSpieler][ aMoeglicheZuege[i][0] ];
		var sAusgangsBankkarte = argKartendeck[1][ aMoeglicheZuege[i][1] ];
		var aAusgangsBankstich = argBankstiche[aMoeglicheZuege[i][1]].slice(0);

		
		if(argKartendeck[1][ aMoeglicheZuege[i][1] ]!==""){
			var oAusgangsBankkarte = oSpiel.create_karte(argKartendeck[1][ aMoeglicheZuege[i][1] ]);
			var oAusgangsBankstich = oSpiel.create_stich(argBankstiche[aMoeglicheZuege[i][1]]);
		} else {
			var oAusgangsBankkarte = 0;
			var oAusgangsBankstich = 0;
		}
		var oAusgangsSpielerkarte = oSpiel.create_karte(argKartendeck[2+argSpieler][ aMoeglicheZuege[i][0] ]);

		//lokale Nützlichkeit des Zuges
		var iLokaleNuetzlichkeit = logik_ki3_wertungsfunktion(oSpiel, oAusgangsSpielerkarte, oAusgangsBankstich,oAusgangsBankkarte); // (oSpiel,oSpielerkarte,oBankstich,oBankkarte)
			
		//die globalen Nützlichkeiten der möglichen Folgezüge, wenn es eine Rekursionsstufe gibt!
		if( bKeinNaechsterSpieler===false && argEbene<1 &&   ( ( argEbene>0 && argStartspieler!=argSpieler) || (argEbene==0 && argStartspieler==argSpieler))  ){
		
			//Deck verändnern d.h. Zug ausführen
			
			//Wenn die Spielerkarte der Möller ist || die Karte größer als die angepeilte ist bei gleicher farbe || wenn die bankkarte kein trumpf ist und die spielerkarte trumpf
			if( oAusgangsBankstich!==0)
			{
				if( (oAusgangsSpielerkarte.ist_moeller()) || 
					(oAusgangsSpielerkarte.get_farbe()==oAusgangsBankkarte.get_farbe() && oAusgangsSpielerkarte.get_staerke()>oAusgangsBankkarte.get_staerke()) ||
					(oAusgangsSpielerkarte.get_farbe()!=oAusgangsBankkarte.get_farbe() && oAusgangsSpielerkarte.ist_trumpf()) ){
					
					//Stich einziehen
					
						//Stich löschen
						argBankstiche[aMoeglicheZuege[i][1]]=new Array();
						//Bankkarte löschen
						argKartendeck[1][ aMoeglicheZuege[i][1] ]="";
						//Spielerkarte löschen
						argKartendeck[2+argSpieler][ aMoeglicheZuege[i][0] ]="";

				} else {
				
					//Karte auf den Bankstapel ablegen
					
						//Spielerkarte auf den Bankstapel legen
						argBankstiche[aMoeglicheZuege[i][1]].push(sAusgangsSpielerkarte);
						//Bankkarte ersetzen
						argKartendeck[1][ aMoeglicheZuege[i][1] ]=sAusgangsSpielerkarte;
						//Spielerkarte löschen
						argKartendeck[2+argSpieler][ aMoeglicheZuege[i][0] ]="";
						
				}
			} else { // Sonst

				//Karte auf den Bankstapel ablegen

					//Spielerkarte auf den Bankstapel legen
					argBankstiche[aMoeglicheZuege[i][1]].push(sAusgangsSpielerkarte);
					//Bankkarte ersetzen
					argKartendeck[1][ aMoeglicheZuege[i][1] ]=sAusgangsSpielerkarte;
					//Spielerkarte löschen
					argKartendeck[2+argSpieler][ aMoeglicheZuege[i][0] ]="";
				
			}
					
			//Das veränderte Deckt der Funktion rekursiv übergeben mit neuer Ebene
			// ABBRUCH: 	kein neuer Spieler!
			//				zu tiefe ebene
			//				bank leer aber es darf nicht auf den leeren stapel gelegt werden, dann können gar keine vorhersagen mehr gemacht werden
			

			
			var aGlobaleNuetzlichkeitenderFolgezuege = logik_ki3_n1(iNaechsterSpieler, argEbene+1, argKartendeck, argBankstiche, oSpiel, argStartspieler,iNachziehkarten);
		
	
		
			//Den zug wieder rückgängi machen
			argKartendeck[1][ aMoeglicheZuege[i][1] ] = sAusgangsBankkarte;
			argBankstiche[aMoeglicheZuege[i][1]] = aAusgangsBankstich;
			argKartendeck[2+argSpieler][ aMoeglicheZuege[i][0] ] = sAusgangsSpielerkarte;
		
		} else {
			var aGlobaleNuetzlichkeitenderFolgezuege=new Array(new Array(0,1)); //falls keine tiefere Rekursion erlaubt ist
		}
			
		var diGlobaleNuetzlichkeitenderFolgezuege=0;
		
		//protokoll("logik_ki3_n1: Globale Nützlichkeit der Folgezuege("+aGlobaleNuetzlichkeitenderFolgezuege.length+"):"+aGlobaleNuetzlichkeitenderFolgezuege.join("/"));
		
		//die globale Nützlichkeit der Folgezüge hinzurechnen
		for(var j=0;j<aGlobaleNuetzlichkeitenderFolgezuege.length;j++){
			if(argSpieler==argStartspieler)diGlobaleNuetzlichkeitenderFolgezuege= diGlobaleNuetzlichkeitenderFolgezuege + (aGlobaleNuetzlichkeitenderFolgezuege[j][1] / aGlobaleNuetzlichkeitenderFolgezuege.length);
			else diGlobaleNuetzlichkeitenderFolgezuege= diGlobaleNuetzlichkeitenderFolgezuege + (1 / (aGlobaleNuetzlichkeitenderFolgezuege[j][1]*aGlobaleNuetzlichkeitenderFolgezuege.length));
		}
		
		//die lokale Nützlichkeiten zur globalen Nützlichkeit dieses Zuges hinzurechnen
		var iGlobaleNuetzlichkeitdesZuges = iLokaleNuetzlichkeit*diGlobaleNuetzlichkeitenderFolgezuege;
			
		//Diesen Zug mit seiner Nützlichkeit speichern
		aZuegeMitBewertung.push([aMoeglicheZuege[i],iGlobaleNuetzlichkeitdesZuges]);
		
		//protokoll("logik_ki3_n1: Nützlichkeit des Zuges "+aMoeglicheZuege[i]+" ist "+iGlobaleNuetzlichkeitdesZuges+".");

		//Prüfen ob damit ein neues Maximum erreicht wurde, dann ggf. hochsetzen		
		if(iMaximaleNuetzlichkeit<iGlobaleNuetzlichkeitdesZuges)iMaximaleNuetzlichkeit=iGlobaleNuetzlichkeitdesZuges;
	}
	
	//Die Züge nach der besseren Hälfte aussortieren
	var iHalbeNuetzlichkeit=iMaximaleNuetzlichkeit/2;
	var aEndgueltigeZuegeMitBewertung = new Array();
	for(var i=0;i<aZuegeMitBewertung.length;i++){
		if(aZuegeMitBewertung[i][1]>=iHalbeNuetzlichkeit)aEndgueltigeZuegeMitBewertung.push(aZuegeMitBewertung[i]);
	}

	//die übriggebliebene bessere Hälfte übergeben
	
	protokoll("logik_ki3_n1: "+argEbene+" Beste Hälfte der Züge:"+aEndgueltigeZuegeMitBewertung.join("/"));

	return aEndgueltigeZuegeMitBewertung;

};


/*********************************

	Laura mit Clara Wertungsfunktion

*********************************/



function logik_ki3_02(argSpiel,argSpielernummer) // Laura (4d4D-kI) mit Clara Wertungsfunktion
{

	//Kopie aller offenen Karten, die als Referenz übergeben wird
	var aKartendeck = argSpiel.get_offene_karten();
/*	var aKartendeck =	[	daDeck[0],
							[
								daDeck[1][0],daDeck[1][1],daDeck[1][2]
							],
							[
								daDeck[2][0],daDeck[2][1],daDeck[2][2]
							],
							[
								daDeck[3][0],daDeck[3][1],daDeck[3][2]
							],
							[
								daDeck[4][0],daDeck[4][1],daDeck[4][2]
							]
						];*/
	var aBankstiche =   [argSpiel.bank().bankstapel(0).get_offenen_stich().get_stapel(),argSpiel.bank().bankstapel(1).get_offenen_stich().get_stapel(),argSpiel.bank().bankstapel(2).get_offenen_stich().get_stapel()];
	
	//Startspieler
	var iStartspieler = argSpielernummer;
	
	//die besten Zugvarianten herausfinden
	var aBesteZuege = logik_ki3_02_n1(iStartspieler , 0, aKartendeck, aBankstiche, argSpiel, iStartspieler, argSpiel.get_nachziehstapel_kartenzahl() );
	
	//den Besten zurückgeben
	var aErgebnisZuege=logik_beste_zuege_heraussuchen_02(aBesteZuege);
	
	protokoll("logik_ki3: Der oder die besten Züge:"+aErgebnisZuege);
	
	if(aErgebnisZuege.length==1){
		return aBesteZuege[aErgebnisZuege[0]][0];
	} else {
		
		return aBesteZuege[aErgebnisZuege[ma_z_rand_intv_0e(aErgebnisZuege.length-1)]][0];
	}
	

}

function logik_beste_zuege_heraussuchen_02(argZuege){
	//den Besten zurückgeben
	var aIndexBesterZuege=new Array();
	var iMaxWert=0;

	for(var i=0;i<argZuege.length;i++){
		if(argZuege[i][1]>iMaxWert)
		{
			aIndexBesterZuege = new Array();
			aIndexBesterZuege.push(i);
			iMaxWert=argZuege[i][1];
			//protokoll("logik_ki3: neuer Spitzenwert:"+iMaxWert+" Zug:"+aBesteZuege[i][0]);
		} else if(argZuege[i][1]==iMaxWert){
			aIndexBesterZuege.push(i);
			//protokoll("logik_ki3: weiterer bester Zug:"+iMaxWert+" Zug:"+aBesteZuege[i][0]);
		}
	}
	return aIndexBesterZuege;
}

function logik_ki3_02_n1(argSpieler, argEbene, argKartendeck, argBankstiche, oSpiel, argStartspieler,iNachziehkarten){

	//protokoll("logik_ki3_n1: Spieler:"+argSpieler+" Ebene:"+argEbene+" Kartendeck:"+argKartendeck.join("/")+" Bankstiche:"+argBankstiche.join("/"));

	//Bewertungsarray des Zuges erzeugen
	var aZuegeMitBewertung = new Array();
	var iMaximaleNuetzlichkeit = 0;
	
	//möglichen nächsten Spieler der nächsten unteren Ebene heraus

	var iNaechsterSpieler=argSpieler;
	var bKeinNaechsterSpieler = true;
	
	do
	{
		//nächster Spieler mit Überlaufkontrolle
		iNaechsterSpieler++;
		if(iNaechsterSpieler==oSpiel.get_spieler_anzahl()){iNaechsterSpieler=0;}
		
		//protokoll("Vorschlag nächster Spieler "+iNaechsterSpieler);
		
		//Wenn der Spielerstapel nicht leer ist, darf erspielen!
		if(! argKartendeck[2+iNaechsterSpieler][0]=="" || ! argKartendeck[2+iNaechsterSpieler][1]=="" || ! argKartendeck[2+iNaechsterSpieler][2]=="")
		{
			bKeinNaechsterSpieler=false;
		}
	}
	while(iNaechsterSpieler!=argSpieler && bKeinNaechsterSpieler == true)
	
	//protokoll("logik_ki3_n1: Nächster Spieler:"+iNaechsterSpieler+" Nicht gültig:"+bKeinNaechsterSpieler);
	var bDarfAufLeerenStapelZiehen = false;
	if(iNachziehkarten==0 && argKartendeck[1][0]==""  && argKartendeck[1][1]==""  && argKartendeck[1][2]=="")bDarfAufLeerenStapelZiehen=true;

	//Mögliche Züge laden
	var aMoeglicheZuege = logik_ki3_moegliche_zuege(argKartendeck[1],argKartendeck[2+argSpieler],oSpiel,bDarfAufLeerenStapelZiehen); //Muss noch geändert werden (!)
	var iAnzahlderMoeglichenZuege = aMoeglicheZuege.length;
	
	protokoll("logik_ki3_n1: Ebene:"+argEbene+" Anzahl der Möglichkeiten:"+iAnzahlderMoeglichenZuege);
	
	if(iAnzahlderMoeglichenZuege==1){
			//Zug daten
		var sAusgangsBankkarte = argKartendeck[1][ aMoeglicheZuege[0][1] ];
		var aAusgangsBankstich = argBankstiche[aMoeglicheZuege[0][1]];
		var sAusgangsSpielerkarte = argKartendeck[2+argSpieler][ aMoeglicheZuege[0][0] ];
		
		if(sAusgangsBankkarte!==""){
			var oAusgangsBankkarte = oSpiel.create_karte(argKartendeck[1][ aMoeglicheZuege[0][1] ]);
			var oAusgangsBankstich = oSpiel.create_stich(argBankstiche[aMoeglicheZuege[0][1]]);
			sBankStapelwert=oAusgangsBankstich.get_punkte();
			sBankStapelDeckkartenStaerke=oAusgangsBankkarte.get_staerke();
			sBankDeckkartenfarbe=oAusgangsBankkarte.get_farbe();
		} else {
			var sBankStapelwert=0;
			var sBankStapelDeckkartenStaerke=0;
			var sBankDeckkartenfarbe=" ";
		}
		var oAusgangsSpielerkarte = oSpiel.create_karte(argKartendeck[2+argSpieler][ aMoeglicheZuege[0][0] ]);

		//lokale Nützlichkeit des Zuges
		var iLokaleNuetzlichkeit =	logik_ki2_wertungsfunktion(oSpiel,oAusgangsSpielerkarte.get_staerke(),oAusgangsSpielerkarte.get_augenzahl(),sBankStapelwert,sBankStapelDeckkartenStaerke,oAusgangsSpielerkarte.get_farbe(),sBankDeckkartenfarbe)
		//logik_ki3_wertungsfunktion(oSpiel, oAusgangsSpielerkarte, oAusgangsBankstich,oAusgangsBankkarte); // (oSpiel,oSpielerkarte,oBankstich,oBankkarte)
									
		
		return new Array(new Array(aMoeglicheZuege[0],iLokaleNuetzlichkeit));
	}

	//Für jeden Zug berechnen
	for(var i=0;i<iAnzahlderMoeglichenZuege;i++){


		//Zug daten
		var sAusgangsSpielerkarte = argKartendeck[2+argSpieler][ aMoeglicheZuege[i][0] ];
		var sAusgangsBankkarte = argKartendeck[1][ aMoeglicheZuege[i][1] ];
		var aAusgangsBankstich = argBankstiche[aMoeglicheZuege[i][1]].slice(0);

		
		if(argKartendeck[1][ aMoeglicheZuege[i][1] ]!==""){
			var oAusgangsBankkarte = oSpiel.create_karte(argKartendeck[1][ aMoeglicheZuege[i][1] ]);
			var oAusgangsBankstich = oSpiel.create_stich(argBankstiche[aMoeglicheZuege[i][1]]);
			sBankStapelwert=oAusgangsBankstich.get_punkte();
			sBankStapelDeckkartenStaerke=oAusgangsBankkarte.get_staerke();
			sBankDeckkartenfarbe=oAusgangsBankkarte.get_farbe();
		} else {
			var sBankStapelwert=0;
			var sBankStapelDeckkartenStaerke=0;
			var sBankDeckkartenfarbe=" ";
		}
		var oAusgangsSpielerkarte = oSpiel.create_karte(argKartendeck[2+argSpieler][ aMoeglicheZuege[i][0] ]);

		//lokale Nützlichkeit des Zuges
		var iLokaleNuetzlichkeit =	logik_ki2_wertungsfunktion(oSpiel,oAusgangsSpielerkarte.get_staerke(),oAusgangsSpielerkarte.get_augenzahl(),sBankStapelwert,sBankStapelDeckkartenStaerke,oAusgangsSpielerkarte.get_farbe(),sBankDeckkartenfarbe)
		//var iLokaleNuetzlichkeit = logik_ki3_wertungsfunktion(oSpiel, oAusgangsSpielerkarte, oAusgangsBankstich,oAusgangsBankkarte); // (oSpiel,oSpielerkarte,oBankstich,oBankkarte)
			
		//die globalen Nützlichkeiten der möglichen Folgezüge, wenn es eine Rekursionsstufe gibt!
		
		//								dies gibt die rekursionsstufe an
		//									|-------|  
		if( bKeinNaechsterSpieler===false && argEbene<1 &&   ( ( argEbene>0 && argStartspieler!=argSpieler) || (argEbene==0 && argStartspieler==argSpieler))  ){
		
			//Deck verändnern d.h. Zug ausführen
			
			//Wenn die Spielerkarte der Möller ist || die Karte größer als die angepeilte ist bei gleicher farbe || wenn die bankkarte kein trumpf ist und die spielerkarte trumpf
			if( typeof(oAusgangsBankstich)=="object")
			{
				if( (oAusgangsSpielerkarte.ist_moeller()) || 
					(oAusgangsSpielerkarte.get_farbe()==oAusgangsBankkarte.get_farbe() && oAusgangsSpielerkarte.get_staerke()>oAusgangsBankkarte.get_staerke()) ||
					(oAusgangsSpielerkarte.get_farbe()!=oAusgangsBankkarte.get_farbe() && oAusgangsSpielerkarte.ist_trumpf()) ){
					
					//Stich einziehen
					
						//Stich löschen
						argBankstiche[aMoeglicheZuege[i][1]]=new Array();
						//Bankkarte löschen
						argKartendeck[1][ aMoeglicheZuege[i][1] ]="";
						//Spielerkarte löschen
						argKartendeck[2+argSpieler][ aMoeglicheZuege[i][0] ]="";

				} else {
				
					//Karte auf den Bankstapel ablegen
					
						//Spielerkarte auf den Bankstapel legen
						argBankstiche[aMoeglicheZuege[i][1]].push(sAusgangsSpielerkarte);
						//Bankkarte ersetzen
						argKartendeck[1][ aMoeglicheZuege[i][1] ]=sAusgangsSpielerkarte;
						//Spielerkarte löschen
						argKartendeck[2+argSpieler][ aMoeglicheZuege[i][0] ]="";
						
				}
			} else { // Sonst

				//Karte auf den Bankstapel ablegen

					//Spielerkarte auf den Bankstapel legen
					argBankstiche[aMoeglicheZuege[i][1]].push(sAusgangsSpielerkarte);
					//Bankkarte ersetzen
					argKartendeck[1][ aMoeglicheZuege[i][1] ]=sAusgangsSpielerkarte;
					//Spielerkarte löschen
					argKartendeck[2+argSpieler][ aMoeglicheZuege[i][0] ]="";
				
			}
					
			//Das veränderte Deckt der Funktion rekursiv übergeben mit neuer Ebene
			// ABBRUCH: 	kein neuer Spieler!
			//				zu tiefe ebene
			//				bank leer aber es darf nicht auf den leeren stapel gelegt werden, dann können gar keine vorhersagen mehr gemacht werden
			

			
			var aGlobaleNuetzlichkeitenderFolgezuege = logik_ki3_02_n1(iNaechsterSpieler, argEbene+1, argKartendeck, argBankstiche, oSpiel, argStartspieler,iNachziehkarten);
		
	
		
			//Den zug wieder rückgängi machen
			argKartendeck[1][ aMoeglicheZuege[i][1] ] = sAusgangsBankkarte;
			argBankstiche[aMoeglicheZuege[i][1]] = aAusgangsBankstich;
			argKartendeck[2+argSpieler][ aMoeglicheZuege[i][0] ] = sAusgangsSpielerkarte;
		
		} else {
			var aGlobaleNuetzlichkeitenderFolgezuege=new Array(new Array(0,1)); //falls keine tiefere Rekursion erlaubt ist
		}
			
		var diGlobaleNuetzlichkeitenderFolgezuege=0;
		
		//protokoll("logik_ki3_n1: Globale Nützlichkeit der Folgezuege("+aGlobaleNuetzlichkeitenderFolgezuege.length+"):"+aGlobaleNuetzlichkeitenderFolgezuege.join("/"));
		
		//die globale Nützlichkeit der Folgezüge hinzurechnen
		for(var j=0;j<aGlobaleNuetzlichkeitenderFolgezuege.length;j++){
			if(argSpieler==argStartspieler)diGlobaleNuetzlichkeitenderFolgezuege= diGlobaleNuetzlichkeitenderFolgezuege + (0.1*(aGlobaleNuetzlichkeitenderFolgezuege[j][1] / aGlobaleNuetzlichkeitenderFolgezuege.length));
			else diGlobaleNuetzlichkeitenderFolgezuege= diGlobaleNuetzlichkeitenderFolgezuege + (0.1*(1 / (aGlobaleNuetzlichkeitenderFolgezuege[j][1]*aGlobaleNuetzlichkeitenderFolgezuege.length)));
		}
		
		//die lokale Nützlichkeiten zur globalen Nützlichkeit dieses Zuges hinzurechnen
		var iGlobaleNuetzlichkeitdesZuges = iLokaleNuetzlichkeit+diGlobaleNuetzlichkeitenderFolgezuege;
			
		//Diesen Zug mit seiner Nützlichkeit speichern
		aZuegeMitBewertung.push([aMoeglicheZuege[i],iGlobaleNuetzlichkeitdesZuges]);
		
		//protokoll("logik_ki3_n1: Nützlichkeit des Zuges "+aMoeglicheZuege[i]+" ist "+iGlobaleNuetzlichkeitdesZuges+".");

		//Prüfen ob damit ein neues Maximum erreicht wurde, dann ggf. hochsetzen		
		if(iMaximaleNuetzlichkeit<iGlobaleNuetzlichkeitdesZuges)iMaximaleNuetzlichkeit=iGlobaleNuetzlichkeitdesZuges;
	}
	
	//Die Züge nach der besseren Hälfte aussortieren
	var iHalbeNuetzlichkeit=iMaximaleNuetzlichkeit/2;
	var aEndgueltigeZuegeMitBewertung = new Array();
	for(var i=0;i<aZuegeMitBewertung.length;i++){
		if(aZuegeMitBewertung[i][1]>=iHalbeNuetzlichkeit)aEndgueltigeZuegeMitBewertung.push(aZuegeMitBewertung[i]);
	}

	//die übriggebliebene bessere Hälfte übergeben
	
	protokoll("logik_ki3_n1: "+argEbene+" Beste Hälfte der Züge:"+aEndgueltigeZuegeMitBewertung.join("/"));

	return aEndgueltigeZuegeMitBewertung;

};

/*
function logik_ki3(argSpiel,argSpielernummer) // Laura (4d4D-kI)
{

	//Kopie aller offenen Karten, die als Referenz übergeben wird
	var aKartendeck =	[
							//Bank
							[
								argSpiel.bank().get_offene_karten(), //Oberste Karten
								[argSpiel.bank().bankstapel(0).get_offenen_stich().get_punkte(),argSpiel.bank().bankstapel(1).get_offenen_stich().get_punkte(),argSpiel.bank().bankstapel(2).get_offenen_stich().get_punkte()]	//Punkten der Stiche
							],
							//Spieler 1 Offene Karten
							argSpiel.spieler(0).get_offene_karten(),
							//Spieler 2 Offene Karten
							argSpiel.spieler(1).get_offene_karten(),
							//Spieler 3 Offene Karten
							argSpiel.spieler(2).get_offene_karten()
	
						];
	
	//Startspieler
	var iStartspieler = argSpielernummer;
	
	//Alle Möglichen Züge, die der Spieler machen können, werden ermittelt ohne, dass man sie auswertet
	var aKarten = logik_ki3_moegliche_zuege(aKartendeck[0][1],aKartendeck[argSpielernummer+1],argSpiel,true);
	//protokoll("logik_ki3: Alle Kombinationen:"+aKarten.join("/"));
	
	//Wenn es nur eine Möglichkeit gibt, braucht man nicht zu rätseln, welche die beste ist.
	if(aKarten.length==1){
		//protokoll("logik_ki: Gezwungene Entscheidung nach Indizes:"+aKarten[0][0]+" auf "+aKarten[0][1][0]);
		return new Array(aKarten[0][0],aKarten[0][1]);
	}
	
	//protokoll("logik_ki3: Alle Kombinationen:"+aKarten.join("/"));
	
	//Bewertung der Züge, die der Spieler machen kann,
	var aBewertung = new Array();
	for(var i=0;i<aKarten.length;i++){
		//wobei die neue Bewertungsfunktion rekursiv weitere mögliche Züge ableitet und deren Wert berechnet und nach der 4. Rekursion endet!
		aBewertung.push(logik_ki3_n1(new Array(aKarten[i][0],aKarten[i][1]),iStartspieler,1,aKartendeck,argSpiel));
	}

	//Anzahl der Äste pro Ebene heraussuchen
	aAnzahlderAeste=logik_ki3_aestezahl(aBewertung);
		
	//Berechnen der Pfade
	aPfadwerte = logik_ki3_pfadwerte(aAnzahlderAeste,aBewertung,0);
	
	//Den Zug mit der besten Bewertung heraussuchen, bei gleichstand wähle durch Zufall
	iMaxWert=0;
	aMaxWertKoordinaten=new Array();
	
	for(var i=0;i<aPfadwerte.length;i++){
		diZugwert=aPfadwerte[i];
		if(diZugwert>iMaxWert)
		{
			aMaxWertKoordinaten=new Array();
			aMaxWertKoordinaten.push(new Array(i,j));
			iMaxWert=diZugwert;
			//protokoll("neuer Spitzenwert");
		}
		else
		{	//Wenn genau wie Maximaler Wert, dann bitte aufnehmen
			if(diZugwert==iMaxWert)
			{
				aMaxWertKoordinaten.push(new Array(i,j));
				//protokoll("genommen;")
			}
			else //Wenn kleinerer Wert, dann passiert nix
			{
				//protokoll("ignoriert;")
			}
		}
	}
	
	//Besten zurückgeben
	//return new Array(iSpielerstapelNummer,iBankstapelNummer);

	

}*/

/*********************************

	kI-Sammelobject

*********************************/

var o_kI_Engines = {
	"kI/Nora":logik_ki,
	"kI2/Clara":logik_ki2,
	"kI2_09/Laurina":logik_ki2_09, 
	"kI3/Laura":logik_ki3,
	"kI3_02/Laura":logik_ki3_02
};