/**
 * Constructeur
 * @param {string} stage_id - ID du canvas
 */
function Game(stage_id)
{
	// Le statut de la partie
	this.status = 'pending';

	// La liste des joueurs
	this.players = [];

	// La scène
	this.stage = new createjs.Stage(stage_id);

	// On active événements de souris
	this.stage.enableMouseOver();

	// On crée le conteneur des cases
	this.grid = new createjs.Container();

	// On ajoute la grille à la scène
	this.stage.addChild(this.grid);

	// Constantes
	this.BOX_SIZE = 32; // Taille des cases en pixels
	this.width = MAP[0].length; // Largeur de la scène en nombre de cases
	this.height = MAP.length; // Hauteur de la scène en nombre de cases

	// Touches du clavier
	this.KEY_DOWN	= 40,
	this.KEY_UP		= 38,
	this.KEY_LEFT	= 37,
	this.KEY_RIGHT	= 39;
}



/**
 * Initialisation
 */
Game.prototype.initialize = function()
{
	console.log('Game.initialize');
	var that = this;

	// createjs.Ticker.useRAF = true;
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
	this.loadQueue.loadManifest([
		{
			id: 'map',
			src: 'img/map.png'
		},
		{
			id: 'blue',
			src: 'img/blue.png'
		},
		{
			id: 'green',
			src: 'img/green.png'
		},
		{
			id: 'red',
			src: 'img/red.png'
		},
		{
			id: 'yellow',
			src: 'img/yellow.png'
		}
	]);
};



/**
 * EventHandler : Tick
 */
Game.prototype.onTick = function()
{
	this.stage.update();
};



/**
 * Preload terminé
 */
Game.prototype.handleQueueComplete = function()
{
	console.log('Game.handleQueueComplete');

	// On crée le Bitmap de la carte
	this.map = new createjs.Bitmap( this.loadQueue.getResult('map') );

	// On place la map
	this.map.x = 0;
	this.map.y = 0;

	// On l'ajoute à la scène
	this.stage.addChild(this.map);

	var player = bitmapSrc = null,
		x = 4, y = 0;
	// On ajoute les joueurs
	for (var i in this.players)
	{
		// On récupère le joueur
		player = this.players[i];

		// On récupère l'image du joueur
		bitmapSrc = this.loadQueue.getResult( player.color );

		// On initialise le joueur à la position donnée (cases)
		player.initializeCharacter(bitmapSrc, (4 + num), 0);
	}
	

	// On lance la création de la grille
	this.createGrid();
};



/**
 * Création de la grille des cases
 */
Game.prototype.createGrid = function()
{
	console.log('Game.createGrid');

	// Ordonnées
	for ( var x = 0; x < this.width; x++ )
	{
		// Abscisses
		for ( var y = 0; y < this.height; y++ )
		{
			// On crée la forme, on la positionne
			var box = this.createGridBox(this.BOX_SIZE, x, y);

			// On l'ajoute à la grille
			this.grid.addChild(box);
		}
	}

	this.stage.setChildIndex(this.grid, 2);
};



/**
 * Création d'une case de la grille
 */
Game.prototype.createGridBox = function(size, x, y)
{
	// On crée la forme, on la positionne
	var box = new createjs.Shape();

	// On lui donne un nom pour pouvoir le retrouver
	box.name = 'box-' + x + '-' + y;

	// On lui donne son type
	box.data = MAP[y][x];
	box.walkable = false; // On ne peut pas marcher dessus

	// Position sur la grille
	box.posX = x;
	box.posY = y;

	// Position en pixels sur le Canvas
	box.x = x * size;
	box.y = y * size;

	// On rend la case transparente
	box.alpha = 0;

	// On crée le carré à l'intérieur
	box.graphics
		.beginFill('red')
		.drawRect(0, 0, size, size);

	// On crée la zone cliquable (un carré identique)
	box.hitArea = new createjs.Shape();
	box.hitArea.graphics
			.beginFill('white')
			.drawRect(0, 0, size, size);

	// ---------------------

	/**
	 * EventHandler: MouseOver
	 */
	box.addEventListener('mouseover', function(event)
	{
		// Si on peut marcher dessus
		if ( box.walkable )
		{
			// On affiche le curseur pointeur
			document.body.style.cursor = "pointer";

			// On augmente l'opacité
			box.alpha = 0.5;
		}
	});

	/**
	 * EventHandler: MouseOut
	 */
	box.addEventListener('mouseout', function(event)
	{
		// Si on peut marcher dessus
		if ( box.walkable )
		{
			// On baisse l'opacité
			box.alpha = 0.2;
		}

		// On affiche le curseur par défaut
		document.body.style.cursor = "default";
	});

	/**
	 * EventHandler: Click
	 */
	box.addEventListener('click', function(event)
	{
		console.log('onClick ' + box.name);

		// Si on peut marcher dessus
		if ( box.walkable )
		{
			// On déplace le joueur
			ME.moveTo(box);
		}

		console.log('Box [' + box.posX +', ' + box.posY + '] : x=' + box.x + ', y=' + box.y );
	});

	// ---------------------

	return box;
};



/**
 * Ajoute un joueur à la partie
 * @param {Player} player
 */
Game.prototype.addPlayer = function(player)
{
	// On ajoute le joueur au tableau
	this.players[player.id] = player;
	this.players.length += 1;

	// On l'ajoute sur la page
	$('#players').append(
		'<li id="' + player.id + '">'
		+ '<span class="label status">Connected</span> '
		+ '<strong>' + player.username + '</strong>, '
		+ '<span class="hp">0</span> HP / '
		+ '<span class="ap">0</span> AP'
		+ '</li>'
	);

	// On met à jour le label du statut
	player.setStatus(player.status);
};



/**
 * Supprime un joueur de la partie
 * @param {String} player_id
 */
Game.prototype.removePlayer = function(player_id)
{
	var player = this.getPlayer(player_id);

	if ( typeof(player) != 'undefined' )
	{
		// On retire le joueur du tableau
		delete this.players[player_id];
		this.players.length -= 1;

		// On le supprime de la page
		$('#' + player.id).remove();
	}
	else
	{
		throw "unknown player id: " + player_id;
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
		throw "unknown player id: " + player_id;
	}
};



/**
 * Lance la partie
 */
Game.prototype.launch = function()
{
	// On modifie le statut
	this.status = 'playing';

	// On modifie le bouton et on le bloque
	$('#ready').removeClass('btn-info')
		.addClass('btn-success')
		.attr('disabled', true)
		.text("Game's launched!");

	// On change le statut de tous les joueurs
	for (var player_id in this.players)
	{
		this.players[player_id].setStatus('waiting');
	}

	CHATBOX.log('<strong>Game has just begun!</strong>', 'info');
};