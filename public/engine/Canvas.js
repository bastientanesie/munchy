/**
 * Constructeur
 * @param {string} stage_id - ID du canvas
 */
TannsEngine.Canvas = function (stage_id)
{
	// La scène
	this.stage = new createjs.Stage(stage_id);

	// On active événements de souris
	this.stage.enableMouseOver();

	// Touches du clavier
	this.KEY_DOWN	= 40,
	this.KEY_UP		= 38,
	this.KEY_LEFT	= 37,
	this.KEY_RIGHT	= 39;

	// Chemin retourné par le PathFinding
	this.path = [];
};


// Niveau de log
TannsEngine.Canvas.logLevel = 1;



/**
 * Initialisation
 */
TannsEngine.Canvas.prototype.initialize = function(map, player_positions)
{
	this.log(1, 'Canvas.initialize');

	// On enregistre les données de la map
	this.map = map;
	game.mapWidth = map.mapWidth;
	game.mapHeight = map.mapHeight;

	// Les positions de départs des joueurs
	this.playerPositions = player_positions;

	var that = this;

	// On fixe les FPS
	createjs.Ticker.useRAF = true;
	createjs.Ticker.setFPS(60);

	// Ticker
	createjs.Ticker.addEventListener('tick', function(event)
	{
		that.onTick();
	});

	// Préloader
	this.loadQueue = new createjs.LoadQueue(false); // false quand on est en local !
	this.loadQueue.addEventListener('complete', function(event)
	{
		that.handleQueueComplete();
	});
	this.loadQueue.loadManifest(this.map.manifest);
};



/**
 * EventHandler : Tick
 */
TannsEngine.Canvas.prototype.onTick = function()
{
	this.stage.update();
};



/**
 * Preload terminé
 */
TannsEngine.Canvas.prototype.handleQueueComplete = function()
{
	this.log(1, 'Canvas.handleQueueComplete');

	// On récupère la SpriteSheet
	this.tileset = this.loadQueue.getResult('tileset');

	// On crée la map et la grille de déplacement
	this.buildMap();
};



/**
 * Création de la map
 */
TannsEngine.Canvas.prototype.buildMap = function()
{
	this.log(2, 'Canvas.buildMap');

	var bitmap, tile, player, player_id, coords;
	bitmap = tile = player = player_id = coords = null;

	// Conteneur des Tiles de la map
	this.tiles_0 = new createjs.Container();

	// Conteneur des Tiles des joueurs
	this.tiles_1 = new createjs.Container();

	// Conteneur des cases de déplacement
	this.move_grid = new createjs.Container();

	// Pour chaque ligne
	for (var y = 0; y < this.map.height; y++)
	{
		// Pour chaque colonne
		for (var x = 0; x < this.map.width; x++)
		{
			// On récupère l'objet TileX (dans le namespace "game")
			tile = new game[ 'Tile' + this.map.tileMap[y][x] ]();

			// On crée le Bitmap
			bitmap = new createjs.Bitmap(this.tileset);
			bitmap.name = 'tile_' + y + '_' + x;
			bitmap.walkabe = tile.walkable;
			bitmap.type = tile.type;

			// On crée cible la Tile uniquement sur la SpriteSheet
			bitmap.sourceRect = new createjs.Rectangle(tile.x, tile.y, tile.width, tile.height);

			// On positionne le Bitmap
			bitmap.x = x * tile.width;
			bitmap.y = y * tile.height;

			// On crée la zone de déplacement correspondant au Bitmap
			var box = this.createGridBox(x, y, bitmap.x, bitmap.y, tile.walkable, tile.type);

			// On l'ajoute à la grille de déplacement
			this.move_grid.addChild(box);

			// EventHandler: Click
			bitmap.addEventListener('click', function(event)
			{
				var box = event.target;
				console.log(box.name, box.type, 'x=' + box.x, 'y=' + box.y);
			});

			// On ajoute le Bitmap au conteneur
			this.tiles_0.addChild(bitmap);
		}
	}

	// Pour chaque joueur
	for (var pos in this.playerPositions)
	{
		// On récupère l'ID du joueur
		player_id = this.playerPositions[pos];

		// On récupère le joueur
		player = game.engine.getPlayer(player_id);

		// On récupère la position de départ
		coords = this.map.playersStart[pos];

		this.createCharacter(player, coords[0], coords[1]);

		// On l'ajoute à la scène
		this.tiles_1.addChild(player.bitmap);
	}

	// On ajoute les conteneurs à la scène
	this.stage.addChildAt(this.tiles_0, 0); // Index 0
	this.stage.addChildAt(this.tiles_1, 1); // Index 1
	this.stage.addChildAt(this.move_grid, 2); // Index 2

	// On signale au joueur que le canvas est chargé
	game.player.gameLoaded();

	// On masque la grille de déplacement
	// this.move_grid.set({ visible: false });
};



