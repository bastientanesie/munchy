
/**
 * Constructeur de la classe Player
 * @param {Object} socket
 * @param {Object} player
 */
TannsEngine.Player = function (socket, player)
{
	this.id = player.id;
	this.socket = socket;
	this.status = player.status || 'connected';

	this.username = player.username;
	this.HP = 100;
	this.AP = 3;
	this.color = player.color;
	this.bitmap = null;
};



/**
 * Change le statut du joueur
 * @param {String} status
 */
TannsEngine.Player.prototype.setStatus = function(status)
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
	else if ( status == 'loading' )
	{
		status_field
			.attr('class', 'status label label-warning')
			.text('Loading');
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
 * Chargement du Canvas terminé
 */
TannsEngine.Player.prototype.gameLoaded = function ()
{
	// On prévient le serveur que l'on a temriné le chargement
	this.socket.emit('player:game_loaded');
};



/**
 * Le joueur commence son tour
 */
TannsEngine.Player.prototype.beginRound = function()
{
	// On change le statut
	this.setStatus('playing');

	game.chatbox.log('Next turn: ' + this.username);
};



/**
 * Le joueur termine son tour
 */
TannsEngine.Player.prototype.finishRound = function()
{
	// On change le statut du joueur joueur
	this.setStatus('waiting');

	game.chatbox.log(this.username + ' finished his turn');

	this.updateInterface();
};



/**
 * On commence notre tour
 */
TannsEngine.Player.prototype.beginMyRound = function()
{
	// On active la barre d'actions
	enableActions();

	// On change le statut
	this.setStatus('playing');

	game.chatbox.log("<strong>It's your turn to play!</strong>", 'info');
};



/**
 * On termine notre tour
 */
TannsEngine.Player.prototype.finishMyRound = function()
{
	// On désactive la barre d'actions
	disableActions();

	// On change le statut de notre joueur
	this.setStatus('waiting');

	// On prévient le serveur qu'on a fini notre tourne
	this.socket.emit('player:finish_round');

	game.chatbox.log(this.username + ' finished his turn');

	// TODO: faire en sorte que ça soit le serveur qui nous envoie
	// les données "fraîches" après la fin du tour du joueur
	this.AP = 3;

	this.updateInterface();
};



/**
 * MàJ de l'interface
 */
TannsEngine.Player.prototype.updateInterface = function()
{
	console.log('Player.updateInterface', this);

	$('#' + this.id).find('.hp').text( this.HP );
	$('#' + this.id).find('.ap').text( this.AP );
};



/**
 * Récupère l'orientation du joueur par rapport à une case cible
 */
TannsEngine.Player.prototype.getOrientation = function(posX, posY)
{
	// Source: http://www.tonypa.pri.ee/tbw/tut04.html

	// On stocke les positions de départ et de la cible
	var target_x = posX,
		target_y = posY,
		start_x = this.posX,
		start_y = this.posY;

	console.log('> Start [' + start_x + ',' + start_y + ']');
	console.log('> Target [' + target_x + ',' + target_y + ']');

	// On calcule la direction: -1, 0 ou 1
	var dir_x = start_x - target_x,
		dir_y = start_y - target_y;

	// On fait le calcul pour récupérer le numéro de l'animation
	var frame_num = dir_x + (dir_y * 2) + 3;

	console.log('> dir_x=' + dir_x, 'dir_y=' + dir_y, 'frame_num=' + frame_num);

	/*
	  Matrice :
		y\x|-1 | 0 | 1
		-1 | 0 | 1 | 2
		 0 | 2 | 3 | 4
		 1 | 4 | 5 | 6
	 */
	
	var animation = 'standDown';

	// En fonction du numéro de l'anim, on récupère le bon nom
	switch (frame_num)
	{
		case 5: // Haut
			animation = 'Up';
			break;
		case 2: // Droite
			animation = 'Right';
			break;
		case 1: // Bas
			animation = 'Down';
			break;
		case 4: // Gauche
			animation = 'Left';
			break;
		default: // Défaut
			animation = 'Down';
			break;
	}

	return animation;
};



/**
 * Déplace le joueur sur une case (animation + tween)
 * @param {Array} path - tableau de paires de coords
 * @param {int} index - le compteur pour taverser le tableau
 */
TannsEngine.Player.prototype.moveToPath = function(path, index, target, reached, last_orientation)
{
	console.log('Index:', index, 'Reached:', reached);
	var that = this;

	// Tant qu'on a pas taverser tout le tableau
	if ( !reached && index < path.length )
	{
		// Récupère les coords de la case
		var coords = path[index];

		console.log('Move to:', coords[0] + ',' + coords[1]);

		// Récupère l'orientation du personnage p/r à la case cible
		var orientation = this.getOrientation(coords[0], coords[1]);

		console.log('Orientation:', orientation);

		// Si on doit changer l'animation
		if ( orientation != last_orientation )
		{
			// On lance la nouvelle animation
			this.bitmap.gotoAndPlay('walk' + orientation + 'Loop');
		}

		// On enregistre la nouvelle position du joueur
		this.posX = coords[0];
		this.posY = coords[1];

		// On vérifie si on est arrivé sur la case cible
		if ( target.posX == coords[0] && target.posY == coords[1] )
		{
			console.log('STOP AT NEXT');
			// Si c'est la bonne, on s'arrête
			reached = true;
		}

		// On lance le tween
		createjs.Tween
			.get(this.bitmap)
			.to({
				x: coords[0] * game.canvas.map.tileWidth,
				y: coords[1] * game.canvas.map.tileHeight
			}, 500)
			.call(
				that.moveToPath,
				[path, index + 1, target, reached, orientation],
				that
			);
	}
	else
	{
		// On lance l'animation
		this.bitmap.gotoAndStop('stand' + last_orientation);
	}
};



// -------------------------------------------------------------- //



/**
 * OLD
 * Initialisation du personnage
 * @param {int} x
 * @param {int} y
 */
TannsEngine.Player.prototype.initializeCharacter = function(img, x, y)
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
 * OLD
 * Affiche la zone de déplacement
 */
TannsEngine.Player.prototype.showWhereToMove = function()
{
	console.log('Player.showWhereToMove');

	// On calcule le carré qui représente les limites
	// de la zone de déplacements
	var min_x = this.posX - this.AP,
		min_y = this.posY - this.AP,
		max_x = this.posX + this.AP,
		max_y = this.posY + this.AP,
		distance_x = 0, distance_y = 0, distance_totale = 0;

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
				if ( distance_totale <= this.AP && distance_totale !== 0 )
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
 * OLD
 * Masque la zone de déplacement
 */
TannsEngine.Player.prototype.hideWhereToMove = function()
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

	if (max_x >= game.canvas.map.width) max_x = game.canvas.map.width - 1;
	if (max_y >= game.canvas.map.height) max_y = game.canvas.map.height - 1;


	// On parcourt toutes les cases de la scène
	// En ordonnées
	for (var x = min_x; x <= max_x; x++)
	{
		// En abscisses
		for (var y = min_y; y <= max_y; y++)
		{
			// On récupère la case
			var box = game.canvas.grid.getChildByName('box-' + x + '-' + y);

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