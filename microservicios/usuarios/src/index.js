require('dotenv').config();
const express = require('express');
const usuariosController = require('./controllers/usuariosController');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use(usuariosController);

const PORT = process.env.PORT || 3000;

app.listen(process.env.PORT, () => {
  console.log(`Microservicio usuarios servicios ejecutándose en puerto ${process.env.PORT}`);
});
