var aStartAuswahl=new Array("Mensch","kiz","kiz");
var aKiStartKurz2KiNamen={"kil":"kI/Nora","kim":"ki2/Clara","kis":"kI2_09/Laurina"};
var aAlleKI=new Array("kil","kim","kis");

var iAnzahlderSpieler=3;
var iStartSpielModus=MOE_SPIELTYP_Ramsch;

function startlogik_startespiel()
{
	//Auslesen, ob es überhaupt einen Validenzustand gibt
		
	//Spielernamen und IDs generieren
	var iAnzahlMenschen=0;
	var iMenschPosition=0;
	var aAlleSpieler= new Array(0,0,0);
	var aAlleSpielerID= new Array(0,0,0);
	var aPosition=new Array("mitte","links","rechts");
	var oAlleKiNamen={"kI/Nora":new Array("Tina","Karl","Nora"),"kI2/Clara":new Array("Sarah","Jakob","Clara"),"kI2_09/Laurina":new Array("Laurina","Karlina","Janina"),"kI3/Laura":new Array("Anja","Pete","Laura")};

	//Mitspieler Array füllen
	var aDieMitspieler=new Array();
	for(i=0;i<3;i++)
	{
		if(aStartAuswahl[i]=="Mensch")
		{
			aDieMitspieler[i]=new Array(Math.round(Math.random()*1000000000),$("#Spieler"+(i+1)+"Name").attr("value"),aPosition[i]);
			//alert("startlogik_startespiel: Name des Spielers:"+$("#Spieler"+(i+1)+"Name").attr("value"));
			if(aDieMitspieler[i][1]=="")aDieMitspieler[i][1]="Spieler "+i;
			iAnzahlMenschen++;
			iMenschPosition=i;
		}
		else
		{
			if(aStartAuswahl[i]=="kiz")aStartAuswahl[i]=aAlleKI[ma_z_rand(0,aAlleKI.length-1)];
			var Auswahlnummer=ma_z_rand(0,oAlleKiNamen[aKiStartKurz2KiNamen[aStartAuswahl[i]]].length-1);
			
			aDieMitspieler[i]=new Array(aKiStartKurz2KiNamen[aStartAuswahl[i]],oAlleKiNamen[aKiStartKurz2KiNamen[aStartAuswahl[i]]][Auswahlnummer],aPosition[i]);
			
			oAlleKiNamen[aKiStartKurz2KiNamen[aStartAuswahl[i]]].splice(Auswahlnummer,1);
		}
	}
	
	//Bei einem Spieler das Feld rotieren lassen, bis der Spieler in der Mitte ist
	if(iAnzahlMenschen==1)
	{
		var iMenschAltePosition=iMenschPosition;
		var iMenschNeuePosition=0;
		var iDifferenz=iMenschNeuePosition-iMenschAltePosition;
		if(iDifferenz!=0){
			var aNeuePositionen= new Array("","","");
			var neui=0;
			protokoll("Lasse Spieler "+aDieMitspieler+" rotieren");
			
			for(var i=0;i<iAnzahlderSpieler;i++)		
			{
				neui=i+iDifferenz;
				if(0<=neui && neui<iAnzahlderSpieler)
				{
					aDieMitspieler[i][2]=aPosition[neui];
				}
				else 
				{	
					neui=iAnzahlderSpieler-ma_sign(neui)*neui;
				}
				
				//Neue Positionen werden eingetragen
				aDieMitspieler[i][2]=aPosition[neui];
				protokoll(i+" wandert zu "+neui);
			}
			protokoll(""+aDieMitspieler+" nun rotiert");
		}
	}
	
	//aDieMitspieler = new Array(new Array("kI2/Clara","Clara","rechts"),new Array("kI2/Clara","Clara","mitte"),new Array("kI2/Clara","Clara","links"));
	
	//Startbildschrim deaktiveren
	$("#menuefeld").css("display","none");
	
	//Spielfeld aktivieren
	$("#spielfeld").css("display","block");
	
	//Spiel starten	
	$("#spielfeld").delay(1500);
	strg_spielbeginn(init_SpielID,init_oBlatt,aDieMitspieler,iStartSpielModus);	

}

function startlogik_setze_position(sPosition,sSpielerTyp)
{
	aStartAuswahl[sPosition-1]=sSpielerTyp;
}