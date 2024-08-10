import pool from '../database/pool.js';

class BorrowingRepository {

  async save(borrowing){
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute('INSERT INTO borrowings(id,member_code,book_code,borrow_date,return_date,due_date,penalty_end_date) VALUES(?,?,?,?,?,?,?)', [borrowing.id, borrowing.member_code, borrowing.book_code, borrowing.borrow_date, borrowing.return_date, borrowing.due_date, borrowing.penalty_end_date]);

      return result;
    } finally {
      connection.release();
    }

  }

  async findById(id){
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute('SELECT * FROM borrowings WHERE id=?', [id]);
      return result;
    } finally {
      connection.release();
    }
  }

  async update(borrowing){
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute('UPDATE borrowings SET member_code=?, book_code=?, borrow_date=?, return_date=?, due_date=?, penalty_end_date=? WHERE id=?', [borrowing.member_code, borrowing.book_code, borrowing.borrow_date, borrowing.return_date, borrowing.due_date, borrowing.penalty_end_date, borrowing.id]);

      return result;
    } finally {
      connection.release();
    }
  }

  async findBorrowedBooksCount(member_code){
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute('SELECT COUNT(*) as count FROM borrowings WHERE member_code=? AND return_date IS NULL', [member_code]);
      return result;
    } finally {
      connection.release();
    }
  }

  async isAvailableBook(book_code){
    const connection = await pool.getConnection();

    try {
      //Tidak tersedia
      const [result] = await connection.execute('SELECT COUNT(*) as count FROM borrowings WHERE book_code=? AND return_date IS NULL', [book_code]);
      return result;
    } finally {
      connection.release();
    }
  }

  async isPenaltyActive(member_code){
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute('SELECT CASE WHEN CURDATE() <= penalty_end_date THEN \'penalty\' ELSE \'no penalty\' END AS penalty_status FROM borrowings WHERE member_code=? AND penalty_end_date IS NOT NULL ORDER BY penalty_end_date DESC LIMIT 1', [member_code]);
      return result;
    } finally {
      connection.release();
    }
  }

  async isReturnedBookValid(member_code, book_code){
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute('SELECT id FROM borrowings WHERE member_code=? AND book_code=? AND return_date IS NULL', [member_code, book_code]);

      return result;
    } finally {
      connection.release();
    }
  }

  async findAllBooks(){
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute('SELECT b.code as code, b.title as title, b.author as author, b.stock as stock FROM books b LEFT JOIN borrowings br ON b.code = br.book_code AND br.return_date IS NULL WHERE br.book_code IS NULL');

      return result;
    } finally {
      connection.release();
    }
  }

  async findAllMembers(){
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute('SELECT m.code AS member_code, m.name AS member_name, COALESCE(COUNT(br.id), 0) AS borrowed_books_count FROM members m LEFT JOIN borrowings br ON m.code = br.member_code AND br.return_date IS NULL GROUP BY m.code, m.name');

      return result;
    } finally {
      connection.release();
    }
  }


  // For Test
  async truncate(){
    const connection = await pool.getConnection();

    try {
      await connection.execute('DELETE FROM borrowings');
    } finally {
      connection.release();
    }
  }

  async dummyData(data){
    const connection = await pool.getConnection();

    try {
      for (const datum of data) {
        await connection.execute('INSERT INTO borrowings(id,member_code,book_code,borrow_date,return_date,due_date,penalty_end_date) VALUES(?,?,?,?,?,?,?)', [datum.id, datum.member_code, datum.book_code, datum.borrow_date, datum.return_date, datum.due_date, datum.penalty_end_date]);
      }
    } finally {
      connection.release();
    }
  }
}

export default BorrowingRepository;
