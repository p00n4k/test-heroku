const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors'); // Import the cors middleware

dotenv.config();
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // HTTP request logger middleware
app.use(cors()); // Enable CORS for all routes

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

// Routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Search by id that contains a string
app.get('/products/search/id/:id', (req, res) => {
  const id = req.params.id;
  connection.query(
    'SELECT * FROM product WHERE product_stock_id LIKE ? LIMIT 50',
    ['%' + id + '%'],
    (err, rows) => {
      if (err) {
        console.log('Error in query', err);
        res.status(500).send('Error in query');
        return;
      }

      if (rows.length === 0) {
        res.status(204).send('No products found matching the search criteria');
        return;
      }
      res.send(rows);
    }
  );
});

// Search by name that contains a string
app.get('/products/search/name/:name', (req, res) => {
  const name = req.params.name;
  connection.query(
    'SELECT * FROM product WHERE product_detail LIKE ? LIMIT 50',
    ['%' + name + '%'],
    (err, rows) => {
      if (err) {
        console.log('Error in query', err);
        res.status(500).send('Error in query');
        return;
      }

      if (rows.length === 0) {
        res.status(204).send('No products found matching the search criteria');
        return;
      }
      res.send(rows);
    }
  );
});

// POST request to search by id from request body
app.post('/products/search/id_body', (req, res) => {
  const id = req.body.id;
  connection.query(
    'SELECT * FROM product WHERE product_stock_id LIKE ? LIMIT 50',
    ['%' + id + '%'],
    (err, rows) => {
      if (err) {
        console.log('Error in query', err);
        res.status(500).send('Error in query');
        return;
      }

      if (rows.length === 0) {
        res.status(204).send('No products found matching the search criteria');
        return;
      }
      res.send(rows);
    }
  );
});

app.post('/products/search', (req, res) => {
  const { id, name } = req.body;

  // Validate input
  if (!id && !name) {
    return res
      .status(400)
      .json({ error: 'At least one of "id" or "name" is required' });
  }

  // Build the SQL query dynamically
  const conditions = [];
  const params = [];

  if (id) {
    conditions.push('product_stock_id LIKE ?');
    params.push(`%${id}%`);
  }
  if (name) {
    conditions.push('product_detail LIKE ?');
    params.push(`%${name}%`);
  }

  const query = `SELECT * FROM product WHERE ${conditions.join(
    ' AND '
  )} LIMIT 50`;

  // Execute the query
  connection.query(query, params, (err, rows) => {
    if (err) {
      console.error('Error in query', err);
      return res.status(500).json({ error: 'Error in query' });
    }

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'No products found matching the search criteria' });
    }

    res.send(rows);
  });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
