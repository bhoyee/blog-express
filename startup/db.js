const mongoose = require("mongoose");

module.exports = function() {
//Database connection
mongoose.connect('mongodb://localhost/blogDB', {useNewUrlParser: true, useUnifiedTopology:true})
    .then(() => console.log('Connected to blogDB'))
    .catch((err) => console.log('Something went wrong', err));

}