[<?php $isFirst = 1; 
foreach($characters as $character): 
if($isFirst == 0){?>,<?php } ?>
{
	"name":"<?php echo $character['Character']['name'] ?>" ,
	"user":"<?php echo $character['User']['display_name'] ?>",	
	"culture":"<?php echo $character['Character']['culture'] ?>",
	"calling":"<?php echo $character['Character']['calling'] ?>",
	"id":"<?php echo $character['Character']['id'] ?>"
}
<?php $isFirst=0; endforeach; ?>]