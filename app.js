const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require ('cookie-parser');
const req = require('express/lib/request');
const res = require('express/lib/response');

const app = express();

//Seteo de plantillas
app.set('view engine', 'ejs');

//Seteo de archivos estaticos
app.use(express.static('public'));

//Procesado de datos enviados desde formulario
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//seteo de variables de entorno
dotenv.config({path:'./env/.env'})

//seteo de cookies
app.use(cookieParser());

//llamado al enrutador
app.use('/',require('./routes/routes'))

//Declaración de puerto
app.listen(3000, () =>{
    console.log("Server is running on port 3000");
});