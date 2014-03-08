<?php foreach($messages as $message): ?>
<div class="chatMessage">
<fieldset 
	sender="<?php echo $message['Message']['sender_name'] ?>" 
	date="<?php echo $message['Message']['sent_date'] ?>"
	messageId="<?php echo $message['Message']['id'] ?>">
	<legend><?php echo $message['Message']['sender_name']?><span class="chatMessageDateSpan"> - <?php echo $message['Message']['sent_date'] ?></span></legend>
	<?php echo $message['Message']['text'] ?>
</fieldset>
</div>
<?php endforeach; ?>