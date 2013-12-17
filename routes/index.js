
/*
 * GET home page.
 */



/**
 * Homepage
 */
exports.index = function(req, res)
{
	// Redirection vers le formulaire de connexion
	if ( typeof req.session.username == "undefined" )
	{
		res.redirect('/login');
	}

	res.render('index', {
		title: 'Homepage',
		username: req.session.username
	});
};



/**
 * Login
 */
exports.login = function(req, res)
{
	res.render('login', {
		title: 'Login'
	});
};
exports.authenticate = function(req, res)
{
	// On récupère le pseudo
	username = req.body.username || "Anonymous";

	// On l'enregistre en session
	req.session.username = username;

	res.redirect('/');
};



/**
 * Logout
 */
exports.logout = function(req, res)
{
	delete req.session.username;

	res.redirect('/login');
};