
/**
 * Constructeur
 */
function Game(sockets, maps)
{
	this.debug = true;
	this.sockets = sockets;
	this.maps = maps;
	this.map = null;
	this.status = 'pending';
	this.players = [];
	this.spectators = [];
	this.currentPlayerID = null;
	this.playerPositions = [];
	this.warmup = null;
	this.warmupTime = 1;

	this.player_colors = ['blue', 'green', 'red', 'yellow'];
}



/**
 * Ajout un spectateur
 * @param {Object} socket
 */
Game.prototype.addSpectator = function(socket)
{
	// On l'ajoute à la liste
	this.spectators.push(socket.id);

	// On lance le mode spectateur chez le joueur
	socket.emit('player:spectator_mode');

	// On lui envoie la liste des joueurs connectés
	socket.emit('game:current_players', this.getSerializePlayers());
};



/**
 * Ajoute un joueur à la partie
 * @param {Player} player
 * @param {Object} socket
 */
Game.prototype.addPlayer = function(player, socket)
{
	// On l'ajoute à la liste
	this.players[player.id] = player;
	this.players.length += 1;

	// On crée la position du joueur et on l'enregistre
	player.position = this.playerPositions.length;
	this.playerPositions.push(player.id);

	// On lui donne sa couleur
	player.color = this.player_colors.shift();

	console.log('[addPlayer] Player "' + player.username + '" added, position ' + player.position + ', color ' + player.color);

	// On envoie la liste des joueurs connectés au nouveau joueur
	player.socket.emit('game:current_players', this.getSerializePlayers());

	// On prévient les autres qu'un nouveau joueur est arrivé
	player.socket.broadcast.emit('game:new_player', player.serialized());
};



/**
 * Supprime un joueur de la partie
 * @param {String} player_id
 */
Game.prototype.removePlayer = function(player_id)
{
	// Est-ce un spectateur ?
	if ( this.spectators.indexOf(player_id) > -1 )
	{
		// On cherche la position du joueur dans le tableau
		for (var pos in this.spectators)
		{
			if (this.spectators[pos] == player_id)
			{	// C'est lui! On le vire!
				this.spectators.splice(pos, 1);
			}
		}
	}
	// Est-ce bien un joueur ?
	else
	{
		var player = this.getPlayer(player_id);

		if ( typeof(player) != 'undefined' )
		{
			// D'abord, on retire la position du joueur
			this.removePlayerPosition(player.id);

			// Ensuite on retire le joueur de la partie
			// this.players.splice(player_id, 1); // Je n'arrive pas à récupérer l'objet Player ici
			delete this.players[player.id];
			this.players.length -= 1;

			console.log('[removePlayer] Player "' + player.username + '" deleted, position ' + player.position);

			// On avertit les joueurs que quelqu'un est parti
			player.socket.broadcast.emit('game:player_disconnected', player.serialized());

			// On remet la couleur du joueur dans la liste
			this.player_colors.push( player.color );


			// Plus assez de joueurs pour continuer ?
			if ( this.status == 'playing' && ! this.areThereEnoughPlayers() )
			{	// On abandonne la partie
				this.abortGame();
			}
		}
		else
		{
			this.error('[removePlayer] Unknown player_id: ' + player_id);
		}
	}
};



/**
 * Retire la position d'un joueur
 * @param {String} player_id
 */
Game.prototype.removePlayerPosition = function(player_id)
{
	var position = null,
		pos = 0;

	// D'abord, on parcourt le tableau pour trouver la position du joueur
	for (pos in this.playerPositions)
	{
		// Si le player_id à la position actuelle correspond
		if ( this.playerPositions[pos] == player_id )
		{
			position = pos;
		}
	}

	// Si jamais on n'a pas trouvé la position du joueur
	if ( position === null )
	{
		this.error('[removePlayerPosition] Cant find player\'s position with player_id: ' + player_id);
	}

	// On supprime la position du joueur
	var player = this.playerPositions.splice(position, 1);

	// On met à jour la position des autres joueurs
	for (pos in this.playerPositions)
	{	// On récupère le joueur
		player = this.players[ this.playerPositions[pos] ];

		player.position = Number(pos);
	}
};



