const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {

    console.log(req.session.userId);
    
    req.session.destroy(() => {
        res.redirect('/')
    })
    
})


module.exports = router;