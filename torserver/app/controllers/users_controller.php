<?php

class UsersController extends AppController {
    /*var $scaffold;*/
	var $name = 'Users';    
	var $components = array('RequestHandler');	
	var $helpers = array('Html', 'Ajax');
	

	function ajax_list(){
		$this->layout = 'ajax';
		$users = $this->User->find('all');
		$this->set('users', $users);		
	}
	
	function ajax_register(){		
		$this->layout = 'ajax';
		$username = $this->params['form']['username'];
		$password = $this->params['form']['password'];
		$displayName = $this->params['form']['displayName'];
				
		$user = $this->User->find('first', array(
			"conditions" => array(				
				"User.username" => $username
			)
		));		
		
		if (!empty($user)){
			$this->set("message", "uiOnlineErrorAlreadyTaken");			
			return;
		}
		
		$user['User']['username'] = $username;
		$user['User']['password'] = $password;
		$user['User']['display_name'] = $displayName;
		$this->User->save($user);		
		$this->set("message", "uiOnlineUserCreated");	
		
	}

}


