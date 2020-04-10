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

       
        const validPassword = await bcrypt.compare(req.body.password, user.password);
         if(!validPassword) return req.flash('loginErrors', 
         'Invalid Username or Password'), res.redirect('/auth/login');
    
         req.session.userId = user._id;
         req.session.name = user.username;
        
         res.redirect('/auth/admin');
    }
    catch(error) {

        const loginErrors = Object.keys(error.errors).map(key => error.errors[key].message)
 
        req.flash('loginErrors', loginErrors)
        

        return res.redirect('/auth/login');
    }
    
})

module.exports = router;
