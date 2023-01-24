
'use strict'

const config = require('config');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs');

// invoke an instance of express application.
const app = express();

if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR: jwtPrivateKey not defined. ');
    process.exit(1);
}


// initialize body-parser to parse incoming parameters requests to req.body

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//handling the view engine and static file(Public)
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use('/public/posts', express.static(path.join(__dirname, 'public/posts')));

//link startup db connectipn and startup routes 
require('./startup/db')();
require('./startup/routes')(app);

// set application port and start the server
const port = process.env.PORT || '4000';
app.listen(port, () => console.log(`Server listerniing on port ${port}` ))