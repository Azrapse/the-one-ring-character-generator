<? foreach($characters as $character): ?>
	<div 
		name="<? echo $character['Character']['name'] ?>" 
		user="<? echo $character['User']['display_name'] ?>"
		public="<? echo $character['Character']['public'] == 1?'true':'false' ?>"
		culture="<? echo $character['Character']['culture'] ?>"
		calling="<? echo $character['Character']['calling'] ?>"
		id="<? echo $character['Character']['id'] ?>"
	></div>
<? endforeach; ?>