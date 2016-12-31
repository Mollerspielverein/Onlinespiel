var aStartAuswahl=new Array("Mensch","kiz","kiz");
var aKiStartKurz2KiNamen={"kil":"kI/Nora","kim":"kI2/Clara","kis":"kI2_09/Laurina"};
var aAlleKI=new Array("kil","kim","kis");

var iAnzahlderSpieler=3;
var iStartSpielModus=MOE_SPIELTYP_Ramsch;

/**
 * 
 * @param {type} argSpielID
 * @param {array} argDieMitspieler besteht aus Array(SpielerID/kITyp, Name, Position)
 * @returns {undefined}
 */

function startlogik_startespiel(argSpielID,argDieMitspieler,argSpielModus,argSpieltyp,argSpielfeldOptionen)
{

	/*
	 *		Spieler
	 * 
	 *		argDieMitspieler[i]=new Array(Math.round(Math.random()*1000000000),$("#Spieler"+(i+1)+"Name").attr("value"),aPosition[i]);
	 *		//alert("startlogik_startespiel: Name des Spielers:"+$("#Spieler"+(i+1)+"Name").attr("value"));
	 *		if(argDieMitspieler[i][1]=="")argDieMitspieler[i][1]="Spieler "+i;
	 *
			kI
	
			if(aStartAuswahl[i]=="kiz")aStartAuswahl[i]=aAlleKI[ma_z_rand(0,aAlleKI.length-1)];
			var Auswahlnummer=ma_z_rand(0,oAlleKiNamen[aKiStartKurz2KiNamen[aStartAuswahl[i]]].length-1)
			argDieMitspieler[i]=new Array(aKiStartKurz2KiNamen[aStartAuswahl[i]],oAlleKiNamen[aKiStartKurz2KiNamen[aStartAuswahl[i]]][Auswahlnummer],aPosition[i]);
			oAlleKiNamen[aKiStartKurz2KiNamen[aStartAuswahl[i]]].splice(Auswahlnummer,1);

	 */
	
	
	//Spielernamen und IDs generieren
	var iAnzahlMenschen=0;
	var iMenschPosition=0;
	var aPosition=new Array("mitte","links","rechts");
	var oAlleKiNamen={"kI/Nora":new Array("Tina","Karl","Nora"),"kI2/Clara":new Array("Sarah","Jakob","Clara"),"kI2_09/Laurina":new Array("Laurina","Karlina","Janina"),"kI3/Laura":new Array("Anja","Pete","Laura")};

	
	for(i=0;i<3;i++)
	{
		//Mitspieler hinsetzten
		argDieMitspieler[i][2]=aPosition[i];
		if(typeof(argDieMitspieler[i][0])=="number")
		{
			//Menschen erkennen und für den Einzelspiele die Position merken, damit sie rotiert werden kann
			iAnzahlMenschen++;
			iMenschPosition=i;
		}
	}
	
	//Bei einem einzigen Spieler das Feld rotieren lassen, bis der Spieler in der Mitte ist
	if(iAnzahlMenschen==1)
	{
		var iMenschAltePosition=iMenschPosition;
		var iMenschNeuePosition=0;
		var iDifferenz=iMenschNeuePosition-iMenschAltePosition;
		if(iDifferenz!=0){
			var aNeuePositionen= new Array("","","");
			var neui=0;
			protokoll("Lasse Spieler "+argDieMitspieler+" rotieren");
			
			for(var i=0;i<iAnzahlderSpieler;i++)		
			{
				neui=i+iDifferenz;
				if(0<=neui && neui<iAnzahlderSpieler)
				{
					argDieMitspieler[i][2]=aPosition[neui];
				}
				else 
				{	
					neui=iAnzahlderSpieler-ma_sign(neui)*neui;
				}
				
				//Neue Positionen werden eingetragen
				argDieMitspieler[i][2]=aPosition[neui];
				protokoll(i+" wandert zu "+neui);
			}
			protokoll(""+argDieMitspieler+" nun rotiert");
		}
	}
	

	//Spiel starten	
	$("#spielfeld").delay(1500);
	strg_spielbeginn(argSpielID,init_oBlatt,argDieMitspieler,argSpielModus,argSpieltyp,argSpielfeldOptionen);	

}

function startlogik_setze_position(sPosition,sSpielerTyp)
{
	aStartAuswahl[sPosition-1]=sSpielerTyp;
}