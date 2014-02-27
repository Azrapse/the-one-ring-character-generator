<? foreach($messages as $message): ?>
<div class="chatMessage">
<fieldset 
	sender="<? echo $message['Message']['sender_name'] ?>" 
	date="<? echo $message['Message']['sent_date'] ?>"
	messageId="<? echo $message['Message']['id'] ?>">
	<legend><? echo $message['Message']['sender_name']?><span class="chatMessageDateSpan"> - <? echo $message['Message']['sent_date'] ?></span></legend>
	<? echo $message['Message']['text'] ?>
</fieldset>
</div>
<? endforeach; ?>