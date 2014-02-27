<html>
	<head>
		<title>
			Complete chat log
		</title>
		<script src="http://azrapse.es/tor/js/jquery-1.7.min.js" type="text/javascript"></script>
		<style>		
			.dieDiv{
				display: inline-block;
				text-align: center;	
				height: 32px;
				width: 32px;
				margin: 1px 1px 1px 1px;
				padding: 0 0 0 0;
				font-family: 'Philosopher', Arial, Helvetica, serif;
				font-size: 18pt;
				background-repeat: no-repeat;
				background-position:center center;
				line-height:32px;		
				vertical-align: middle;
			}

			.diediv.d6DieDiv{
				background-image: url('http://azrapse.es/tor/css/d6.png');
			}

			.diediv.d12DieDiv{
				background-image: url('http://azrapse.es/tor/css/d12.png');
			}

			.diediv.d12DieDiv.discarded{
				background-image: url('http://azrapse.es/tor/css/d12discarded.png');
			}
		</style>
	</head>
	<body>	
		<? foreach($messages as $message): ?>
		<? echo $message['Message']['sender_name']?> - <? echo $message['Message']['sent_date'] ?>
		<br />
		<? echo $message['Message']['text'] ?>
		<hr />
		<? endforeach; ?>
	</body> 
</html>
<script>
$(function(){
	$("img").each(function(){
		var src = $(this).attr("src");
		src = "http://azrapse.es/tor/" + src;
		$(this).attr("src", src);
	});
});
</script>