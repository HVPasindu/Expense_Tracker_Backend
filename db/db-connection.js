// const mysql = require('mysql2');

// let connection;

// function getConnection(){
//     if(!connection){
//         connection = mysql.createConnection({
//             host: process.env.DB_HOST,
//             user: process.env.DB_USER,
//             password: process.env.DB_PASSWORD,
//             database: process.env.DB_NAME
//         })
//         connection.connect();
//     }
//     return connection;
// }

// module.exports = getConnection();

// const mysql = require('mysql2');

// let connection;

// function getConnection() {
//     if (!connection) {
//         connection = mysql.createConnection({
//             host: process.env.DB_HOST,
//             user: process.env.DB_USER,
//             password: process.env.DB_PASSWORD,
//             database: process.env.DB_NAME,
//             port: process.env.DB_PORT,
//             ssl: {
//                 rejectUnauthorized: false
//             }
//         });

//         connection.connect((err) => {
//             if (err) {
//                 console.log('DB connection error:', err.message);
//             } else {
//                 console.log('DB connected successfully');
//             }
//         });
//     }

//     return connection;
// }

// module.exports = getConnection();

const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;