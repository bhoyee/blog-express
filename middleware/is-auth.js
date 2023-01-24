const jwt = require('jsonwebtoken');
const config = require('config');


module.exports = (req, res, next) => {

     //Verify user with session
    let isAuthenticated = req.session.isLoggedIn;
    const token = req.session.authToken;
   // let isAuthorised = req.session.isAdmin;

    if ( !isAuthenticated ) {
       
        req.session.destroy();
        return res.redirect('/');
    }
    if (!token) {
        console.log('Access Denied. No Token Provided');
        req.session.destroy();
        return res.redirect('/') ;
    }

    try {
        const decode = jwt.verify(token, config.get('jwtPrivateKey'));
        req.user = decode;
        console.log(req.user.role + ' ' +'role')
        if(req.user.role !== 'admin') {
        console.error('User Not allow here ');
        req.session.destroy();
        return res.redirect('/');
        }

        next();
    }
    catch(err) {
        res.status(404).console.error('Bad Token.')
    }


}

