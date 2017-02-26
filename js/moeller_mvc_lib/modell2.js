/**********************************

	Moeller Lib 2
		
	Modell-Schicht

**********************************/


/*****************************************************************

	Konstanten

*****************************************************************/

var MOE_VERSION = "0.4.1";
var MOE_DEVSTATUS = "α";

/*********************************

	Spielstatus

*********************************/

var MOE_STATUS_INITIALISIERT=0;
var MOE_STATUS_VORBEREITET=2;		//Es sin Karten gegeben.
var MOE_STATUS_SPIELT=5;			//Die Spieler ziehen abwechselnd
var MOE_STATUS_PAUSIERT=6;			//Keiner kann ziehen, aber es gibt einen aktuellen Spieler, der als snächstes zieht. Dieser wird vor der Pause gewählt.
var MOE_STATUS_ENDE=8;				//Niemand kann mehr ziehen. Das Spiel hat ein Ergebnis und einen Sieger. Es ist vorbei.

/*********************************

	Fehlerkonstanten

*********************************/	

var	MOE_FEHLER_NichtAktuellerSpielerMachtZug=1006;
var MOE_FEHLER_SpielerZiehtVonLeeremStapel=1007;
var	MOE_FEHLER_FalschBedient=1008;

/*********************************

	Zugarten

*********************************/

var MOE_ZUGART_VonStapelZuStapelGezogen=10001;
var MOE_ZUGART_KarteUndStapelAngeklickt=10002;
var MOE_ZUGART_ComputerZiehtEineKarte=  10002;

/*********************************

	Spielarten

*********************************/

var MOE_SPIELTYP_Video = 98;
var MOE_SPIELTYP_Tutorial = 99;
var MOE_SPIELTYP_Testspiel = 100;
var MOE_SPIELTYP_Ramsch = 101;
var MOE_SPIELTYP_KeinRamsch = 102;
var MOE_SPIELTYP_WildesSpiel = 103;

/*****************************************************************

	Spielvariablen

*****************************************************************/

/*****************************************************************

	Kartendecks

*****************************************************************/

/*********************************

	Standard-Karteblatt
	
	Fasst alle Eigenschaften für
	das Kartenblatt zusammen. Es
	erstellt auch die Stapel usw.
 
 *********************************/

bobj = function(argFarben,argBilder,argStaerke,argAugenzahlen,argMultiplikator)
{
	var aFarben = argFarben;
	var aBilder = argBilder;
	var aStaerke = argStaerke;
	var aWertigkeit = argAugenzahlen;
	var iMultiplikator = argMultiplikator;
	var sMoeller = "";
	var aAlleKarten = new Array();
	
	this.create_karte = function(argName){
		var diIstMoeller=0;
		if(argName==sMoeller)diIstMoeller=1;
		return new kobj(argName);
	};
	
	function get_farbe(argName){
		return argName[0];
	}
	
	function get_bild(argName){
		return argName[1];
	}
	
	this.get_staerke = function(argName){
		return aStaerke[get_bild(argName)];
	};
	
	this.get_augenzahl = function(argName){
		return aWertigkeit[get_bild(argName)];
	};
	//
	
	function create_alle_karten()
	{
		aAlleKarten=new Array();
		for(var i=0;i<iMultiplikator;i++){
			for(var j=0;j<aFarben.length;j++){
				for(var k=0;k<aBilder.length;k++){
					aAlleKarten.push(aFarben[j]+aBilder[k]);
				}
			}
		}
	}
	
	this.get_ungmscht_stapel = function()
	{
		if(aAlleKarten.length==0)create_alle_karten();
		return aAlleKarten;
	};

	this.get_alle_farben = function(){
		var daFarben = new Array();
		return daFarben.concat(aFarben);
	}

	this.get_moeller_staerke = function(){
		return aStaerke["M"];
	};
}

/********************************************

	Standardprotokoll Wertobjekt Zug (zobj)		
	
********************************************/

function zobj(argSpielernummer,argSpielerstapel,argBankstapel,argSpielerkarte,argObersteBankkarte)
{
	//if(typeof(argSpielernummer)!="number" || typeof(argSpielerstapel)!="number" || typeof(argBankstapel)!="number" || typeof(argSpielerkarte)!="string" || typeof(argObersteBankkarte)!="string")throw "Das Zugobjekt wurde nicht richtig initialisiert:"+(new Array(argSpielernummer,argSpielerstapel,argBankstapel,argSpielerkarte,argObersteBankkarte));		
	if(typeof(argSpielernummer)!="number")throw "Das Zugobjekt wurde nicht richtig initialisiert:"+(new Array(argSpielernummer,argSpielerstapel,argBankstapel,argSpielerkarte,argObersteBankkarte));		
	
	this.iSpielernummer=argSpielernummer;
    this.bDarfStapelDrehen=false;
	this.iSpielerstapel=argSpielerstapel;
	this.iBankstapel=argBankstapel;
	this.sSpielerkarte=argSpielerkarte;
	this.sObersteBankkarte=argObersteBankkarte;

	this.errornr=0;


	this.iNaechsterSpielernummer=0;
    this.sNaechsterSpielertyp=0;
    this.bNaechsterSpielerDarfDrehen=false;
	
	this.bMussNehmen=false;
	this.aGezogenerStich=new Array();
	
	this.bSpielerHatNachgezogen=false;
	this.aNachgezogenerKartenstapel=new Array();
	
	this.bSpielerstapelGedreht=false;
	this.sUmgedrehteKarte = "";
	
	this.bBankHatNachgezogen=false;
	this.aNachgezogenerBankstapel=new Array();
	
	this.bBankstapelGedreht=false;
	this.aUmgedrehterStapel = new Array();
	
	this.aOffeneKarten;
	
	this.set_spieler_nimmt_stich = function(argStich){
		this.bMussNehmen=true;
		this.aGezogenerStich=argStich.get_stapel();
	};
	
	this.set_spieler_zieht_nach = function(argStapel){
		if(this.bSpielerstapelGedreht===false){									//Nur wenn ein Spieler nicht den eigenen Stapel gedreht hat, darf nachgezogen werden
			this.bSpielerHatNachgezogen=true;
			this.aNachgezogenerKartenstapel=argStapel.get_stapel();
		} else throw 1001;
	};
	
	this.set_spieler_dreht_um = function(argKartenname){
		if(this.bSpielerHatNachgezogen===false){								//Nur wenn ein Spieler nicht nachgezogen hat, darf er den Stapel drehen!
			this.bSpielerstapelGedreht=true;
			this.sUmgedrehteKarte = argKartenname;
		} else throw 1002;
	};
	
	this.set_bank_zieht_nach = function(argStapel){
		if(this.bBankstapelGedreht===false){
			this.bBankHatNachgezogen=true;
			this.aNachgezogenerBankstapel=argStapel.get_stapel();
		}
	};
	
	this.set_bank_dreht_um = function(argStapel){
		if(this.bBankHatNachgezogen===false){								//Nur wenn ein Spieler nicht nachgezogen hat, darf er den Stapel drehen!
			this.bBankstapelGedreht=true;
			this.aUmgedrehterStapel = argStapel;
		} else throw 1002;
	}		;

	this.get_genommenen_stich = function(){
		if(this.aGezogenerStich.length>0)return new stobj(this.aGezogenerStich);
		else return false;
	};
	
	this.get_nachgezogenen_kartenstapel = function(){
		if(this.aNachgezogenerKartenstapel.length>0)return new kstobj(this.aNachgezogenerKartenstapel[0],this.aNachgezogenerKartenstapel[1]);
		else return false;
	};
	
	this.get_umgedrehte_karte = function(){
		if(this.sUmgedrehteKarte!="") return new kobj(this.sUmgedrehteKarte);
		else return false;
	};
	
	this.get_nachgezogenen_bankstapel = function(){
		if(this.aNachgezogenerBankstapel.length>0)return new bstobj(new stobj(this.aNachgezogenerBankstapel[0]),new stobj(this.aNachgezogenerBankstapel[1]));
		else return false;
	};

	this.get_umgedrehten_stapel = function(){
		if(this.aUmgedrehterStapel.length>0)return new stobj(this.aUmgedrehterStapel);
		else return false;			
	};

	this.set_offene_karten = function(argOffeneKarten){
		if(typeof(this.aOffeneKarten)=="undefined"){
			this.aOffeneKarten=argOffeneKarten;
		}
	};
	
	this.get_offene_karten = function(){
		return this.aOffeneKarten;
	};
}

/*****************************************************************

	ObjekteS

*****************************************************************/

/* Startwerte, müssen vom Server gegeben werden */

init_oBlatt = new bobj(["e","g","h","s"],["9","t","U","O","K","A"],{ "M":7 ,"A": 6, "K": 5, "O": 4, "U": 3, "t": 2, "9": 1 },{ "A": 11, "K": 4, "O": 3, "U": 2, "t": 10, "9": 0 },2);

init_SpielID = 0;//ma_z_rand(0,1000000000000);


/* Das Spielobjekt */

