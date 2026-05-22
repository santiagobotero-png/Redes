const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const habitacionesController = require('./controllers/habitacionesController');
const serviciosController = require('./controllers/serviciosController');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use(habitacionesController);
app.use(serviciosController);

const PORT = process.env.PORT || 3000;

app.listen(process.env.PORT, () => {
  console.log(`Microservicio servicios ejecutándose en puerto ${process.env.PORT}`);
});