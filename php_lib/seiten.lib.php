<?php

class seitenklasse extends db_mysql_secure
{

	function __construct($thost,$tname,$tuser,$tpass)
	{
		parent::__construct($thost,$tname,$tuser,$tpass);
	}

	function __destruct()
	{
		parent::__destruct();
	}
	
	public function save($iki_1,$iki_2,$iki_3)
	{
		$this->sabfrage("insert into tabelle_ki3_b5_2 (ki3_1,ki2_2,ki2_3) values ($iki_1,$iki_2,$iki_3);");
	}
	
}

?>