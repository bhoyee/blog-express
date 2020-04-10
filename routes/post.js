const express = require('express');
const router = express.Router();
const { Post } = require('../db/models/Post');



router.get('/',  async (req, res) => {
    try {
      
        let name = req.session.name;
        const posts = await Post.find().sort('-createdAt')
        console.log(name)
        res.render('index', { posts, name });  

    }
    catch(err) {
        console.log('Something go wrong.. error: ' + err)
    }
  
});

router.get('/:id',  async (req, res) => {
    try {
        //check if id is valid ObjectId
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
           
            let name = req.session.name;
            const post = await Post.findById(req.params.id);
            console.log(name)
            res.render('post', { post, name });  

          } else {

            res.render('page404');
              
          }
       
    }
    catch(err) {
        console.log('Something go wrong.. error: ' + err)
    }
  
});

router.get('/posts/edit/:id',  async (req, res) => {
    try {
            //check if id is valid ObjectId
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      
        let name = req.session.name;
        const post = await Post.findById(req.params.id);
        console.log(name)
        if(!name) return res.redirect('/auth/login');
        res.render('editPost', {post, name, viewTitle: "Edit / Update Post"});

        } else {
            res.render('page404');
           
        }
   
    }
    catch(err) {
        console.log('Something go wrong.. error: ' + err)
    }
  
});


module.exports = router;