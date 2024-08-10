import connection from './pool.js';

try {
  await connection.execute(
    'CREATE TABLE books(code VARCHAR(10) PRIMARY KEY,title VARCHAR(255) NOT NULL,author VARCHAR(255) NOT NULL, stock INT NOT NULL)'
  );
  console.log('Tabel books berhasil dibuat');

  await connection.execute(
    'CREATE TABLE members(code VARCHAR(10) PRIMARY KEY,name VARCHAR(255) NOT NULL)'
  );
  console.log('Tabel members berhasil dibuat');

  await connection.execute(
    'CREATE TABLE borrowings(id VARCHAR(10) PRIMARY KEY,member_code VARCHAR(10), book_code VARCHAR(10),borrow_date DATE NOT NULL, return_date DATE,due_date DATE NOT NULL,penalty_end_date DATE,FOREIGN KEY (member_code) REFERENCES members(code),FOREIGN KEY (book_code) REFERENCES books(code))'
  );

  console.log('Table borrowings berhasil dibuat');

} catch (e){
  console.error(e.message);
} finally {
  await connection.end();
}