/**
 * Récupère un joueur de la partie
 * @param  {String} player_id
 * @return {Player}
 */
Game.prototype.getPlayer = function(player_id)
{
	var player = this.players[player_id];

	if ( typeof(player) != 'undefined' )
	{
		return player;
	}
	else
	{
		this.error('[getPlayer] Unknown player_id: ' + player_id);
	}
};



/**
 * Vérifie qu'il y a assez de joueurs pour continuer la partie
 */
Game.prototype.areThereEnoughPlayers = function()
{
	// Si on a au moins 2 joueurs, c'est bon
	return ( this.players.length >= 2 );
};



/**
 * Vérifie si la partie est prête à commencer
 * @return {Bool}
 */
Game.prototype.isReadyToStart = function()
{
	// Y a-t-il assez de joueurs ?
	if ( !this.areThereEnoughPlayers() )
	{
		return false;
	}

	var is_everyone_ready = true;

	// On vérifie que chaque joueur est prêt
	for (var i in this.players)
	{
		// Si le joueur n'est pas prêt
		if ( this.players[i].status != 'ready' )
		{
			is_everyone_ready = false;
		}
	}

	return is_everyone_ready;
};



/**
 * On lance le compte à rebours!
 */
Game.prototype.launchWarmup = function()
{
	console.info('Launching Warmup, Bitches!');

	this.status = 'warmup';

	var counter = this.warmupTime,
		game = this;

	// On lance la boucle, toutes les secondes
	this.warmup = setInterval(function()
	{
		// A partir de 5 secondes
		if ( counter <= 5 )
		{
			game.sockets.emit('game:warmup', counter);
		}
		// Message toutes les 5 secondes
		else if ( counter == 30 || counter == 15 || counter == 10 ) //if ( counter % 5 == 0 )
		{
			game.sockets.emit('game:warmup', counter);
		}

		// On décrémente le compteur
		counter--;

		// Si on est arrivé à la fin
		if ( counter == 0 )
		{

			// On lance le chargement de la partie
			game.loadGame();
		}
	}, 1000);
};



/**
 * On arrête le compte à rebours!
 */
Game.prototype.stopWarmup = function()
{
	console.info('STOPPED WARMUP, Damn!');

	// On réinitialise le statut
	this.status = 'pending';

	// On stoppe le compte à rebours
	clearInterval(this.warmup);

	// On prévient les joueurs
	this.sockets.emit('game:warmup_stop');
};



/**
 * On charge la partie
 */
Game.prototype.loadGame = function()
{
	console.info('Game.loadGame');

	// On stoppe le compte à rebours
	clearInterval(this.warmup);

	var player = null, positions = [], pos = null, coords = null;

	// Partie en cours de chargement
	this.status = 'loading';


	// On sélectionne la map 1
	this.map = this.maps[0];

	// On récupère les ID et positions de tous les joueurs
	for (var player_id in this.players)
	{
		player = this.getPlayer(player_id);

		// On récupère la position
		pos = player.position;

		// On enregistre l'ID du joueur à sa position
		positions[ pos ] = player_id;

		// On récupère les coordonnées de départ du joueur
		coords = this.map.playersStart[pos];

		// On enregistre la position de départ du joueur
		player.posX = coords[0];
		player.posY = coords[1];

		// On modifie la matrice d'obstacles pour mettre un obstacle à l'emplacement du joueur
		// matrix[y][x]
		// this.map.matrix[coords[1]][coords[0]] = 1;
	}

	// console.dir(positions);

	// On change le statut de tous les joueurs
	for (var player_id in this.players)
	{
		// On récupère le joueur
		player = this.players[player_id];

		// On envoie le signal au joueur avec la map
		player.socket.emit('game:load', this.map, positions);

		// On change les statuts des joueurs
		player.setStatus('loading');
	}
};



