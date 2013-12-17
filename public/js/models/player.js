
/**
 * Constructeur de la classe Player
 * @param {Object} socket
 * @param {Object} player
 */
function Player(socket, player)
{
	this.id = player.id;
	this.socket = socket;
	this.status = player.status || 'connected';

	this.username = player.username;
	this.HP = 100;
	this.AP = 3;
	this.color = player.color;
	this.bitmap = null;
}



/**
 * Change le statut du joueur
 * @param {String} status
 */
Player.prototype.setStatus = function(status)
{
	// On enregistre le statut
	this.status = status;

	// Le label du statut
	var status_field = $('#' + this.id).find('.status');

	if ( status == 'connected' )
	{
		status_field
			.attr('class', 'status label')
			.text('Connected');
	}
	else if ( status == 'ready' )
	{
		status_field
			.attr('class', 'status label label-info')
			.text('Ready');
	}
	else if ( status == 'disconnected' )
	{
		status_field
			.attr('class', 'status label label-important')
			.text('Disconnected');
	}
	else if ( status == 'playing' )
	{
		status_field
			.attr('class', 'status label label-success')
			.text('Playing');
	}
	else if ( status == 'waiting' )
	{
		status_field
			.attr('class', 'status label')
			.text('Waiting');
	}
	// Par défaut
	else
	{
		status_field
			.attr('class', 'status label label-inverse')
			.attr('disabled', true)
			.text('Unknown');
	}
};



/**
 * Le joueur commence son tour
 */
Player.prototype.beginRound = function()
{
	// On change le statut
	this.setStatus('playing');

	CHATBOX.log('Next turn: ' + this.username);
};



/**
 * Le joueur termine son tour
 */
Player.prototype.finishRound = function()
{
	// On change le statut du joueur joueur
	this.setStatus('waiting');

	CHATBOX.log(this.username + ' finished his turn');
};



/**
 * On commence notre tour
 */
Player.prototype.beginMyRound = function()
{
	// On active la barre d'actions
	enableActions();

	// On change le statut
	this.setStatus('playing');

	CHATBOX.log("<strong>It's your turn to play!</strong>", 'info');
};



/**
 * On termine notre tour
 */
Player.prototype.finishMyRound = function()
{
	// On désactive la barre d'actions
	disableActions();

	// On change le statut de notre joueur
	this.setStatus('waiting');

	// On prévient le serveur qu'on a fini notre tourne
	this.socket.emit('player:finish_round');

	CHATBOX.log(this.username + ' finished his turn');
};



/**
 * Initialisation du personnage
 * @param {int} x
 * @param {int} y
 */
Player.prototype.initializeCharacter = function(img, x, y)
{
	console.log('Player.initializeCharacter');

	var frequency = 8;

	// create spritesheet and assign the associated data.
	var spriteSheet  = new createjs.SpriteSheet({
		images: [img],
		frames: {
			width: 32,
			height: 32
		},
		animations: {
			// start, end, next, frequency
			walkDown: {
				frames: [0, 1, 2, 1],
				frequency: frequency,
				next: 'standDown'
			},
			walkDownRt: {
				frames: [0, 1, 2, 1],
				frequency: frequency
			},

			walkLeft: {
				frames: [3, 4, 5, 4],
				frequency: frequency,
				next: 'standLeft'
			},
			walkLeftRt: {
				frames: [3, 4, 5, 4],
				frequency: frequency
			},

			walkRight: {
				frames: [6, 7, 8, 7],
				frequency: frequency,
				next: 'standRight'
			},
			walkRightRt: {
				frames: [6, 7, 8, 7],
				frequency: frequency
			},

			walkUp: { // Equivalent à au dessus
				frames: [9, 10, 11, 10],
				frequency: frequency,
				next: 'standUp'
			},
			walkUpRt: { // Equivalent à au dessus
				frames: [9, 10, 11, 10],
				frequency: frequency
			},

			standDown: { frames: [1] },
			standLeft: { frames: [4] },
			standRight: { frames: [7] },
			standUp: 10 // Equivalent à au dessus
		}
	});

	// On place le Bitmap (pixels)
	this.bitmap = new createjs.BitmapAnimation(spriteSheet);
	this.bitmap.x = x * GAME.BOX_SIZE;
	this.bitmap.y = y * GAME.BOX_SIZE;

	// On place le personnage (cases)
	this.posX = x;
	this.posY = y;

	// On lance l'anim
	this.bitmap.gotoAndPlay('standDown');

	// On l'ajoute à la scène
	GAME.stage.addChild(this.bitmap);

	// On MàJ l'interface
	this.updateInterface();
};



