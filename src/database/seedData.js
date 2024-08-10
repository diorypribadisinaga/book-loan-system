import connection from './pool.js';
import books from '../data/books.js';
import members from '../data/members.js';

try {
  for (const book of books) {
    await connection.execute(
      'INSERT INTO books(code, title, author, stock) VALUES(?,?,?,?)'
      , [book.code, book.title, book.author, book.stock]);
  }

  for (const member of members) {
    await connection.execute(
      'INSERT INTO members(code, name) VALUES(?,?)'
      , [member.code, member.name]);
  }

  console.log('Data berhasil ditambahkan');
} catch (e) {
  console.error(e.message);
} finally {
  await connection.end();
}