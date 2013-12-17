
/**
 * Constructeur
 */
function Chatbox()
{
	this.container = $('#chatbox_container');
}



/**
 * Ajoute un message en provenance du serveur
 * @param {String} message
 */
Chatbox.prototype.addMessage = function(message)
{
	// #chatbox_tab <span class="badge badge-success">2</span>

	this.container.append('<p>' + message + '</p>');

	this.container.animate({
		scrollTop: this.container.prop('scrollHeight') - this.container.height()
	}, 800);
};



/**
 * Ajoute le message d'un joueur UNIQUEMENT côté client
 * @param {String} message
 * @param {String} username
 */
Chatbox.prototype.addMessageFrom = function (message, username)
{
	var html = '',
		date = new Date();

	// On construit le message HTML
	html += '<p>';
	html += '[' + ('0' + date.getHours()).slice(-2);
	html += ':' + ('0' + date.getMinutes()).slice(-2);
	html += ':' + ('0' + date.getSeconds()).slice(-2);
	html += '] ';
	html += username + ' : ';
	
	// On protège les balises HTML en remplaçant par les entités
	html += String(message)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

	html += '</p>';

	// #chatbox_tab <span class="badge badge-success">2</span>

	this.container.append(html);

	this.container.animate({
		scrollTop: this.container.prop('scrollHeight') - this.container.height()
	}, 800);
};



/**
 * Ajoute un message système au tchat
 * @param {String} message
 * @param {String} type
 */
Chatbox.prototype.log = function(message, type)
{
	if ( typeof(type) == 'undefined' ) {
		type = 'log';
	}

	var html = '',
		date = new Date();

	html += '<p class="' + type + '">';
	html += '[' + ('0' + date.getHours()).slice(-2);
	html += ':' + ('0' + date.getMinutes()).slice(-2);
	html += ':' + ('0' + date.getSeconds()).slice(-2);
	html += '] ';
	html += message;
	html += '</p>';

	this.container.append(html);

	this.container.animate({
		scrollTop: this.container.prop('scrollHeight') - this.container.height()
	}, 800);
};