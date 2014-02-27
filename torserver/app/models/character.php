<?php
	class Character extends AppModel 
	{    
		var $name = 'Character';
		
		var $belongsTo = array (			
			'User'
		);
	}
?>
