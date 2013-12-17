// Classe Mère
game.TileClass = function () {};
game.TileClass.prototype.walkable = false;
game.TileClass.prototype.type = 'tilename';
game.TileClass.prototype.width = 32;
game.TileClass.prototype.height = 32;
game.TileClass.prototype.x = 0;
game.TileClass.prototype.y = 0;



// Vide
game.Tile0 = function () {};
game.Tile0.prototype.__proto__ = game.TileClass.prototype;
game.Tile0.prototype.type = 'void';
game.Tile0.prototype.x = 0;
game.Tile0.prototype.y = 0;

// Route
game.Tile1 = function () {};
game.Tile1.prototype.__proto__ = game.TileClass.prototype;
game.Tile1.prototype.type = 'road';
game.Tile1.prototype.walkable = true;
game.Tile1.prototype.x = 32;
game.Tile1.prototype.y = 0;

// Mur
game.Tile2 = function () {};
game.Tile2.prototype.__proto__ = game.TileClass.prototype;
game.Tile2.prototype.type = 'wall';
game.Tile2.prototype.x = 64;
game.Tile2.prototype.y = 0;

// Porte
game.Tile3 = function () {};
game.Tile3.prototype.__proto__ = game.TileClass.prototype;
game.Tile3.prototype.type = 'door';
game.Tile3.prototype.walkable = true;
game.Tile3.prototype.x = 96;
game.Tile3.prototype.y = 0;

// Sol
game.Tile4 = function () {};
game.Tile4.prototype.__proto__ = game.TileClass.prototype;
game.Tile4.prototype.type = 'floor';
game.Tile4.prototype.walkable = true;
game.Tile4.prototype.x = 128;
game.Tile4.prototype.y = 0;

// Spawn
game.Tile5 = function () {};
game.Tile5.prototype.__proto__ = game.TileClass.prototype;
game.Tile5.prototype.type = 'spawn';
game.Tile5.prototype.walkable = true;
game.Tile5.prototype.x = 160;
game.Tile5.prototype.y = 0;

// Finish
game.Tile6 = function () {};
game.Tile6.prototype.__proto__ = game.TileClass.prototype;
game.Tile6.prototype.type = 'finish';
game.Tile6.prototype.walkable = true;
game.Tile6.prototype.x = 192;
game.Tile6.prototype.y = 0;