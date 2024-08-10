import { afterAll, describe, expect, test } from '@jest/globals';

import BookRepository from '../../src/repository/BookRepository.js';
import pool from '../../src/database/pool.js';
import books from '../../src/data/books.js';

const bookRepository = new BookRepository();

afterAll(async ()=>{
  pool.end();
});

describe('Book Repository Tests', () => {
  test('findBookByCode success', async () => {
    const result = await bookRepository.findBookByCode(books[0].code);
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe(books[0].code);
    expect(result[0].name).toBe(books[0].name);
  });

  test('findBookByCode fail, not found', async () => {
    const result = await bookRepository.findBookByCode('not-found');
    expect(result).toHaveLength(0);
  });
});