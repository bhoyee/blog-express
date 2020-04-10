const express = require('express');
const router = express.Router();
const { User }= require('../db/models/User');
const bcrypt = require('bcrypt');


router.get('/', (req, res) => {
    let name = req.session.name;
    res.render('login', { name,
        
        errors: req.flash('loginErrors')
    });

    
})
 
router.post('/', async(req, res) => {

    try {
        const user = await User.findOne({email: req.body.email});
        if(!user)return req.flash('loginErrors', 
          'Invalid Username or Password'), res.redirect('/auth/login');

        //if(!user) return console.log('Invalid user'), res.redirect('/auth/login');
        const validPassword = await bcrypt.compare(req.body.password, user.password);
         if(!validPassword) return req.flash('loginErrors', 
         'Invalid Username or Password'), res.redirect('/auth/login');
    
         req.session.userId = user._id;
         req.session.name = user.username;
         console.log(req.session.userId);
         console.log(validPassword);
         console.log('sessionName '+ req.session.name);
         res.redirect('/auth/admin');
    }
    catch(error) {

        const loginErrors = Object.keys(error.errors).map(key => error.errors[key].message)
 
        req.flash('loginErrors', loginErrors)
        console.log('something went wrong error: ' + error);

        return res.redirect('/auth/login');
    }
    
})

module.exports = router;
