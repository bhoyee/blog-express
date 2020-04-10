const express = require('express');
const path = require('path');
const ejs = require('ejs');
const app = express();


app.set('view engine', 'ejs');
app.use(express.static("public"));

require('./startup/db')();
require('./startup/routes')(app);


const port = process.env.PORT || '4000';

app.listen(port, () => console.log(`Server listerniing on port ${port}` ))