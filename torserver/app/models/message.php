<?php
	class Message extends AppModel 
	{   		
		var $name = 'Message';
		
		var $belongsTo = array ('User');
	}
?>