/**
 * Création d'une case de la grille de déplacement
 */
TannsEngine.Canvas.prototype.createGridBox = function(posX, posY, x, y, walkable, type)
{
	// On crée la forme, on la positionne
	var box = new createjs.Shape();

	// On lui donne un nom pour pouvoir le retrouver
	box.name = 'grid_' + posY + '_' + posX;

	// On récupère les données de la Tile
	box.walkable = walkable;
	box.type = type;
	box.highlighted = false;

	// Position sur la grille
	box.posX = posX;
	box.posY = posY;

	// Position au même endroit que la Tile
	box.x = x;
	box.y = y;

	// On rend la case transparente
	box.alpha = 0;

	// On crée le carré à l'intérieur
	box.graphics
		.beginFill('red')
		.drawRect(0, 0, this.map.tileWidth, this.map.tileHeight);

	// On crée la zone cliquable (un carré identique)
	box.hitArea = new createjs.Shape();
	box.hitArea.graphics
			.beginFill('white')
			.drawRect(0, 0, this.map.tileWidth, this.map.tileHeight);


	// ---------------------

	/**
	 * EventHandler: MouseOver
	 */
	box.addEventListener('mouseover', function(event)
	{
		// Si on peut marcher dessus
		if ( box.walkable && box.highlighted )
		{
			// On affiche le curseur pointeur
			document.body.style.cursor = "pointer";

			// On augmente l'opacité
			box.alpha = 0.5;
		}
		else
		{
			// On affiche le curseur pointeur
			document.body.style.cursor = "pointer";

			// On augmente l'opacité
			box.alpha = 0.2;
		}
	});

	/**
	 * EventHandler: MouseOut
	 */
	box.addEventListener('mouseout', function(event)
	{
		// Si on peut marcher dessus
		if ( box.walkable && box.highlighted )
		{
			// On baisse l'opacité
			box.alpha = 0.2;
		}
		else
		{
			box.alpha = 0;
		}

		// On affiche le curseur par défaut
		document.body.style.cursor = "default";
	});

	/**
	 * EventHandler: Click
	 */
	box.addEventListener('click', function(event)
	{
		if ( game.status == 'move' )
		{
			// Si on peut marcher sur la case et qu'elle est atteignable
			if ( box.walkable && box.highlighted )
			{
				console.log('want_to_move');

				// On déplace le joueur
				// game.player.moveTo(box);

				// On envoie au serveur le déplacement
				game.player.socket.emit('player:want_to_move', box.posX, box.posY);
			}
			// Sinon
			else
			{
				console.log('pathfinding');

				// TODO: Vérifie si, sur la case cliquée,
				// il y a un joueur ou autre chose qui empêche de s'y déplacer
				// pour ne pas aller sur une case déjà occupée

				// On envoie la demande de déplacement au serveur
				// pour récupérer le chemin d'accès
				game.player.socket.emit('player:pathfinding', box.posX, box.posY);

				// On lance la recherche du chemin
				// game.canvas.findPath(game.player, box);
			}
		}
		else
		{
			var tile = game.canvas.tiles_0.getChildByName('tile_' + posY + '_' + posX),
				matrix = game.canvas.map.matrix[posY][posX];

			console.log('Box [' + box.posX +', ' + box.posY + '] : x=' + box.x + ', y=' + box.y 
				+ ', Tile [' + tile.type + '], Matrix: ' + matrix);
		}
	});



	// ---------------------

	return box;
};



