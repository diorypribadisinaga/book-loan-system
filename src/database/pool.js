import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  host: process.env.HOST || 'localhost',
  user: process.env.USER || 'root',
  password: process.env.PASSWORD || '',
  database: 'book_loan_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


export default pool;