/**
 * Vérifie que tous les joueurs ont fini de charger la partie
 */
Game.prototype.isEveryoneLoaded = function()
{
	// Y a-t-il assez de joueurs ?
	if ( !this.areThereEnoughPlayers() )
	{
		return false;
	}

	var is_everyone_loaded = true;

	// On vérifie que chaque joueur est prêt
	for (var i in this.players)
	{
		// Si le joueur n'est pas prêt
		if ( this.players[i].status != 'game_loaded' )
		{
			is_everyone_loaded = false;
		}
	}

	console.log('Game.isEveryoneLoaded', is_everyone_loaded);

	return is_everyone_loaded;
};



/**
 * Lance la partie
 */
Game.prototype.launch = function()
{
	console.info('Launching Game');

	var player = null;

	this.status = 'playing';
	this.sockets.emit('game:launch');

	// On change le statut de tous les joueurs
	for (var player_id in this.players)
	{
		// On récupère le joueur
		player = this.players[player_id];

		// On lui donne son statut
		player.setStatus('waiting');
	}

	var game = this;
	// On lance le tour du premier joueur
	setTimeout(function ()
	{
		game.nextPlayerRound()
	}, 2000);
};



/**
 * Lance le tour du joueur suivant
 */
Game.prototype.nextPlayerRound = function()
{
	// On prend le premier joueur de la liste
	var player_id = this.playerPositions.shift(),
		player = this.getPlayer(player_id);

	// Et on le replace en dernière position
	this.playerPositions.push(player.id);

	// On enregistre qui est en train de jouer
	this.currentPlayerID = player.id;

	// On modifie son statut
	player.setStatus('playing');

	// On avertit le joueur du début de son tour
	player.socket.emit('game:begin_my_round');

	// On prévient les autres joueurs
	player.socket.broadcast.emit('game:player_began_round', player.id);
};



/**
 * Fin du tour du joueur actuel
 * @param {Player} player
 */
Game.prototype.finishRound = function(player)
{
	// On s'assure que ça soit le bon joueur qui joue son tour
	if ( this.currentPlayerID == player.id )
	{
		// On modifie son statut
		player.setStatus('waiting');

		// On réinitialise les AP
		player.AP = 3;

		// On prévient les autres que le tour est terminé
		player.socket.broadcast.emit('game:player_finished_round', player.serialized());

		var game = this;
		// On lance le tour du prochain joueur
		setTimeout(function ()
		{
			game.nextPlayerRound()
		}, 2000);
	}
	// Quelqu'un essaye de tricher et de jouer son tour
	// alors que ce n'est pas à lui de jouer
	else
	{
		this.error('[HACK] Player "' + player.id + '" tries to play while it is not his round!');
	}
};



/**
 * Abandon de la partie en cours
 */
Game.prototype.abortGame = function()
{
	// On prévient tous les joueurs
	this.sockets.emit('game:aborting');

	// On réinitialise tout
	this.status = 'pending';
	// this.players = [];
	// this.spectators = [];
	this.cards = [];
	this.currentPlayerID = null;
	// this.playerPositions = [];

	// Génère 50 cartes bidon
	for (var i = 1; i <= 50; i++)
	{
		this.cards.push({
			name: 'Carte ' + i
		});
	}
};



/**
 * Retourne une version sérialisée du tableau des joueurs
 * @return {Array[Object]}
 */
Game.prototype.getSerializePlayers = function()
{
	var serialized = [];

	for (var i in this.players)
	{
		serialized.push( this.players[i].serialized() );
	}

	return serialized;
};



/**
 * Traitement de l'affichage des erreurs
 * Lance une exception ou affiche dans la console
 * @param {String} message
 */
Game.prototype.error = function(message)
{
	if ( this.debug === true )
	{
		console.error(message);
	}
	else
	{
		throw message;
	}
};



/**
 * Export de la classe
 */
module.exports = Game;