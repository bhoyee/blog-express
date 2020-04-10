const express = require('express');
const router = express.Router();
const {Post} = require('../db/models/Post');


router.post('/:id', async (req, res)=> {
    try{
        let name = req.session.name;
        if(!name) return res.redirect('/auth/login');
      
        const posts =  await Post.findByIdAndUpdate(req.params.id, {
          title: req.body.title,
          description: req.body.description,
          content: req.body.content,
          author: req.session.name,
          createdAt: req.body.createdAt
        },
        {new: true});
      
      res.redirect('/auth/admin');
    
       }
       catch(err) {
        
         console.log('something is wrong ' + err);
       }
})

module.exports = router;