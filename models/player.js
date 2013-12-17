
/**
 * Constructeur
 * @param {[type]} id       [description]
 * @param {[type]} username [description]
 * @param {[type]} socket   [description]
 * @param {[type]} game     [description]
 */
function Player(id, username, socket, game, PF)
{
	this.id = id;
	this.username = username;
	this.socket = socket;
	this.game = game;
	this.PF = PF;
	this.color = 'blue';
	this.status = 'connected';
	this.position = 0;
	this.posX = 0;
	this.posY = 0;
	this.x = 0;
	this.y = 0;
	this.path = null;
	this.HP = 100;
	this.AP = 3;
}



/**
 * Le joueur est prêt
 * @param  {String} status
 */
Player.prototype.setReady = function()
{
	// On s'assure que la partie n'a pas encore commencée
	if ( this.game.status == 'pending' )
	{
		// On change le statut
		this.setStatus('ready');

		// On prévient les joueurs
		this.game.sockets.emit('game:player_ready_to_play', this.serialized());
	}
	// Sinon, ça sent le cheat
	else
	{
		console.error('[HACK] Player ' + this.username + ' sent status "ready" while the game is already started.');

		this.socket.emit('player:hack', "Cheats/Hacks are not allowed, GTFO!");
	}
};



/**
 * Le joueur n'est pas prêt
 * @param  {String} status
 */
Player.prototype.setNotReady = function()
{
	// On s'assure que la partie n'a pas encore commencée
	if ( this.game.status == 'pending' || this.game.status == 'warmup' )
	{
		// On change le statut
		this.setStatus('connected');

		// On prévient les joueurs
		this.game.sockets.emit('player:changed_status', this.serialized());
	}
	// Sinon, ça sent le cheat
	else
	{
		console.error('[HACK] Player ' + this.username + ' sent status "not_ready" while the game is already started.');

		this.socket.emit('player:hack', "Cheats/Hacks are not allowed, GTFO!");
	}
};



/**
 * Change le statut du joueur
 * @param  {String} status
 */
Player.prototype.setStatus = function(status)
{
	// On change le statut
	this.status = status;
};



/**
 * PathFinding
 */
Player.prototype.findPath = function(posX, posY)
{
	// On réinitialise tout
	this.path = [];

	// On crée la grille qui va servir au PathFinding
	var grid = new this.PF.Grid(this.game.map.width, this.game.map.height, this.game.map.matrix);

	// On instancie le Finder
	var finder = new this.PF.BestFirstFinder();

	// On recherche le chemin
	this.path = finder.findPath(
		this.posX, // Start X
		this.posY, // Start Y
		posX,	// Target X
		posY,	// Targer Y
		grid
	);

	// Si on a trouvé un chemin
	if ( this.path.length > 0 )
	{
		// On part dans le sens inverse du chemin
		// pour retirer les cases qui sont trop loin du joueur
		// en fonction du nombre de AP restants
		for (var i = this.path.length - 1; i > this.AP; i--)
		{
			this.path[i].shift();
			this.path.length--;
		}
	}
	// Sinon, chemin introuvable
	else
	{
		this.path = false;
	}

	// On renvoie le chemin trouvé
	return this.path;
};



/**
 * Déplace le joueur sur une case
 */
Player.prototype.moveTo = function(posX, posY, useAP)
{
	// Paramètre par défaut
	if ( typeof(useAP) == 'undefined' )
	{
		useAP = true;
	}

	// On prend la valeur absolue du résultat
	// en X et en Y pour trouver la distance entre les deux cases
	var distance_x = Math.abs( posX - this.posX ),
		distance_y = Math.abs( posY - this.posY ),
		distance_totale = distance_x + distance_y;

	// Si on a suffisamment de points pour s'y déplacer
	if ( distance_totale <= this.AP )
	{
		console.log('Moving ' + this.username + ' to [' + posX + ',' + posY + ']');

		// On enregistre la nouvelle position du joueur
		this.posX = posX;
		this.posY = posY;

		// On retire les AP
		if ( useAP ) {
			this.AP -= distance_totale;
		}

		// On prévient les autres joueurs
		this.socket.broadcast.emit('game:player_move_to', this.serialized(), posX, posY, this.path);

		// On prévient LE joueur en lui-même
		this.socket.emit('game:move_to', this.serialized(), posX, posY);
	}
};



/**
 * Renvoie le joueur en format sérialisé,
 * juste avec les variables publiques
 * @return {Object}
 */
Player.prototype.serialized = function()
{
	// On retourne un objet contenant ce qu'il faut
	return {
		id: this.id,
		username: this.username,
		color: this.color,
		status: this.status,
		posX: this.posX,
		posY: this.posY,
		HP: this.HP,
		AP: this.AP
	};
};



/**
 * Export de la classe
 */
module.exports = Player;







/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt (min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}