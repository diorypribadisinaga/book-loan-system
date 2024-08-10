// Get the client
import mysql from 'mysql2/promise';
import 'dotenv/config';

const connection = await mysql.createConnection({
  host: process.env.HOST || 'localhost',
  user: process.env.USER || 'root',
  password: process.env.PASSWORD || '',
});

try {
  await connection.execute('CREATE DATABASE book_loan_system');
  console.log('Database book-loan-system berhasil dibuat');
} catch (e){
  console.error(e.message);
} finally {
  await connection.close();
}
