// Namespace dédié à la map
var map = {
	name : 'map1',

	// Matrice de la map avec les Tiles
	tileMap : [
		[0, 0, 0, 0, 0, 0, 5, 5, 5, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 5, 5, 5, 2, 4, 4, 4, 4, 4, 2, 0, 0, 0, 0],
		[2, 2, 2, 2, 2, 2, 1, 1, 1, 2, 4, 4, 4, 4, 4, 2, 0, 0, 0, 0],
		[2, 4, 4, 4, 4, 2, 1, 1, 1, 2, 4, 4, 4, 4, 4, 2, 0, 0, 0, 0],
		[2, 4, 4, 4, 4, 2, 1, 1, 1, 2, 4, 4, 4, 4, 4, 2, 0, 0, 0, 0],
		[2, 4, 4, 4, 4, 2, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2, 0, 0, 0, 0],
		[2, 4, 4, 4, 4, 3, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 6, 6],
		[2, 4, 4, 4, 4, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6],
		[2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 6, 6]
	],

	// Matrice des obstacles
	matrix : [
		// 0 = walkable
		// 1 = obstacle
		[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
	],

	// Ressources: Images/Spritesheets/Audio/Etc.
	manifest : [
		{
			id: 'tileset',
			src: 'assets/tileset_1.png'
		},
		{
			id: 'red',
			src: 'assets/img/character_red.png'
		},
		{
			id: 'blue',
			src: 'assets/img/character_blue.png'
		},
		{
			id: 'green',
			src: 'assets/img/character_green.png'
		},
		{
			id: 'yellow',
			src: 'assets/img/character_yellow.png'
		},
		{
			id: 'zombie',
			src: 'assets/img/zombie.png'
		}
	],

	// Positions de départ des joueurs
	playersStart : [ [6, 0], [8, 0], [6, 1], [8, 1] ],

	// Propriétés des Tiles
	tileWidth : 32,
	tileHeight : 32
};

// Propriétés de la map
map.width = map.tileMap[0].length;
map.height = map.tileMap.length;



/**
 * Export de l'objet
 */
module.exports = map;