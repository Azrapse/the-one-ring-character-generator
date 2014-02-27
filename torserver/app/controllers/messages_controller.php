<?php
class MessagesController extends AppController {
    /*var $scaffold;*/
	var $name = 'Messages';    
	var $components = array('RequestHandler');	

	function download_history(){
		$this->layout = 'ajax';
		$username = $this->params['form']['username'];
		$password = $this->params['form']['password'];
		
		$messages = $this->Message->find('all', array(
				"conditions" => array(
					"User.username" => $username,
					"User.password" => $password
				),
				"order" => array("Message.id")
			));
		$this->set('messages', $messages);
		
		// Set headers		
		header("Content-Description: File Transfer");
		header("Content-Type: application/pdf");
		header("Content-Disposition: attachment; filename=chatlog.html");		
		header("Content-Transfer-Encoding: binary");
	}
	
	function ajax_list_from(){
		$this->layout = 'ajax';
		$username = $this->params['form']['username'];
		$password = $this->params['form']['password'];
		$from = $this->params['form']['from'];
		
		// If the client doesn't know what was the last one, it will send "?"
		if ($from == "?"){
			$message = $this->Message->find('first', array(
				"conditions" => array(
					"User.username" => $username,
					"User.password" => $password
				),
				"order" => array("Message.id DESC")
			));
			$messages = array($message);
		} else {
		// We send all messages since the one the client states.
			$messages = $this->Message->find('all', array(
				"conditions" => array(
					"User.username" => $username,
					"User.password" => $password,
					"Message.id >"=> $from
				),
				"order" => array("Message.id")
			));
			
			
		}
		$this->set('messages', $messages);		
	}

	function ajax_save(){
		$this->layout = 'ajax';
		$username = $this->params['form']['username'];
		$password = $this->params['form']['password'];
		$sender_name = $this->params['form']['sender_name'];
		$sent_date = $this->params['form']['sent_date'];
		$text = $this->params['form']['text'];
				
		$user = $this->Message->User->find('first', array(
			"conditions" => array(				
				"User.username" => $username,
				"User.password" => $password
			)
		));
		
		if (empty($user)){
			return;
		}
		$message = array('Message');
		$message['Message']['user_id'] = $user['User']['id'];
		$message['Message']['sender_name'] = $sender_name;
		$message['Message']['sent_date'] = $sent_date;
		$message['Message']['text'] = $text;		
		$this->Message->save($message);		
		$this->set("message", $message);
	}
}
?>