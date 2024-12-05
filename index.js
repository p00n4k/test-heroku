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

app.post('/products/search', (req, res) => {
  const { id, name, page = 1, limit = 30 } = req.body;
  const offset = (page - 1) * limit;

  connection.query(
    'SELECT SQL_CALC_FOUND_ROWS * FROM product WHERE product_stock_id LIKE ? AND product_detail LIKE ? LIMIT ? OFFSET ?',
    [`%${id}%`, `%${name}%`, parseInt(limit), parseInt(offset)],
    (err, rows) => {
      if (err) {
        console.error('Error in query', err);
        res.status(500).send('Error in query');
        return;
      }

      connection.query('SELECT FOUND_ROWS() AS total', (err, result) => {
        if (err) {
          console.error('Error fetching total rows', err);
          res.status(500).send('Error fetching total rows');
          return;
        }

        const total = result[0].total;

        // If no products are found
        if (rows.length === 0) {
          return res.status(204).json({ message: 'No products found' });
        }

        res.json({ products: rows, total });
      });
    }
  );
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
