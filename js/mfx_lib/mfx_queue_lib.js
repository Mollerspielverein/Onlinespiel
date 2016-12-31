


mfx_queue_object =function()
{
	var selbst=this;
	var a_fx_WarteSchlange=new Array();
	
	//Statusflag über den Laufzustand der Warteschlange
	var i_fx_Warteschlange_laeuft=0;
	
	//Macht daraus eine moderierte Warteschlange, die selbstständig nur neue
	//Einträge annimmt und nur auf anweisung den nächsten Eintrag abspielt und danach wieder stoppt.
	var i_fx_Moderiert=0;
	
	
	//Pausiert bei 1 die Warteschlange vor der Ausführung des nächsten Schritts. 
	//Die .play()-Funktion setzt dies wieder 0 und führt die Ausführung weiter.
	var i_fx_Paused=0;
	
	
	
	this.queue = function (argoFunktionsreferenz,argaFunktionsargumente)
	{
		//if(this.queue.arguments.length!=2)return 0;
		if(typeof(argaFunktionsargumente)=="undefined")argaFunktionsargumente=[];
		
		//alert(argaFunktionsargumente);
		a_fx_WarteSchlange.push(new Array(argoFunktionsreferenz,argaFunktionsargumente));
		if(i_fx_Warteschlange_laeuft==0 && i_fx_Moderiert==0 && i_fx_Paused==0)
		{
			i_fx_Warteschlange_laeuft=1;
			execute_first();
		}
		
		return this;
	}
	
	this.delay = function(iTimeMilliSeconds)
	{
		return this.queue(this.delay_entry,[iTimeMilliSeconds]);
	}
	
	this.dequeue = function()
	{
		//ersten eintrag löschen
		a_fx_WarteSchlange.shift();
		if(a_fx_WarteSchlange.length>0 && i_fx_Moderiert==0 && i_fx_Paused==0)
		{
			//nächsten eintrag aufrufen
			execute_first();
		}
		else
		{
			//Wenn leer, dann stoppt die Ausführung
			i_fx_Warteschlange_laeuft=0;
		}
	}
	
	function execute_first()
	{
		(a_fx_WarteSchlange[0][0]).apply((a_fx_WarteSchlange[0][0]),a_fx_WarteSchlange[0][1]);
	}
	
	this.delay_entry = function(iTimeMilliSeconds)
	{
		setTimeout(function(){selbst.dequeue()},iTimeMilliSeconds);
	}

	
	this.del_queue = function ()
	{
		a_fx_WarteSchlange=new Array();
	}

	this.get_queue = function ()
	{
		return a_fx_WarteSchlange;
	}
	
	this.show_queue = function()
	{
		return "<p>Anzahl:"+a_fx_WarteSchlange.length+" Pausiert:"+i_fx_Paused+" Moderiert:"+i_fx_Moderiert+" </p><p>"+a_fx_WarteSchlange.join("</p><p>")+"</p>";
	}
	
	this.exec_first = function()
	{
		if(i_fx_Moderiert==1 && a_fx_WarteSchlange.length>0 && i_fx_Paused==0)execute_first();
	}
	
	this.pause = function(){
		i_fx_Paused=1;
	}
	
	this.unpause = function(){
		i_fx_Paused=0;
	}
	
	this.play = function(){
		//Wieder Pausieren rausnehmen
		selbst.unpause();
		//wenn die Warteschlange nicht läuft und nicht moderiert ist = >abspielen starten
		if(i_fx_Moderiert==0 && a_fx_WarteSchlange.length>0 && i_fx_Warteschlange_laeuft==0)execute_first();
	}
	
	this.moderate = function(){
		i_fx_Moderiert=1;
	}
	
	this.demoderate = function(){
		i_fx_Moderiert=0;
	}
}

oMfxQueue = new  mfx_queue_object();

