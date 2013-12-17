var BASE_URL = window.location.protocol + '://' + window.location.host,
	socket = io.connect();

// Tann's Engine Objects
game.player = null;
game.engine = new TannsEngine.Engine('canvas');
game.canvas = new TannsEngine.Canvas('canvas');
game.chatbox = new TannsEngine.Chatbox();


/*-----------------------------------------*/


/**
 * Connexion au serveur, on s'authentifie
 * et on crée le joueur
 */
socket.on('connect', function()
{
	// On crée notre joueur
	game.player = new TannsEngine.Player(socket, {
		id: socket.socket.sessionid,
		username: localStorage['username']
	});

	// On s'authentifie
	game.player.socket.emit('player:authenticate', game.player.username);
});



/**
 * Déconnexion du serveur
 */
socket.on('disconnect', function()
{
	game.chatbox.log('<strong>Lost connection with server!</strong>', 'error');

	// On met tout le monde en déconnecté
	for (var player_id in game.engine.players)
	{
		game.engine.players[player_id].setStatus('disconnected');
	}
});



/**
 * Déconnexion du serveur
 */
socket.on('player:spectator_mode', function()
{
	$('#ready').removeClass('btn-info')
		.addClass('btn-inverse')
		.attr('disabled', true)
		.text("Spectator Mode");

	alert("You're now in Spectator Mode");
});



/**
 * Un joueur a changé de statut
 */
socket.on('player:changed_status', function(player)
{
	game.engine.players[player.id].setStatus(player.status);
});



/**
 * Le serveur a repéré un tricheur
 */
socket.on('player:hack', function(message)
{
	alert(message);
});



/*-----------------------------------------*/



/**
 * Réception de la liste des joueurs en ligne
 * @param {Array[Object]} players
 */
socket.on('game:current_players', function (players)
{
	console.log('game:current_players');

	var player = null,
		html = 'Current players in game : ';

	// Pour chaque joueur
	for (var i in players)
	{
		// On stocke le joueur (nous)
		if ( players[i].id == game.player.id )
		{
			// On crée l'objet Player
			player = new TannsEngine.Player(socket, players[i]);
			game.player = player;
		}
		else
		{
			// On crée l'objet Player
			player = new TannsEngine.Player(null, players[i]);
		}

		// On l'ajoute à la partie
		game.engine.addPlayer(player);

		html += player.username + ', ';
	}

	// On retire la dernière virgule
	html = html.substr(0, (html.length - 2)) + '.';
	game.chatbox.log(html);
});



/**
 * Un joueur se connecte
 * @param {Object} player
 */
socket.on('game:new_player', function (player_data)
{
	console.log('game:new_player');

	var player = new TannsEngine.Player(null, player_data);

	// On l'ajoute à la partie
	game.engine.addPlayer(player);

	game.chatbox.log(player.username + ' has joined the game');
});



/**
 * Un joueur se déconnecte
 * @param {Object} player
 */
socket.on('game:player_disconnected', function (player)
{
	console.log('game:player_disconnected');

	// On supprime le joueur du tableau
	game.engine.removePlayer(player.id);

	game.chatbox.log(player.username + ' has left', 'warning');
});



/**
 * Un joueur est prêt à lancer la partie
 * @param {Object} player
 */
socket.on('game:player_ready_to_play', function (player_data)
{
	console.log('game:player_ready_to_play');

	var player = new TannsEngine.Player(null, player_data);

	// On modifie son statut
	player.setStatus('ready');

	game.chatbox.log(player.username + ' is ready to play', 'success');
});



/**
 * Le compte à rebours est lancé
 */
socket.on('game:warmup', function (seconds)
{
	console.log('game:warmup');

	game.chatbox.log('Game will start in ' + seconds + ' seconds!', 'info');
});



/**
 * Le compte à rebours a été abandonné
 */
socket.on('game:warmup_stop', function ()
{
	console.log('game:warmup_stop');

	game.chatbox.log('Warmup has been canceled!', 'error');
	game.chatbox.log('Waiting for all players to be ready.');
});



