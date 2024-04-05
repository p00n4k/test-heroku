const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors'); // Import the cors middleware
dotenv.config();
const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cors()); // Use the cors middleware

const connection = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  port: process.env.dbport,
});

connection.connect((err) => {
  if (err) {
    console.log('Error connecting to Db', err);
    return;
  }
  console.log('Mysql Connected...');
});
app.get('/', (req, res) => {
  res.send('Hello World');
});
//search by id that contains a string
app.get('/products/search/id/:id', (req, res) => {
  const id = req.params.id;
  connection.query(
    'SELECT * FROM product WHERE product_stock_id LIKE ? LIMIT 50',
    ['%' + id + '%'],
    (err, rows) => {
      if (err) {
        console.log('Error in query', err);
        return;
      }
      res.send(rows);
    }
  );
});

//search by name that contains a string
app.get('/products/search/name/:name', (req, res) => {
  const name = req.params.name;
  connection.query(
    'SELECT * FROM product WHERE product_name LIKE ? LIMIT 50',
    ['%' + name + '%'],
    (err, rows) => {
      if (err) {
        console.log('Error in query', err);
        return;
      }
      res.send(rows);
    }
  );
});

app.listen(process.env.PORT || port || 3000, () => {
  console.log('Server started on port 3000');
});