/**
 * MàJ de l'interface
 */
Player.prototype.updateInterface = function()
{
	console.log('Player.updateInterface');

	$('#' + this.id).find('.hp').text( this.HP );
	$('#' + this.id).find('.ap').text( this.AP );
};



/**
 * Affiche la zone de déplacement
 */
Player.prototype.showWhereToMove = function()
{
	console.log('Player.showWhereToMove');

	// On calcule le carré qui représente les limites
	// de la zone de déplacements
	var min_x = this.posX - this.AP,
		min_y = this.posY - this.AP,
		max_x = this.posX + this.AP,
		max_y = this.posY + this.AP,
		distance_x = distance_y = distance_totale = 0;

	if (min_x < 0) min_x = 0;
	if (min_y < 0) min_y = 0;

	if (max_x >= GAME.width) max_x = GAME.width - 1;
	if (max_y >= GAME.height) max_y = GAME.height - 1;

	// On parcourt toutes les cases de la scène
	// En ordonnées
	for (var x = min_x; x <= max_x; x++)
	{
		// En abscisses
		for (var y = min_y; y <= max_y; y++)
		{
			// On récupère la case
			var box = GAME.grid.getChildByName('box-' + x + '-' + y);

			// Si on est pas dans le vide
			if ( box.data.type != 'empty' )
			{
				// On prend la valeur absolue du résultat
				distance_x = Math.abs( box.posX - this.posX );
				distance_y = Math.abs( box.posY - this.posY );
				distance_totale = distance_x + distance_y;

				// Si on a suffisamment de points pour y avancer
				if ( distance_totale <= this.AP && distance_totale != 0 )
				{
					box.alpha = 0.2;
					box.walkable = true;
				}
			}
		}
	}

	this.bitmap.gotoAndPlay('walkDownRt');
};



/**
 * Masque la zone de déplacement
 */
Player.prototype.hideWhereToMove = function()
{
	console.log('Player.hideWhereToMove');

	// On calcule le carré qui représente les limites
	// de la zone de déplacements
	var min_x = this.posX - this.AP,
		min_y = this.posY - this.AP,
		max_x = this.posX + this.AP,
		max_y = this.posY + this.AP;

	if (min_x < 0) min_x = 0;
	if (min_y < 0) min_y = 0;

	if (max_x >= GAME.width) max_x = GAME.width - 1;
	if (max_y >= GAME.height) max_y = GAME.height - 1;


	// On parcourt toutes les cases de la scène
	// En ordonnées
	for (var x = min_x; x <= max_x; x++)
	{
		// En abscisses
		for (var y = min_y; y <= max_y; y++)
		{
			// On récupère la case
			var box = GAME.grid.getChildByName('box-' + x + '-' + y);

			// Si on est pas dans le vide
			if ( box.data.type != 'empty' )
			{
				box.alpha = 0;
				box.walkable = false;
			}
		}
	}

	this.bitmap.gotoAndPlay('standDown');
};



/**
 * Déplace le joueur sur une case
 * @param {Rectangle} box
 */
Player.prototype.moveTo = function(box, useAP)
{
	// Paramètre par défaut
	if ( typeof(useAP) == 'undefined' )
	{
		useAP = true;
	}

	// On vérifie que l'on peut aller sur cette case
	if ( box.data.type == 'empty' || box.walkable != true )
	{
		return false;
	}

	console.log('Moving to [' + box.posX + ',' + box.posY + '], ' + box.data.type);

	// On prend la valeur absolue du résultat
	var distance_x = Math.abs( box.posX - this.posX ),
		distance_y = Math.abs( box.posY - this.posY ),
		distance_totale = distance_x + distance_y;

	// Si on a suffisamment de points pour y avancer
	if ( distance_totale <= this.AP )
	{
		// On masque les cases
		this.hideWhereToMove();

		// On déplace le joueur
		this.posX = box.posX;
		this.posY = box.posY;
		this.bitmap.x = box.x;
		this.bitmap.y = box.y;

		// On retire des AP
		if ( useAP ) {
			this.AP -= distance_totale;
		}
		
		this.updateInterface();
	}
};