/**
 * On charge la partie
 */
socket.on('game:load', function (map, player_positions)
{
	console.log('game:load[' + map.name + ']');

	game.chatbox.log('Loading game');

	// On place les joueurs en "chargement"
	for (var player_id in game.engine.players)
	{
		game.engine.players[player_id].setStatus('loading');
	}

	// On initialise le jeu
	game.canvas.initialize(map, player_positions);
});



/**
 * Un joueur a fini de charger le jeu
 */
socket.on('game:player_finish_loading', function (player_id)
{
	console.log('game:player_finish_loading');

	// On récupère le joueur en question
	var player = game.engine.getPlayer(player_id);

	player.setStatus('waiting');
});



/**
 * La partie est lancée !
 */
socket.on('game:launch', function ()
{
	console.log('game:launch');

	game.engine.launch();
});



/**
 * C'est à mon tour de jouer
 */
socket.on('game:begin_my_round', function()
{
	console.log('game:begin_my_round');

	game.player.beginMyRound();
});



/**
 * Le joueur a voulu bouger mais le chemin est introuvable
 */
socket.on('game:forbidden_move', function()
{
	// On vire l'ancien chemin
	game.canvas.removePath();

	alert('Impossible d\'avancer sur cette case');
});



/**
 * Le joueur a voulu bouger, on lui renvoie le chemin à prendre
 */
socket.on('game:path_to_move', function(path)
{
	// On dessine le chemin trouvé
	game.canvas.drawPath(path);
});



/**
 * Le serveur autorise le joueur à se déplacer
 */
socket.on('game:move_to', function(player_data, posX, posY)
{
	console.log('game:move_to [' + posX + ',' + posY + ']');

	// On récupère la case cible
	var box = game.canvas.move_grid.getChildByName('grid_' + posY + '_' + posX);

	// On récupère le chemin actuel (copie)
	var path = jQuery.extend(true, {}, game.canvas.path);
	path.length = game.canvas.path.length;

	// On retire le chemin
	game.canvas.removePath();

	// On déplace le joueur
	game.canvas.movePlayerTo(game.player, box, path);

	// On MàJ les AP
	game.player.AP = player_data.AP;

	// MàJ interface
	game.player.updateInterface();

	finishedMoving();
});



/**
 * Un joueur se déplace
 */
socket.on('game:player_move_to', function(player_data, posX, posY)
{
	// TODO: le serveur envoie le chemin utilisé par le joueur pour se déplacer
	
	console.log('game:player_move_to [' + posX + ',' + posY + ']', player_data.username);

	// On récupère le joueur
	var player = game.engine.getPlayer(player_data.id);

	// On récupère la case cible
	var box = game.canvas.move_grid.getChildByName('grid_' + posY + '_' + posX);

	// On bouge le joueur
	player.moveTo(box);

	// On MàJ les AP
	player.AP = player_data.AP;

	// MàJ interface
	player.updateInterface();
});



/**
 * C'est au tour d'un autre joueur
 */
socket.on('game:player_began_round', function(player_id)
{
	console.log('game:player_began_round');

	var player = game.engine.getPlayer(player_id);
	player.beginRound();
});



/**
 * Un joueur a fini son tour
 */
socket.on('game:player_finished_round', function(player_data)
{
	console.log('game:player_finished_round');

	var player = game.engine.getPlayer(player_data.id);

	// On récupère les AP
	player.AP = player_data.AP;

	console.log(player.username + ' has now ' + player.AP + ' AP');

	player.finishRound();
});



/**
 * La partie est abandonnée
 */
socket.on('game:aborting', function ()
{
	alert("La partie a été abandonnée car il n'y a plus suffisamment de joueurs dans la partie.");

	window.location = "/logout";
});



/*-----------------------------------------*/



/**
 * Réception d'un message sur le tchat en provenance du serveur
 * @param {String} message
 */
socket.on('chatbox:message', function (message)
{	// On ajoute le message dans le tchat
	game.chatbox.addMessage(message);
});