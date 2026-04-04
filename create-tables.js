require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

const queries = [
  `
  CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_email_verified TINYINT(1) DEFAULT 0,
    otp_code VARCHAR(10) NULL,
    otp_expires_at DATETIME NULL,
    reset_otp VARCHAR(10) NULL,
    reset_otp_expires_at DATETIME NULL,
    is_reset_password_verified TINYINT(1) DEFAULT 0
  )
  `,
  `
  CREATE TABLE IF NOT EXISTS expenses (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    note TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
  `,
  `
  CREATE TABLE IF NOT EXISTS expense_slips (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    expense_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
  )
  `,
  `SHOW TABLES`,
];

connection.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err.message);
    return;
  }

  console.log('Connected to database');

  let index = 0;

  const runNext = () => {
    if (index >= queries.length) {
      console.log('All queries executed');
      connection.end();
      return;
    }

    const query = queries[index];
    connection.query(query, (queryErr, results) => {
      if (queryErr) {
        console.error(`Query ${index + 1} failed:`, queryErr.message);
        connection.end();
        return;
      }

      console.log(`Query ${index + 1} executed successfully`);

      if (index === queries.length - 1) {
        console.log('Tables in database:', results);
      }

      index += 1;
      runNext();
    });
  };

  runNext();
});