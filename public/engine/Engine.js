/**
 * Constructeur
 */
TannsEngine.Engine = function ()
{
	// Le statut de la partie
	game.status = 'pending';

	// La liste des joueurs
	this.players = [];
};



/**
 * Initialisation
 */
TannsEngine.Engine.prototype.initialize = function()
{
};



/**
 * Ajoute un joueur à la partie
 * @param {Player} player
 */
TannsEngine.Engine.prototype.addPlayer = function(player)
{
	// On ajoute le joueur au tableau
	this.players[player.id] = player;
	this.players.length += 1;

	// On l'ajoute sur la page
	$('#players').append(
		'<li id="' + player.id + '">'
		+ '<span class="label status">Connected</span> '
		+ '<strong>' + player.username + '</strong>, '
		+ '[<span class="color">' + player.color + '</span>] '
		+ '<span class="hp">0</span> HP | '
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
TannsEngine.Engine.prototype.removePlayer = function(player_id)
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
TannsEngine.Engine.prototype.getPlayer = function(player_id)
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
TannsEngine.Engine.prototype.launch = function()
{
	// On modifie le statut
	game.status = 'playing';

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

	game.chatbox.log('<strong>Game has just begun!</strong>', 'info');
};