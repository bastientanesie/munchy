
/**
 * MODULES
 */
var express = require('express'),
	routes = require('./routes'),
	http = require('http'),
	path = require('path'),
	socket_io = require('socket.io'),
	PF = require('pathfinding');

// Load models
var Player = require('./models/player'),
	Game = require('./models/game'),
	Chatbox = require('./models/chatbox');

// Load assets
var maps = [
	require('./assets/map1')
];

// Instanciating stuff
var app = express(),
	server = http.createServer(app),
	io = socket_io.listen(server);

// all environments
app.set('port', process.env.VCAP_APP_PORT || process.env.PORT || 5555);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
// app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('dafuqtrololosmurf'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

// Socket.IO config
// https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
/**
 * Log Level
 * 0 = error
 * 1 = warn
 * 2 = info
 * 3 = debug
 */
io.set('log level', 2);
/**
 * Authorizing & Handshaking
 * https://github.com/LearnBoost/socket.io/wiki/Authorizing
 */



/**
 * ROUTES
 */
app.get('/', routes.index);

app.get('/login', routes.login);
app.post('/authenticate', routes.authenticate);
app.get('/logout', routes.logout);



/**
 * SERVER STARTING
 */
server.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});



/**
 * GLOBAL MODELS
 */
var GAME = new Game(io.sockets, maps),
	CHATBOX = new Chatbox(io.sockets);



/**
 * SOCKET.IO EVENTS
 */
io.sockets.on('connection', function(socket)
{
	try
	{
		/*------------------------------------------------*/
		/*--------------	 PRE-GAME	  	--------------*/
		/*------------------------------------------------*/

		/**
		 * Déconnexion d'un joueur
		 */
		socket.on('disconnect', function()
		{
			// On supprime le joueur
			GAME.removePlayer(socket.id);
		});



		/**
		 * Authentification d'un joueur
		 * @param  {string} username
		 */
		socket.on('player:authenticate', function(username)
		{
			// Si la partie la partie n'est pas déjà lancée
			if ( GAME.status == 'pending' && GAME.players.length < 4 )
			{
				var player = new Player(this.id, username, this, GAME, PF);

				GAME.addPlayer(player, socket);
			}
			// Sinon, la partie est déjà lancée
			else
			{	// On lance le Mode Spectateur pour le joueur
				GAME.addSpectator(socket);
			}
		});



		/**
		 * Un joueur est prêt à lancer la partie
		 */
		socket.on('player:ready', function()
		{
			// Le joueur est prêt
			GAME.getPlayer(socket.id).setReady();

			// Si tout le monde est prêt
			if ( GAME.isReadyToStart() )
			{
				// WARMUP TIME, BITCHES!
				GAME.launchWarmup();
			}
		});



		/**
		 * Un joueur n'est pas prêt à lancer la partie
		 */
		socket.on('player:not_ready', function()
		{
			// Le joueur n'est pas prêt
			GAME.getPlayer(socket.id).setNotReady();

			// Si le Warmup est lancé
			if ( GAME.status == 'warmup' )
			{
				// On stoppe le Warmup si besoin
				GAME.stopWarmup();
			}
		});



		/**
		 * Un joueur a fini de charger le jeu
		 */
		socket.on('player:game_loaded', function()
		{
			var player = GAME.getPlayer(socket.id);

			// On change le statut
			player.setStatus('game_loaded');

			// On prévient les autres joueurs
			player.socket.broadcast.emit('game:player_finish_loading', player.id);

			// Si tout le monde est prêt
			if ( GAME.isEveryoneLoaded() )
			{
				// On lance la partie
				GAME.launch();
			}
		});



		/*------------------------------------------------*/
		/*--------------	 GAME LOGIC  	--------------*/
		/*------------------------------------------------*/

		/**
		 * Un joueur a terminé son tour
		 */
		socket.on('player:finish_round', function()
		{
			var player = GAME.getPlayer(socket.id);
			GAME.finishRound(player);

			console.log('player:finish_round', player.username + ' has now ' + player.AP + ' AP');
		});



		/**
		 * Un joueur souhaite se déplacer sur une case
		 * On a besoin de faire un PathFinding
		 */
		socket.on('player:pathfinding', function(posX, posY)
		{
			// On récupère le joueur
			var player = GAME.getPlayer(socket.id);

			if ( player.AP > 0 )
			{
				var path = player.findPath(posX, posY);

				// Aucun chemin trouvé
				if ( path === false )
				{	// On prévient le joueur
					player.socket.emit('game:forbidden_move');
				}
				else
				{	// On envoie le chemin au joueur
					player.socket.emit('game:path_to_move', path);
				}
			}
		});



		/**
		 * Un joueur veut se déplacer sur une case
		 */
		socket.on('player:want_to_move', function(posX, posY)
		{
			// On récupère le joueur
			var player = GAME.getPlayer(socket.id);

			// S'il a suffisamment de AP
			if ( player.AP > 0 )
			{
				// On bouge le joueur
				player.moveTo(posX, posY);
			}
		});



		/*------------------------------------------------*/
		/*--------------	 CHATBOX	  	--------------*/
		/*------------------------------------------------*/

		/**
		 * Un joueur a envoyé un message
		 */
		socket.on('chatbox:send', function(message)
		{
			var player = GAME.getPlayer(socket.id);

			CHATBOX.broadcastMessage(message, player);
		});

	}
	catch(error)
	{
		console.error(error);
	}

});