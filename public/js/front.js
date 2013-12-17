var canvas_container = $('#canvas_container'),
	canvas = $('#canvas');

canvas.attr('width', canvas_container.width());

$(window).on('resize', function(event)
{
	canvas.attr('width', canvas_container.width());
});

/**
 * Signale que le joueur est prêt
 */
$('#ready').on('click', function(event)
{
	// On s'assure que la partie n'est pas encore lancée
	if ( game.status == 'pending' && game.player.status != 'ready' )
	{
		// On modifie le bouton
		$('#ready').addClass('btn-info')
			.removeClass('btn-success')
			.text('I\'m not ready...');

		// Change bouton et label + prévient le serveur
		game.player.setStatus('ready');

		game.chatbox.log(game.player.username + ' is ready to play!', 'success');

		// On prévient le serveur
		game.player.socket.emit('player:ready');
	}
	// On s'assure que la partie n'est pas encore lancée
	else if ( game.status == 'pending' && game.player.status == 'ready' )
	{
		// On modifie le bouton
		$('#ready').addClass('btn-success')
			.removeClass('btn-info')
			.attr('disabled', false)
			.text('I\'m Ready!');

		// Change bouton et label + prévient le serveur
		game.player.setStatus('connected');

		// On prévient le serveur
		game.player.socket.emit('player:not_ready');
	}
	else
	{
		return false;
	}
});



/**
 * Passer au joueur suivant
 */
$('#next').on('click', function (event)
{	// Notre joueur a fini son tour
	game.player.finishMyRound();
});



$('#move').on('click', function (event)
{
	if ( game.player.AP > 0 ) {
		game.player.showWhereToMove();
	}
});


/*-----------------------------------------*/

$('#chatbox_form').on('submit', function(event)
{
	var form = $(this),
		input = $(this).find('input'),
		message = input.val(),
		html = '',
		date = new Date();

	// Si le message n'est pas vide
	if ( message != '' )
	{
		// On envoie le message
		game.player.socket.emit('chatbox:send', message);

		// On vide le champ
		input.val('');

		game.chatbox.addMessageFrom(message, game.player.username);
	}

	event.preventDefault();
	return false;
});


/*-----------------------------------------*/


/**
 * Activation de la barre d'actio
 */
function enableActions()
{
	// On active les boutons d'actions
	$('#actions button').each(function(index)
	{
		$(this).attr('disabled', false);
	});
}



/**
 * Désactivation de la barre d'actio
 */
function disableActions()
{
	// On active les boutons d'actions
	$('#actions button').each(function(index)
	{
		$(this).attr('disabled', true);
	});
}