spielobject = function(arg_SpielID,arg_oBlatt,argAlleSpieler)
{
	if(typeof(arg_SpielID)!="number" || typeof(arg_oBlatt)!="object" || typeof(argAlleSpieler)!="object")throw "Fehler: Spiel muss mit einer ID und einem Kartendeck und Mitspielern initialisiert werden!";
	var iSpielID = arg_SpielID;
	var Blatt = arg_oBlatt;
	var selbst = this;
	var aAlleSpieler = new Array();
	var Bank;
	var aStartNachziehstapel = new Array();
	var iAktuellerSpieler;
	var iSpielstatus=MOE_STATUS_INITIALISIERT;
	var iSpielModus = false;
	var iGeber;
	var iAnzahlDerSpieler = argAlleSpieler.length;
	
	
	/*********************************

		Object Values

	*********************************/

	/********************************

		Moelleronjekt Moeller
		
		Speichert den Moeller eines
		Spieles.

	*********************************/
	
	mobj = function(){
		
		var sMoeller="";
	
		this.set_moeller = function(argMoellerName){
			if(sMoeller==""){
				sMoeller=argMoellerName;
				return true;
			}
			else{
				return false;
			}
		}
		
		this.ist_moeller = function(argName){
			if(sMoeller==argName){
				return true;
			}
			else{
				return false;
			}
		}
		
		this.get_moeller = function(){
			return sMoeller;
		}
	
		this.get_trumpffarbe = function(){
			if(sMoeller=="")return false;
			else return sMoeller[0];
		}
	}
	
	var Moeller = new mobj();

	/********************************

		Kartenobjekt kobj
		
		Kapselt diverse Methoden und 
		Funktionen zu Karten und
		reicht diese an Das Blatt weiter

	*********************************/

	/*	Kartenobjekt  */
	
	kobj = function(argName)
	{
		var sName = argName;
		var sFarbe = argName[0];
		var sBild = argName[1];
		var iStaerke = Blatt.get_staerke(argName);
		var iAugenzahl = Blatt.get_augenzahl(argName);
		var bIstMoeller = Moeller.ist_moeller(argName);
		var karte_selbst = this;
		
		this.get_type = function(){
			return "kobj";
		}
		
		this.ist_moeller = function(){
			return bIstMoeller;
		}
		
		this.get_name = function(){
			return sName;
		}
		
		this.get_staerke = function(optOhneMoellerStaerke){
			if(optOhneMoellerStaerke!==true)optOhneMoellerStaerke=false;
			if(karte_selbst.ist_moeller() && !optOhneMoellerStaerke)return Blatt.get_moeller_staerke();
			else return iStaerke;
		}
		
		this.get_augenzahl = function(){
			return iAugenzahl;
		}
		
		this.get_farbe = function(){
			return sFarbe;
		}
		
		this.get_bild = function(){
			return sBild;
		}
		
		this.ist_trumpf = function(){
			dsMoeller = Moeller.get_moeller();
			//protokoll("ist_trumpf(): Farbe der Karte("+sFarbe+") Farbe des Moeller("+dsMoeller[0]+") und dsMoeller("+dsMoeller+")");
			if(dsMoeller!="")
			{
				if(sFarbe==dsMoeller[0])return true;
			}
			return false;
		}

	}

	/*	Kartenobjekt test */

	/***********************************

		Stichobjekt kobj

		Verwaltet Stiche als Reihe von
		Karten, die über Punkte und
		einige Spielmechaanik verfügen

	************************************/

	/* Stichobjekt stobj */

	stobj  = function(argKarten,argPunkte)
	{
		var aKarten = new Array();
		var iAugenzahl = 0;

		if(typeof(argKarten)!="undefined" && typeof(argPunkte)!="undefined")
		{
			aKarten=argKarten;
			iAugenzahl=argPunkte;
		}
		else
		{
			if(typeof(argKarten)!="undefined" && typeof(argPunkte)=="undefined"){
				for(i=0;i<argKarten.length;i++)
				{
					var doTemp = new kobj(argKarten[i]);
					aKarten.push(argKarten[i]);
					iAugenzahl = iAugenzahl + doTemp.get_augenzahl();
					delete doTemp;
				}
			}
		}

		this.ist_leer = function(){
			if(aKarten.length==0)return true;
			else return false;
		}

		this.karte_auflegen = function(argKarte)
		{
			var doTemp = argKarte;
			//doTemp = new kobj(argKarte.get_name());
			aKarten.push(doTemp.get_name());
			iAugenzahl = iAugenzahl + doTemp.get_augenzahl();
			delete doTemp,argKarte;
		}

		this.get_stapel = function(){
			return aKarten.slice(0);
		}

		this.get_punkte = function(){
			return iAugenzahl;
		}

		this.get_kartenanzahl = function(){
			return aKarten.length;
		}

		this.get_oberste_karte = function(){
			return new kobj(aKarten[aKarten.length-1]);
		}

		this.stapel_auflegen = function (argKarten,argPunkte){
			if(typeof(argKarten)!="undefined" && typeof(argPunkte)=="undefined"){
				for(i=0;i<argKarten.length;i++)
				{
					doTemp = new kobj(argKarten[i]);
					aKarten.push(argKarten[i]);
					iAugenzahl = iAugenzahl + doTemp.get_augenzahl();
					delete doTemp;
				}
			}
			else
			{
				aKarten=aKarten.concat(argKarten);
				iAugenzahl=iAugenzahl+argPunkte;
			}
		}

		this.kopie = function()
		{
			return new stobj(aKarten,iAugenzahl);
		}
	}

	/*************************************************

		Wertobjekt Kartenstapel (kstobj)

		Er kann erzeugt und leer geräumt werden.
		Dann muss ein neuer Kartenstapel erzeugt
		werden.

	*************************************************/

	/* Der Kartenstapel, dessen die Spieler drei auf ihrem Blatt haben */

	kstobj = function(argUntereKarte,argObereKarte)
	{
		if(typeof(argUntereKarte)!="string" || typeof(argObereKarte)!="string" )throw "Kartenstapel müssen mit Strings initialisiert werden.";
		var sObereKarte=argObereKarte;
		var sUntereKarte=argUntereKarte;
		var bStapelIstLeer=false;
		var bStapelIstGedreht=false;

		if(argUntereKarte=="" && argObereKarte!="" )
		{
			//protokoll("Kartenstapel wurde halb leer initialisiert! ("+argUntereKarte+","+argObereKarte+")");
			bStapelIstLeer=false;
			bStapelIstGedreht=true;
		}
		else
		{
			if(argUntereKarte=="" && argObereKarte=="" )
			{
				///protokoll("Kartenstapel wurde leer initialisiert! ("+argUntereKarte+","+argObereKarte+")");
				var bStapelIstLeer=true;
				var bStapelIstGedreht=true;
			}
			else
			{
				if(argUntereKarte!="" && argObereKarte=="")throw "Kartenstapel müssen vollständig oder umgereht initialisiert werden.";
				//else protokoll("Kartenstapel wurde voll initialisiert! ("+argUntereKarte+","+argObereKarte+")");
			}
		}

		function stapel_umdrehen(){
			var sTempKarte = sObereKarte;
			sObereKarte = sUntereKarte;
			sUntereKarte = sTempKarte;
			bStapelIstGedreht=true;
			//protokoll("Stapel wird umgedreht.");
		}

		this.karte_nehmen = function(){
			if(bStapelIstLeer==false)
			{
				var sTempKarte = sObereKarte;
				sObereKarte="";
				//protokoll("Spieler will eine Karte nehmen. Der Stapel wurde "+(bStapelIstGedreht?"schon":"noch nicht")+" gedreht.");
				if(bStapelIstGedreht==false){
					stapel_umdrehen();
				}
				else{
					bStapelIstLeer=true;
					//protokoll("Jetzt wird der Stapel leer? "+bStapelIstLeer+".");
				}
				return new kobj(sTempKarte);
			}
			else return false;
		}

		this.get_stapel = function(){
			return new Array(sUntereKarte,sObereKarte);
		}

		this.ist_leer = function(){
			return bStapelIstLeer;
		}

		this.get_obere_karte = function()
		{
			return new kobj(sObereKarte);
		}
	}


	/**********************************************

		Wertobjekt Bankstapel (bstobj)

	**********************************************/

	bstobj = function(argOffenerStich,argVerdeckterStich)
	{
		var oOffenerStich;
		var oVerdeckterStich;
		var iBankStapelLeer;
		var iHatGeradeGedreht=0; // 0 hat noch nicht gedreht, 1 hat gerade gedreht, 2 kann nicht mehr gedreht werden --> wird, wenn gedreht wurde und dann wenn eine Karte gelegt wurde, je einmal weitergeschaltet

		if(typeof(argOffenerStich)!="undefined" && typeof(argVerdeckterStich)!="undefined")
		{
			oOffenerStich=argOffenerStich.kopie();
			oVerdeckterStich=argVerdeckterStich.kopie();
		}
		else
		{
			//protokoll("Fehler: Ein Bankstapel konnte nicht ordentlich initalisiert werden.");
		}

		this.ist_drehbar = function(){
			if(oVerdeckterStich.get_stapel().length==0)return false;
			else return true;
		}

		this.ist_leer = function(){
			if(oVerdeckterStich.get_stapel().length==0 && oOffenerStich.get_stapel().length==0)return true;
			else return false;
		}

		this.drehen = function(){
			if(this.ist_drehbar()){
				var doTempBankStich = oVerdeckterStich.kopie();
				oVerdeckterStich = oOffenerStich.kopie();
				oOffenerStich = doTempBankStich;
				if(iHatGeradeGedreht==0)iHatGeradeGedreht=1;
			}
		}

		this.hat_gerade_gedreht = function(){
			if(iHatGeradeGedreht==1)return true;
			else false;
		}

		this.get_offenen_stich = function(){
			return oOffenerStich.kopie();
		}

		this.get_offene_karte = function(){
			return new kobj(oOffenerStich.get_oberste_karte().get_name());
		}

		this.stich_nehmen = function(){
			var doTempStich = oOffenerStich.kopie();
			oOffenerStich = new stobj();
			this.drehen();
			return doTempStich;
		}

		this.karte_legen = function(argKarte){
			if(typeof(argKarte)=="object"){
				oOffenerStich.karte_auflegen(argKarte);
				if(iHatGeradeGedreht==1)iHatGeradeGedreht=0;
			}
			else throw "Es wurde kein Kartenobjekt auf den Stapel gelegt";
		}

		this.spieler_muss_nehmen = function(argName){
			if(argName!="" && !iBankStapelLeer){
				var doTestKarte = new kobj(argName);
				// Wenn die oberste Karte der Moeller ist, wenn die oberste Karte bei gleicher Farbe stärker ist, wenn die oberste Karte bei unterschiedlichen farben trumpf ist
				if(doTestKarte.ist_moeller() && !oOffenerStich.ist_leer())return true;
				if(oOffenerStich.ist_leer())return false;
				if(doTestKarte.get_farbe() == oOffenerStich.get_oberste_karte().get_farbe() && doTestKarte.get_staerke() > oOffenerStich.get_oberste_karte().get_staerke())return true;
				if(doTestKarte.get_farbe() != oOffenerStich.get_oberste_karte().get_farbe() && doTestKarte.ist_trumpf())return true;

				return false;
				//throw "this.spieler_muss_nehmen: Eine der bisherigen Alternativen hätte angespielt werden müssen. M:"+doTestKarte.ist_moeller()+" Bank leer:"+oOffenerStich.ist_leer()+" gleiche Farbe:"+doTestKarte.get_farbe()+" == "+oOffenerStich.get_oberste_karte().get_farbe()+" ist Stärker:"+doTestKarte.get_staerke()+">"+oOffenerStich.get_oberste_karte().get_staerke()+" ist Trumpf:"+doTestKarte.ist_trumpf();
				//return void 1;
			} else {
				if(argName=="") throw "this.spieler_muss_nehmen: Mit einer leeren Karte kann kein Test durchgeführt werden.";
				else return false;
			}
		}

		this.kopie = function()
		{
			return new bstobj(oOffenerStich.kopie(),oVerdeckterStich.kopie());
		}
		/* Man kann keine Stiche auf den Stapel legen */

		/*
		this.stich_legen = function(argStich){
			if(typeof(argStich)=="object"){
				oOffenerStich.stapel_auflegen(argStich.get_stapel());
			}
			else return false;

		}*/

		this.get_stapel = function(){
			return new Array(oOffenerStich.get_stapel(),oVerdeckterStich.get_stapel());
		}

	}


	/**********************************************

		Wertobjekt Nachziehstapel (nzstbj)

	**********************************************/

	nzstobj = function()
	{
		var aKartenStapel = new Array();
		var nzstobj_selbst = this;

		this.generiere_spielstapel = function(){
			if(aKartenStapel.length==0){
				var daKartenStapel = Blatt.get_ungmscht_stapel();
				daKartenStapel.shuffle();
				for(i=0;i<daKartenStapel.length;i++){
				//for(var i=0;i<26;i++){
					aStartNachziehstapel.push(daKartenStapel[i]);
					aKartenStapel.push(daKartenStapel[i]);
					//protokoll("generiere_spielstapel: karte:"+daKartenStapel[i]+" Nummer:"+i);
				}
			}
		}

		this.get_stapel = function(){
			return aKartenStapel;
		}

		this.ziehe_karte = function(){
			 var sObersteKarte = aKartenStapel[0];
			 aKartenStapel.shift();
			 return new kobj(sObersteKarte);
		}

		this.ziehe_kartenstapel = function(){
			sObereKarte=aKartenStapel[1];
			sUntereKarte=aKartenStapel[0];
			aKartenStapel.shift();aKartenStapel.shift();
			return new kstobj(sUntereKarte,sObereKarte);
		}

		this.ziehe_bankstapel = function(){
			var sObereKarte=aKartenStapel[1];
			var sUntereKarte=aKartenStapel[0];
			aKartenStapel.shift();aKartenStapel.shift();
			return new bstobj(new stobj(new Array(sObereKarte)),new stobj(new Array(sUntereKarte)));
		}

		this.ist_leer = function(){
			if(aKartenStapel.length==0)return true;
			else return false;
		}

		this.set_moeller = function(){
			if(Moeller.get_moeller()==""){
				Moeller.set_moeller(nzstobj_selbst.ziehe_karte().get_name());
				aKartenStapel.push(Moeller.get_moeller());
				return true;
			}
			return false;
		}

		this.get_aktuelle_kartenzahl = function(){
			return aKartenStapel.length;
		}


	}

	/******************************************************************

		Objekt

	*******************************************************************/

	/**********************************************

		Objekt Bank (bankobj)

	**********************************************/

	function bankobj(argErsterBankStapel,argZweiterBankStapel,argDritterBankStapel)
	{
		selbst_Bank = this;

		if(typeof(argErsterBankStapel)=="undefined" || typeof(argZweiterBankStapel)=="undefined" || typeof(argDritterBankStapel)=="undefined")throw "Fehler:Bank ohne Bankstapel initialisiert.";
		var aAlleBankstapel = new Array(argErsterBankStapel.kopie(), argZweiterBankStapel.kopie(), argDritterBankStapel.kopie());



		this.get_offene_karten = function(){
			var daArray = new Array();
			for(i=0;i<3;i++){
				if(!aAlleBankstapel[i].ist_leer()){daArray.push(aAlleBankstapel[i].get_offene_karte().get_name());}
				else {daArray.push("");}
			}
			return daArray;
		}

		this.bankstapel = function(argStapelnummer){
			if(typeof(argStapelnummer)=="number" && argStapelnummer>=0 && argStapelnummer<3){
				return aAlleBankstapel[argStapelnummer];
			}
		}

		this.get_stapel = function(){
			var daArray = new Array();
			for(i=0;i<3;i++){
				var daVordererStapel = aAlleBankstapel[i].get_offenen_stich().get_stapel();
				aAlleBankstapel[i].drehen();
				daArray.push(new Array(daVordererStapel,aAlleBankstapel[i].get_offenen_stich().get_stapel()));
				aAlleBankstapel[i].drehen();
			}
			return daArray;
		}

		this.ziehe_neuen_bankstapel = function(argStapelnummer,argNeuerStapel){
			if(typeof(argStapelnummer)=="number" && argStapelnummer>=0 && argStapelnummer<3 && typeof(argNeuerStapel)=="object"){
				aAlleBankstapel[argStapelnummer] = argNeuerStapel;
				//protokoll("Stapel "+argStapelnummer+":"+argNeuerStapel.get_offene_karte().get_name());
			}
			else throw "Beim Nachziehen wurden falsche Datentypen übergeben";
		}

		this.get_farben_offener_karten = function(){
			var aOffeneKarten = selbst_Bank.get_offene_karten();
			//protokoll("[Bank].get_offene_karten: Offene Karten:"+aOffeneKarten);
			var iAnzahlDerKarten = aOffeneKarten.length;
			var aAlleFarben = Blatt.get_alle_farben();
			var iAnzahlDerFarben = aAlleFarben.length;
			var aFarbvektor = new Array();
			for(var i=0;i<iAnzahlDerFarben;i++){
				aFarbvektor.push(0);
				for(var j=0;j<iAnzahlDerKarten;j++){
					if(aAlleFarben[i]==aOffeneKarten[j][0])aFarbvektor[i]++;
				}
			}
			//protokoll("[Bank].get_farben_offener_karten: Farbvektor:"+aFarbvektor);
			return aFarbvektor;
		}
	}



	/**********************************************

		Objekt Spieler (spielerobj)

	**********************************************/

	spielerobj = function(argSpielerID, argName, argErsterKartenstapel,argZweiterKartenstapel, argDritterKartenstapel)
	{

		if(typeof(argSpielerID)!="number" && typeof(argSpielerID)!="string" || typeof(argName)!="string" || typeof(argErsterKartenstapel)!="object" || typeof(argZweiterKartenstapel)!="object" || typeof(argDritterKartenstapel)!="object"){
			throw "Spieler falsch initialisiert.("+(new Array(argSpielerID,argName,argErsterKartenstapel,argZweiterKartenstapel,argDritterKartenstapel)+")");
		}
		var iSpielerID = argSpielerID;
		var aAlleKartenstapel = new Array(argErsterKartenstapel,argZweiterKartenstapel,argDritterKartenstapel);
		var oStichstapel = new stobj();
		if(typeof(argSpielerID)=="string")var sSpielertyp="kI";
		else var sSpielertyp = "Mensch";
		var sName = argName;
		var bHatEinmalBankGedreht=false;
		var Spieler_selbst = this;

		this.get_stapel = function(){
			return new Array(aAlleKartenstapel[0].get_stapel(),aAlleKartenstapel[1].get_stapel(),aAlleKartenstapel[2].get_stapel());
		}

		this.darf_stapel_drehen = function(){

			//Nur wenn mindestens ein Stapel drehbar ist, erhält er die Erlaubnis
			if(selbst.bank().bankstapel(0).ist_drehbar() || selbst.bank().bankstapel(1).ist_drehbar() || selbst.bank().bankstapel(2).ist_drehbar()){
				if(
					aAlleKartenstapel[0].get_obere_karte().get_bild()==aAlleKartenstapel[1].get_obere_karte().get_bild() &&
					aAlleKartenstapel[2].get_obere_karte().get_bild()==aAlleKartenstapel[1].get_obere_karte().get_bild() &&
					! bHatEinmalBankGedreht)
				{
					return true
				}
				else
				{
					var iStaerke1=0;var iStaerke2=0;var iStaerke3=0;
					if(!aAlleKartenstapel[0].ist_leer() && !aAlleKartenstapel[1].ist_leer())var iStaerke1=Math.abs(aAlleKartenstapel[0].get_obere_karte().get_staerke()-aAlleKartenstapel[1].get_obere_karte().get_staerke(true));
					if(!aAlleKartenstapel[2].ist_leer() && !aAlleKartenstapel[1].ist_leer())var iStaerke2=Math.abs(aAlleKartenstapel[2].get_obere_karte().get_staerke()-aAlleKartenstapel[1].get_obere_karte().get_staerke(true));
					if(!aAlleKartenstapel[0].ist_leer() && !aAlleKartenstapel[2].ist_leer())var iStaerke3=Math.abs(aAlleKartenstapel[0].get_obere_karte().get_staerke()-aAlleKartenstapel[2].get_obere_karte().get_staerke(true));
					var aDiffArray = new Array(iStaerke1,iStaerke2,iStaerke3);
					aDiffArray.sort(zus_lib_Numsort);
					sDiffs=aDiffArray.join(",");
					//protokoll("darf_stapel_drehen: Differenzarray:"+sDiffs);
					if(sDiffs == "1,1,2" && ! bHatEinmalBankGedreht)return true;
				}
			}
			return false;
		}

		this.karte_nehmen = function(argStapelnummer){
			if(typeof(argStapelnummer)=="number" && argStapelnummer>=0 && argStapelnummer<3){
				return aAlleKartenstapel[argStapelnummer].karte_nehmen();
			}
		}

		this.kartenstapel = function(argStapelnummer){
			if(typeof(argStapelnummer)=="number" && argStapelnummer>=0 && argStapelnummer<3){
				return aAlleKartenstapel[argStapelnummer];
			}
		}

		this.nimmt_stich = function(argStich){
			if(typeof(argStich)=="object")oStichstapel.stapel_auflegen(argStich.get_stapel(),argStich.get_punkte());
			else throw "Es wurde kein Stich übergeben!";
		}

		this.ablagestapel = function(){
			return oStichstapel;
		}

		this.get_spielerid = function(){
			return iSpielerID;
		}

		this.stapel_nachziehen = function(argStapelnummer,argKartenstapel){
			if(typeof(argKartenstapel)=="object" && typeof(argStapelnummer)=="number" && argStapelnummer>=0 && argStapelnummer<3){
				aAlleKartenstapel[argStapelnummer] = argKartenstapel;
			}
			else throw "Beim Nachziehen ist ein dicker Fehler aufgetreten!";
		}

		this.get_spielertyp = function(){
			return sSpielertyp;
		}

		this.get_name = function(){
			return sName;
		}

		this.get_spielerid = function(){
			return iSpielerID;
		}

		this.get_offene_karten = function(){
			return new Array(aAlleKartenstapel[0].get_stapel()[1],aAlleKartenstapel[1].get_stapel()[1],aAlleKartenstapel[2].get_stapel()[1]);
		}

		this.dreht_bankstapel = function(){
			bHatEinmalBankGedreht=true;
		}

		this.neuer_zug_beginnt = function(){
			bHatEinmalBankGedreht=false;
		}

		this.get_farben_offener_karten = function(){
			var aOffeneKarten = Spieler_selbst.get_offene_karten();
			var iAnzahlDerKarten = aOffeneKarten.length;
			var aAlleFarben = Blatt.get_alle_farben();
			var iAnzahlDerFarben = aAlleFarben.length;
			var aFarbvektor = new Array();
			for(var i=0;i<iAnzahlDerFarben;i++){
				aFarbvektor.push(0);
				for(var j=0;j<iAnzahlDerKarten;j++){
					//protokoll("[Spieler].get_farben_offener_karten: i:"+i+" Farbe:"+aAlleFarben[i]+"  j:"+j+" Spielerkarte:"+aOffeneKarten[j]);
					if(aAlleFarben[i]===aOffeneKarten[j][0] && !Moeller.ist_moeller(aOffeneKarten[j]) )aFarbvektor[i]++;
				}
			}
			//protokoll("[Spieler].get_farben_offener_karten: Farbvektor:"+aFarbvektor);
			return aFarbvektor;
		}
	}

	/******************************************************************************

		Öffentliche Spielfunktionen

	******************************************************************************/

	this.spieler = function(argSpielernummer){
		if(typeof(argSpielernummer)=="number" && argSpielernummer>=0 && argSpielernummer<aAlleSpieler.length){
			return aAlleSpieler[argSpielernummer];
		}
		else throw "Es wurde eine Spielernummer aufgerufen, die es gar nicht gibt :"+argSpielernummer;
	}

	this.bank = function(){
		return Bank;
	}

	this.blatt = function(){
		return Blatt;
	}

	this.moeller = function(){
		return Moeller;
	}

	this.get_startstapel = function(){
		return aStartNachziehstapel;
	}

	/******************************************************************************

		Öffentliche Spielservices

	******************************************************************************/

	this.karten_geben = function(){

		//Stapel initialisieren
		Nachziehstapel.generiere_spielstapel();

		//Die 24 Karten vom Stapel ziehen
		var aGeberKarten = new Array();
		for(var i=0;i<24;i++){
			aGeberKarten.push(Nachziehstapel.ziehe_karte());
		}

		// Moeller festlegen
		Nachziehstapel.set_moeller();


		// Nahch der Kartenstapel und Moeller erstell sind, ist das Spiel vorbereitet.
		iSpielstatus=MOE_STATUS_VORBEREITET;

		// im Gebeschema karten verteilen
		Bank.ziehe_neuen_bankstapel(
				0,
				new bstobj(
					new stobj(
						new Array(aGeberKarten[15].get_name()) //Offener Stapel kommt beim banbkstapel zuerst in der Definition. Die offene Karte wird aber beim geben als zweite gelegt
					),
					new stobj(
						new Array(aGeberKarten[3].get_name())
					)
				)
			);

		Bank.ziehe_neuen_bankstapel(
				1,
				new bstobj(
					new stobj(
						new Array(aGeberKarten[19].get_name()) //Offener Stapel kommt beim banbkstapel zuerst in der Definition. Die offene Karte wird aber beim geben als zweite gelegt
					),
					new stobj(
						new Array(aGeberKarten[7].get_name())
					)
				)
			);

		Bank.ziehe_neuen_bankstapel(
				2,
				new bstobj(
					new stobj(
						new Array(aGeberKarten[23].get_name()) //Offener Stapel kommt beim banbkstapel zuerst in der Definition. Die offene Karte wird aber beim geben als zweite gelegt
					),
					new stobj(
						new Array(aGeberKarten[11].get_name())
					)
				)
			);

		/* Ersten Spieler auswürfeln*/
		var iAnzahlDerSpieler = aAlleSpieler.length;
		var iGeber = ma_z_rand_intv_0e(iAnzahlDerSpieler-1);
		var iVorhand = rotate_clockwise(0,iAnzahlDerSpieler-1,iGeber);

		set_aktuellen_spieler(iVorhand);

		//Übersetzungsarray einfügen
		var aUebersetzer = new Array();
		var diSpielerzeiger=iGeber;
		for(var j=0;j<iAnzahlDerSpieler;j++){
			diSpielerzeiger=rotate_clockwise(0,iAnzahlDerSpieler-1,diSpielerzeiger);
			aUebersetzer.push(diSpielerzeiger);
		}

		for(var i=0;i<aAlleSpieler.length;i++){
			for(j=0;j<3;j++){
				//protokoll("karten_geben: Geberkarten: Index:"+(i+(j*4))+"/"+(i+(j*4)+12)+"  "+aGeberKarten.length+"");
				aAlleSpieler[aUebersetzer[i]].stapel_nachziehen(
					j,
					new kstobj(aGeberKarten[i+(j*4)].get_name(),aGeberKarten[i+(j*4)+12].get_name())
				);
			}
		}


		iSpielstatus=MOE_STATUS_SPIELT;

		return this.get_offene_karten();
	}

	/**
	 * Offene Kartensammeln und zurück geben!
	 *
	 * @returns {Array}
	 */

	this.get_offene_karten = function(bBedienpflichtFuerAktuellenSpieler){
		if(bBedienpflichtFuerAktuellenSpieler!==true)bBedienpflichtFuerAktuellenSpieler=false;
		var daOffeneKarten = new Array();

		//0 zuerst der Møller
		daOffeneKarten.push(Moeller.get_moeller());

		//1 dann die offenen Karten der Bank
		daOffeneKarten.push(Bank.get_offene_karten());

		//2,3,4 dann je ein Spieler
		for(i=0;i<aAlleSpieler.length;i++){
			daOffeneKarten.push(aAlleSpieler[i].get_offene_karten());
		}

		//5 dann die Punkte der offenen Bankstapel
		daOffeneKarten.push(new Array(
				Bank.bankstapel(0).get_offenen_stich().get_punkte(),
				Bank.bankstapel(1).get_offenen_stich().get_punkte(),
				Bank.bankstapel(2).get_offenen_stich().get_punkte()));

		//6 zuletzt die bedienpflciht

		//unterscheidung, wenn es beim bankdrehen um den aktuellen spieler geht
		if(bBedienpflichtFuerAktuellenSpieler===false)var iSpielernummer = selbst.get_naechsten_spieler();
		else var iSpielernummer = selbst.get_aktuellen_spieler();

		//nur wenn es überhaupt einen nächsten Spieler gibt, am Spielende darf kein Fehler auftreten
		if(iSpielernummer!==false)daOffeneKarten.push(get_bedienpflicht(iSpielernummer));

		return daOffeneKarten;
	}

	this.zug_machen = function(iSpielernummer, iSpielerstapel, iBankstapel){

		//Prüfung der Eingabe
		if(iSpielernummer != selbst.get_aktuellen_spieler()){
            var oNeuerZug = new zobj(iSpielernummer,iSpielerstapel,iBankstapel,"","");
            oNeuerZug.errornr=MOE_FEHLER_NichtAktuellerSpielerMachtZug;
            oNeuerZug.bDarfStapelDrehen=aAlleSpieler[iAktuellerSpieler].darf_stapel_drehen();
			return oNeuerZug;
            //throw "Der Spieler "+iSpielernummer+" hat versucht, einen Zug zu machen, obwohl er nicht dran ist. Es ist Spieler "+selbst.get_aktuellen_spieler()+" an der Reihe.";
        }
		if( aAlleSpieler[iSpielernummer].kartenstapel(iSpielerstapel).ist_leer()){
            var oNeuerZug = new zobj(iSpielernummer,iSpielerstapel,iBankstapel,"","");
            oNeuerZug.errornr=MOE_FEHLER_SpielerZiehtVonLeeremStapel;
            oNeuerZug.bDarfStapelDrehen=aAlleSpieler[iAktuellerSpieler].darf_stapel_drehen();
            return oNeuerZug;
            //throw "Der Spieler "+iSpielernummer+" hat versucht, vom Stapel "+iSpielerstapel+" zu ziehen. Dort liegt aber keine Karte!";
        }

		//Zugobjekt erstellen
		doSpielerkarte = aAlleSpieler[iSpielernummer].kartenstapel(iSpielerstapel).get_obere_karte();
		if( Bank.bankstapel(iBankstapel).ist_leer() ) dsBankkarte="";
		else dsBankkarte=Bank.bankstapel(iBankstapel).get_offene_karte().get_name();

		//testen, ob ein Zug überhaupt zustande kommt <=> wenn er den Regeln entspricht;
		if(iSpielModus!=MOE_SPIELTYP_WildesSpiel){
			if(!doSpielerkarte.ist_moeller()){
				if(!Bank.bankstapel(0).ist_leer() && !Bank.bankstapel(1).ist_leer() && !Bank.bankstapel(2).ist_leer()){
					if(doSpielerkarte.get_farbe()!=Bank.bankstapel(iBankstapel).get_offene_karte().get_farbe()){
						if(ma_dotp(aAlleSpieler[iSpielernummer].get_farben_offener_karten(),Bank.get_farben_offener_karten())>0){
                            var oNeuerZug = new zobj(iSpielernummer,iSpielerstapel,iBankstapel,"","");
                            oNeuerZug.errornr=MOE_FEHLER_FalschBedient;
                            oNeuerZug.bDarfStapelDrehen=aAlleSpieler[iAktuellerSpieler].darf_stapel_drehen();
                            return oNeuerZug;
						}
					}
				}
			}
		}

		//Zugobjekt erstellen

		doSpielerkarte = aAlleSpieler[iSpielernummer].karte_nehmen(iSpielerstapel);
		var oNeuerZug = new zobj(iSpielernummer,iSpielerstapel,iBankstapel,doSpielerkarte.get_name(),dsBankkarte);

		//Karte auflegen
		//Erstmal das Ergebnis speichern, da sonst die obersten Karten gleich sind und das ergebnis sinnfrei wäre.
		bSpielerMussNehmen=Bank.bankstapel(iBankstapel).spieler_muss_nehmen(doSpielerkarte.get_name());
		Bank.bankstapel(iBankstapel).karte_legen(doSpielerkarte);

		//Nimmt Stich?
		if(bSpielerMussNehmen)
		{
			oStich = Bank.bankstapel(iBankstapel).stich_nehmen();
			aAlleSpieler[iSpielernummer].nimmt_stich(oStich);
			oNeuerZug.set_spieler_nimmt_stich(oStich);
		}

		//Nachziehen Spieler
		if(aAlleSpieler[iSpielernummer].kartenstapel(iSpielerstapel).ist_leer() && ! Nachziehstapel.ist_leer() ){
			doNachgezogenerKartenstapel = Nachziehstapel.ziehe_kartenstapel();
			aAlleSpieler[iSpielernummer].stapel_nachziehen(iSpielerstapel,doNachgezogenerKartenstapel);
			oNeuerZug.set_spieler_zieht_nach(doNachgezogenerKartenstapel);
		} else {//Umdrehen
			if( ! aAlleSpieler[iSpielernummer].kartenstapel(iSpielerstapel).ist_leer() ) {
				oNeuerZug.set_spieler_dreht_um(aAlleSpieler[iSpielernummer].kartenstapel(iSpielerstapel).get_obere_karte().get_name());
			}
		}

		//Nachziehen Bank
		if( Bank.bankstapel(iBankstapel).ist_leer()  && ! Nachziehstapel.ist_leer() ){
			doNachgezogenerBankstapel = Nachziehstapel.ziehe_bankstapel();
			Bank.ziehe_neuen_bankstapel(iBankstapel,doNachgezogenerBankstapel);
			oNeuerZug.set_bank_zieht_nach(doNachgezogenerBankstapel);
		} else { //Umdrehen der Bankstapel
			if( Bank.bankstapel(iBankstapel).hat_gerade_gedreht() ){
				oNeuerZug.set_bank_dreht_um(Bank.bankstapel(iBankstapel).get_offenen_stich().get_stapel());
			}
		}

		//die offenen Karten eines Zuges übergeben
		oNeuerZug.set_offene_karten(selbst.get_offene_karten());


		//Darf der Spieler auf der Vindmoelle drehen
		oNeuerZug.bDarfStapelDrehen=aAlleSpieler[iAktuellerSpieler].darf_stapel_drehen();

		//nächsten Spieler festlegen und laden
		//welcher Spieler ist der nächste, gibt es einen nächsten Spieler
		oNeuerZug.iNaechsterSpielernummer = selbst.naechster_spieler();

		if(oNeuerZug.iNaechsterSpielernummer!==false) {


            //Type des nächsten Spielers
            oNeuerZug.sNaechsterSpielertyp = aAlleSpieler[iAktuellerSpieler].get_spielertyp();

            //Nächster Spieler darf drehen?
            oNeuerZug.bNaechsterSpielerDarfDrehen = aAlleSpieler[iAktuellerSpieler].darf_stapel_drehen();
        }
		return oNeuerZug;
	}

	this.naechster_spieler = function(){

		//protokoll("suche nächsten Spieler");
		var iNeuerSpieler=selbst.get_naechsten_spieler();

		if(typeof(iNeuerSpieler)=="number"){
				iAktuellerSpieler=iNeuerSpieler;
				aAlleSpieler[iAktuellerSpieler].neuer_zug_beginnt();
				return iAktuellerSpieler;
		}
		return iNeuerSpieler;
	}

	this.get_naechsten_spieler = function(){


		//protokoll("suche nächsten Spieler");
		var iNeuerSpieler=iAktuellerSpieler;

		do
		{
			//nächster Spieler mit Überlaufkontrolle
			iNeuerSpieler++;
			if(iNeuerSpieler==aAlleSpieler.length){iNeuerSpieler=0;}

			console.log("Vorschlag nächster Spieler "+iNeuerSpieler);

			//Wenn der Spielerstapel nicht leer ist, darf erspielen!
			if(! aAlleSpieler[iNeuerSpieler].kartenstapel(0).ist_leer() || ! aAlleSpieler[iNeuerSpieler].kartenstapel(1).ist_leer() || ! aAlleSpieler[iNeuerSpieler].kartenstapel(2).ist_leer())
			{
				return iNeuerSpieler;
			}
		}
		while(iNeuerSpieler!=iAktuellerSpieler)

		//Nach dem letzten Zug beendet sich das Spiel und es können keine Weiteren züge gemacht werden!
		selbst.spiel_ist_zuende();
		return false;
	}

	this.bankstapel_drehen = function(argBankstapelNummer){
		if(typeof(argBankstapelNummer)=="number" && argBankstapelNummer>=0 && argBankstapelNummer<3){
			if(aAlleSpieler[iAktuellerSpieler].darf_stapel_drehen()){

				var dSpielerstapel;
				var oNeuerZug = new zobj(iAktuellerSpieler,dSpielerstapel,argBankstapelNummer);

				aAlleSpieler[iAktuellerSpieler].dreht_bankstapel();
				Bank.bankstapel(argBankstapelNummer).drehen();
				//protokoll("Hat die Bank gedreht!");
				oNeuerZug.set_bank_dreht_um(Bank.bankstapel(argBankstapelNummer).get_offenen_stich().get_stapel());

				var bFuerDenAktuellenSpieler=true;
				oNeuerZug.set_offene_karten(selbst.get_offene_karten(bFuerDenAktuellenSpieler));

                //Darf der Spieler auf der Vindmoelle drehen
                oNeuerZug.bDarfStapelDrehen=aAlleSpieler[iAktuellerSpieler].darf_stapel_drehen();

				return oNeuerZug;
			}
			else{
				//protokoll(iAktuellerSpieler+" durfte nicht mehr die Bank drehen!");
				return 3002;
			}
		} else {
			return 3001;
		}
	}

	this.get_aktuellen_spieler = function(){
		if(typeof(iAktuellerSpieler)=="undefined")return false;
		else return iAktuellerSpieler;
	}

	this.get_spieler_anzahl = function(){
		return iAnzahlDerSpieler;
	}

	this.get_nachziehstapel_kartenzahl = function(){
		return Nachziehstapel.get_aktuelle_kartenzahl();
	}

	this.get_nachziehstapel_startkartenzahl = function(){
		return aStartNachziehstapel.length;
	}

	this.get_spieler_punkte = function(){
		var aSpielerpunkte = new Array();
		if(iSpielstatus!=MOE_STATUS_ENDE){
			//Alle Punkte heraussuchen
			for(var i=0;i<iAnzahlDerSpieler;i++){
				aSpielerpunkte.push(aAlleSpieler[i].ablagestapel().get_punkte());
			}
		} else {
			//Alle Punkte Heraussuchen und den Verlierer finden
			var iSpielerMeistePunkte=0;
			var iMeistePunkte=0;

			for(var i=0;i<iAnzahlDerSpieler;i++){
				aSpielerpunkte.push(aAlleSpieler[i].ablagestapel().get_punkte());
				if(iSpielerMeistePunkte<aSpielerpunkte[i])
				{
					iSpielerMeistePunkte=aSpielerpunkte[i];
					iMeistePunkte=i;
				}
			}
			//Restpunkte laden
			var iRestpunkte = Bank.bankstapel(0).get_offenen_stich().get_punkte() + Bank.bankstapel(1).get_offenen_stich().get_punkte() + Bank.bankstapel(2).get_offenen_stich().get_punkte();
			//Restpunkte dem Verlierer Spieler geben
			aSpielerpunkte[iMeistePunkte]=aSpielerpunkte[iMeistePunkte]+iRestpunkte;
		}
		return aSpielerpunkte;
	}

	this.get_spielstatus = function(){
		return iSpielstatus;
	}

	this.spiel_ist_zuende = function(){
		iSpielstatus=MOE_STATUS_ENDE;
	}

	this.set_spielmodus = function(argSpielmodus){
		if(iSpielModus===false){
			iSpielModus=argSpielmodus;
		} else throw "Fehler:Spielmodus ist schon auf "+iSpielModus+" gesetzt. Er kann nicht mehr geändert in "+argSpielmodus+" werden.";
	}

	this.get_spielmodus = function(){
		return iSpielModus;
	}

	this.create_karte = function(argName){
		return new kobj(argName);
	}

	this.create_stich = function(argKarten){
		return new stobj(argKarten);
	}

	/******************************************************************************

		Interne Spielfunktionen

	******************************************************************************/

	function set_aktuellen_spieler(iNummer){
		iAktuellerSpieler=iNummer;
	}

	//gibt einen Array mit der Bedienpflicht des aktuellen Spielers aus
	function get_bedienpflicht(iSpielernummer){

		//ergebnis array erzeugen
		var aBedienpflicht = [];//new Array();
		var oSpieler = selbst.spieler(iSpielernummer);
		var aMoellerIstDabei = [];//new Array();

		//in einer Forschleife
		for(var i=0;i<3;i++){

			//für jede Karte des Spielers
			aBedienpflicht.push(new Array());
			//sd

			for(var j=0;j<3;j++){


				//verlgeich mit jeder Bankkarte

				//wenn überhaupt der bankstapel und der spielerstapel nicht leer sind
				if(!selbst.bank().bankstapel(j).ist_leer() && !oSpieler.kartenstapel(i).ist_leer()){

					//Wenn die karte nicht der moeller ist und die farben übereinstimmen
					if(!oSpieler.kartenstapel(i).get_obere_karte().ist_moeller() && oSpieler.kartenstapel(i).get_obere_karte().get_farbe()===selbst.bank().bankstapel(j).get_offene_karte().get_farbe()){
						//protokoll("ok!");
						//wenn dieser Bedienen muss, dann füge nummer des bankstapels an
						aBedienpflicht[i].push(j);

					//Wenn er Moeller dabei sit soll es vermerkt werden, damit er ggf. nochmal hinzugefügt werden kann
					} else if(oSpieler.kartenstapel(i).get_obere_karte().ist_moeller()){
						aMoellerIstDabei.push(i);
					}
				}
			}
		}

		console.log("("+selbst.get_spielid()+")get_bedienpflicht: Bedienpflicht oMø:"+aBedienpflicht[0]+" Mø:"+aMoellerIstDabei);

		//Wenn eine der anderen Karten bedienen muss, dann muss der Møller noch dazu gerechnet werden.
		if((aBedienpflicht[0].length!=0 || aBedienpflicht[1].length!=0 || aBedienpflicht[2].length!=0) && aMoellerIstDabei.length>0){
			for(var i=0;i<aMoellerIstDabei.length;i++){
				aBedienpflicht[aMoellerIstDabei[i]]= new Array(0,1,2);
			}
		}

		//Ergebnis ausgeben
		return aBedienpflicht;

	}

	this.get_spielid = function(){
		return iSpielID;
	}

	/******************************************************************************

		Spiellinitialisierung

	******************************************************************************/

	/**************************************************

		Spieler werden mit leeren Stapel initialisiert

	***************************************************/

	for(i=0;i<iAnzahlDerSpieler;i++){
		aAlleSpieler.push(new spielerobj(argAlleSpieler[i][0],argAlleSpieler[i][1], new kstobj("",""), new kstobj("",""), new kstobj("","")));
	}

	/**************************************************

		Bank wird ebenfalls leer initialisiert

	***************************************************/

	var Bank = new bankobj(new bstobj(new stobj(),new stobj()),new bstobj(new stobj(),new stobj()), new bstobj(new stobj(),new stobj()));

	/**************************************************

		Der Nachziehstapel wird sofort initialisiert,

	***************************************************/

	var Nachziehstapel = new nzstobj();





	/******************************************************************************

		Testfunktionen

		Für jedes Unterobjekt und Wertobjekt
		wurde Testdriven ein eigener Anwendungsfall
		geschrieben. Dies können auch ablaufen.
		Daraus kann später ein selbsttest feiniert
		werden.

	******************************************************************************/


	this.test_moeller = function(){
		var sKarte="hK";
		Moeller.set_moeller(sKarte);
		//protokoll(Moeller.ist_moeller(sKarte));

	}


	this.test_deck = function(){
		aKartenStapel = Blatt.get_ungmscht_stapel();
		//protokoll("Ein ungemischter vollständiger Kartenstapel:\n\r\n\r"+aKartenStapel);
	}

	this.test2_deck = function(){
		aKartenStapel = Blatt.get_ungmscht_stapel();
		//protokoll("Ein ungemischter, vollständiger Kartenstapel:\n\r\n\r"+aKartenStapel);
		aKartenStapel.shuffle();
		//protokoll("Ein gemischter, vollständiger Kartenstapel:\n\r\n\r"+aKartenStapel);
		Blatt.set_moeller(aKartenStapel[0]);
		//protokoll("Moeller ist:"+Blatt.get_moeller());
		var doKarte = new kobj(aKartenStapel[1]);
		//protokoll("Karte "+doKarte.get_name()+" ist Moeller? "+doKarte.ist_moeller() +". Oder Trumpf? "+doKarte.ist_trumpf()+"." );
	}


	this.test_kobj = function(){
		daKartenStapel = Blatt.get_ungmscht_stapel();
		for(i=0;i<daKartenStapel.length;i++){
			var oKarte = new kobj(daKartenStapel[i]);
			//protokoll("HerzBube:"+oKarte.get_name()+"("+oKarte.get_augenzahl()+"/"+oKarte.get_staerke()+") und ist "+(oKarte.ist_moeller()==0?"nicht":"")+" der Moeller.");

		}
	}

	/*	Einfacher Test für das Stichobjekt	*/

	this.test1_stobj = function()
	{
		var oErsterStapel = new stobj();
		var oErsteKarte = new kobj("hA");
		var oZweiteKarte = new kobj("gO");
		oErsterStapel.karte_auflegen(oErsteKarte);
		//protokoll("Der Stapel "+oErsterStapel.get_stapel()+"("+oErsterStapel.get_kartenanzahl()+")"+" hat "+oErsterStapel.get_punkte()+" Punkte und die "+oErsterStapel.get_oberste_karte().get_name()+" als oberste Karte");
		oErsterStapel.karte_auflegen(oZweiteKarte);
		//protokoll("Der Stapel "+oErsterStapel.get_stapel()+"("+oErsterStapel.get_kartenanzahl()+")"+" hat "+oErsterStapel.get_punkte()+" Punkte und die "+oErsterStapel.get_oberste_karte().get_name()+" als oberste Karte");
	}

	/*	Test zum Händling / Tauschen des Stichobjekts	*/
	this.test3_stobj = function()
	{
		var daKartenStapel = Blatt.get_ungmscht_stapel();
		daKartenStapel.shuffle();

		var daErsterStapel = daKartenStapel.slice(0,11);
		var daZweiterStapel = daKartenStapel.slice(11,21);

		//protokoll("Gemischter Stapel 1: "+daErsterStapel+"<br />Gemischter Stapel 2: "+daZweiterStapel);

		var oErsterStapel = new stobj(daErsterStapel);
		var oZweiterStapel = new stobj(daZweiterStapel);

		//protokoll("Erster Stapel: "+daErsterStapel+"/"+oErsterStapel.get_stapel()+" Punkte"+oErsterStapel.get_punkte());
		//protokoll("Zweiter Stapel: "+daZweiterStapel+"/"+oZweiterStapel.get_stapel()+" Punkte"+oZweiterStapel.get_punkte());

		//doTempStapel = new stobj(oErsterStapel.get_stapel(),oErsterStapel.get_punkte());
		//doTempStapel = oErsterStapel.kopie();

		//oErsterStapel= new stobj();

		/*
		doTempStapel = new stobj(oZweiterStapel.get_stapel());
		oZweiterStapel = new stobj(oErsterStapel.get_stapel());
		oErsterStapel = new stobj(doTempStapel.get_stapel());
		*/
		var doTempStapel = oZweiterStapel.kopie();
		oZweiterStapel = oErsterStapel.kopie();
		oErsterStapel = doTempStapel;

		//protokoll("Erster Stapel: "+daErsterStapel+"/"+oErsterStapel.get_stapel()+" Punkte"+oErsterStapel.get_punkte());
		//protokoll("Zweiter Stapel: "+daZweiterStapel+"/"+oZweiterStapel.get_stapel()+" Punkte"+oZweiterStapel.get_punkte());

		//protokoll("Temp Stapel: .../"+doTempStapel.get_stapel()+" Punkte"+doTempStapel.get_punkte());
	}

	/*	Test zum Händling / Zum auflegen eines Stapels	*/
	this.test4_stobj = function()
	{
		var daKartenStapel = Blatt.get_ungmscht_stapel();
		daKartenStapel.shuffle();

		var oErsterStapel = new stobj(daKartenStapel.slice(0,11));
		var oZweiterStapel = new stobj( daKartenStapel.slice(11,21));

		//protokoll("Erster Stapel: "+oErsterStapel.get_stapel()+" Punkte"+oErsterStapel.get_punkte());
		//protokoll("Zweiter Stapel: "+oZweiterStapel.get_stapel()+" Punkte"+oZweiterStapel.get_punkte());

		//doTempStapel = new stobj(oErsterStapel.get_stapel(),oErsterStapel.get_punkte());
		//doTempStapel = oErsterStapel.kopie();

		//oErsterStapel= new stobj();

		/*
		doTempStapel = new stobj(oZweiterStapel.get_stapel());
		oZweiterStapel = new stobj(oErsterStapel.get_stapel());
		oErsterStapel = new stobj(doTempStapel.get_stapel());
		*/
		oErsterStapel.stapel_auflegen(oZweiterStapel.get_stapel());

		//protokoll("Erster Stapel: "+oErsterStapel.get_stapel()+" Punkte"+oErsterStapel.get_punkte());
		//protokoll("Zweiter Stapel: "+oZweiterStapel.get_stapel()+" Punkte"+oZweiterStapel.get_punkte());

	}


	this.test_kstobj = function(){
		var daKartenStapel = Blatt.get_ungmscht_stapel();

		var oKartenstapel = new kstobj(daKartenStapel[0],daKartenStapel[1]);
		while(oKartenstapel.ist_leer()==false)protokoll("Erste Karte vom Stapel gezogen: "+oKartenstapel.karte_nehmen().get_name());
		//protokoll("Nun ist der Stapel leer");

	}

	this.test_bstobj = function(){

		var daKartenStapel = Blatt.get_ungmscht_stapel();
		daKartenStapel.shuffle();

		var daErsterStapel = daKartenStapel.slice(0,11);
		var daZweiterStapel = daKartenStapel.slice(11,21);

		//protokoll("Gemischter Stapel 1: "+daErsterStapel+" Gemischter Stapel 2: "+daZweiterStapel);

		var oErsterStapel = new stobj(daErsterStapel);
		var oZweiterStapel = new stobj(daZweiterStapel);

		var BankStapel1 = new bstobj(oErsterStapel,oZweiterStapel);

		//protokoll("");
		//protokoll("Ansehen");
		//protokoll("Erster Stapel: "+BankStapel1.get_offenen_stich().get_stapel()+"("+BankStapel1.get_offenen_stich().get_punkte()+")/"+oErsterStapel.get_stapel()+" Punkte"+oErsterStapel.get_punkte());
		BankStapel1.drehen();
		//protokoll("Zweiter Stapel: "+BankStapel1.get_offenen_stich().get_stapel()+"("+BankStapel1.get_offenen_stich().get_punkte()+")/"+oZweiterStapel.get_stapel()+" Punkte"+oZweiterStapel.get_punkte());
		//Wieder auf Ausgangsposition
		BankStapel1.drehen();
		//protokoll("Der Bankstapel ist drehbar? "+BankStapel1.ist_drehbar()+".");
		//protokoll("Der Bankstapel ist leer? "+BankStapel1.ist_leer()+".");
		//protokoll("");
		//protokoll("Wegnehmen");
		/*var oGenommenerStich = BankStapel1.stich_nehmen();
		//protokoll("Stapel: "+oGenommenerStich.get_stapel()+"("+oGenommenerStich.get_punkte()+")/"+oErsterStapel.get_stapel()+" Punkte"+oErsterStapel.get_punkte());
		var oGenommenerStich = BankStapel1.stich_nehmen();
		//protokoll("Stapel: "+oGenommenerStich.get_stapel()+"("+oGenommenerStich.get_punkte()+")/"+oZweiterStapel.get_stapel()+" Punkte"+oZweiterStapel.get_punkte());*/
		do
		{
			var oGenommenerStich = BankStapel1.stich_nehmen();
			//protokoll("Stapel: "+oGenommenerStich.get_stapel()+" ("+oGenommenerStich.get_punkte()+")");
			//protokoll("Genommener Stich ist leer? "+oGenommenerStich.ist_leer()+".");
			//protokoll("Der Bankstapel ist drehbar? "+BankStapel1.ist_drehbar()+".");
			//protokoll("Der Bankstapel ist leer? "+BankStapel1.ist_leer()+".");
			//protokoll("");
		}
		while(!oGenommenerStich.ist_leer())
	}

	/*	Wegnehmen der Stiche vom Bankstapel	*/
	this.test2_bstobj = function(){

		var daKartenStapel = Blatt.get_ungmscht_stapel();
		daKartenStapel.shuffle();

		var daErsterStapel = daKartenStapel.slice(0,11);
		var daZweiterStapel = daKartenStapel.slice(11,21);
		var dsStichKarte = daKartenStapel[21];


		//protokoll("Gemischter Stapel 1: "+daErsterStapel+" Gemischter Stapel 2: "+daZweiterStapel);
		//protokoll("Stichkarte:"+dsStichKarte);

		var oErsterStapel = new stobj(daErsterStapel);
		var oZweiterStapel = new stobj(daZweiterStapel);
		var oStichKarte = new kobj(dsStichKarte);

		var BankStapel1 = new bstobj(oErsterStapel,oZweiterStapel);

		//protokoll("");
		//protokoll("Ansehen");
		//protokoll("Offener Stapel: "+BankStapel1.get_offenen_stich().get_stapel()+"("+BankStapel1.get_offenen_stich().get_punkte()+")/"+oErsterStapel.get_stapel()+" Punkte"+oErsterStapel.get_punkte());
		BankStapel1.drehen();
		//protokoll("Verdeckter Stapel: "+BankStapel1.get_offenen_stich().get_stapel()+"("+BankStapel1.get_offenen_stich().get_punkte()+")/"+oZweiterStapel.get_stapel()+" Punkte"+oZweiterStapel.get_punkte());
		//protokoll("Stichkarte:"+oStichKarte.get_name());
		//Wieder auf Ausgangsposition
		BankStapel1.drehen();
		//protokoll("Stichkarte:"+oStichKarte.get_name());
		//protokoll("");
		//protokoll("Muss der Spieler die Karte nehmen? "+BankStapel1.spieler_muss_nehmen(oStichKarte.get_name())+" Offene Karte:"+BankStapel1.get_offene_karte().get_name()+" Stichkarte:"+oStichKarte.get_name());
		//protokoll("");
		if(BankStapel1.spieler_muss_nehmen(oStichKarte.get_name()))
		{
			// karte legen und Stich nehmen nehmen
			BankStapel1.karte_legen(oStichKarte.get_name());
			var oGenommenerStich = BankStapel1.stich_nehmen();
			//protokoll("Genommener Stapel: "+oGenommenerStich.get_stapel()+"("+oGenommenerStich.get_punkte()+")");
			//protokoll("Offener Stapel: "+BankStapel1.get_offenen_stich().get_stapel()+"("+BankStapel1.get_offenen_stich().get_punkte()+")");
		}
		else
		{
			//karte legen und Bank ansehen
			BankStapel1.karte_legen(oStichKarte.get_name());
			//protokoll("Offener Stapel: "+BankStapel1.get_offenen_stich().get_stapel()+"("+BankStapel1.get_offenen_stich().get_punkte()+")");
		}

		//protokoll("Der Bankstapel ist drehbar:"+BankStapel1.ist_drehbar());
		//protokoll("Der Bankstapel ist leer:"+BankStapel1.ist_leer());



	}


	this.test_nzstobj = function(){
		var NachziehStapel = new nzstobj();
		NachziehStapel.generiere_spielstapel()
		do
		{
			//protokoll("["+NachziehStapel.ziehe_karte().get_name()+"],"+NachziehStapel.get_stapel());
		}
		while(!NachziehStapel.ist_leer())

		//protokoll("Der Stapel ist leer? "+NachziehStapel.ist_leer()+".");
	}

	this.test2_nzstobj = function(){
		var NachziehStapel = new nzstobj();
		NachziehStapel.generiere_spielstapel()
		do
		{
			oNeuerKartenstapel=NachziehStapel.ziehe_kartenstapel();
			//protokoll("["+oNeuerKartenstapel.karte_nehmen()+"], ["+oNeuerKartenstapel.karte_nehmen()+"] "+NachziehStapel.get_stapel());
		}
		while(!NachziehStapel.ist_leer())

		//protokoll("Der Stapel ist leer? "+NachziehStapel.ist_leer()+".");
	}

	this.test3_nzstobj = function(){
		var NachziehStapel = new nzstobj();
		NachziehStapel.generiere_spielstapel()
		do
		{
			oNeuerBankstapel=NachziehStapel.ziehe_bankstapel();
			//protokoll("("+oNeuerBankstapel.stich_nehmen().get_stapel()+"), ("+oNeuerBankstapel.stich_nehmen().get_stapel()+") "+NachziehStapel.get_stapel());
		}
		while(!NachziehStapel.ist_leer())

		//protokoll("Der Stapel ist leer? "+NachziehStapel.ist_leer()+".");
	}

	this.test4_nzstobj = function(){
		var NachziehStapel = new nzstobj();
		NachziehStapel.generiere_spielstapel()
		//protokoll("Stapel:"+NachziehStapel.get_stapel());
		//protokoll("Moeller gesetzt? "+NachziehStapel.set_moeller()+".");
		//protokoll("Moeller: "+Moeller.get_moeller());
		//protokoll("Stapel mit Moeller:"+NachziehStapel.get_stapel());

		do
		{
			oKarte = NachziehStapel.ziehe_karte();
			//protokoll("["+oKarte.get_name()+"]"+(oKarte.ist_trumpf()?"t":"nt")+","+NachziehStapel.get_stapel());
		}
		while(!NachziehStapel.ist_leer())

		//protokoll("Der Stapel ist leer? "+NachziehStapel.ist_leer()+".");
	}

	this.test_zobj = function(){
		var z = new zobj(0,1,2,"hA","h9");

		z.set_spieler_nimmt_stich(new stobj(new Array("gt","h9","hA")));

		z.set_spieler_zieht_nach(new kstobj("gO","st"));

		z.set_bank_zieht_nach(	new bstobj(		new stobj(new Array("eK")),	new stobj(new Array("eK"))		)	);

		//protokoll("Spieler "+z.iSpielernummer+" hat die Karte "+z.sSpielerkarte+"("+z.iSpielerstapel+") auf "+z.sObersteBankkarte+"("+z.iBankstapel+") gelegt. Er hat den Stich "+z.get_genommenen_stich().get_stapel()+" bekommen. Er zog "+z.get_nachgezogenen_kartenstapel().get_stapel()+" nach, die Bank "+z.get_nachgezogenen_bankstapel().get_stapel()+" .");
	}



	this.test_bankobj = function(){

		var NachziehStapel = new nzstobj();
		NachziehStapel.generiere_spielstapel()
		//protokoll("Nachziehstapel: "+NachziehStapel.get_stapel());

		var oBank = new bankobj(NachziehStapel.ziehe_bankstapel(),NachziehStapel.ziehe_bankstapel(),NachziehStapel.ziehe_bankstapel());

		oKarte1=NachziehStapel.ziehe_karte();
		oKarte2=NachziehStapel.ziehe_karte();

		//protokoll("Bankstapel: "+oBank.get_stapel().join("/"));
		//protokoll("Karte auflegen:"+oKarte1.get_name());
		oBank.bankstapel(0).karte_legen(oKarte1);
		//protokoll("Karte nehmen:");
		oStich = oBank.bankstapel(0).stich_nehmen();
		//protokoll("Offene Karten des Bankstapels: "+oBank.get_offene_karten());
		//protokoll("Genommener Stich:"+oStich.get_stapel());

		//protokoll("2. Karte auflegen:"+oKarte2.get_name());
		oBank.bankstapel(0).karte_legen(oKarte2);
		//protokoll("Stich nehmen: "+oBank.bankstapel(0).get_offenen_stich().get_stapel());
		oStich2 = oBank.bankstapel(0).stich_nehmen();
		//protokoll("Offene Karten des Bankstapels: "+oBank.get_offene_karten());
		//protokoll("Genommener Stich:"+oStich2.get_stapel());
		//protokoll("Nachziehen:");
		oBank.ziehe_neuen_bankstapel(0,NachziehStapel.ziehe_bankstapel());
		//protokoll("Offene Karten des Bankstapels: "+oBank.get_offene_karten());
	}


	this.test_spielerobj = function(){

		/*

		*/

		//protokoll("Test zum Spielerstapel");
		var NachziehStapel = new nzstobj();
		NachziehStapel.generiere_spielstapel();

		var oBank = new bankobj(NachziehStapel.ziehe_bankstapel(),NachziehStapel.ziehe_bankstapel(),NachziehStapel.ziehe_bankstapel());
		//protokoll("Bankstapel: "+oBank.get_stapel().join("/"));

		iSpielerID = ma_z_rand(0,10000000000);
		var oSpieler = new spielerobj(iSpielerID,"Name",NachziehStapel.ziehe_kartenstapel() ,NachziehStapel.ziehe_kartenstapel(),NachziehStapel.ziehe_kartenstapel());

		//protokoll("Spielerkartenstapel:"+oSpieler.get_stapel().join("/"));
		//protokoll("Spieler darf die Bank drehen:"+oSpieler.darf_stapel_drehen());
	}

	this.test2_spielerobj = function(){

		/*	Ein präpariertes Spiel. Der Spieler legt eine Karte von Stapel 0 auf
			Bankstapel 0. Wenn er den Stihc nehmen muss, wird er eingezogen.

		*/

		//protokoll("Test zum Spielerstapel");
		var NachziehStapel = new nzstobj();
		NachziehStapel.generiere_spielstapel();

		//protokoll("Moeller gesetzt? "+NachziehStapel.set_moeller()+".");
		//protokoll("Moeller: "+Moeller.get_moeller());

		var oBank = new bankobj(NachziehStapel.ziehe_bankstapel(),NachziehStapel.ziehe_bankstapel(),NachziehStapel.ziehe_bankstapel());
		//protokoll("Bankstapel: "+oBank.get_stapel().join("/"));

		var iSpielerID = ma_z_rand(0,10000000000);
		var oSpieler = new spielerobj(iSpielerID,"Name",NachziehStapel.ziehe_kartenstapel() ,NachziehStapel.ziehe_kartenstapel(),NachziehStapel.ziehe_kartenstapel());

		//protokoll("Spielerkartenstapel:"+oSpieler.get_stapel().join("/"));

		var doKarte = oSpieler.karte_nehmen(0);
		//protokoll("Die Karte des Spielers:"+doKarte.get_name());
		var bSpielerMussNehmen = oBank.bankstapel(0).spieler_muss_nehmen(doKarte.get_name());
		oBank.bankstapel(0).karte_legen(doKarte);
		//protokoll("Bankstapel: "+oBank.get_stapel().join("/"));
		//protokoll("Spielerkartenstapel:"+oSpieler.get_stapel().join("/"));
		if(bSpielerMussNehmen)
		{
			//protokoll("--muss nehmen");
			var oStich = oBank.bankstapel(0).stich_nehmen();
			//protokoll("Die Stich des Bankstapels:"+oStich.get_stapel());
			oSpieler.nimmt_stich(oStich);
		}else protokoll("--nimmt nicht");
		//protokoll("Spielerstichstapel:"+oSpieler.ablagestapel().get_stapel()+"("+oSpieler.ablagestapel().get_punkte()+")");
		//protokoll("Bankstapel: "+oBank.get_stapel().join("/"));
	}

	this.test3_spielerobj = function(){
		//protokoll("Test zum Spielerstapel");
		var NachziehStapel = new nzstobj();
		NachziehStapel.generiere_spielstapel();

		//protokoll("Moeller gesetzt? "+NachziehStapel.set_moeller()+".");
		//protokoll("Moeller: "+Moeller.get_moeller());

		var oBank = new bankobj(NachziehStapel.ziehe_bankstapel(),NachziehStapel.ziehe_bankstapel(),NachziehStapel.ziehe_bankstapel());
		//protokoll("Bankstapel: "+oBank.get_stapel().join("/"));

		var iSpielerID = ma_z_rand(0,10000000000);
		var oSpieler = new spielerobj(iSpielerID,"Name",NachziehStapel.ziehe_kartenstapel() ,NachziehStapel.ziehe_kartenstapel(),NachziehStapel.ziehe_kartenstapel());

		//protokoll("Spielerkartenstapel:"+oSpieler.get_stapel().join("/"));

		while(oSpieler.kartenstapel(0).ist_leer()==false)protokoll("Karte vom Kartenstapel des Spielers gezogen: "+oSpieler.karte_nehmen(0).get_name());
		//protokoll("Spielerkartenstapel:"+oSpieler.get_stapel().join("/"));

		oSpieler.stapel_nachziehen(0,NachziehStapel.ziehe_kartenstapel());
		//protokoll("Spielerkartenstapel:"+oSpieler.get_stapel().join("/"));

	}

}