<?php	
	foreach($users as $user):
?>
<? echo $user['User']['username'] ?>: <? echo $user['User']['display_name'] ?>
<? endforeach; ?>
