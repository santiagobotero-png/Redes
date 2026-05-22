require('dotenv').config();
const express = require('express'); 
const productosController = require('./controllers/reservaController'); 
const morgan = require('morgan'); 
const cors = require('cors'); 
const app = express(); 

app.use(morgan('dev')); 
app.use(cors());
app.use(express.json()); 

app.use('/api/ordenes', productosController); 
 
const PORT = process.env.PORT || 3000;

app.listen(process.env.PORT, () => {
  console.log(`Microservicio ordenes ejecutándose en puerto ${process.env.PORT}`);
});