/**
 * Création d'un personnage sur la map
 */
TannsEngine.Canvas.prototype.createCharacter = function(player, posX, posY)
{
	this.log(2, 'Canvas.createCharacter');

	var frequency = 8;

	// create spritesheet and assign the associated data.
	var spriteSheet  = new createjs.SpriteSheet({
		images: [ this.loadQueue.getResult(player.color) ],
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
			walkDownLoop: {
				frames: [0, 1, 2, 1],
				frequency: frequency
			},

			walkLeft: {
				frames: [3, 4, 5, 4],
				frequency: frequency,
				next: 'standLeft'
			},
			walkLeftLoop: {
				frames: [3, 4, 5, 4],
				frequency: frequency
			},

			walkRight: {
				frames: [6, 7, 8, 7],
				frequency: frequency,
				next: 'standRight'
			},
			walkRightLoop: {
				frames: [6, 7, 8, 7],
				frequency: frequency
			},

			walkUp: { // Equivalent à au dessus
				frames: [9, 10, 11, 10],
				frequency: frequency,
				next: 'standUp'
			},
			walkUpLoop: { // Equivalent à au dessus
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
	player.bitmap = new createjs.BitmapAnimation(spriteSheet);
	player.bitmap.x = posX * this.map.tileWidth;
	player.bitmap.y = posY * this.map.tileHeight;

	this.log(2, 'Character ' + player.color + ': ' + player.bitmap.x + ',' + player.bitmap.y);

	// On place le personnage (cases)
	player.posX = posX;
	player.posY = posY;

	// On lance l'anim
	player.bitmap.gotoAndStop('standDown');

	// On rafraichit l'interface
	player.updateInterface();
};



/**
 * Affiche le résultat du PathFinding
 */
TannsEngine.Canvas.prototype.drawPath = function(path)
{
	this.log(1, 'Canvas.drawPath');

	// On vire le chemin actif si besoin
	this.removePath();

	// On enregistre le chemin
	this.path = path;

	// On avance de case en case
	for (var i = 1; i < this.path.length; i++)
	{
		// On récupère les coordonnées de la case
		x = this.path[i][0];
		y = this.path[i][1];

		// On récupère la case
		box = this.move_grid.getChildByName('grid_' + y + '_' + x);
		box.alpha = 0.2;
		box.highlighted = true;
	}
};



/**
 * PathFinding
 */
TannsEngine.Canvas.prototype.findPath = function(player, targetBox)
{
	// Réinitialisation
	this.removePath();

	// On crée la grille qui va servir au PathFinding
	var grid = new PF.Grid(game.mapWidth, game.mapHeight, this.matrix);

	// On instancie le Finder
	var finder = new PF.BestFirstFinder();

	// On recherche le chemin
	this.path = finder.findPath(
		player.posX, // Start X
		player.posY, // Start Y
		targetBox.posX,	// Target X
		targetBox.posY,	// Targer Y
		grid
	);

	// Si on a trouvé un chemin
	if ( this.path.length > 0 )
	{
		var x = 0, y  = 0,
			box = null,
			distance = this.path.length;

		// On part dans le sens inverse du chemin
		// pour retirer les cases qui sont trop loin du joueur
		for (var i = this.path.length - 1; i > player.AP; i--)
		{
			this.path[i].shift();
			this.path.length--;
		}

		// On avance de case en case
		for (i = 1; i < this.path.length; i++)
		{
			// On récupère les coordonnées de la case
			x = this.path[i][0];
			y = this.path[i][1];

			// On récupère la case
			box = this.move_grid.getChildByName('grid_' + y + '_' + x);
			box.alpha = 0.2;
			box.highlighted = true;
		}
	}
	// Sinon, chemin introuvable
	else
	{
		alert('Chemin introuvable');
	}
};



/**
 * PathFinding
 */
TannsEngine.Canvas.prototype.removePath = function()
{
	this.log(1, 'Canvas.removePath');

	// Si un chemin existe
	if ( this.path.length > 0 )
	{
		var x = 0, y = 0,
			box = null;

		// On avance de case en case
		for (var coords in this.path)
		{
			// On récupère les coordonnées de la case
			x = this.path[coords].shift();
			y = this.path[coords].shift();

			// On récupère la case
			box = this.move_grid.getChildByName('grid_' + y + '_' + x);
			box.alpha = 0;
			box.highlighted = false;
		}
	}

	this.path = [];
};



/**
 * Déplacement d'un joueur
 */
TannsEngine.Canvas.prototype.movePlayerTo = function(player, box, path)
{
	var reached = false, // Flag pour la boucle
		i = 1, // Compteur (1 pour zaper la première case où est le joueur)
		coords = null,
		animation = '';

	// On crée le Tween en pause
	var tween = createjs.Tween.get(player.bitmap, { paused: true });

	console.log('------- Canvas.movePlayerTo');
	console.log('Moving ' + player.username + ' from [' + player.posX + ',' + player.posY + '] to [' + box.posX + ',' + box.posY + '], ' + box.type);
	console.log('Path', path);

	// On parcourt le chemin dispo pour le joueur
	player.moveToPath(path, i, box, false, null);

	// // Si on a atteint la case souhaitée
	// if ( box.posX == coords[0] && box.posY == coords[1] )
	// {
	// 	console.log('Target reached');
	// 	reached = true;

	// 	// On joue l'animation où le perso s'arrête
	// 	player.bitmap.gotoAndStop('stand' + direction);
	// }
	// // On passe à la case suivante
	// else
	// {
	// 	i++;
	// }

	console.log('MoveAction finished');
};



/**
 * Déplacement d'un joueur
 */
TannsEngine.Canvas.prototype.movePlayerTo_OLD = function(player, box, path)
{
	var reached = false, // Flag pour la boucle
		i = 1, // Compteur (1 pour zaper la première case où est le joueur)
		coords = null,
		animation = '';

	// On crée le Tween en pause
	var tween = createjs.Tween.get(player.bitmap, { paused: true });

	console.log('------- Canvas.movePlayerTo');
	console.log('Moving ' + player.username + ' from [' + player.posX + ',' + player.posY + '] to [' + box.posX + ',' + box.posY + '], ' + box.type);
	console.log('Path', path);

	// On parcourt le chemin dispo pour le joueur
	// tant qu'on a pas atteint la case souhaitée
	do
	{
		console.log('--- Loop ' + i);
		// On récupère les coordonnées de la prochaine case
		coords = path[i];

		console.log('Move to ', coords[0] + ',' + coords[1]);

		// On bouge le joueur en récupérant la direction du déplacement
		direction = player.moveTo(coords[0], coords[1]);

		console.log('Animation: walk' + direction + 'Rt');

		// On joue l'animation de déplacement (en boucle)
		player.bitmap.gotoAndPlay('walk' + direction + 'Rt');

		// Tween
		tween.to({
			x: coords[0] * this.map.tileWidth,
			y: coords[1] * this.map.tileHeight
		}, 1000).call(function() {
			console.log('Finished moving to ' + player.posX + ',' + player.posY);
		});

		// Si on a atteint la case souhaitée
		if ( box.posX == coords[0] && box.posY == coords[1] )
		{
			console.log('Target reached');
			reached = true;

			// On joue l'animation où le perso s'arrête
			player.bitmap.gotoAndStop('stand' + direction);
		}
		// On passe à la case suivante
		else
		{
			i++;
		}
	}
	while ( !reached );

	console.log('MoveAction finished');
};



/**
 * Logging
 */
TannsEngine.Canvas.prototype.log = function(level, message)
{
	// On log tout
	if ( this.logLevel === 0 )
	{
		console.log(message);
	}
	// On filtre
	else if ( level <= this.logLevel )
	{
		console.log(message);
	}
};