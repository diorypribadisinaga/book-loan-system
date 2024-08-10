import pool from '../database/pool.js';

class BookRepository {
  async findBookByCode(code){
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute('SELECT * FROM books WHERE code=?', [code]);
      return result;
    } finally {
      connection.release();
    }
  }
}

export default BookRepository;
