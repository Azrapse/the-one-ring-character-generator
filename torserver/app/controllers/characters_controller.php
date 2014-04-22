<?php
class CharactersController extends AppController {
    /*var $scaffold;*/
	var $name = 'Characters';    
	var $components = array('RequestHandler');	
		
	function ajax_list_own(){
		$this->layout = 'ajax';
		$username = $this->params['form']['username'];
		$password = $this->params['form']['password'];
		
		$characters = $this->Character->find('all', array(
			"conditions" => array(
				"User.username" => $username,
				"User.password" => $password
			)
		));
		$this->set('characters', $characters);		
	}
	
	function ajax_list_public(){
		$this->layout = 'ajax';
		$characters = $this->Character->find('all', array(			
			"order" => array("Character.culture", "Character.calling", "Character.name", "Character.user_id")
		));
		$this->set('characters', $characters);	
		$this->render('ajax_list_own');
	}

	function ajax_save(){
		$username = $this->params['form']['username'];
		$password = $this->params['form']['password'];
		$characterName = $this->params['form']['characterName'];
		$culture = $this->params['form']['culture'];
		$calling = $this->params['form']['calling'];
		$isPublic = $this->params['form']['isPublic'];
		$characterData = $this->params['data'];
		
		
		
		$this->layout = 'ajax';
		$character = $this->Character->find('first', array(
			"conditions" => array(
				"Character.name LIKE" => $characterName,
				"User.username" => $username,
				"User.password" => $password
			)
		));
		if (empty($character)){
			$user = $this->Character->User->find('first', array(
				"conditions" => array(
					"User.username" => $username,
					"User.password" => $password
				)
			));
			if (empty($user)){
				$this->set("message", "uiInvalidUser");
				return;
			}
			$character['Character']['user_id'] = $user['User']['id'];
			$character['Character']['name'] = $characterName;
		}
		$character['Character']['data'] = $characterData;
		$character['Character']['public'] = $isPublic;			
		$character['Character']['culture'] = $culture;		
		$character['Character']['calling'] = $calling;		
		$this->Character->save($character);		
		$this->set("message", "uiCharacterSaved");
	}
	
	function ajax_delete(){
		$this->layout = 'ajax';
		$username = $this->params['form']['username'];
		$password = $this->params['form']['password'];
		$characterName = $this->params['form']['characterName'];

		$character = $this->Character->find('first', array(
			"conditions" => array(
				"Character.name LIKE" => $characterName,
				"User.username" => $username,
				"User.password" => $password
			)
		));		
		
		if (empty($character)){
			$this->set("message", "uiInvalidUser");
			$this->render("ajax_save");
			return;
		}
					
		$this->Character->delete($character['Character']['id']);		
		$this->set("message", "uiCharacterDeleted");
		$this->render("ajax_save");
	}

	
	function ajax_get_character(){
		$this->layout = 'ajax';
		$username = $this->params['form']['username'];
		$password = $this->params['form']['password'];
		if(array_key_exists("characterName", $this->params['form'])){
			$characterName = $this->params['form']['characterName'];
		}
		$characterId = null;
		if(array_key_exists("characterId", $this->params['form'])){
			$characterId = $this->params['form']['characterId'];
		}
		if ($characterId != null){
			$character = $this->Character->find('first', array(
				"conditions" => array(
					"Character.id" => $characterId,
					"User.username" => $username,
					"User.password" => $password
				)			
			));	
		} else {
			$character = $this->Character->find('first', array(
				"conditions" => array(
					"Character.name LIKE" => $characterName,
					"User.username" => $username,
					"User.password" => $password
				)			
			));
		}
		$this->set("character", $character);
	}
	
	function index() {
        $characters = $this->Character->find('all', array(			
			"order" => array("Character.culture", "Character.calling", "Character.name", "Character.user_id")
		));
        $this->set(compact('characters'));
    }
	
	function view($id) {
        if ($id != null){
			$character = $this->Character->find('first', array(
				"conditions" => array(
					"Character.id" => $id
				)			
			));	
		}
        $this->set(compact('character'));
    }
	
	
	
	function ajax_get_public_character(){
		$this->layout = 'ajax';
		if(array_key_exists("characterName", $this->params['form'])){
			$characterName = $this->params['form']['characterName'];
		}
		if(array_key_exists("characterId", $this->params['form'])){
			$characterId = $this->params['form']['characterId'];
		}
		if ($characterId != null){
			$character = $this->Character->find('first', array(
				"conditions" => array(
					"Character.id" => $characterId
				)			
			));	
		} else {
			$character = $this->Character->find('first', array(
				"conditions" => array(
					"Character.name LIKE" => $characterName,
					/*"Character.public" => 1*/
				)			
			));
		}
		
		$this->set("character", $character);
		$this->render("ajax_get_character");
	}

}

