const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser')//sirve para parsear
const { config }= require('dotenv')//lee las variables de estado
config();
const bookRoutes = require('./src/routes/marvel.routes');
const app = express();
app.use(bodyParser.json())
//conexion a la base de datos
mongoose.connect(process.env.MONGO_URL, {
  dbName: process.env.MONGO_DB_NAME    
})

const db = mongoose.connection;
app.use('/marvel',bookRoutes);
const port = process.env.PORT || 3000;
//iniciar el servidor
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
