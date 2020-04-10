const express = require('express');
const router = express.Router();
const { User }= require('../db/models/User');
const bcrypt = require('bcrypt');


router.get('/', (req, res) => {
    let name = req.session.name;
    res.render('register', { name,
        
        errors: req.flash('registrationErrors')
    });

    
});

router.post('/',async (req, res)=> {

    try{

        let user = await User.findOne({email: req.body.email});
        if(user) return req.flash('registrationErrors', 
                'User already exit with email!'), res.redirect('/auth/register');
          
        user = new User({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        
            await user.save();
            req.session.userId = user._id;
            req.session.name = user.username;
            console.log('reg: '+ req.session.name);
            res.redirect('/auth/admin');
           
    }
    catch(error) {
        const registrationErrors = Object.keys(error.errors).map(key => error.errors[key].message)
 
        req.flash('registrationErrors', registrationErrors)
        return res.redirect( '/auth/register')
    }
    
})


module.exports = router;