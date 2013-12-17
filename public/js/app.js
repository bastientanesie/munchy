var BASE_URL = window.location.protocol + '://' + window.location.host,
	socket = io.connect(),
	// Tann's Engine Objects
	game.player = null,
	game.engine = new TannsEngine.Engine('canvas'),
	game.canvas = new TannsEngine.GraphicsEngine('canvas'),
	game.chatbox = new TannsEngine.Chatbox();


/*-----------------------------------------*/


/**
 * Connexion au serveur, on s'authentifie
 * et on crée le joueur
 */
socket.on('connect', function()
{
	// On crée notre joueur
	game.player = new Player(socket, {
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
	for (var player in game.engine.players)
	{
		player.setStatus('disconnected');
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
	var player = null,
		html = 'Current players in game : ';

	console.log(players);

	// Pour chaque joueur
	for (var i in players)
	{
		// On crée l'objet Player
		player = new Player(null, players[i]);

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
	var player = new Player(null, player_data);

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
	var player = new Player(null, player_data);

	// On modifie son statut
	player.setStatus('ready');

	game.chatbox.log(player.username + ' is ready to play', 'success');
});



/**
 * Le compte à rebours est lancé
 */
socket.on('game:warmup', function (seconds)
{
	game.chatbox.log('Game will start in ' + seconds + ' seconds!', 'info');
});



/**
 * On charge la partie
 */
socket.on('game:load', function ()
{
	game.chatbox.log('Loading game');

	// Chargement de la Map en AJAX
	$.getScript('assets/map1/map.js', function(data)
	{
		// On initialise le jeu
		game.canvas.initialize();
	});
});



/**
 * Le compte à rebours a été abandonné
 */
socket.on('game:warmup_stop', function ()
{
	game.chatbox.log('Warmup has been canceled!', 'error');
	game.chatbox.log('Waiting for all players to be ready.');
});



/**
 * La partie est lancée !
 */
socket.on('game:launch', function ()
{
	game.engine.launch();
});



/**
 * C'est à mon tour de jouer
 */
socket.on('game:begin_my_round', function()
{
	game.player.beginMyRound();
});



/**
 * C'est au tour d'un autre joueur
 */
socket.on('game:player_began_round', function(player_id)
{
	var player = game.engine.players[player_id];
	player.beginRound();
});



/**
 * Un joueur a fini son tour
 */
socket.on('game:player_finished_round', function(player_id)
{
	var player = game.engine.players[player_id];
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