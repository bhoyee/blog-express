const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Post }= require('../db/models/Post');




router.get('/', auth, async (req, res) => {
    try {
         let name = req.session.name;
         const posts = await Post.find().sort('-createdAt')
         res.render('dashboard', { posts, name, 
         errors: req.flash('loginErrors')
    });
    }
    catch(err) {
        console.log('Something go wrong.. error: ' + err)
    }
  
});

module.exports = router;

