<?php
	class User extends AppModel 
	{   		
		var $name = 'User';
		var $displayField = 'display_name';
		var $hasMany = array (			
			'Character' => array(
				'order' => 'Character.name ASC, Character.culture ASC, Character.calling ASC, Character.public DESC', 
				'dependent' => true
			),
			'Message' => array(
				'order' => 'Message.sent_date ASC', 
				'dependent' => true
			)
		);
	}
?>
