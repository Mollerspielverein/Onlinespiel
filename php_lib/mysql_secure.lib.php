<?php



class db_mysql_secure
{
	protected $abfrage=''; 		 //enthaeltt den Abfrage Code
	protected $numrows=0;		//enthaelt die Anzahl der ausgegeben Zeilen einer Anfrage
	protected $affrows=0;		//enthaelt die Anzahl der geaenderten oder beschreibene zeilen der anfrage
	protected $errormsg='';		//Entzhaelt die Errornachricht
	protected $errornr=0;		//Beinhaltet die Errornummer
	protected $dbname='';		//Logindaten
	protected $dbuser='';
	protected $dbpass='';
	protected $dbhost='';
	protected $verb=0;			//verbindungshandler
	protected $res=0;			//Ergebnishandler
	protected $insert_id=0;		//zuletzte ingefügt Id bei einem auto increment
	protected $lsg=array();
	protected $lsgs=array();
	protected $lock=0;
	protected $iAnzahlVerbindungen=0;
	protected $iAnzahlAbfragen=0;


	##	Gesicherte nur dieser Klasse zugängliche Funktionen
	##

	protected function __construct($thost,$tname,$tuser,$tpass)
	{
		$this->dbname=$tname;
		$this->dbuser=$tuser;
		$this->dbpass=$tpass;
		$this->dbhost=$thost;
		$this->exec_time = microtime(true);
		$this->open();
	}

	function __destruct()
	{
		$this->close();
	}
	
	private function set_abfrage($text)
	{
		if($this->lock==0)
		{
			$this->abfrage=$text;
		}
	}
	
	protected function get_abfrage()
	{
		if($this->lock==0)
		{
			return $this->abfrage;
		}
	}
	
	private function open()		// Beginnt eine Verbindung und laed gleich die richtige Datenbank
	{
		if($this->lock==0)
		{
			if(isset($this->dbhost,$this->dbname,$this->dbpass,$this->dbuser) && !empty($this->dbhost) && !empty($this->dbname) && !empty($this->dbuser))
			{
				$this->verb=@mysql_connect($this->dbhost,$this->dbuser,$this->dbpass);
				@mysql_select_db($this->dbname);
				if(!is_resource($this->verb))throw new Exception("",18);
				$this->errornr=@mysql_errno($this->verb);
				$this->errormsg=@mysql_error($this->verb);
				$this->iAnzahlVerbindungen++;
			}
		}
	}
	
	protected function close()		// Schließt die Datenbankverbindung
	{
		if($this->lock==0)
		{
			if($this->verb!=0)
			{
				mysql_close($this->verb);
				$this->errornr=@mysql_errno($this->verb);
				$this->errormsg=@mysql_error($this->verb);
			}
		}
	}
	
	private function start_abfrage()		// führt die Abfrage durch und gibt Errornummern, -daten, Ergebnislösungen aus
	{
		if($this->lock==0)
		{
			if($this->abfrage!='')
			{
				$this->lsgs=array();
				$this->lsg=array();
			
				$this->res=mysql_query($this->abfrage,$this->verb);
				$this->errornr=@mysql_errno($this->verb);
				$this->errormsg=@mysql_error($this->verb);

				$this->iAnzahlAbfragen++;
				
				if($this->is_error()==0)
				{
					if(is_resource($this->res))
					{
						$this->numrows=@mysql_num_rows($this->res);
						$this->affrows=@mysql_affected_rows($this->verb);
						$this->insert_id=@mysql_insert_id($this->verb);
						while($this->lsg=@mysql_fetch_array($this->res))
						{
							array_push($this->lsgs,$this->lsg);
						}
					}
					elseif(!is_resource($this->res) && $this->res==false)
					{
						throw new Exception("ResId ".gettype($this->res)."(".$this->res.") Abfrage:".$this->abfrage,20);
					}
				}
				else
				{
					$this->mysql_throw_error();
				}
			}
		}
	}
	
	protected function sabfrage($text,$argParameter="")		// Befehl, der einfach der Abfragetext uebergeben und die Abfrage gestartet wird
	{
		if($this->lock==0)
		{
			if($argParameter=="")
			{
				$this->set_abfrage($text);
				$this->start_abfrage();
			}
			else
			{
				$this->secure_abfrage($text,$argParameter);
			}
		}
	}
	
	// Die Klasse kann sich zur Fehlerbehandlung wieder selbst öffnen
	protected function unlock()															
	{
		$this->lock=0;
	}
	
	// Sichere Abfrage $aVars=array("varname"=>varwert[, ...])
	protected function secure_abfrage($sAbfragetext,$aVars=array())								
	{
		if($this->lock==0)
		{
			
			$alter=$sAbfragetext;
			
			//Zuerst müssen die Variablen ausgewertet werden
			foreach($aVars as $sVarname => $vVarwert)
			{
				if (!get_magic_quotes_gpc())$vVarwert =  mysql_real_escape_string  ( $vVarwert , $this->verb );
				$vVarwert=$this->mysql_sqlstring_cutter($vVarwert);
				
				$sAbfragetext=preg_replace("/\{".$sVarname."\}/",$vVarwert,$sAbfragetext);
			}

			$this->set_abfrage($sAbfragetext);
			$this->start_abfrage();
			if($this->is_error())$this->mysql_throw_error();
		}		
	}
	
	// Wirft eine Mysql-Exception	
	protected function mysql_throw_error()
	{
		$daMysqlError=$this->get_error();
		throw new Exception($daMysqlError[1],$daMysqlError[0]);
	}

	protected function get_lsgs($nur_erstezeile=0)		// gibt die Lösungsvariablen aus
	{
		if($this->lock==0)
		{
			if($nur_erstezeile==0){return $this->lsgs;}
			elseif(isset($this->lsgs[0])){return $this->lsgs[0];}
			//else echo print_r($this->lsgs);
			return array();
		}
	}	

	protected function get_error()		// gibt die Errordaten aus
	{
		if($this->lock==0)
		{
			return array($this->errornr,$this->errormsg);
		}
	}
	
	protected function is_error()		// gibt die Errordaten aus
	{
		if($this->lock==0)
		{
			if($this->errornr!=0)
			{
				return 1;
			}
			else
			{
				return 0;
			}
		}
	}
	
	protected function get_num_rows()	// gibt die Anzahl der abgefragten Zeilen aus
	{
		if($this->lock==0)
		{
			return $this->numrows;
		}
	}

	protected function get_aff_rows()		// gibt die betroffenen Datensaetze aus
	{
		if($this->lock==0)
		{
			return $this->affrows;
		}
	}
	

	protected function get_insert_id()		// laed die letzte eingesetze ID
	{
		if($this->lock==0)
		{
			return $this->insert_id;
		}
	}
	
	protected function print_error()		// Schreibt den Error aus
	{
		if($this->lock==0)
		{
			return "Mysql Error:".$this->errornr." - ".$this->errormsg."<br />".$this->abfrage;
		}
	}

	//Verhindert, dass die Datenbank benutzt werden kann. Jeder kann sie schließen
	public function lock()																
	{
		$this->lock=1;
	}

	// Löscht alles was nach einem ; bei einem String kommt, damit keine zusätzlichen Code fragmente eingefügt werden können.
	public function mysql_sqlstring_cutter($argString)
	{
		list($sNeuerString) = explode(";",$argString,1);
		return $sNeuerString;
	}


}
?>