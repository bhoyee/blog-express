const express = require('express');
const router = express.Router();
const { Post } = require('../db/models/Post');

const postController = require('../controllers/posts');



router.get('/', postController.getindex);
router.get('/post/:postName-:id', postController.getPostDetail);
// router.get('/dash', postController.getDash);


module.exports = router;