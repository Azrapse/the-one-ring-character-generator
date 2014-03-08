<?php foreach($characters as $character): ?>
	<div 
		name="<?php echo $character['Character']['name'] ?>" 
		user="<?php echo $character['User']['display_name'] ?>"
		public="<?php echo $character['Character']['public'] == 1?'true':'false' ?>"
		culture="<?php echo $character['Character']['culture'] ?>"
		calling="<?php echo $character['Character']['calling'] ?>"
		id="<?php echo $character['Character']['id'] ?>"
	></div>
<?php endforeach; ?>