const express = require('express');
const router = express.Router();
const path = require('path');
const {Post} = require('../db/models/Post');


router.get('/', (req, res) => {
    let name = req.session.name;
    return res.render('create' , { name, email: req.flash('postErrors')});
    
});

router.post('/', (req, res)=> {

    
    try{
       
        const { image } = req.files;
        if(image.mimetype.includes("png") || image.mimetype.includes("jpeg") || 
            image.mimetype.includes("jpg") || image.mimetype.includes("gif")) {
        
        image.mv(path.resolve(__dirname, '..', 'public/posts', image.name), async (err) => {
                   
                let post = new Post ({
                    title: req.body.title,
                    description: req.body.description,
                    content: req.body.content,
                    author: req.session.name,
                    image: `/posts/${image.name}` ,
                                          
                })
                await post.save();
                console.log('ppost '+ req.session.name);
                res.redirect('/auth/admin');
             
        })
     }
        else {
          return res.send('file no supported')           
        }

    }
    catch(error) {

        console.log('something went wrong ' + error);
        
        const postErrors = Object.keys(error.errors).map(key => error.errors[key].message)
 
        req.flash('loginErrors', postErrors)
        return res.redirect('/posts/new');
    }
    
   
})

module.exports = router;