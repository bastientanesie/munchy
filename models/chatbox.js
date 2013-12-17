
/**
 * Constructeur
 */
function Chatbox(sockets)
{
	this.sockets = sockets;
}



/**
 * Un joueur envoie un message à tous les autres
 * @param {String} message
 * @param {Player} player
 */
Chatbox.prototype.broadcastMessage = function (message, player)
{
	var html = '',
		date = new Date();

	// On construit le message
	html += '[' + ('0' + date.getHours()).slice(-2);
	html += ':' + ('0' + date.getMinutes()).slice(-2);
	html += ':' + ('0' + date.getSeconds()).slice(-2);
	html += '] ';
	html += player.username + ' : ';

	// On protège les balises HTML en remplaçant par les entités
	html += String(message)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

	player.socket.broadcast.emit('chatbox:message', html);
};



/**
 * Export de la classe
 */
module.exports = Chatbox;