	/****************************************
	 * 
	 * 
	 * Sonstige Funtionen
	 * 
	 * 
	 *****************************************/
	
	
	//gibt wie bei php 1 zurück, wenn eine gegebene variable null ist
	function empty (mixed_var) {
		// version: 909.322
		// discuss at: http://phpjs.org/functions/empty
		var key;
		if (mixed_var === "" || mixed_var === 0 || mixed_var === "0" || mixed_var === null || mixed_var === false || mixed_var === undefined ) {
			return true;
		}
		if (typeof mixed_var == 'object') {
			for (key in mixed_var) {
				return false;
			}
			return true;
		}
		return false;
    }
	
	
	// fügt an den array die zusätzliche funktion schuffle an, damit die Elemente gemischt werden können
	Array.prototype.shuffle = function(){
		var tmp, rand;
		for(var i =0; i < this.length; i++){
			rand = Math.floor(Math.random() * this.length);
			tmp = this[i]; 
			this[i] = this[rand]; 
			this[rand] =tmp;
		}
	}
	
	
	//Vergleichsfunktion, die später für Array.sort() gebraucht wird, um numerische Werte korrekt zu sortieren
	function zus_lib_Numsort (a, b)
	{
		return a - b;
	}
	
	/****************************************
	 * 
	 * 
	 * Umwandlungsfunktionen
	 * 
	 * 
	 *****************************************/
	
	/**
	 * erzeugt aus einem übergebnen HTML ID eines Stapels dessen interne ID
	 * 
	 * @param {type} sStapelHtmlID
	 * @returns {Number|@exp;@call;parseInt}
	 */
	
	function stapelHTML2stapelindex(sStapelHtmlID){
		return parseInt(sStapelHtmlID[3])-1;
	}
	
	/****************************************
	 * 
	 * 
	 * Mathematische Funktionen für Møller
	 * 
	 * 
	 *****************************************/
	
	
	//gibt zufällige Werte im Intervall [a,e] aus. (nicht gleichverteilt!)
	function ma_rand(a,e)
	{
		var diErgebnis=a+Math.random()*(e-a);
		console.log("ma_rand: "+diErgebnis+" aus  ["+a+","+e+"]");
		return diErgebnis;
	}
	
	//gibt zufällige ganze Werte im Intervall [a,e] aus (nicht gleichverteilt!)
	function ma_z_rand(a,e)
	{
		var diErgebnis=Math.round(a+Math.random()*(e-a));
		return diErgebnis;
	}
	
	//gibt korrekt gleichverteilte zufällige Werte im Intervall [0,e] aus.
	function ma_z_rand_intv_0e(e){
		if(e===0)return 0;
		var q=Math.random()*(e);
		var z = Math.floor(q+(q/e));
		return z;
	}
	
	
	//Testet, ob ein Objekt Teil eines Arrays ist
	function is_array(input){
		return typeof(input)=='object'&&(input instanceof Array);
	}
	
	function rotate_clockwise(von_einschliesslich, bis_einschliesslich, aktuell){
		aktuell++;
		if(aktuell>bis_einschliesslich)aktuell=von_einschliesslich;
		return aktuell;
	}
	
	function rotate_anticlockwise(von_einschliesslich, bis_einschliesslich, aktuell){
		aktuell--;
		if(aktuell<von_einschliesslich)aktuell=bis_einschliesslich;
		return aktuell;
	}
	
	function ma_dotp(a,b){
		if(typeof(a.length)!="undefined" && typeof(b.length)!="undefined"){
			if(a.length==b.length){
				var c=0;
				var iLength=a.length;
				for(var i=0;i<iLength;i++)c=c+a[i]*b[i];
				console.log("ma_dotp( "+a+" , "+b+" ): "+c);
				return c;
			}
			else throw "Fehler: Beide Argumente müssen die gleiche Anzahl numerischer Elemente haben.";
		} else {
			throw "Fehler: Beide Argumente müssen Arrays sein.";
		}
	}
	
	function ma_sign(a){
		return Math.round(a/Math.abs(a));
	}
	
	/****************************************
	 * 
	 * 
	 * HTML, PUT GET Funktionen
	 * 
	 * 
	 *****************************************/	
	
function htmlParameterObject (querystring) {
	if (querystring == '') return;
	if(typeof(querystring)!="string")querystring = new String(querystring);
	var wertestring = querystring.slice(1);
	var paare = wertestring.split("&");
	var paar, name, wert;
	for (var i = 0; i < paare.length; i++) {
	    paar = paare[i].split("=");
	    name = paar[0];
	    wert = paar[1];
	    name = unescape(name).replace("+", " ");
	    wert = unescape(wert).replace("+", " ");
	    this[name] = wert;
	}
}