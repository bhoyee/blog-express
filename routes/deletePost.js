const express = require('express');
const router = express.Router();
const {Post} = require('../db/models/Post');


router.get('/:id', async (req, res)=> {
    try{
        const post =  await Post.findByIdAndRemove(req.params.id);
        if(!post) return res.send('Record not found ');
        res.redirect('/auth/admin');
    }
    catch(err) {
        console.log('something went wrong ' + err);
    }
    
})

module.exports = router;