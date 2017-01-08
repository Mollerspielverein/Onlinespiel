/**********************************

	Moeller Lib 2
		
	View-Schicht

**********************************/

	/*********************************************************************************

		Konstanten

	*********************************************************************************/
	
	

	/*******************************pr**************************************************
dia
		Objekte

	*********************************************************************************/
	
	/*********************************
	
		Spielfeld
	
	*********************************/
	
spielfeldobject = function(argSpielId,argMitspieler,argSpielfeldOptionen,argSpieltyp){

	//protokoll("spielfeldobject: Mitspieler"+argMitspieler.join("/"));

	var selbst_Spielfeld = this;

	//Die SpielId kann nur einemal gestezt werden. Das Spielfeld muss also nachder Verbindung zum Server instanziert werden, wenn ein Server gebraucht wird!

	var spielId = argSpielId;
	var oBank;
	var oNachziehstapel
	var biAktuellerSpieler = false;
	var aAlleSpieler = argMitspieler;
	var aMitspieler = new Array(3);
	var aPositionen = new Array("rechts","mitte","links");
	var biSpielerHatLetztenStich = false;
	var aOffeneKarten = new Array();
	var aZugProtokoll = new Array();
	var oSpieltypBezeichner = {98:"Partieplayer",99:"Tutorial",100:"Testspiel",101:"Ramsch", 102:"Kein Ramsch", 103:"Wildes Spiel"};
	var oSound;
	var oKartenLegeSteuerung = strg_ziehen;
	var oBankDrehenSteuerung = strg_bank_umdrehen;
	var oDialogTimer;
	var iZugart=0;

	if(typeof(argSpieltyp)=="undefined"){
		var iSpieltyp = MOE_SPIELTYP_Ramsch;
	} else {
		var iSpieltyp = argSpieltyp;
	}
	var sSpieform;

	
	if(typeof(argSpielfeldOptionen)=="undefined"){ // || !(argSpielfeldOptionen.showPoints && argSpielfeldOptionen.gameSpeed && argSpielfeldOptionen.analizeTurn && argSpielfeldOptionen.giveAdvice && argSpielfeldOptionen.bindGameActions)){
		protokoll("Fehler:Die Spieloptionen konnten nicht geladen werden. Es werden Standardoptionen verwendet.");
		var oSpielfeldOptionen = {showPoints:true,showTrump:false,gameSpeed:8.3,analizeTurn:true,giveAdvice:true,playSound:true,bindBankActions:true,bindPlayerActions:true,bindOptionActions:true,showFlute:true};
	} else {
		var oSpielfeldOptionen = argSpielfeldOptionen;
		protokoll(
			"Optionen:"+
			"<br />Punkte Anzeigen"+oSpielfeldOptionen.showPoints+
			"<br />Trumpf zeigen"+oSpielfeldOptionen.showTrump+
			"<br />Speed"+oSpielfeldOptionen.gameSpeed+
			"<br />Analyse"+oSpielfeldOptionen.analizeTurn+
			"<br />Empfehlung"+oSpielfeldOptionen.giveAdvice+
			"<br />Sound abspielen"+oSpielfeldOptionen.playSound+
			"<br />bindBankActions"+oSpielfeldOptionen.bindBankActions+
			"<br />bindPlayerActions"+oSpielfeldOptionen.bindPlayerActions+
			"<br />bindOptionActions"+oSpielfeldOptionen.bindOptionActions+
			"<br />showFlute"+oSpielfeldOptionen.showFlute
		);
	}
	
	var rFeld = $("#spielfeld");
	var rLetzterStichFrame = $("#letzter_stichframe");
	var rLetzterStich = $("#letzter_stich");
	var rMittelfeld = $('#mittelfeld');
	var DrehenIcon = $("#StapelTausch");

	var oSpielerposition = {"rechts":{"kurz":"gr","lang":"gegnerrechts"},"links":{"kurz":"gl","lang":"gegnerlinks"},"mitte":{"kurz":"sp","lang":"spieler"}};
	
	

	/*********************************
	
		Unterobjekte werden jeweils
		nach ihrer Definition
		initialisiert!!
	
	*********************************/
	
	/*********************************
	
		Bank
	
	*********************************/	
	
	function bankobject(){
		var selbst_Bank = this;
		var bDropHatStattgefunden=false;
		var biBedroppterStapel=false;
		var rBankframe = $("#bankframe");
		var Bankstapel = new Array(
			new Array(
				$("#ba_1a"),$("#ba_2a"),$("#ba_3a")
			),
			new Array(
				$("#ba_1z"),$("#ba_2z"),$("#ba_3z")
			)
		);
		
		var iBankstapelAufgeblaettert = false;
		var bOberflaecheAktiv = false;
		var aiAngezeigteVerdeckteKartenzahl = new Array(0,0,0);
		var aiVerdeckteKartenzahl = new Array(0,0,0);
		var iDivisor=3;
		var bStapelumdrehenAktiviert = false;
		
		this.stapel = function(iStapelnummer,iIstVerdeckt){
			if(typeof(iIstVerdeckt)=="undefined")var iIstVerdeckt=0;
			return Bankstapel[iIstVerdeckt][iStapelnummer];
		}
		
		this.frame = function(){
			return rBankframe;
		}
		
		this.naechste_koordinaten = function(iStapelnummer,sModus){
			var iKartenzahl = $("#ba_"+(iStapelnummer+1)+sModus+" > div").length;

			/*
			var iLeft=Math.round(3*(iKartenzahl));
			var iTop=Math.round(3*(iKartenzahl));
			*/

            if(iKartenzahl>0){
                var iLeft=ma_z_rand(-10,10);//Math.round(3*(iKartenzahl));
                var iTop=ma_z_rand(-10,10);//Math.round(3*(iKartenzahl));
            } else {
                var iLeft=Math.round(3*(iKartenzahl));
                var iTop=Math.round(3*(iKartenzahl));
            };

            var iZindex=((sModus==="a"?5:3)-iStapelnummer)*100+iKartenzahl;
            return new Array(iLeft,iTop,iZindex);


		}


		this.offene_karte_anfuegen = function(iStapelnummer,argKartenname){
			oSound.hinlegen();
			var sStapelname="ba_"+(iStapelnummer+1)+"a";
			var sKartenKoordinaten = selbst_Bank.naechste_koordinaten(iStapelnummer,"a");
			Bankstapel[0][iStapelnummer].append( $('#kartenbilder > #'+argKartenname).clone());
			$("#"+Bankstapel[0][iStapelnummer].attr("id")+" > div:last-child ").css("left",sKartenKoordinaten[0]+"px");
			$("#"+Bankstapel[0][iStapelnummer].attr("id")+" > div:last-child ").css("top",sKartenKoordinaten[1]+"px");
			$("#"+Bankstapel[0][iStapelnummer].attr("id")+" > div:last-child ").css("z-index",sKartenKoordinaten[2]);
		}

		this.verdeckte_karte_anfuegen = function(iStapelnummer){
			oSound.hinlegen();
			var sStapelname="ba_"+(iStapelnummer+1)+"z";
			aiVerdeckteKartenzahl[iStapelnummer]++;
			//protokoll("verdeckte_karte_anfuegen: stapel:"+iStapelnummer+" "+aiAngezeigteVerdeckteKartenzahl[iStapelnummer]+"<"+(Math.round((aiVerdeckteKartenzahl[iStapelnummer]+1)/iDivisor)));			
			if(aiAngezeigteVerdeckteKartenzahl[iStapelnummer]<Math.round((aiVerdeckteKartenzahl[iStapelnummer]+1)/iDivisor))
			{
				var sKartenKoordinaten = this.naechste_koordinaten(iStapelnummer,"z");
				Bankstapel[1][iStapelnummer].append( $('#kartenbilder > #zu').clone());
				$("#"+Bankstapel[1][iStapelnummer].attr("id")+" > div:last-child ").css("left",sKartenKoordinaten[0]+"px");
				$("#"+Bankstapel[1][iStapelnummer].attr("id")+" > div:last-child ").css("top",sKartenKoordinaten[1]+"px");
				$("#"+Bankstapel[1][iStapelnummer].attr("id")+" > div:last-child ").css("z-index",sKartenKoordinaten[2]);
				aiAngezeigteVerdeckteKartenzahl[iStapelnummer]=$("#"+Bankstapel[1][iStapelnummer].attr("id")+" > div").length;
			}
		}		
		
		this.loesche_stapel = function(iStapelnummer,sModus){
			var sStapelname="ba_"+(iStapelnummer+1)+sModus;
			$('#'+sStapelname).empty();
			if(sModus=="z"){
				aiVerdeckteKartenzahl[iStapelnummer]=0;
				aiAngezeigteVerdeckteKartenzahl[iStapelnummer]=0;
			}
		}
		
		this.stapel_highlighten = function(iStapelnummer){
			$("#"+Bankstapel[0][iStapelnummer].attr("id")+" > div:last-child ").addClass("karte_aktiv");
		}

		this.stapel_dehighlighten = function(iStapelnummer){
			if(Bankstapel[0][iStapelnummer].children("div.karte_aktiv").length>0){
				Bankstapel[0][iStapelnummer].children("div.karte_aktiv").removeClass("karte_aktiv");
				//protokoll("Bank:stapel_dehighlighten:"+iStapelnummer+" #"+Bankstapel[0][iStapelnummer].attr("id")+" > div.karte_aktiv ");	
			}
		}
		
		this.karte_wurde_abgelegt = function(){
			return bDropHatStattgefunden;
		}
		
		this.get_abgelegten_stapel = function(){
			return biBedroppterStapel;
		}
		
		this.zeige_bankkarten = function(argStapelID){
			zeige_bankkarten(argStapelID);
		}
		
		var zeige_bankkarten = function(argStapelID){ //Splash !!!
			
			sBankStapel=argStapelID;
			
			selbst_Spielfeld.stapel_auffaechern(sBankStapel);
			
			if(oSpielfeldOptionen.showPoints===true){
				var BankstapelNumID = parseInt(sBankStapel[3]);
				$('#ba_'+BankstapelNumID+'n').addClass("gruenfeld");
				$('#ba_'+BankstapelNumID+'n').text(aOffeneKarten[5][BankstapelNumID-1]);
				$('#ba_'+BankstapelNumID+'n').fadeIn(250);
			}
		}
		
		this.reset_bankdrop = function(){
			bDropHatStattgefunden=false;
			biBedroppterStapel=false;
			
			//protokoll("bDropHatStattgefunden:"+bDropHatStattgefunden+" biBedroppterStapel:"+biBedroppterStapel);
		}
		
		var verberge_bankkarten = function(argStapelID,argQueueObjekt){
			
			var sBankStapel = argStapelID;
			var iBankStapelNummer = parseInt(sBankStapel[3]);
			
			//Punkte verbergen
			var BankstapelNumID = parseInt(sBankStapel[3]);
			$('#ba_'+BankstapelNumID+'n').fadeOut(250);
			$('#ba_'+BankstapelNumID+'n').text("");

			selbst_Spielfeld.stapel_zublaettern(sBankStapel,argQueueObjekt);
			
			$( "#"+sBankStapel+" > div" ).css("z-index",(5-iBankStapelNummer)*101);
		}
		
		this.verberge_bankkarten = function(argStapelID,argQueueObjekt){
			verberge_bankkarten(argStapelID,argQueueObjekt);
		}

		this.oberflaeche_aktivieren = function(){
			bOberflaecheAktiv=true;
			for(var di=0;di<3;di++){	
				if(Bankstapel[0][di].children().length>0 || (Bankstapel[0][0].children().length==0 && Bankstapel[0][1].children().length==0 && Bankstapel[0][2].children().length==0)){
					Bankstapel[0][di].droppable("enable");
					//protokoll("oberflaeche_aktivieren: aktiviere "+Bankstapel[0][di].attr("id"));
				}
			}
		}
		
		this.oberflaeche_deaktivieren = function(){
			bOberflaecheAktiv=false;
			selbst_Bank.stapel_dehighlighten(0);selbst_Bank.stapel_dehighlighten(1);selbst_Bank.stapel_dehighlighten(2);
			for(var di=0;di<3;di++){	
				Bankstapel[0][di].droppable("disable");
			}
		}
		
		this.drehen_aktivieren = function(){
			if(oSpielfeldOptionen.showFlute==true)DrehenIcon.css("display","block");
			bStapelumdrehenAktiviert=true;
			}

		this.drehen_deaktivieren = function(){
			DrehenIcon.css("display","none");
			bStapelumdrehenAktiviert=false;	
	
		}
		
		this.leere_bank_markieren = function(){
			if($('#ba_1a').children().length==0 && $('#ba_2a').children().length==0 && $('#ba_3a').children().length==0){
				$('#ba_1a').addClass("bank_leer");
				$('#ba_2a').addClass("bank_leer");
				$('#ba_3a').addClass("bank_leer");
			}
		}
		
		this.leere_bank_demarkieren = function(){
			$('#ba_1a').removeClass("bank_leer");
			$('#ba_2a').removeClass("bank_leer");
			$('#ba_3a').removeClass("bank_leer");
		}
		
		this.zugmodus_an = function(){
			DrehenIcon.addClass("tauschbutton_grau");
			DrehenIcon.removeClass("spieler_aktiv");
		}
		
		this.zugmodus_aus = function(){
			DrehenIcon.addClass("spieler_aktiv");
			DrehenIcon.removeClass("tauschbutton_grau");
		}
		
		if(oSpielfeldOptionen.bindBankActions===true){
			for(var di=0;di<3;di++)
			{

				/***********************************************

					Click initialisieren

				***********************************************/

				Bankstapel[0][di].click(function(){
					if(	$(this).children().length>0  || (
							Bankstapel[0][0].children().length==0 && 
							Bankstapel[0][1].children().length==0 && 
							Bankstapel[0][2].children().length==0
						)
					){
						var iStapelID = parseInt($(this).attr("id")[3])-1;
						if(bOberflaecheAktiv==true && typeof(biAktuellerSpieler)=="number")
						{
							//Wenn der Spieler eine Spielerkarte und dann die bankkarte angegklickt hat, dann wird das Umdrehen überbrückt
							if(	aMitspieler[biAktuellerSpieler].get_highlighted_stapel()!==false ){
								spielfeld_sperren();
								var iAktivierterSpielerstapel=aMitspieler[biAktuellerSpieler].get_highlighted_stapel();
								aMitspieler[biAktuellerSpieler].stapel_dehighlighten(aMitspieler[biAktuellerSpieler].get_highlighted_stapel());

								//Hier muss der Controler aufgerufen werden
								//strg_ziehen(MOE_ZUGART_KarteUndStapelAngeklickt,biAktuellerSpieler,iAktivierterSpielerstapel,iStapelID);
								oKartenLegeSteuerung.apply(document, new Array(MOE_ZUGART_KarteUndStapelAngeklickt,biAktuellerSpieler,iAktivierterSpielerstapel,iStapelID));
								set_zugart(MOE_ZUGART_KarteUndStapelAngeklickt);
								
								selbst_Bank.leere_bank_demarkieren();
							}
							else
							{
								if(bStapelumdrehenAktiviert===true && $(this).children().length>0 && $('#ba_'+(iStapelID+1)+'z').children().length>0){

									//Wenn der Stich aufgefaechert ist, muss er wieder zusammengefaltet werden
									//protokoll($(this).attr("id")+".click: iBankstapelAufgeblaettert:"+iBankstapelAufgeblaettert);
									if(iBankstapelAufgeblaettert == true)
									{
										$(this).queue(function(){verberge_bankkarten($(this).attr("id"),this)});;
										iBankstapelAufgeblaettert=false;
									}

									//Bank umdrehen veranlassen
									$(this).queue(function(){
										//alert("Erst jetzt geht es weiter!");
										spielfeld_sperren();
										//strg_bank_umdrehen(iStapelID,biAktuellerSpieler);
										oBankDrehenSteuerung.apply(document,new Array(iStapelID,biAktuellerSpieler));
										$(this).dequeue();
									});
								} else {
									if(bStapelumdrehenAktiviert===true && $(this).children().length==0 || $('#ba_'+(iStapelID+1)+'z').children().length==0){
										selbst_Spielfeld.dialog("Es können nur Stapel mit einem offenen und einem verdeckten Stich umgedreht werden.");
									} else {
										if(bStapelumdrehenAktiviert===false) selbst_Spielfeld.dialog("Klicken Sie Ihre Karte erst an, bevor Sie den Stapel der Vindmølle anklicken. Sie können Ihre Karte auch direkt auf den Stapel der Vindmølle ziehen.");
									}
								}
							}
						}
					}
				});



				/************************************************

					Drop initialisieren

				************************************************/

				Bankstapel[0][di].droppable({
					over:function(event,ui){
						if(bOberflaecheAktiv==true ) //&& (	$(this).children().length>0  || ( Bankstapel[0][0].children().length==0 && Bankstapel[0][1].children().length==0 && Bankstapel[0][2].children().length==0   )  )  )
						{
							bDropHatStattgefunden=true;
							biBedroppterStapel=parseInt($(this).attr("id")[3])-1;
							$(this).addClass("karte_aktiv");
						}
					},
					out:function(event,ui){
						if(bOberflaecheAktiv==true)
						{
							bDropHatStattgefunden=false;
							biBedroppterStapel=false;
							$(this).removeClass("karte_aktiv");
						}
					},
					drop:function(event,ui){
						Bankstapel[0][0].removeClass("karte_aktiv");
						Bankstapel[0][1].removeClass("karte_aktiv");
						Bankstapel[0][2].removeClass("karte_aktiv");
					},
					create:function(argI){return function(){protokoll("Erstelle für ba_"+(argI+1)+"a die Dropfunktion");}}(di),
					disabled:true,
					tolerance:"intersect" //intersect
				});


				/***********************************************

					Hover initialisieren

				***********************************************/

				// Karten auseinander fahren lassen / splash
				Bankstapel[0][di].hover(function(e){
					var event = e || window.event;
					//verhindern, dass der splash ohne aktiven spieler ausgeführt werden kann
					if(biAktuellerSpieler===false){return void 1;}
					//if(sAktiverSpielerStapel=="" && aAlleSpielerID[iAktuellerSpieler].toString().slice(0,2)!="ki" && aBankStapelHovered==0 && iBankHoverAktiviert==1 || iSpielStatus==MOE_STATUS_ENDE && aBankStapelHovered==0 )
					var biHighlightedSpielerstapel = aMitspieler[biAktuellerSpieler].get_highlighted_stapel();
					if(iBankstapelAufgeblaettert == false && bOberflaecheAktiv==true && biHighlightedSpielerstapel===false && $(this).children().length>0)
					{	iBankstapelAufgeblaettert = true;
						zeige_bankkarten($(this).attr("id"));
						//protokoll("bankhover: Rauf auf "+$(this).attr("id"));
					}
					if (event.stopPropagation) {event.stopPropagation();} else {event.cancelBubble = true;}
				},
				function(e){
					var event = e || window.event;
					if(iBankstapelAufgeblaettert == true)
					{
						verberge_bankkarten($(this).attr("id"));
						iBankstapelAufgeblaettert = false;
						//protokoll("bankhover: Runter von "+$(this).attr("id"));
						if (event.stopPropagation) {event.stopPropagation();} else {event.cancelBubble = true;}
					}
					//protokoll("bank_hover_out: Variablen an Ende "+iBankstapelAufgeblaettert+" == false && "+bOberflaecheAktiv+"==true && "+biHighlightedSpielerstapel+"===false");
				});
			}
		}
		
		
		/***********************************************
			
				Drehen initialisieren
			
		***********************************************/
		
		DrehenIcon.click(function(){
			selbst_Spielfeld.dialog('Sie haben <a title="Eine Plætte sind drei gleiche Bilder zum Beispiel drei Neunen.">Plætte</a> oder eine <a title="Ein Flœte sind drei aufeinanderfolgende Bilder zum Beispiel Bube, Dame, König.">Flœte</a>. Mit einem Klick auf einen Stapel der Vindmølle dürfen Sie den unteren mit dem oberen Stapel vertauschen.');
		});
		

		DrehenIcon.hover(function(){
			selbst_Spielfeld.dialog('Sie haben <a title="Eine Plætte sind drei gleiche Bilder zum Beispiel drei Neunen.">Plætte</a> oder eine <a title="Ein Flœte sind drei aufeinanderfolgende Bilder zum Beispiel Bube, Dame, König.">Flœte</a>. Mit einem Klick auf einen Stapel der Vindmølle dürfen Sie den unteren mit dem oberen Stapel vertauschen.');
		},function(){});
		
	}
	
	var oBank = new bankobject();
	
	this.test_bankobject = function(){
		//oBank = new bankobject();		
		aNK = oBank.naechste_koordinaten(0);
		//protokoll("Nächste Koordinaten sind:"+aNK.join("/"));
		oBank.offene_karte_anfuegen(0,"e2");
		oBank.offene_karte_anfuegen(0,"e3");
		oBank.offene_karte_anfuegen(0,"e4");
		oBank.offene_karte_anfuegen(0,"e5");
		oBank.offene_karte_anfuegen(0,"e6");
		oBank.offene_karte_anfuegen(0,"e7");
		oBank.offene_karte_anfuegen(0,"e8");
		oBank.offene_karte_anfuegen(0,"e9");
		oBank.offene_karte_anfuegen(0,"et");
		oBank.offene_karte_anfuegen(0,"eU");
		oBank.offene_karte_anfuegen(0,"eO");
		oBank.offene_karte_anfuegen(0,"eK");
		oBank.offene_karte_anfuegen(0,"eA");
		
		for(var di=0;di<13;di++)oBank.offene_karte_anfuegen(1,"eA");
		for(var di=0;di<8;di++)oBank.offene_karte_anfuegen(2,"eK");
		oBank.loesche_stapel(2,"a");
		for(var di=0;di<13;di++)oBank.verdeckte_karte_anfuegen(1,"eK");
		for(var di=0;di<15;di++)oBank.verdeckte_karte_anfuegen(2,"eK");
		oBank.stapel_highlighten(1);
		oBank.oberflaeche_aktivieren();
		//oBank.stapel_dehighlighten(1);
		
	}
	
	this.test_bankobject2 = function(){
		oBank.drehen_anzeigen();
		$("#StapelTausch").click(function(){
		oBank.zugmodus_an();});
		
	}
	
	/*********************************
	
		Die Spieler
	
	*********************************/
	
	var spielerobject = function(argPosition,di)
	{
		if(argPosition!="mitte" && argPosition!="links" && argPosition!="rechts")throw "Spieler ohne korrekte Position initialisiert.";
		if(typeof(di)!="number")throw "Spieler ohne korrekte Nummer initialisiert.";
	
		var selbst_Spieler = this;
		var sPosition = argPosition;
		var sPositionKurz=oSpielerposition[sPosition]["kurz"];
		var sPositionLang=oSpielerposition[sPosition]["lang"];
		var bSpielerIstAktiv = false;
		var biAktivierterStapel = false;
		var aAuspielkartenPositionen = new Array( new Array(0,0), new Array(0,0), new Array(0,0));
		var rAblagestapel = $("#stichstapel_"+sPositionLang);
		var bDragAktiv = false;
		var iSpielernummer = di;
		var sSpielername;
		var bHabeLetztenStich = false;
		var bAblagestapelAktiv = true;
		var sBildpfad;
		
		
		//alert(sPosition+" "+sPositionKurz+" "+sPositionLang);
		
		var rSpielerstapel = new Array(
			new Array(
				$("#"+sPositionKurz+"_1a"),$("#"+sPositionKurz+"_2a"),$("#"+sPositionKurz+"_3a")
			),
			new Array(
				$("#"+sPositionKurz+"_1z"),$("#"+sPositionKurz+"_2z"),$("#"+sPositionKurz+"_3z")
			)
		);
		
		
		
		var Stichstapel = $("#stichstapel_"+sPositionLang+"");
		var Namenfeld = $("#"+sPositionLang+"_ueberschrift p.userbox_name");
		var Bildfeld =  $("#"+sPositionLang+"_ueberschrift p.userbox_bild img");
		var Arrayfeld = $("#"+sPositionLang+"_arrays");
		
		var rSpielerfeld = $("#"+sPositionLang);
	
		this.stapel_highlighten = function(iStapelnummer){
			if(bSpielerIstAktiv==true){
				rSpielerstapel[0][iStapelnummer].addClass("karte_aktiv");
				biAktivierterStapel=iStapelnummer;
				//protokoll("stapel_highlighten: biAktivierterStapel:"+biAktivierterStapel);
				oBank.zugmodus_an();
	
				//bankkarten dazu laden, wenn dies die einstellungen vorsehen:
				if(oSpielfeldOptionen.analizeTurn==true){

					//wenn man gar nicht bedienen muss, werden alle bankkarten geladen
					if(aOffeneKarten[6][0].length==0 && aOffeneKarten[6][1].length==0 && aOffeneKarten[6][2].length==0){
						for(var dj=0;dj<3;dj++){
							selbst_Spielfeld.bank().stapel(dj,0).children().filter(":last-child").addClass("karte_ziehbar");
						}
					} else {
						if(aOffeneKarten[6][iStapelnummer].length>0){
							//wenn nur eine karte eine bestimmte anzahl an bankkarten bedienen muss
							for(var j=0;j<aOffeneKarten[6][iStapelnummer].length;j++){
								selbst_Spielfeld.bank().stapel(aOffeneKarten[6][iStapelnummer][j],0).children().filter(":last-child").addClass("karte_ziehbar");
							}
						}
					}
				}
			}
			
		}

		this.stapel_dehighlighten = function(iStapelnummer){
			if(iStapelnummer===0 || iStapelnummer===1 || iStapelnummer===2){
				rSpielerstapel[0][iStapelnummer].removeClass("karte_aktiv");
				biAktivierterStapel=false;
				oBank.zugmodus_aus();
				//protokoll("stapel_dehighlighten: biAktivierterStapel:"+biAktivierterStapel);
				
				//andere Bankempfehlung deaktivieren
				for(var dj=0;dj<3;dj++){
					selbst_Spielfeld.bank().stapel(dj,0).children().filter(":last-child").removeClass("karte_ziehbar");
				}
				
			}
		}
		
		this.karte_auf_stapel = function(iStapelnummer,argKartenname){
			oSound.hinlegen();
			//protokoll("karte_auf_stapel: lege karte "+argKartenname+" auf den Stapel "+iStapelnummer );
			rSpielerstapel[0][iStapelnummer].append( $('#kartenbilder > #'+argKartenname).clone());
		}

		this.verdeckte_karte_auf_stapel = function(iStapelnummer){
			oSound.hinlegen();
			rSpielerstapel[1][iStapelnummer].append( $('#kartenbilder > #zu').clone());
		}		
		
		this.karte_von_stapel_loeschen = function(iStapelnummer,sModus){
			if(sModus!=="a" && sModus!=="z")var sModus="a";
			var sStapelname=sPositionKurz+"_"+(iStapelnummer+1)+sModus;
			//protokoll("karte_von_stapel_loeschen:"+sStapelname);
			$('#'+sStapelname).empty();
		}
	
		this.ist_dran = function(){
			rSpielerfeld.addClass("spieler_aktiv");
                        Namenfeld.addClass("spieler_aktiv");
		}
		
		this.ist_nicht_dran = function(){
			rSpielerfeld.removeClass("spieler_aktiv");
                        Namenfeld.removeClass("spieler_aktiv");
			biAktivierterStapel=false;
		}
		
		this.ist_aktiv = function(){
			bSpielerIstAktiv=true;
			//protokoll(aOffeneKarten[6].join("/"));
			for(di=0;di<3;di++){
				//Spielerstapel aktivieren
				if(rSpielerstapel[0][di].children().length==1)
				{
					//rSpielerstapel[0][di].draggable("enable");

					//Spielerstapel einfärben, wenn die Anzeige aktiviert ist
					if(oSpielfeldOptionen.analizeTurn==true){
						//Wenn die Karte bedienen muss oder alle leer sind
						if(aOffeneKarten[6][di].length>0 || (aOffeneKarten[6][0].length==0 && aOffeneKarten[6][1].length==0 && aOffeneKarten[6][2].length==0)){
							//Karte als ziehbar markieren
							rSpielerstapel[0][di].addClass("karte_ziehbar");
						}
					}
				}
			}
		}
		
		this.ist_inaktiv = function(){
			bSpielerIstAktiv=false;
			for(di=0;di<3;di++){
				rSpielerstapel[0][di].draggable("disable");
				rSpielerstapel[0][di].removeClass("karte_ziehbar");
			}
		}
		
		this.get_highlighted_stapel = function(){
			return biAktivierterStapel;
		}
		
		this.karte_zurueck_zum_stapel = function(iStapelnummer){
			oSound.hinlegen();
			rSpielerstapel[0][iStapelnummer].css( "top" , aAuspielkartenPositionen[iStapelnummer][1]+"px" );
			rSpielerstapel[0][iStapelnummer].css( "left" , aAuspielkartenPositionen[iStapelnummer][0]+"px" );
		}
		
		this.set_name = function(argName){
			Namenfeld.empty().append(argName);
			sSpielername=argName;
		}
		
		this.set_bild = function(argBildpfad){
                    if(iSpieltyp!=100){
			Bildfeld.attr("src",argBildpfad);
			sBildpfad = argBildpfad;
                    }
		}
		
		this.get_name = function(){
			return sSpielername;
		}
		
		this.get_spielernummer = function(){
			return iSpielernummer;
		}
		
		this.stapel_umdrehen = function(argStapelnummer,argKartenID,argQueueThis){
			//Prüfen, ob der Stapel überhaupt umgedreht werden kann
					
			var iStapelnummer=argStapelnummer
			if(rSpielerstapel[1][iStapelnummer].children().length==1 && rSpielerstapel[0][iStapelnummer].children().length==0){

				//Movekarte erstellen
				var oMoveKarte= new movekarteobject();

				//Verdeckt machen und Kartenwert aus Kartenid erstellen, karte drehen
				oMoveKarte.karte_setzen(argKartenID);
				oMoveKarte.karte_verdeckt_drehen();
				
				//Karte auf den Verdeckten Stapel legen
				var oKoordinatenVerdeckteKarte = rSpielerstapel[1][iStapelnummer].offset();
				var oKoordinatenOffeneKarte = rSpielerstapel[0][iStapelnummer].offset();
				var oKoordinatenSpielfeld = $("#spielfeld").offset();
				
				//Position der Movekarte festlegen
				oMoveKarte.position_setzen(oKoordinatenVerdeckteKarte.left-oKoordinatenSpielfeld.left,oKoordinatenVerdeckteKarte.top-oKoordinatenSpielfeld.top);
				
				//Karte sichtbar machen
				oMoveKarte.karte_einblenden();

				//Karte vom Stapel löschen
				oMoveKarte.karte().queue(function(){
					selbst_Spieler.karte_von_stapel_loeschen(iStapelnummer,"z");
					$(this).dequeue();
				});
				
				//Movekarte auf den Stapelverschieben und umdrehen
				oMoveKarte.karte_verschieben(oKoordinatenOffeneKarte.left-oKoordinatenSpielfeld.left,oKoordinatenOffeneKarte.top-oKoordinatenSpielfeld.top,oSpielfeldOptionen.gameSpeed*20,function(){/*protokoll("Karte verschoben");*/});
				//oMoveKarte.karte().delay(250);
				oMoveKarte.karte_drehen();
				
				//Karte unterhalb der Movekarte auf den Stapel legen
				oMoveKarte.karte().queue(function(){
					selbst_Spieler.karte_auf_stapel(iStapelnummer,argKartenID);
					$(this).dequeue();
				});
				
				//den  oberen queue
				oMoveKarte.karte_leeren();
				
				//Den oberen Queuefreigeben.
				oMoveKarte.karte().queue(function(){
					$(argQueueThis).dequeue();
					$(this).dequeue();
				});
				
				//Movekarte löschen
				oMoveKarte.karte_loeschen();
			}
		}
		
		this.stapel = function(argStapelnummer, iIstVerdeckt){
			if(typeof(iIstVerdeckt)=="undefined")var iIstVerdeckt=0;
			return rSpielerstapel[iIstVerdeckt][argStapelnummer];
		}
		
		this.feld = function(){
			return rSpielerfeld;
		}
		
		this.stich_auf_ablagestapel = function(argStichKartenanzahl){
			//protokoll("stich_auf_ablagestapel: Stich "+argStich+" auf den Stichstapel gelegt.");
			
			oSound.stapelablegen();
			
			var iAnzahlLiegenderKarten = rAblagestapel.children().length;
			//iAktuellerZeiger=aAlleSpielerStichStapel[iAktuellerSpieler].length - aStichKarten.length;
			
			for(var i=0;i<argStichKartenanzahl;i++)
			{
				rAblagestapel.append($('#kartenbilder > #zu').clone());
				//$('#stichstapel_'+aPosition2Id[iAktuellerSpieler]+' > div:last-child').css("position","absolute");
				var rLetzteKarte = rAblagestapel.children().last();
				rLetzteKarte.css("position","absolute");
				
				//if(sPosition=="mitte")
				//{
					var sKarteTop="0";
					var sKarteLeft=Math.round(10+((i+iAnzahlLiegenderKarten)*5))+"pt";
				//}
				//else
				//{
				//	var sKarteTop=Math.round(10+((i+iAnzahlLiegenderKarten)*5))+"pt";
				//	var sKarteLeft="0";
				//}
				rLetzteKarte.css("top",sKarteTop);
				rLetzteKarte.css("left",sKarteLeft);
			}
			
		}
		
		this.ablagestapel_deaktivieren = function(){
			bAblagestapelAktiv=false;
		}

		this.ablagestapel_aktivieren = function(){
			bAblagestapelAktiv=true;
		}
		
		this.ablagestapel = function(){
			return rAblagestapel;
		}
		
		this.hat_letzten_stich = function(){
			return bHabeLetztenStich;
		}
		
		this.stichstapel_hover_aktivieren = function(){
			bHabeLetztenStich=true;
		}		
		
		this.stichstapel_hover_deaktivieren = function(){
			bHabeLetztenStich=false;
			//Hier muss manuelle ausgefadet werden, weil das Hoverout-Event deaktiviert wird!
			selbst_Spieler.letzten_stich_ausblenden();
		}
		
		this.get_position = function(){
			return sPosition;
		}
		
		this.get_spieler_aktiv = function(){
			return bSpielerIstAktiv;
		}
		
			
		//blendet den letzten Stich aus
		this.letzten_stich_ausblenden = function(){

			//Zublättern aund ausblenden
			rAblagestapel.clearQueue().queue(function(){
				rLetzterStichFrame.queue(function(){
					selbst_Spielfeld.stapel_zublaettern(rLetzterStich.attr("id"),rLetzterStichFrame);
				});
				rLetzterStichFrame.fadeOut(250).queue(function(){
					rAblagestapel.dequeue();
					$(this).dequeue();
				});

			});

			//Mittelfeld wieder einblenden
			rAblagestapel.queue(function(){
				rMittelfeld.animate({opacity:1.0},250,function(){
					rAblagestapel.dequeue();
				});						
			})
		}
		
		if(oSpielfeldOptionen.bindPlayerActions==true){
		
			/*******************************************

				Drag und Click initialisieren

			*******************************************/

			for(i=0;i<3;i++)
			{
				rSpielerstapel[0][i].draggable(
				{
					create:function(event,ui){
						var doStartPosition=$(this).position();
						var iStapelId=parseInt( $(this).attr("id")[3]-1 ) ;
						aAuspielkartenPositionen[ iStapelId ][0]=doStartPosition.left;
						aAuspielkartenPositionen[ iStapelId ][1]=doStartPosition.top;
						//protokoll("Binde Drag an "+$(this).attr("id")+" mit Startposition ("+aAuspielkartenPositionen[ parseInt($(this).attr("id")[3])-1 ]+")");
					},
					start:function(event,ui){
						oSound.heben();
						var diAktivierterStapel = biAktivierterStapel;
						var diNeuerStapel = parseInt($(this).attr("id")[3])-1;
						
						// Wenn ein anderer Stapel angeklickt wurde, als der aktuelle, soll er aktiviert werden
						if( diNeuerStapel!== diAktivierterStapel){
							
							// Wenn ein anderer Stapel aktiviert ist, soll er zuvor deaktiviert werden
							if(typeof(biAktivierterStapel)=="number" )selbst_Spieler.stapel_dehighlighten(biAktivierterStapel);
							
							selbst_Spieler.stapel_highlighten(diNeuerStapel);
						}
						bDragAktiv=true;
					},
					stop:function(event,ui){
						//protokoll("Drag("+$(this).attr("id")[3]+"): versucht mit iKarteDropped:"+oBank.karte_wurde_abgelegt());
						var diStapelnummer = parseInt($(this).attr("id")[3])-1;
						if(oBank.karte_wurde_abgelegt()==true)
						{
							spielfeld_sperren();

							//Hier muss nun der Aufruf des Controllers erfolgen!

							var iAktivierterSpielerstapel=selbst_Spieler.get_highlighted_stapel();
							selbst_Spieler.stapel_dehighlighten(iAktivierterSpielerstapel);

								//Hier muss der Controler aufgerufen werden, die Zeile dient nur dem Test
								//selbst_Spielfeld.karte_ziehen_und_auflegen(biAktuellerSpieler,aMitspieler[biAktuellerSpieler].get_highlighted_stapel(),iStapelID);
								//protokoll("Spieler "+biAktuellerSpieler+" von "+iAktivierterSpielerstapel+" nach "+(iStapelID)+" ziehen, hä?");
								//strg_ziehen(MOE_ZUGART_VonStapelZuStapelGezogen,biAktuellerSpieler,iAktivierterSpielerstapel,oBank.get_abgelegten_stapel());
								oKartenLegeSteuerung.apply(document, new Array(MOE_ZUGART_VonStapelZuStapelGezogen,biAktuellerSpieler,iAktivierterSpielerstapel,oBank.get_abgelegten_stapel()));
                            	set_zugart(MOE_ZUGART_VonStapelZuStapelGezogen);
								oBank.leere_bank_demarkieren();
							//Die Zeile dient nur dem Test
							//selbst_Spielfeld.karte_auflegen(iSpielernummer,diStapelnummer,oBank.get_abgelegten_stapel());


						}
						else
						{
							selbst_Spieler.karte_zurueck_zum_stapel(diStapelnummer);
						}
						selbst_Spieler.stapel_dehighlighten(diStapelnummer);
						bDragAktiv=false;
					},
					containment:$("#spielfeld"),
					disabled:true
				});

				rSpielerstapel[0][i].click(function(){
					//protokoll("Angeklickter Stapel:"+$(this).attr("id")+"("+(parseInt($(this).attr("id")[3])-1)+") biAktivierterStapel:"+biAktivierterStapel+" diAktivierterStapel:"+diAktivierterStapel);
					var diAktivierterStapel = biAktivierterStapel;
					var iAngeklickterStapel = parseInt($(this).attr("id")[3])-1;

					//Kann nur angeklickt werden, wenn eine Karte oben liegt und diese nicht bewegt wird, sonst übernimmt die Dragsteuerung alles
					if($("#"+$(this).attr("id")+":empty").length==0 &&  bDragAktiv==false){										

						// Wenn ein Stapel aktiviert ist, soll er deaktiviert werden
						if(typeof(biAktivierterStapel)=="number" ){
							selbst_Spieler.stapel_dehighlighten(biAktivierterStapel);			
						}

						// Wenn ein anderer Stapel angeklickt wurde, als der aktuelle, soll er aktiviert werden
						if( (parseInt($(this).attr("id")[3])-1) !== diAktivierterStapel){											
							selbst_Spieler.stapel_highlighten(iAngeklickterStapel);
						}
					}
				});
			}

			/*******************************************

				Hover des Stichstapel initialisieren

			*******************************************/

			rAblagestapel.hover(
				function(e){
					var event = e || window.event;
					if (event.stopPropagation) {event.stopPropagation();} else {event.cancelBubble = true;}
				},
				function(e){
					var event = e || window.event;
					if(bHabeLetztenStich==true && bAblagestapelAktiv==true){
					selbst_Spieler.letzten_stich_ausblenden();
					}
					if (event.stopPropagation) {event.stopPropagation();} else {event.cancelBubble = true;}
				}		
			);
			rAblagestapel.click(function(e){
				var event = e || window.event;
				if(bHabeLetztenStich==true && bAblagestapelAktiv==true){
					rAblagestapel.clearQueue().queue(function(){
						rMittelfeld.animate({opacity:0.2},250,function(){
							rAblagestapel.dequeue();
						});						
					})
					rAblagestapel.queue(function(){
						rLetzterStichFrame.fadeIn(250);
						selbst_Spielfeld.stapel_auffaechern(rLetzterStich.attr("id"));
						rLetzterStichFrame.queue(function(){
							rAblagestapel.dequeue();
							$(this).dequeue();
						});
					});
				}
			});
		}
		
	
	}
	
	this.test_spieler = function(){
		var oSpieler = new spielerobject("mitte");
		oSpieler.set_name("Ralf");
		oSpieler.ist_dran();
		oSpieler.ist_aktiv();
		oSpieler.karte_auf_stapel(1,"eO");
		oSpieler.stapel_highlighten(1);
		//oSpieler.karte_von_stapel_loeschen(1,"a");
		
		oLinkerGegner = new spielerobject("links");
		oLinkerGegner.set_name("Lennart");
		//oLinkerGegner.ist_dran();
		oLinkerGegner.karte_auf_stapel(0,"e9");
		oLinkerGegner.karte_auf_stapel(1,"eU");
		oLinkerGegner.karte_auf_stapel(2,"gU");
	}
	
	this.test_spieler2 = function(){
		oLinkerGegner = new spielerobject("links");
		oLinkerGegner.set_name("Lennart");
		oLinkerGegner.verdeckte_karte_auf_stapel(0);
		oLinkerGegner.verdeckte_karte_auf_stapel(1);
		oLinkerGegner.verdeckte_karte_auf_stapel(2);
		oLinkerGegner.karte_auf_stapel(0,"e9");
		oLinkerGegner.karte_auf_stapel(1,"eU");
		oLinkerGegner.karte_auf_stapel(2,"gU");
		$("#spielform").click(function(){
			oLinkerGegner.karte_von_stapel_loeschen(1);
			oLinkerGegner.stapel_umdrehen(1,"et");
		});
		oLinkerGegner.ist_dran();
		oLinkerGegner.ist_aktiv();
	
	}
	
	this.test_spieler3 = function(){		//init
		//Funktioniert nur mit einem ordentlich initialisierten System
		
		aMitspieler[0].stich_auf_ablagestapel(10);
	}
	
	
	
	// Spieler die übergeben wurden
	for(var di=0;di<3;di++){
		aMitspieler[di] = new spielerobject(aAlleSpieler[di][2],di);
		aMitspieler[di].set_name(aAlleSpieler[di][1]);
		if(aAlleSpieler[di].length==5)aMitspieler[di].set_bild(aAlleSpieler[di][4]);
	}
	

	/*********************************
	
		Der oNachziehstapel mit Møller
	
	*********************************/
	
	var ext_nachziehstapelobject = function()
	{
		var selbst_extNachziehstapel = this;
		var iKartenzahl=0;
		var iDivisor=3;
		var iAngzeigteKartenzahl = 0;
		var rNachziehstapel=$("#ziehstapel");
		var rMoeller = $("#moeller");
		var aKarte2FaceImage = {"K":"king","U":"jack","O":"queen"};
		
		this.set_moeller = function(argKartenname){
			rMoeller.empty();
			rMoeller.append( $('#kartenbilder > #'+argKartenname).clone());
			oSound.hinlegen();
		}
		
		this.moeller_ausgrauen = function(){
			$("#"+rMoeller.attr("id")+" div.front").addClass("graufront");
		}
		
		this.naechste_koordinaten = function(){
			var iAktuelleKartenzahl = $("#"+rNachziehstapel.attr("id")+" > div").length;
			var iLeft=Math.round(2*(iAktuelleKartenzahl));
			var iTop=Math.round(2*(iAktuelleKartenzahl));
			return new Array(iLeft,iTop);
		}
		
		this.aktuelle_koordinaten_offset = function(){
			if(iAngzeigteKartenzahl>0){
				var iLeft=Math.round(2*(iAngzeigteKartenzahl-1));
				var iTop=Math.round(2*(iAngzeigteKartenzahl-1));
				var oNzStapelPosition = rNachziehstapel.offset();
				return new Array(iLeft+oNzStapelPosition.left,iTop+oNzStapelPosition.top);
			}
			else
			{
				return false;
			}
		}
		
		this.create_stapel = function(argKartenzahl){
			iKartenzahl=argKartenzahl;
			iAngzeigteKartenzahl = Math.round((iKartenzahl+1)/iDivisor);
			for(var di = 0; di<iAngzeigteKartenzahl; di++){
				var aKoords = selbst_extNachziehstapel.naechste_koordinaten();
				rNachziehstapel.append( $('#kartenbilder > #zu_quer').clone());
				$("#"+rNachziehstapel.attr("id")+" > div:last-child").css("left",aKoords[0]+"px");
				$("#"+rNachziehstapel.attr("id")+" > div:last-child").css("top",aKoords[1]+"px");
			}
		}
		
		this.karte_nehmen = function(){
			if(iKartenzahl>0){
				iKartenzahl--;
				if(iAngzeigteKartenzahl > Math.round((iKartenzahl+1)/iDivisor)){
					iAngzeigteKartenzahl = Math.round(iKartenzahl/iDivisor);
					$("#"+rNachziehstapel.attr("id")+" > div:last-child").remove();
				}
				//protokoll("karte_nehmen: nimmt karte vom stapel");
			} else if(iKartenzahl==0){
				selbst_extNachziehstapel.moeller_ausgrauen();
				//protokoll("karte_nehmen: nimmt moeller");
				iKartenzahl--;
			}
		}
		
		this.stapel = function(){
			return rNachziehstapel;
		}
		
		this.moeller = function(){
			return rMoeller;
		}
		
		this.get_ziehkarte_koordinaten = function(){
			if(iKartenzahl>0){
				return $("#"+rNachziehstapel.attr("id")+" > div:last-child").offset();
			} else if(iKartenzahl==0){
				return $("#moeller").offset();
			} else {
				throw "Fehler: Spieler hat versucht vom leeren Stapel zu ziehen!";
			}
		}

	}
	
	var oNachziehstapel = new ext_nachziehstapelobject();
	
	this.test_ext_nachziehstapel = function(){
		oNachziehstapel.create_stapel(9);
		oNachziehstapel.set_moeller("eO");
		oNachziehstapel.stapel().click(function(){
			oNachziehstapel.karte_nehmen();
		});

	}
	
	/*********************************
	
		Die Movekarte
	
	*********************************/
	
	var movekarteobject = function(argOhneRueckseite,rjQueryElternElement){
		var iKarteId=ma_z_rand(0,1000);
		var rMovekarte = $('<div id="'+iKarteId+'" class="move_karte" />');
		rMovekarte.css("z-index",1000);
		var bKarteIstGedreht = false;
		
		if(typeof(rjQueryElternElement)=="undefined"){
			rMovekarte.appendTo($("#spielfeld"));
		} else {
			rMovekarte.appendTo(rjQueryElternElement);
		}
		
		if(typeof(argOhneRueckseite)=="undefined" || argOhneRueckseite!==true)rMovekarte.append($(" #kartenbilder > #zu").clone());
		var sMovekarteName = false;
		var aStapel=new Array(); //wenn man einen Stapel kopieren möchte
		
		this.karte_setzen = function(argKartenname){
			//oSound.heben();
			rMovekarte.queue(function(){
				var sKartenname=argKartenname;
				//protokoll("karte_setzen: sKartenname:"+sKartenname);
				if(typeof(sKartenname)!="string")throw "Fehler: kein Kartenname der Movekarte übergeben.";
				if(sKartenname.length!=2)throw "Fehler: Kartennamen müssen zum setzen zwei Stellen lang sein! Stattdessen wurde '"+sKartenname+"' übergeben.";
				sMovekarteName = sKartenname;
				
				if( ($(this).children().length==1 && argOhneRueckseite!==true) || ($(this).children().length==0 && argOhneRueckseite===true)  )$(this).append( $('#kartenbilder > #'+sKartenname).clone());
				else throw "Fehler: Eine Movekarte darf nur einmal gesetzt werden. Sie muss danach gelöscht werden!"
				
				$(this).dequeue();
			});
		}
		
		this.get_kartenname = function(){
			return sMovekarteName;
		}
		
		this.position_setzen = function(argLeft,argTop){
			rMovekarte.queue(function(){
				if(typeof(argLeft)=="number"){
					var sLeft = argLeft+"px";
					var sTop = argTop+"px";
				} else {
					sLeft=argLeft;
					sTop=argTop;
				}
				
				$(this).css("left",sLeft);
				$(this).css("top",sTop);
				$(this).dequeue();
			});
		}
		
		this.karte_einblenden = function(){
			rMovekarte.queue(function(){
				$(this).addClass("move_karte_sichtbar");
				$(this).removeClass("move_karte");
				$(this).dequeue();
			});
		}
		
		this.karte_ausblenden = function(){
			rMovekarte.queue(function(){
				$(this).addClass("move_karte");
				$(this).removeClass("move_karte_sichtbar");
				$(this).dequeue();
			});
		}
		
		this.karte_verschieben = function(argDLeft,argDTop,argZeitMilliSek,argCallbackFunktion){
			
			if(typeof(argCallbackFunktion)=="undefined")argCallbackFunktion=function(){};
			if(typeof(argZeitMilliSek)=="undefined")argZeitMilliSek=oSpielfeldOptionen.gameSpeed*80;
			
			rMovekarte.animate({left:argDLeft,top:argDTop},argZeitMilliSek,argCallbackFunktion);
		}
		
		this.karte_loeschen = function(){
			rMovekarte.queue(function(){
				$(this).remove();
				$(this).dequeue();
			});
		}
		
		this.karte_leeren = function(){
			rMovekarte.queue(function(){
				$(this).empty();
				$(this).dequeue();
			});
		}
		
		this.karte = function(){
			return rMovekarte;
		}
		
		this.karte_verdeckt_drehen = function(){
			if(bKarteIstGedreht==true){
				rMovekarte.queue(function(){
					bKarteIstGedreht=false;
					$(this).removeClass("einfache_drehung_nach_links einfache_drehung_nach_rechts karte_verdeckt_statisch");
					$(this).dequeue();
				});
			}
			else {	
				rMovekarte.queue(function(){
					bKarteIstGedreht=true;
					$(this).addClass("karte_verdeckt_statisch");
					$(this).removeClass("einfache_drehung_nach_links_zurueck einfache_drehung_nach_rechts_zurueck");
					$(this).dequeue();
				});
			}
		}
		
		this.karte_drehen = function(){
			rMovekarte.queue(function(){
				oSound.drehen();
				rMovekarte.dequeue();
			});
			if(bKarteIstGedreht==true){
				rMovekarte.queue(function(){
					bKarteIstGedreht=false;
					$(this).addClass("einfache_drehung_nach_rechts_zurueck");
					$(this).removeClass("einfache_drehung_nach_rechts karte_verdeckt_statisch");
					$(this).dequeue();
				});
			}
			else {	
				rMovekarte.queue(function(){
					bKarteIstGedreht=true;
					rMovekarte.addClass("einfache_drehung_nach_rechts");
					rMovekarte.removeClass("einfache_drehung_nach_rechts_zurueck");
					$(this).dequeue();
				});
			}
			rMovekarte.delay(350);
		}
		
		this.get_karte_gedreht = function(){
			return bKarteIstGedreht;
		}
		
		this.stapel_ausschneiden = function(rBankstapel){
			rMovekarte.queue(function(){
				if(aStapel.length==0 && sMovekarteName===false){
					var iBankstapelKartenAnzahl = rBankstapel.children().length;
					for(var i=0;i<iBankstapelKartenAnzahl;i++){
						//protokoll("stapel_ausschneiden: iBankstapelKartenAnzahl:"+iBankstapelKartenAnzahl+" i:"+i);
						//Aktuelle Karte auf dem Bankstapel
						//var rAktuelleKarteBankStapel = rBankstapel.children(":eq("+i+")");
					
						//Neues Kartenobject einhängen
						aStapel.push(new movekarteobject(false,rMovekarte));
						var iLetzteKarteIndex = aStapel.length -1;
						
						//Karte setzen
						aStapel[iLetzteKarteIndex].karte_setzen(rBankstapel.children(":eq("+i+")").attr("id"));
						
						//Position der Karte übernehmen
						var oKartenposition = rBankstapel.children(":eq("+i+")").position();
						aStapel[iLetzteKarteIndex].position_setzen(oKartenposition.left,oKartenposition.top);
						
						//Karte einblenden
						aStapel[iLetzteKarteIndex].karte_einblenden();
						
						//Karte vom Bankstapel löschen
						
					}
					rBankstapel.children().remove();
				}
				else { selbst_Spielfeld.dialog(Nachrichten.text(2002),Nachrichten.titel(2002)); }
				$(this).dequeue();
			});
		}
		
		this.stapel_verdeckt_generieren = function(aVerdeckterStapel){
			rMovekarte.queue(function(){
				if(aStapel.length==0 && sMovekarteName===false){
					var iBankstapelKartenAnzahl = aVerdeckterStapel.length;
					for(var di=0;di<iBankstapelKartenAnzahl;di++){
						//protokoll("stapel_ausschneiden: iBankstapelKartenAnzahl:"+iBankstapelKartenAnzahl+" i:"+di);
						//Aktuelle Karte auf dem Bankstapel
						//var rAktuelleKarteBankStapel = rBankstapel.children(":eq("+i+")");
					
						//Neues Kartenobject einhängen
						aStapel.push(new movekarteobject(false,rMovekarte));
						var iLetzteKarteIndex = aStapel.length -1;
						
						//Karte setzen
						aStapel[iLetzteKarteIndex].karte_setzen(aVerdeckterStapel[di]);
						aStapel[iLetzteKarteIndex].karte_verdeckt_drehen();
						
						//Position der Karte übernehmen
						aStapel[iLetzteKarteIndex].position_setzen(3*iLetzteKarteIndex,iLetzteKarteIndex*3);
						
						//Karte einblenden
						aStapel[iLetzteKarteIndex].karte_einblenden();
					}
					//protokoll("stapel_drehen: Anzahl der Karten verdeckt:"+aStapel.length);
				}
				else { selbst_Spielfeld.dialog(Nachrichten.text(2002),Nachrichten.titel(2002)); }
				$(this).dequeue();
			});
		}
		
		/*
		
				oMoveKarte.karte_setzen(argKartenID);
				oMoveKarte.karte_verdeckt_drehen();
				
		*/
		
		this.initialisiert = function(){
			if(aStapel.length>0 || sMovekarteName!=false)return true;
			else return false;
		}
		
		this.stapel_drehen = function(){
			rMovekarte.queue(function(){
				var diLaenge = aStapel.length;
				//protokoll("stapel_drehen: diLaenge:"+diLaenge)
				aStapel[diLaenge-1].karte_drehen();
				for(var i=diLaenge-2;i>-1;i--){
					aStapel[diLaenge-1].karte().queue(function(i){
						return function(){
							var di=i;
							//protokoll("stapel_drehen: di:"+di)
							aStapel[di].karte_drehen();
							aStapel[di].karte().queue(function(){
								aStapel[diLaenge-1].karte().dequeue();
								$(this).dequeue();
							});
						};
					}(i));
				}
				aStapel[diLaenge-1].karte().queue(function(){
					rMovekarte.dequeue();
					$(this).dequeue();
				});
			});
		}
		
		this.get_stapelkarten_anzahl = function(){
			return aStapel.length;
		}
		
		//
		//
		// Interne Funktion
		//
		//
		
		this.set_kartegedreht_status = function(argNeuerstatus){
			bKarteIstGedreht=argNeuerstatus;
		}
		
	}
	
	
	this.test_movekarte = function(){
		var oMoveKarte= new movekarteobject();
		oMoveKarte.karte_setzen("g9");
		oMoveKarte.position_setzen(200,200);
		oMoveKarte.karte_einblenden();
	
		oMoveKarte.karte().click(function(){
			//oMoveKarte.karte_verschieben(700,205,1000,function(){protokoll("Fertsch.123123");});
			oMoveKarte.karte_drehen();

		});
		
		oMoveKarte.karte().dblclick(function(){
			oMoveKarte.karte_loeschen();
		});
		
	
	}
	
	
	this.test_bankobject_click = function(){
		//oBank = new bankobject();		
		aNK = oBank.naechste_koordinaten(0);
		//protokoll("Nächste Koordinaten sind:"+aNK.join("/"));
		for(var di=0;di<3;di++)oBank.offene_karte_anfuegen(0,"et");
		for(var di=0;di<2;di++)oBank.offene_karte_anfuegen(1,"eA");
		for(var di=0;di<5;di++)oBank.offene_karte_anfuegen(2,"eK");
		oBank.loesche_stapel(2,"a");
		for(var di=0;di<5;di++)oBank.verdeckte_karte_anfuegen(1,"eK");
		for(var di=0;di<6;di++)oBank.verdeckte_karte_anfuegen(2,"eK");
		oBank.stapel_highlighten(1);
		//oBank.stapel_dehighlighten(1);
		
		var oSpieler = new spielerobject("mitte");
		oSpieler.ist_dran();
		oSpieler.ist_aktiv();
		oSpieler.karte_auf_stapel(1,"eO");
		oSpieler.stapel_highlighten(1);
	}
	
	this.test2_movekarte = function(){
		oBank.oberflaeche_aktivieren();
		//protokoll("test2_movekarte:erstelle movekarte");
		var oMoveKarte= new movekarteobject(true);
		oMoveKarte.position_setzen(200,200);
		oMoveKarte.karte().css("border","1px solid violet");
		oMoveKarte.karte_einblenden();
		oBank.offene_karte_anfuegen(1,"eU");
		oBank.offene_karte_anfuegen(1,"et");
		oBank.offene_karte_anfuegen(1,"e9");
		oBank.offene_karte_anfuegen(1,"hA");
		oBank.offene_karte_anfuegen(1,"ht");
		oBank.offene_karte_anfuegen(1,"gA");
		
		oMoveKarte.karte().delay(500);

		//protokoll("Auf das Spielfeld klicken, zum testen!");
		$("#spielfeld").click(function(){
			if(!oMoveKarte.initialisiert()){
				oMoveKarte.stapel_ausschneiden(oBank.stapel(1,0));
				oMoveKarte.karte().delay(500);
			}
			
			//oMoveKarte.stapel_drehen();
			
			oMoveKarte.karte_verschieben(500,200);
			oMoveKarte.karte().queue(function(){
				aMitspieler[1].stich_auf_ablagestapel(oMoveKarte.get_stapelkarten_anzahl());
				$(this).dequeue();
			});
			oMoveKarte.karte_leeren();
			oMoveKarte.karte_loeschen();

		});
	}
	
	
	/*********************************
	
		Dialogobjekt
	
	*********************************/
	
	
	this.dialog = function(sText,sTitel,bSaveToEnd)
	{
		clearTimeout(oDialogTimer);
		$("div.ui-dialog").stop().css("opacity","0.9");
		if($("div.ui-dialog").length>0)$("#dialog").dialog("close");
		
		
		if(typeof(bSaveToEnd)=="undefined"){ var bSaveToEnd=false; } else { var bSaveToEnd=true; }
		
		if(typeof(sText)=="undefined" && typeof(sTitel)=="undefined")
		{
			//if($('#dialog').hasClass("ui-dialog"))$('#dialog').dialog("close");
		}
		else
		{
			$('#dialog').queue( function(argText,argTitel){
           start_dialogtimer();
				return function(){
					if(bSaveToEnd==true)var oPositionsobjekt = {my:"center", at:"center", of:"#spielfeld"};
					else var oPositionsobjekt = {my:"left top", at:"left+2% top+3%", of:"#spielfeld"};
					
					if(typeof(argTitel)=="undefined")argTitel="Møller";
					else if(typeof(argTitel)=="object"){
						var oPositionsobjekt = { my: argTitel.my, at: argTitel.at, of:argTitel.of};
						argTitel="Møller";
					}
					
					$('#dialog').empty();
					$('#dialog').append("<p>"+argText+"</p>");
					$('#dialog').dialog({
						title:argTitel,
						draggable:false,
						modal:false,
						closeText:"",
						closeOnEscape: true,
						close:function(bShouldSubmit){
							return function(){
								if(bShouldSubmit==true){ 
									$(window).unbind('beforeunload');
									$('#saveResult').submit();
								}
								$('#dialog').dequeue()
							};
						}(bSaveToEnd),
						containment:$("#spielfeld"),
						/*hide:{effect:"fade",duration:2000},*/
						show:"fade",
						resizable:false,
						height:"auto",
						minHeight:0,
						autoResize:true,
						/*buttons: { "Schließen": function() { $(this).dialog("close"); } },*/
						position: oPositionsobjekt
					});
				};
			}(sText,sTitel) );
		}
	}
	
	restart_dialogtimer=function(){
		clearTimeout(oDialogTimer);
		start_dialogtimer ();	   
	}
	
	start_dialogtimer =function(){
	//alert ("Haloo");
	  oDialogTimer = setTimeout(
			function(){
			//alert ("haloo2");
			   $("div.ui-dialog").fadeOut(2500, function (){
			   	$("#dialog").dialog("close");
			   	$("div.ui-dialog").css("opacity","0.9");
			   });
			},
			   	4000
			   );
	}
	
	$(document).on(".ui-widget-overlay","click", function (){
      $("div:ui-dialog:visible").dialog("close");
    });
	
	$(document).on("div:ui-dialog:visible","click", function (){
      $("div:ui-dialog:visible").dialog("close");
  });
  
	$(document).on("div:ui-dialog:visible","mouseenter", function (){
		clearTimeout(oDialogTimer);
		$("div.ui-dialog").stop().animate({"opacity":0.9}, 250);
		
  });

	$(document).on("div:ui-dialog:visible","mouseleave", function (){
	  start_dialogtimer();
  });
	
	this.test_dialog = function(){
	
		//Spielfeld.dialog("Hallo");
		Spielfeld.dialog(Nachrichten.text(100),Nachrichten.titel(100));
	
	}


	/*********************************
	
		Soundobject
	
	*********************************/

	function soundobject(){

		selbst_Sound = this;

		var channel_max = 20;										// number of channels
		audiochannels = new Array();
		oSoundActionVariations = {"drehen":3,"heben":5,"hinlegen":7,"stichnehmen":4,"stapelablegen":3};
		for (a=0;a<channel_max;a++) {									// prepare the channels
			audiochannels[a] = new Array();
			audiochannels[a]['channel'] = new Audio();						// create a new audio object
			audiochannels[a]['finished'] = -1;							// expected end time for this channel
		}
		function play_multi_sound(s) {
			for (a=0;a<audiochannels.length;a++) {
				thistime = new Date();
				if (audiochannels[a]['finished'] < thistime.getTime()) {			// is this channel finished?
					audiochannels[a]['finished'] = thistime.getTime() + document.getElementById(s).duration*1000;
					audiochannels[a]['channel'].src = document.getElementById(s).src;
					audiochannels[a]['channel'].load();
					audiochannels[a]['channel'].play();
					break;
				}
			}
		}

		this.abspielen = function(soundActionName){
			var soundNumber = ma_z_rand_intv_0e(oSoundActionVariations[soundActionName]-1)+1;
			protokoll("Spiele Sound:"+soundActionName+"-"+soundNumber);
			if(oSpielfeldOptionen.playSound==true)play_multi_sound(soundActionName+"-"+soundNumber);
		}

		this.drehen = function(){
			//selbst_Sound.abspielen("drehen");
		}

		this.heben = function(){
			selbst_Sound.abspielen("heben");
		}

		this.hinlegen = function(){
			selbst_Sound.abspielen("hinlegen");
		}

		this.stichnehmen = function(){
			//selbst_Sound.abspielen("stichnehmen");
		}
		
		this.stapelablegen = function(){
			selbst_Sound.abspielen("stapelablegen");
		}
		
	}

	oSound = new soundobject();

	/*********************************************************************************

		Zugriffsfunktionen

	*********************************************************************************/
   
   
   this.spieler = function(iSpielernummer){
	   return aMitspieler[iSpielernummer];
   }
   
   this.bank = function(){
	   return oBank;
   }
   
   this.nachziehstapel = function(){
	   return oNachziehstapel;
   }
   
   this.spielfeld = function(){
	   return rFeld;
   }
   
   this.mittelfeld = function(){
	   return rMittelfeld;
   }
   

	/*********************************************************************************

		Spielfeldoptionen

	*********************************************************************************/
	
	//Wenn die Optionen eingeblendet werden sollen
	if(oSpielfeldOptionen.bindOptionActions===true){

		/********************************************
		 * 
		 * Initialisieren
		 * 
		 */

		//blendet das Optionsfeld ein
		$("#gamesettings").click(function(){
			$('#settings').slideToggle();
		});

		//blendet das Optionsfeld wieder aus
		$("#settings_close").click(function(){
			$('#settings').slideToggle();
		});
		
		//schaltet den Sound an oder ab
		$("#moe_Sound").click(function(){
			if(oSpielfeldOptionen.playSound==true){
				oSpielfeldOptionen.playSound=false;
				$("#moe_Sound > img").attr("src","fileadmin/design/ep/bilder/sound_0_enabled.png");
			} else {
				$("#moe_Sound > img").attr("src","fileadmin/design/ep/bilder/sound_1_enabled.png");
				oSpielfeldOptionen.playSound=true;
			}
		});
		
		//schaltet den Fehlermeldungsbutton ein
		$("#moe_bugreport").css("display","inline");
		
		//schaltet die Spielsounds ein und aktiviert die Einstellungsbuttons
		/*$('#playSound').buttonset();
		$("#playSoundOff").click(function(){oSpielfeldOptionen.playSound=false;});
		$("#playSoundOn").click(function(){oSpielfeldOptionen.playSound=true;})*/

		//schaltet die Punkteanzeige ein und aktiviert die Einstellungsbuttons
		$('#showPoints').buttonset();
		$("#showPointsOff").click(function(){oSpielfeldOptionen.showPoints=false;});
		$("#showPointsOn").click(function(){oSpielfeldOptionen.showPoints=true;});	

		//schaltet die Zuganalyse ein, die erlaubte Züge anzeigt
		$('#analizeTurn').buttonset();
		$("#analizeTurnOff").click(function(){oSpielfeldOptionen.analizeTurn=false;});
		$("#analizeTurnOn").click(function(){oSpielfeldOptionen.analizeTurn=true;});

		//schaltet den Hilfebutton ein, mit dem ein Zug vorgeschlagen werden kann
		$('#giveAdvice').buttonset();
		$("#giveAdviceOn").click(function(){oSpielfeldOptionen.giveAdvice=true;$('#gamehelper').fadeIn();});
		$("#giveAdviceOff").click(function(){oSpielfeldOptionen.giveAdvice=false;$('#gamehelper').fadeOut();});

		//schaltet ein, dass Plætte und Flote angezeigt werden
		$('#showFlute').buttonset();
		$("#showFluteOn").click(function(){oSpielfeldOptionen.showFlute=true;});
		$("#showFluteOff").click(function(){oSpielfeldOptionen.showFlute=false;DrehenIcon.css("display","none");});



		$('#gamehelper').click(function(){
			if(biAktuellerSpieler!==false){
				if(selbst_Spielfeld.spieler(biAktuellerSpieler).get_spieler_aktiv()){
					//Die Spielerstapel wieder enthighlighten, wenn dies nötig ist
					for(di=0;di<3;di++){
						selbst_Spielfeld.spieler(biAktuellerSpieler).stapel(di).removeClass("karte_ziehbar");
						selbst_Spielfeld.bank().stapel(di).children().filter(":last-child").removeClass("karte_ziehbar");
					}

					//Die Steuerung für eine Zugempfehlung aufrufen
					strg_zug_empfehlen(biAktuellerSpieler);
				}
			}
		});


		//aktiviert den Regler für die Spielgeschwindigkeit
		iStartGameSpeed=parseInt(25/oSpielfeldOptionen.gameSpeed);
		$("#gamespeed_value").text(iStartGameSpeed);
		
		$('#gameSpeed').slider({
			min:1,
			max:5,
			value:iStartGameSpeed,
			stop:function(event,ui){
				oSpielfeldOptionen.gameSpeed = 25 / ui.value;
				$("#gamespeed_value").text(ui.value);
				protokoll("Spielgeschwindkeit bei "+oSpielfeldOptionen.gameSpeed);
			}
		});

		/********************************************
		 * 
		 * Startwerte setzen
		 * 
		 *******************************************/

		var sShowPointsFilter = '[value="'+oSpielfeldOptionen.showPoints.toString()+'"]';
		var sAnalizeTurnFilter = '[value="'+oSpielfeldOptionen.analizeTurn.toString()+'"]';
		var sGiveAdviceFilter = '[value="'+oSpielfeldOptionen.giveAdvice.toString()+'"]';
		var sShowFluteFilter = '[value="'+oSpielfeldOptionen.showFlute.toString()+'"]';

		//protokoll(Startaktionen )

		$('input:radio[name="showPoints"]').filter(sShowPointsFilter).click();
		$('input:radio[name="analizeTurn"]').filter(sAnalizeTurnFilter).click();
		$('input:radio[name="giveAdvice"]').filter(sGiveAdviceFilter).click();
		$('input:radio[name="showFlute"]').filter(sShowFluteFilter).click();

		//Für den Slider wurde dies schon bei der initialisierung gemacht
		
	} else {
		//Gamesettingsbutton ausblenden
		
		$("#gamesettings").addClass("inaktiv");
		$("#gamesettings > img").attr("src","fileadmin/design/ep/bilder/einstellungen_disabled.png");
		
	}
	
	/*********************************************************************************

		Beim verlassen der Seite soll eine Warnung angezeigt werden!

	*********************************************************************************/
	
	if(iSpieltyp!=99){
		$(window).bind('beforeunload', function(){
			//alert("")
			selbst_Spielfeld.dialog("Wenn Sie das laufende Spiel verlassen, gilt es als verloren. Sie können die gewünschte Seite in einem neuen Fenster öffnen. Dann bleibt dieses Spiel in diesem Fenster erhalten.");
			return "Wollen Sie die Seite wirklich verlassen?";
		});
	}
	/*********************************************************************************

		Sevices

	*********************************************************************************/

	/*********************************
	
		Service Stichstapel Hover endgültig deaktiveren
	
	*********************************/
	
	this.letzterstich_deaktiveren = function(){
		if(biSpielerHatLetztenStich!==false)aMitspieler[biSpielerHatLetztenStich].stichstapel_hover_deaktivieren();
	}
	
	
	/*********************************
	
		Service Karte ziehen und auflegen
	
	*********************************/

	function karte_ziehen_und_auflegen_int(iSpielernummer,iStapelnummer, iBankstapelnummer,argQueueThis){
	
		//karte laden
		var oMoveKarte= new movekarteobject();
		
		//var argStartStapel = aMitspieler[iSpielernummer].stapel(iStapelnummer,0);
		
		//Ausgangskartenreferenz erzeugen
		//var sDummy = "#"+argStartStapel.attr("id")+" div:last-child";
		//var rAusgangskarte = aMitspieler[iSpielernummer].stapel(iStapelnummer,0).children();//$(sDummy);
		var sKartenname = aMitspieler[iSpielernummer].stapel(iStapelnummer,0).children().attr("id");
		//protokoll(sKartenname);
		if(sKartenname=="zu_quer")sKartenname="zu";
		//Startkoordinaten laden
		var oStartKoordinaten = aMitspieler[iSpielernummer].stapel(iStapelnummer,0).children().offset();
		var oKoordinatenSpielfeld = $("#spielfeld").offset();	

		//Zielkorrdinaten erzeugen
		//protokoll("karte_ziehen_vszs:karte zur oBank ziehen");
		var aNachsteKoordinaten = oBank.naechste_koordinaten(iBankstapelnummer,"a");
		//protokoll("naechste_koordinaten von oBank("+iBankstapelnummer+",'a'): ("+aNachsteKoordinaten+")");
		var aZielStapelKoordinaten = oBank.stapel(iBankstapelnummer,0).offset();
		var oZielKoordinaten = {left:aZielStapelKoordinaten.left+aNachsteKoordinaten[0],top:aZielStapelKoordinaten.top+aNachsteKoordinaten[1]};

		//Verdeckt machen und Kartenwert aus Kartenid erstellen, wenn es eine offene Karte ist, sonst sind die Karten eh verdeckt!
		if(sKartenname!="zu")oMoveKarte.karte_setzen(sKartenname);
		
		//Position der Movekarte festlegen
		oMoveKarte.position_setzen(Math.floor(oStartKoordinaten.left-oKoordinatenSpielfeld.left),Math.floor(oStartKoordinaten.top-oKoordinatenSpielfeld.top));
		
		//Karte sichtbar machen
		oMoveKarte.karte_einblenden();
		
		//Karte vom Stapel löschen
		oMoveKarte.karte().queue(function(){
			aMitspieler[iSpielernummer].karte_von_stapel_loeschen(iStapelnummer,"a");
			$(this).dequeue();
		});		

		
		//movekarte zu den Zielkoordinaten bewegen
		oMoveKarte.karte_verschieben(oZielKoordinaten.left-oKoordinatenSpielfeld.left,oZielKoordinaten.top-oKoordinatenSpielfeld.top,oSpielfeldOptionen.gameSpeed*100,function(){/*protokoll("Karte verschoben");*/});
		
		//Karte unterhalb der Movekarte auf den Stapel legen
		oMoveKarte.karte().queue(function(){
		
			//protokoll("oBank.offene_karte_anfuegen("+iBankstapelnummer+","+sKartenname+")");
			oBank.offene_karte_anfuegen(iBankstapelnummer,sKartenname);
			
			//protokoll("oBank.offene_karte_anfuegen("+iBankstapelnummer+","+sKartenname+")");
			$(this).dequeue();
		});

		//Movekarte vom bildschirm löschen
		oMoveKarte.karte_leeren();
		
		//Übergeordnete Warteschlange freigeben
		oMoveKarte.karte().queue(function(){
			//$("#spielfeld").dequeue();
			$(argQueueThis).dequeue();
			$(this).dequeue();
		});
		
		oMoveKarte.karte_loeschen();
	
	}
	
	this.karte_ziehen_und_auflegen = function(iSpielernummer, iStapelnummer, iBankstapelnummer){
	$("#spielfeld").queue(function(){
		karte_ziehen_und_auflegen_int(iSpielernummer,iStapelnummer,iBankstapelnummer,this);
	});}
	
	
	/*********************************
	
		Service Bank zieht nach
	
	*********************************/
	
	function bank_zieht_nach_int(argZusInformation, argZielInformation,argQueueThis){
		
		//karte laden
		var oMoveKarte= new movekarteobject();
		
		if(typeof(argZusInformation)=="string")	{
			var iKarteVerdeckt = 0;
			var sKartenname=argZusInformation;
		} else {
			var iKarteVerdeckt=1;
			var sKartenname="zu";
		}
		

		//Startkoordinaten laden
		var oStartKoordinaten = oNachziehstapel.get_ziehkarte_koordinaten();
		var oKoordinatenSpielfeld = $("#spielfeld").offset();	

		var iBankstapelnummer = argZielInformation;
		//protokoll("karte_ziehen_vszs:karte zur bank ziehen");
		var aNachsteKoordinaten = oBank.naechste_koordinaten(iBankstapelnummer,iKarteVerdeckt==0?"a":"z");
		//protokoll("naechste_koordinaten("+iBankstapelnummer+","+(iKarteVerdeckt==0?"a":"z")+")"+aNachsteKoordinaten);
		var aZielStapelKoordinaten = oBank.stapel(iBankstapelnummer,iKarteVerdeckt).offset();
		var oZielKoordinaten = {left:aZielStapelKoordinaten.left+aNachsteKoordinaten[0],top:aZielStapelKoordinaten.top+aNachsteKoordinaten[1]};

		//Verdeckt machen und Kartenwert aus Kartenid erstellen, wenn es eine offene Karte ist, sonst sind die Karten eh verdeckt!
		if(sKartenname!="zu")oMoveKarte.karte_setzen(sKartenname);
		
		//Position der Movekarte festlegen
		oMoveKarte.position_setzen(Math.floor(oStartKoordinaten.left-oKoordinatenSpielfeld.left),Math.floor(oStartKoordinaten.top-oKoordinatenSpielfeld.top));
		
		//Karte sichtbar machen
		oMoveKarte.karte_einblenden();
		
		//Karte vom Stapel löschen
		oMoveKarte.karte().queue(function(){
			oNachziehstapel.karte_nehmen();
			$(this).dequeue();
		});		

		//movekarte zu den Zielkoordinaten bewegen
		oMoveKarte.karte_verschieben(oZielKoordinaten.left-oKoordinatenSpielfeld.left,oZielKoordinaten.top-oKoordinatenSpielfeld.top,oSpielfeldOptionen.gameSpeed*50,function(){/*protokoll("Karte verschoben");*/});
		
		//Karte unterhalb der Movekarte auf den Stapel legen
		oMoveKarte.karte().queue(function(){

			//protokoll("oBank.offene_karte_anfuegen("+iBankstapelnummer+","+sKartenname+")");
			if(iKarteVerdeckt==0){
				oBank.offene_karte_anfuegen(iBankstapelnummer,sKartenname);
			}
			else{
				oBank.verdeckte_karte_anfuegen(iBankstapelnummer);
			}
			$(this).dequeue();
		});
	

		//Movekarte löschen
		oMoveKarte.karte_leeren();
		
		oMoveKarte.karte().queue(function(){
			$(argQueueThis).dequeue();
			$(this).dequeue();
		});
		
		oMoveKarte.karte_loeschen();
	
	}
	
	this.bank_zieht_nach = function(argZusInformation, argZielInformation){
		$("#spielfeld").queue(function(){
		bank_zieht_nach_int(argZusInformation,argZielInformation,this);
	});}
	
	/*********************************
	
		Spieler zieht nach
	
	*********************************/

	function spieler_zieht_nach_int(iSpielernummer, iSpielerstapelnummer, argKartenname,  argQueueThis){
		//karte laden
		var oMoveKarte= new movekarteobject();
		
		var sType=typeof(argKartenname);
		//protokoll("typeof("+argKartenname+"):"+sType);
		if(sType=="string")	{	
			var iKarteVerdeckt = 0;
			var sKartenname=argKartenname;
		} else {
			var iKarteVerdeckt=1;
			var sKartenname="zu";
		}
		//protokoll("typeof("+argZusInformation+"):"+sType);

		//Startkoordinaten laden
		var oStartKoordinaten = oNachziehstapel.get_ziehkarte_koordinaten();
		var oKoordinatenSpielfeld = $("#spielfeld").offset();	

		//protokoll("spieler_zieht_nach_int:spieler "+iSpielernummer+" karte "+iSpielerstapelnummer+" vom nachziehstapel ziehen");
		var oZielKoordinaten = aMitspieler[iSpielernummer].stapel(iSpielerstapelnummer,iKarteVerdeckt).offset();

		//Verdeckt machen und Kartenwert aus Kartenid erstellen, wenn es eine offene Karte ist, sonst sind die Karten eh verdeckt!
		if(sKartenname!="zu")oMoveKarte.karte_setzen(sKartenname);
		
		//Position der Movekarte festlegen
		oMoveKarte.position_setzen(Math.floor(oStartKoordinaten.left-oKoordinatenSpielfeld.left),Math.floor(oStartKoordinaten.top-oKoordinatenSpielfeld.top));
		
		//Karte sichtbar machen
		oMoveKarte.karte_einblenden();
		
		//Karte vom Stapel löschen
		oMoveKarte.karte().queue(function(){
			oNachziehstapel.karte_nehmen();
			$(this).dequeue();
		});		

		//movekarte zu den Zielkoordinaten bewegen
		oMoveKarte.karte_verschieben(oZielKoordinaten.left-oKoordinatenSpielfeld.left,oZielKoordinaten.top-oKoordinatenSpielfeld.top,oSpielfeldOptionen.gameSpeed*50,function(){/*protokoll("Karte verschoben");*/});
		
		//Karte unterhalb der Movekarte auf den Stapel legen
		oMoveKarte.karte().queue(function(){
			if(iKarteVerdeckt==0)aMitspieler[iSpielernummer].karte_auf_stapel(iSpielerstapelnummer,sKartenname);
			else aMitspieler[iSpielernummer].verdeckte_karte_auf_stapel(iSpielerstapelnummer);
			$(this).dequeue();
		});
	

		//Movekarte löschen
		oMoveKarte.karte_leeren();
		
		oMoveKarte.karte().queue(function(){
			$(argQueueThis).dequeue();
			$(this).dequeue();
		});
		
		oMoveKarte.karte_loeschen();
	
	}

	this.spieler_zieht_nach = function(iSpielernummer, iSpielerstapelnummer, argKartenname){
	$("#spielfeld").queue(function(){
		//protokoll("spieler_zieht_nach:"+iSpielerstapelnummer);
		spieler_zieht_nach_int(iSpielernummer, iSpielerstapelnummer,argKartenname,this);
	});}
	
	
	/*********************************
	
		Service Karte legen as
	
	*********************************/


	function karte_auflegen_int(argSpielernummer,argStapelnummer, argBankstapelnummer,argQueueThis){
		//protokoll("argSpielernummer:"+argSpielernummer+",argStapelnummer"+argStapelnummer+", argBankstapelnummer:"+argBankstapelnummer+",argQueueThis:"+argQueueThis);
			//Karte unterhalb der Spielerkarte erzeugen
		aMitspieler[argSpielernummer].stapel(argStapelnummer,0).queue(function(){
			//protokoll("argZielUnterobjekt.offene_karte_anfuegen("+iBankstapelnummer+","+sKartenname+")");
			oBank.offene_karte_anfuegen(argBankstapelnummer,aMitspieler[argSpielernummer].stapel(argStapelnummer,0).children().attr("id") );
			$(this).dequeue();
		});
	
		//Stapel zurück zu seinem Ausgangsplatz
		aMitspieler[argSpielernummer].stapel_dehighlighten(argStapelnummer);
		aMitspieler[argSpielernummer].karte_von_stapel_loeschen(argStapelnummer,"a");
		aMitspieler[argSpielernummer].karte_zurueck_zum_stapel(argStapelnummer);
		
		//Bankoberfläche zurücksetzen
		oBank.reset_bankdrop();
		
		//Obersten Queue weiterlaufen lassen
		aMitspieler[argSpielernummer].stapel(argStapelnummer,0).queue(function(){
			$(argQueueThis).dequeue();
			$(this).dequeue();
		});
	}
	
	this.karte_auflegen = function(argSpielernummer,argStapelnummer, argBankstapelnummer){
	$("#spielfeld").queue(function(){
		karte_auflegen_int(argSpielernummer,argStapelnummer, argBankstapelnummer,this);
	});
	}
	

	/*********************************
	
		Services Geben
	
	*********************************/
	
	
	this.karten_geben = function(argKarten, argGeberNummer,argKartenanzahl){
	$("#spielfeld").queue(function(){
	
		//Anzahl der Spieler in Variable laden
		var iAnzahlDerSpieler = aMitspieler.length;
	
		//Karten laden
		var aKarten=argKarten;
		
		//Stapel visualisieren
		oNachziehstapel.create_stapel(argKartenanzahl);
		
		//Übersetzungsarray einfügen
		var aUebersetzer = new Array();
		var diSpielerzeiger=argGeberNummer;
		for(var j=0;j<iAnzahlDerSpieler;j++){
			diSpielerzeiger=rotate_clockwise(0,iAnzahlDerSpieler-1,diSpielerzeiger);
			aUebersetzer.push(diSpielerzeiger);
		}
		//Übersetzungsrray für die Stapel, damit der mittlere und untere Spieler immer von rechts aufgefüllt werden
		var aStapelUebersetzer = {mitte:new Array(0,1,2),links:new Array(0,1,2),rechts:new Array(2,1,0)};
		
		//
		//protokoll("karten_geben: "+aUebersetzer);
		
		//Verdeckt
		for(var i=0;i<3;i++)
		{
			for(var j=0;j<aMitspieler.length;j++){
				//protokoll("("+aUebersetzer[j]+","+selbst_Spielfeld.spieler(aUebersetzer[j]).get_position()+","+aStapelUebersetzer[  (selbst_Spielfeld.spieler(aUebersetzer[j]).get_position())  ]+"["+i+"]));");
				oNachziehstapel.stapel().queue(function(argSpielerNr,argStapelnummer){
					return function(){
						spieler_zieht_nach_int(argSpielerNr,argStapelnummer,1,this);
					};
				}(aUebersetzer[j],aStapelUebersetzer[ selbst_Spielfeld.spieler(aUebersetzer[j]).get_position() ][i]));
			}
			oNachziehstapel.stapel().queue(function(argStapelnummer){
				return function(){
					bank_zieht_nach_int(1,argStapelnummer,this);
				}
			}(i));
		}
		
		//offen
		for(var i=0;i<3;i++)
		{
			for(var j=0;j<aMitspieler.length;j++){
				
				oNachziehstapel.stapel().queue(function(argSpielerNr,argStapelnummer){
					return function(){
						spieler_zieht_nach_int(argSpielerNr,argStapelnummer,aKarten[argSpielerNr+2][argStapelnummer],this);
					};
				//}(aUebersetzer[j],i));
				}(aUebersetzer[j],aStapelUebersetzer[ selbst_Spielfeld.spieler(aUebersetzer[j]).get_position() ][i]));
			}
			oNachziehstapel.stapel().queue(function(argStapelnummer){
				return function(){
					bank_zieht_nach_int(aKarten[1][argStapelnummer],argStapelnummer,this);
				}
			}(i));
		}
		
/*
		oNachziehstapel.stapel().queue(function(){spieler_zieht_nach_int(aKarten[2][0],0,0,this);});
		oNachziehstapel.stapel().queue(function(){spieler_zieht_nach_int(aKarten[3][0],1,0,this);});
		oNachziehstapel.stapel().queue(function(){spieler_zieht_nach_int(aKarten[4][0],2,0,this);});
		oNachziehstapel.stapel().queue(function(){   bank_zieht_nach_int(aKarten[1][0],0,this);});
		
*/
		//Karte zum Möller führen
		oNachziehstapel.stapel().delay(200).queue(function(){oNachziehstapel.karte_nehmen();$(this).dequeue();});
		oNachziehstapel.stapel().delay(200).queue(function(){oNachziehstapel.set_moeller(aKarten[0]);$(this).dequeue();});

		
		oNachziehstapel.stapel().delay(250).queue(function(){
			$("#spielfeld").dequeue();
			$(this).dequeue();
		});
	});
	}
	
	this.test_kartengeben = function(){
	
		var aAlleSpieler = new Array(new Array(19870418,"Ralf"),new Array(19870129,"Lenni"),new Array(19870105,"Alex"));
		var aPositionen = new Array("rechts","mitte","links");
		var aMitspieler = new Array(3);
		
		for(var di=0;di<3;di++){
			aMitspieler[di] = new spielerobject(aPositionen[di]);
			aMitspieler[di].set_name(aAlleSpieler[di][1]);
		}
		
		
		oNachziehstapel.create_stapel(48);
		
		
		Spiel = new spielobject(init_SpielID,init_oBlatt,aAlleSpieler);
		
		
		aKarten  = Spiel.karten_geben();
		//protokoll(aKarten.join("/"));
		//selbst_Spielfeld.karten_geben();
		
		rFeld.queue(function(){oNachziehstapel.karte_nehmen();$(this).dequeue();});
		rFeld.queue(function(){oNachziehstapel.set_moeller(aKarten[0]);$(this).dequeue();});
		
		
		//Verdeckt
		for(var di=0;di<3;di++){
			selbst_Spielfeld.spieler_zieht_nach_ext(oNachziehstapel,1,aMitspieler[0],di);
			selbst_Spielfeld.spieler_zieht_nach_ext(oNachziehstapel,1,aMitspieler[1],di);
			selbst_Spielfeld.spieler_zieht_nach_ext(oNachziehstapel,1,aMitspieler[2],di);
			selbst_Spielfeld.bank_zieht_nach_ext(oNachziehstapel,1,oBank,di);
		}
		
		//offen
		for(var di=0;di<3;di++){
			selbst_Spielfeld.spieler_zieht_nach_ext(oNachziehstapel,aKarten[2][di],aMitspieler[0],di);
			selbst_Spielfeld.spieler_zieht_nach_ext(oNachziehstapel,aKarten[3][di],aMitspieler[1],di);
			selbst_Spielfeld.spieler_zieht_nach_ext(oNachziehstapel,aKarten[4][di],aMitspieler[2],di);
			selbst_Spielfeld.bank_zieht_nach_ext(oNachziehstapel,aKarten[1][di],oBank,di);
		}
		
		
	}
	
	/*********************************
	
		Service Aktuellen Spieler anzeigen
	
	*********************************/
	
	this.aktuellen_spieler_anzeigen = function(argSpielernummer){
		$("#spielfeld").queue(function(){
			//Altem Spieler wieder , wenn es ihn gibt.
			if(typeof(biAktuellerSpieler)=="number"){aMitspieler[biAktuellerSpieler].ist_nicht_dran();}
			//Alten der nächsten Spieler ersetzen
			biAktuellerSpieler=argSpielernummer;
			//Neuen Spieler 
			if(typeof(biAktuellerSpieler)=="number"){aMitspieler[biAktuellerSpieler].ist_dran();}
			//Wenn die Bank 
			$(this).dequeue();
		});
	}
	
	/*********************************
	
		Sieger anzeigen
	
	*********************************/	
	
	this.sieger_anzeigen = function(sPunktestand,iGewinner1,iGewinner2,aPunktestand){
		$("#spielfeld").queue(function(){
			Spielfeld.dialog(sPunktestand,"Møller  - Spielende",true);
			if(typeof(iGewinner1)=="number"){aMitspieler[iGewinner1].ist_dran();}
			if(typeof(iGewinner2)=="number"){aMitspieler[iGewinner2].ist_dran();}
			$(this).dequeue();
		});
	}
	
	
	this.spiel_ist_zuende = function(argPunktestand){

		//Sieger anzeigen
		selbst_Spielfeld.dialog("Spielende","",true);

		//Ergebnis speichern
		for(var i=0;i<3;i++){
			selbst_Spielfeld.spieler(i).ist_nicht_dran();
			$('#member'+i).attr("value",argPunktestand[i]);
		} 
		
	}
	
	/*********************************
	
		Umdrehen
	
	*********************************/
	
	this.spieler_dreht_um = function(argSpielernummer,argKartenname,argStapelnummer){
		$("#spielfeld").queue(function(){	
			aMitspieler[argSpielernummer].stapel_umdrehen(argStapelnummer,argKartenname,this);
		});
	}
	
	/*********************************
	
		Services Spieler zieht stich ein
	
	*********************************/	
	
	function spieler_zieht_ein_int(argSpielernummer,argBankstapelnummer,argQueueThis){
		
		//
		// Vorbereitung für die Anzeige des letzten Stiches
		//
		
		if(biSpielerHatLetztenStich!==false){
			aMitspieler[biSpielerHatLetztenStich].stichstapel_hover_deaktivieren();
		}
		
		//
		// Eigentliche Zug
		//
		
		//karte laden
		var oMoveKarte= new movekarteobject(true);
		
		//Startkoordinaten laden
		var oStartKoordinaten = oBank.stapel(argBankstapelnummer,0).offset();
		var oKoordinatenSpielfeld = $("#spielfeld").offset();	

		var oZielKoordinaten = aMitspieler[argSpielernummer].ablagestapel().offset();

		//Position der Movekarte festlegen
		oMoveKarte.position_setzen(Math.floor(oStartKoordinaten.left-oKoordinatenSpielfeld.left),Math.floor(oStartKoordinaten.top-oKoordinatenSpielfeld.top));
		
		//Karte sichtbar machen
		oMoveKarte.karte_einblenden();
		
		//Stichkopie für die Anzeige des letzten Stiches anfertigen
		rLetzterStich.empty();
		rLetzterStich.append(oBank.stapel(argBankstapelnummer,0).children().clone());
		
		//Stapel vom Bankstapel ausschneiden, sie müssen nicht mehr gelöscht werden.
		oMoveKarte.stapel_ausschneiden(oBank.stapel(argBankstapelnummer,0));
		
		//movekarte zu den Zielkoordinaten bewegen
		oMoveKarte.karte_verschieben(oZielKoordinaten.left-oKoordinatenSpielfeld.left,oZielKoordinaten.top-oKoordinatenSpielfeld.top,oSpielfeldOptionen.gameSpeed*50,function(){/*protokoll("Karte verschoben");*/});
		
		//Karte unterhalb der Movekarte auf den Stapel legen
		oMoveKarte.karte().queue(function(){
				aMitspieler[argSpielernummer].stich_auf_ablagestapel(oMoveKarte.get_stapelkarten_anzahl());
				$(this).dequeue();
		});
	
		//Movekarte löschen
		oMoveKarte.karte_leeren();
	
		//Letztenstich auf diesen Spieler stellen und dessen Hoveraktivieren
		selbst_Spielfeld.letzterstich_deaktiveren();
		biSpielerHatLetztenStich=argSpielernummer;
		aMitspieler[biSpielerHatLetztenStich].stichstapel_hover_aktivieren();
		
		//Nächsten Schritt freigeben
		oMoveKarte.karte().queue(function(){
			$(argQueueThis).dequeue();
			$(this).dequeue();
		});
		
		oMoveKarte.karte_loeschen();
	}
	
	this.spieler_zieht_ein = function(argSpielernummer,argBankstapel){
		$("#spielfeld").queue(function(){
			spieler_zieht_ein_int(argSpielernummer,argBankstapel,this);
		});
	}

	
	/*********************************
	
		Service Bankdrehen aktivieren
	
	*********************************/
	
	function bank_drehen_aktivieren_int(argQueueThis){
		oBank.drehen_aktivieren();
	}
	
	this.bank_drehen_aktivieren = function(){
		$("#spielfeld").queue(function(){
			bank_drehen_aktivieren_int(this);
			$(this).dequeue();
		});
	}
	
	/*********************************
	
		Service Bankdrehen deaktivieren
	
	*********************************/
	
	function bank_drehen_deaktivieren_int(){
		
		//throw "Fehler:bank_drehen_deaktivieren_int soll eigentlich direkt beim legen der karte geschehen.";  			<--- Das ist blödsinn, weil dies durch den controller geprüft wird
		oBank.drehen_deaktivieren();		
	}
	
	this.bank_drehen_deaktivieren = function(){
		$("#spielfeld").queue(function(){
			bank_drehen_deaktivieren_int(this);
			$(this).dequeue();
		});		
	}
	
	/*********************************
	
		Services Bank drehen (Stich tauschen)
	
	*********************************/
	
	function bank_drehen_int(iBankstapelNummer,aOffenerStich,argQueueThis){
		
		//karten laden
		var oNachUnten= new movekarteobject(true);
		var oNachOben= new movekarteobject(true);
		
		var oKoordinatenSpielfeld = $("#spielfeld").offset();	
		
		//Startkoordinaten für Oben laden
		var oStartKoordinatenOben = oBank.stapel(iBankstapelNummer,0).offset();
		var oZwischenKorrdinatenNachUnten = {left:oStartKoordinatenOben.left,top:oStartKoordinatenOben.top+100};
		
		//Startkoordinaten für Unten laden
		var oStartKoordinatenUnten = oBank.stapel(iBankstapelNummer,1).offset();
		var oZwischenKorrdinatenNachOben = {left:oStartKoordinatenUnten.left,top:oStartKoordinatenUnten.top-50};
		
		//Nach Unten
		//
		
		// Dies muss dequeuet werden, damit die karten nicht überlappen
		oNachOben.karte().queue(function(){
						
			//Position der Movekarte Oben nach Unten festlegen
			oNachUnten.position_setzen(Math.floor(oStartKoordinatenOben.left-oKoordinatenSpielfeld.left),Math.floor(oStartKoordinatenOben.top-oKoordinatenSpielfeld.top));
			
			//Karte sichtbar machen
			oNachUnten.karte_einblenden();
			
			//Karte vom Bankstapel ausschneiden, sie müssen nicht mehr gelöscht werden.
			oNachUnten.stapel_ausschneiden(oBank.stapel(iBankstapelNummer,0));
			
			//movekarte zu den Zielkoordinaten bewegen
			oNachUnten.karte_verschieben(oZwischenKorrdinatenNachUnten.left-oKoordinatenSpielfeld.left,oZwischenKorrdinatenNachUnten.top-oKoordinatenSpielfeld.top,oSpielfeldOptionen.gameSpeed*50,function(){oNachOben.karte().dequeue();});
		});
		//Nach Oben
		//
		
		//Position der Movekarte Oben "nach Unten" bewegen
		oNachOben.position_setzen(Math.floor(oStartKoordinatenUnten.left-oKoordinatenSpielfeld.left),Math.floor(oStartKoordinatenUnten.top-oKoordinatenSpielfeld.top));
		
		//Karte sichtbar machen
		oNachOben.karte_einblenden();
		
		//Karte vom Bankstapel ausschneiden, sie müssen nicht mehr gelöscht werden.
		oNachOben.stapel_verdeckt_generieren(aOffenerStich);
		oNachOben.karte().queue(function(){
			oBank.loesche_stapel(iBankstapelNummer,"z");
			oNachOben.karte().dequeue();
		});
		
		//movekarte zu den zwischenkorrdinaten bewegen
		oNachOben.karte_verschieben(oZwischenKorrdinatenNachOben.left-oKoordinatenSpielfeld.left,oZwischenKorrdinatenNachOben.top-oKoordinatenSpielfeld.top,oSpielfeldOptionen.gameSpeed*50,function(){/*protokoll("Karte verschoben");*/});

		
		//
		oNachOben.karte().queue(function(){
			oNachUnten.stapel_drehen();
			oNachUnten.karte().queue(function(){
				oNachOben.karte().dequeue();
				oNachUnten.karte().dequeue();
			});
		});
		
		oNachOben.stapel_drehen();
		
		// Movekarte oben nach unten bewegen
		oNachOben.karte().queue(function(){
			//movekarte zu den Zielkoordinaten bewegen
			oNachUnten.karte_verschieben(oStartKoordinatenUnten.left-oKoordinatenSpielfeld.left,oStartKoordinatenUnten.top-oKoordinatenSpielfeld.top,oSpielfeldOptionen.gameSpeed*50,
				function(){
					//bankstapel erstellen
					//protokoll("bank_drehen_int: Anzahl der Karten:"+oNachUnten.get_stapelkarten_anzahl());
					for(var di=0;di<oNachUnten.get_stapelkarten_anzahl();di++){
						//protokoll("bank_drehen_int: verdeckte karte anfügen iBankstapelNummer:"+iBankstapelNummer);
						oBank.verdeckte_karte_anfuegen(iBankstapelNummer);
					}
					//Karte löschen
					oNachUnten.karte_leeren();
					oNachUnten.karte_loeschen();
					oNachOben.karte().dequeue();
					//oNachOben.karte().dequeue();
				}
			);
		});
		
		
		//Movekarte Unten nach Oben bewegen
		oNachOben.karte_verschieben(oStartKoordinatenOben.left-oKoordinatenSpielfeld.left,oStartKoordinatenOben.top-oKoordinatenSpielfeld.top,oSpielfeldOptionen.gameSpeed*40,function(){/*protokoll("Karte verschoben");*/});
		
		//Bankstapel erstellen
		oNachOben.karte().queue(function(){
			//Bankstapel erstellen
			for(var di=0;di<oNachOben.get_stapelkarten_anzahl();di++){
				//protokoll("bank_drehen_int: karte "+aOffenerStich[di]+" anfügen iBankstapelNummer:"+iBankstapelNummer);
				oBank.offene_karte_anfuegen(iBankstapelNummer,aOffenerStich[di]);
			}
			//Karte löschen
			oNachOben.karte_leeren();
			oNachOben.karte_loeschen();
			oNachOben.karte().dequeue();			
		});
		
	
		//Spielfeld Queue weiterlaufen lassen
		oNachOben.karte().queue(function(){
			$("#spielfeld").dequeue();
			oNachOben.karte().dequeue();
		});
	}

	
	this.bank_drehen = function(iBankstapelNummer,aOffenerStich){
		$("#spielfeld").queue(function(){
			bank_drehen_int(iBankstapelNummer,aOffenerStich,this);
		});
	}

	/*********************************
	
		Services Bankstich aufdecken
	
	*********************************/
	
	function bank_dreht_um_int(iBankstapelNummer,aOffenerStich,argQueueThis){
		
		//karten laden
		var oNachUnten= new movekarteobject(true);
		var oNachOben= new movekarteobject(true);
		
		var oKoordinatenSpielfeld = $("#spielfeld").offset();	
		
		//Startkoordinaten für Oben laden
		var oStartKoordinatenOben = oBank.stapel(iBankstapelNummer,0).offset();
		
		//Startkoordinaten für Unten laden
		var oStartKoordinatenUnten = oBank.stapel(iBankstapelNummer,1).offset();
		
		//Nach Oben
		//
		
		//Position der Movekarte Oben "nach Unten" bewegen
		oNachOben.position_setzen(Math.floor(oStartKoordinatenUnten.left-oKoordinatenSpielfeld.left),Math.floor(oStartKoordinatenUnten.top-oKoordinatenSpielfeld.top));
		
		//Karte sichtbar machen
		oNachOben.karte_einblenden();
		
		//Karte vom Bankstapel ausschneiden, sie müssen nicht mehr gelöscht werden.
		oNachOben.stapel_verdeckt_generieren(aOffenerStich);
		oNachOben.karte().queue(function(){
			oBank.loesche_stapel(iBankstapelNummer,"z");
			oNachOben.karte().dequeue();
		});
		
		oNachOben.stapel_drehen();
		
		//Movekarte Unten nach Oben bewegen
		oNachOben.karte_verschieben(oStartKoordinatenOben.left-oKoordinatenSpielfeld.left,oStartKoordinatenOben.top-oKoordinatenSpielfeld.top,oSpielfeldOptionen.gameSpeed*40,function(){/*protokoll("Karte verschoben");*/});
		
		//Bankstapel erstellen
		oNachOben.karte().queue(function(){
			//Bankstapel erstellen
			for(var di=0;di<oNachOben.get_stapelkarten_anzahl();di++){
				//protokoll("bank_drehen_int: karte "+aOffenerStich[di]+" anfügen iBankstapelNummer:"+iBankstapelNummer);
				oBank.offene_karte_anfuegen(iBankstapelNummer,aOffenerStich[di]);
			}
			//Karte löschen
			oNachOben.karte_leeren();
			oNachOben.karte_loeschen();
			oNachOben.karte().dequeue();			
		});
		
	
		//Spielfeld Queue weiterlaufen lassen
		oNachOben.karte().queue(function(){
			$("#spielfeld").dequeue();
			oNachOben.karte().dequeue();
		});
	}

	
	this.bank_dreht_um = function(iBankstapelNummer,aOffenerStich){
		$("#spielfeld").queue(function(){
			bank_dreht_um_int(iBankstapelNummer,aOffenerStich,this);
		});
	}

	/*********************************
	
		Spieler deckt die jeweils letzte karte vom stapel auf (Endanimation)
	
	*********************************/

	function karte_vom_ablagestapel_aufdecken_int(iSpielernummer, argKartenname,  argQueueThis){
		//protokoll("karte_vom_ablagestapel_aufdecken_int: Spieler:"+iSpielernummer+" Karte:"+argKartenname);
		//karte laden
		var oMoveKarte= new movekarteobject();
		
		var sKartenname=argKartenname;
		

		//Startkoordinaten laden
		var oStartKoordinaten = aMitspieler[iSpielernummer].ablagestapel().children(":last-child").offset();
		var oKoordinatenSpielfeld = $("#spielfeld").offset();	

		//protokoll("spieler_zieht_nach_int:spieler "+iSpielernummer+" karte "+iSpielerstapelnummer+" vom nachziehstapel ziehen");
		var iZeiger = aMitspieler[iSpielernummer].feld().children().length-2;
		var oFeldKoordinaten = aMitspieler[iSpielernummer].feld().offset;
		if(aMitspieler[iSpielernummer].get_position()=="mitte"){
			var oZielKoordinaten = {left:(iZeiger*20),top:9+((iZeiger%2)*20)};
		} else {
			var oZielKoordinaten = {left:9+((iZeiger%2)*20),top:(iZeiger*20)};
		}
		
		//Verdeckt machen und Kartenwert aus Kartenid erstellen, wenn es eine offene Karte ist, sonst sind die Karten eh verdeckt!
		oMoveKarte.karte_setzen(sKartenname);
		
		//Position der Movekarte festlegen
		oMoveKarte.position_setzen(Math.floor(oStartKoordinaten.left-oKoordinatenSpielfeld.left),Math.floor(oStartKoordinaten.top-oKoordinatenSpielfeld.top));
		
		//Karte sichtbar machen
		oMoveKarte.karte_einblenden();
		
		//Karte unterhalb der Movekarte löschen
		oMoveKarte.karte().queue(function(){
			aMitspieler[iSpielernummer].ablagestapel().children(":last-child").remove();
			$(this).dequeue();
		});
		
		//movekarte zu den Zielkoordinaten bewegen
		oMoveKarte.karte_verschieben(oFeldKoordinaten.left-oKoordinatenSpielfeld.left+oZielKoordinaten.left,oFeldKoordinaten.top-oKoordinatenSpielfeld.top+oZielKoordinaten.top,oSpielfeldOptionen.gameSpeed*30);
		
		//Karte unterhalb der Movekarte auf den Stapel legen
		oMoveKarte.karte().queue(function(){
			aMitspieler[iSpielernummer].feld().append(oMoveKarte.karte().children("div:last-child").clone());
			aMitspieler[iSpielernummer].feld().children(":last-child").css("position","absolute");
			aMitspieler[iSpielernummer].feld().children(":last-child").css("left",oZielKoordinaten.left);
			aMitspieler[iSpielernummer].feld().children(":last-child").css("top",oZielKoordinaten.top);
			$(this).dequeue();
		});
	

		//Movekarte löschen
		oMoveKarte.karte_leeren();
		
		oMoveKarte.karte().queue(function(){
			$(argQueueThis).dequeue();
			$(this).dequeue();
		});
		
		oMoveKarte.karte_loeschen();
	
	}

	this.karte_vom_ablagestapel_aufdecken = function(iSpielernummer, argStapel){
		for(var j=argStapel.length-1;j>-1;j--){
			$("#spielfeld").queue(function(argJ){
				return function(){
					//protokoll("karte_vom_ablagestapel_aufdecken:"+iSpielernummer+" j:"+argJ);
					karte_vom_ablagestapel_aufdecken_int(iSpielernummer, argStapel[argJ],this);
				}
			}(j));
		}
	}
	
	/*********************************
	
		Spieler nimmt Karte zurück
	
	*********************************/	
	
	this.zug_zurueckziehen = function(argSpielernummer,argSpielerstapelnummer){
		aMitspieler[argSpielernummer].karte_zurueck_zum_stapel(argSpielerstapelnummer);
	
	}
	
	
	/********************************
	 * 
	 * Stapel Splashen
	 * 
	 *******************************/
	
	this.stapel_auffaechern = function(argStapelID){
		sBankStapel=argStapelID;
		var iKartenZahl=$( "#"+argStapelID+" > div" ).length;	
		//protokoll('Hover Bankstapel '+iKartenZahl);
		var zmax=0;
		var izmax=0;
		var zi=0;
		var z0=2000;

		var delta_winkel=2*Math.PI/iKartenZahl;
		if(delta_winkel>(Math.PI/6))delta_winkel=delta_winkel=Math.PI/6;

		$('#'+argStapelID+" > div").stop(true,false);
		//for(i=iKartenZahl-1;i>=0;i--)
		for(i=0;i<iKartenZahl;i++)
		{
			// Splash vertikal
//			var radiusy=($("#zu").height()/1.2-10);
			var radiusy=40;
			var iTop=Math.round(radiusy*( 1-Math.cos(delta_winkel*i)));

			// Splash horizontal
//			var radiusx=($("#zu").width()/1+10);
			var radiusx=60;
			var iLeft=Math.round(radiusx*(Math.sin(delta_winkel*i)));

			zi=z0+i;

			$('#'+argStapelID+" > div").filter(":eq("+(i)+") , :gt("+(i)+")").css("z-index",(zi)).delay(oSpielfeldOptionen.gameSpeed*5).animate({"left":iLeft+"%","top":iTop+"%"},oSpielfeldOptionen.gameSpeed*10,"swing"); // 
		}
	}
	
	/*********************************
	
		Stapel zufächern
	
	*********************************/
	
	this.stapel_zublaettern = function(argStapelID,argQueueObjekt){
		
		var iKartenZahl=$( "#"+argStapelID+" > div" ).length;	

		for(var i=0;i<iKartenZahl;i++)
		{

			var iLeft=Math.round(3*i);
			var iTop=Math.round(3*i);
			$('#'+argStapelID+" > div").filter(":eq("+(i)+")").stop(true,false).animate(
				{"left":iLeft+"px","top":iTop+"px"},
				oSpielfeldOptionen.gameSpeed*20,
				"swing",
				function(argI){			//Wenn das letzte i erreicht wird, muss die nächste Funktion gestartet werden.
					return function(){
						if(argI==iKartenZahl-1 && typeof(argQueueObjekt)!="undefined"){
							$(argQueueObjekt).dequeue();
						}
					};
				}(i)
			);
		}
	}
	
	/*********************************
	
		Privater Service Oberflaeche sperren
	
	*********************************/
	
	function spielfeld_sperren(){
		$("#spielfeld").queue(function(){	
			//Aktuellen Spieler sperren
			if(typeof(biAktuellerSpieler)=="number"){
				aMitspieler[biAktuellerSpieler].ist_inaktiv();
			}
			
			//Bank deaktivieren
			oBank.oberflaeche_deaktivieren();
			$(this).dequeue();
		});
	}
	
	/*********************************
	
		Service Oberflaeche freigeben
	
	*********************************/
	
	this.spieler_schaltflaechen_freigeben = function(){
		$("#spielfeld").queue(function(){
			if(typeof(biAktuellerSpieler)=="number"){
				aMitspieler[biAktuellerSpieler].ist_aktiv();
				
			}
			
			selbst_Spielfeld.bank().leere_bank_markieren();
			oBank.oberflaeche_aktivieren();
			$(this).dequeue();
		});
	}
	
	this.spielfeld_sperren = function(){
		spielfeld_sperren();
	}
	
	/*********************************
	
		Offene Karten festlegen
	
	*********************************/	
   
   
   this.set_offene_karten = function(argOffeneKarten){
	   aOffeneKarten = argOffeneKarten;
   }
	
	/*********************************
	
		Eigenschaft festlegen
	
	*********************************/	
   
	this.set_spielfeldoption = function(argOptionName,argWert){
		if(typeof(argWert)=="integer")if(oSpielfeldOptionen[argOptionName]){
			oSpielfeldOptionen[argOptionName]=argWert;
		}
	}
	
	/*********************************
	
		Service kI-Zug in Warteschlange einreihen
	
	*********************************/	
	
	this.ki_zieht_als_naechstes = function(){
		$("#spielfeld").queue(function(){
			setTimeout(';$("#spielfeld").dequeue();',oSpielfeldOptionen.gameSpeed*80);
		}).queue(function(){
			strg_ki_zug(biAktuellerSpieler);
			$("#spielfeld").dequeue();
		});
	}
	
	
	/*************************
	
		den letzte Zug des Spieles anzeigen lassen
	
	*************************/
	
	this.set_zug_und_auswertung = function(oZug){
	$("#spielfeld").queue(function(){
		
		//Zugprotokoll ergänzen
		aZugProtokoll.push(oZug);
		
		//Offene Karten ergänzen
		selbst_Spielfeld.set_offene_karten(oZug.aOffeneKarten);
		
		//Das Zugprotokoll in HTML-Tags schreiben
		$("#offene_karten_nach_letztem_zug").text(oZug.aOffeneKarten.join("/"));
		$("#zugprotokoll").text(JSON.stringify(aZugProtokoll));
		
		$(this).dequeue();
	});
	}
	
		
	/*************************
	
		die Kennung des Spiels schreiben
	
	*************************/
	
	this.get_spieltyp = function(){
		return oSpieltypBezeichner[iSpieltyp];
	}
	
	this.get_spielform = function(){
		return sSpielform;
	}
	
	this.spieltyp_anzeige = function(argSpielform){
		if(typeof(argSpielform)=="undefined")argSpielform="Einzelspiel";
		sSpielform=argSpielform;
		$('#spielform').text(sSpielform+" "+selbst_Spielfeld.get_spieltyp()+" "+MOE_VERSION+MOE_DEVSTATUS);
	}


    /*************************

     	die Spielzugart speichern und lesen

     *************************/

	this.get_zugart = function(){
		return iZugart;
	}


	function set_zugart(argZugart){
		iZugart = argZugart;
	}

    /*************************

	 	die SpielId laden

     ************************/

    this.get_spielid = function(){
    	return spielId;
	}

    /*************************
	 * 
	 * Zeige Zugempehlung für den aktuellen Spieler an
	 * 
	 ************************/
	
	 this.zeige_zug_empfehlung = function(argSpielerstapelnummer, argBankstapelnummer){
		  //wenn überhaupt der Spieler noch dran ist
		 if(biAktuellerSpieler!==false){
			 //Wenn der Spieler noch aktiv ist
			 if(selbst_Spielfeld.spieler(biAktuellerSpieler).get_spieler_aktiv()){
			 
				rFeld.delay(2*Math.sqrt(oSpielfeldOptionen.gameSpeed)*100).queue(function(){
				 //Spielerstapel markieren
				 selbst_Spielfeld.spieler(biAktuellerSpieler).stapel(argSpielerstapelnummer).addClass("karte_ziehbar");
					$(this).dequeue();
				});
				rFeld.delay(2*Math.sqrt(oSpielfeldOptionen.gameSpeed)*100).queue(function(){
				 //Bankstapel markieren
				 selbst_Spielfeld.bank().stapel(argBankstapelnummer).children().filter(":last-child").addClass("karte_ziehbar");
					$(this).dequeue();
				});
				
				rFeld.delay(2*Math.sqrt(oSpielfeldOptionen.gameSpeed)*100).queue(function(){
					selbst_Spielfeld.spieler(biAktuellerSpieler).stapel(0).removeClass("karte_ziehbar");
					selbst_Spielfeld.spieler(biAktuellerSpieler).stapel(1).removeClass("karte_ziehbar");
					selbst_Spielfeld.spieler(biAktuellerSpieler).stapel(2).removeClass("karte_ziehbar");
					selbst_Spielfeld.bank().stapel(0).children().filter(":last-child").removeClass("karte_ziehbar");
					selbst_Spielfeld.bank().stapel(1).children().filter(":last-child").removeClass("karte_ziehbar");
					selbst_Spielfeld.bank().stapel(2).children().filter(":last-child").removeClass("karte_ziehbar");
					$(this).dequeue();
				});
			 }
			 
			 //Spieler nochmals aktiv setzen, damit die ziehbaren Karten wieder kommen
			 rFeld.delay(2*Math.sqrt(oSpielfeldOptionen.gameSpeed)*100).queue(function(){
				aMitspieler[biAktuellerSpieler].ist_aktiv();
				$(this).dequeue();
			});
 		 }
	 }
	 
	 /*************************
	 * 
	 * Stapel erzittern lassen
	 * 
	 ************************/
	 
	this.stapel_zittert = function(argStapelnummer){
		
		selbst_Spielfeld.spielfeld().queue(function(){
		
			var rStapel = selbst_Spielfeld.bank().stapel(argStapelnummer);
			var iZeit=400,iDurchgaenge=3,iWeite=10;

			iSchwingzeit=Math.round(iZeit/(2*(iDurchgaenge+1)+2));
			iVorschwingenZeit=Math.round(iSchwingzeit/2);

			//Vorschwingen
			rStapel.animate({left:'+='+(iWeite/2)}, iVorschwingenZeit,'swing');
			//Zitterbewegung
			for(i=0;i<iDurchgaenge;i++)
			{
				rStapel.animate({left:'-='+iWeite}, iSchwingzeit,'swing');
				rStapel.animate({left:'+='+iWeite}, iSchwingzeit,'swing');
			}
			//Nachschwingen
			rStapel.animate({left:'-='+(iWeite/2)}, iVorschwingenZeit,'swing',function(){selbst_Spielfeld.spielfeld().dequeue();});
		
		});
	}
	 
	/*************************
	* 
	* Steuerungsfunktion festlegen, die aufgerufen wird, wenn eine Karte gelegt wird
	* 
	************************/

	this.set_karten_lege_steuerung = function(argNeueLegeFunktion){
	   oKartenLegeSteuerung = argNeueLegeFunktion;
	}

	this.reset_karten_lege_steuerung = function(){
		oKartenLegeSteuerung = strg_ziehen;
	}

	/*************************
	* 
	* Steuerungsfunktion festlegen, die aufgerufen wird, wenn eine Karte gedreht werden soll
	* 
	************************/

	this.set_bank_drehen_steuerung = function(argNeueDrehFunktion){
	   oBankDrehenSteuerung = argNeueDrehFunktion;
	}

	this.reset_bank_drehen_steuerung = function(){
	   oBankDrehenSteuerung = strg_bank_umdrehen;
	}
	
	/*********************************************************************************

		Factories

	*********************************************************************************/

	this.create_movekarteobject = function(argOhneRueckseite,argJQueryElternelement){
		return new movekarteobject(argOhneRueckseite,argJQueryElternelement);
	}
	
}