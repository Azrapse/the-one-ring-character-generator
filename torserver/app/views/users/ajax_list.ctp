<?php	
	foreach($users as $user):
?>
<?php echo $user['User']['username'] ?>: <?php echo $user['User']['display_name'] ?>
<?php endforeach; ?>