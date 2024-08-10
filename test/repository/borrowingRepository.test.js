import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import moment from 'moment';

import BorrowingRepository from '../../src/repository/BorrowingRepository.js';
const borrowingRepository = new BorrowingRepository();

import Borrowing from '../../src/domain/Borrowing.js';
import pool from '../../src/database/pool.js';

const membersTest = [
  {
    code: 'M001',
    name: 'Angga',
  },
  {
    code: 'M002',
    name: 'Ferry',
  },
];

const booksTest = [
  {
    code: 'JK-45',
    title: 'Harry Potter',
    author: 'J.K Rowling',
    stock: 1
  },
  {
    code: 'SHR-1',
    title: 'A Study in Scarlet',
    author: 'Arthur Conan Doyle',
    stock: 1
  },
];

const borrowingsTest = [
  {
    id: 'dsjWjdsp1d', member_code: membersTest[0].code, book_code: booksTest[1].code, borrow_date: '2024-08-01', return_date: null, due_date: '2024-08-08', penalty_end_date: null
  },
  {
    id: 'zseWrd3p2g', member_code: membersTest[1].code, book_code: booksTest[0].code, borrow_date: '2024-08-03', return_date: null, due_date: '2024-08-10', penalty_end_date: null
  }
];

beforeAll(async ()=>{
  await borrowingRepository.truncate();
});

afterAll(async ()=>{
  await pool.end();
});

describe('BorrowingRepository Save Test', () => {
  afterAll(async ()=>{
    await borrowingRepository.truncate();
  });

  test('save borrowing success', async () => {
    const { id, member_code, book_code, borrow_date, return_date, due_date, penalty_end_date } = borrowingsTest[0];

    const borrowingNew = new Borrowing(id, member_code, book_code, borrow_date, return_date, due_date, penalty_end_date);

    const result = await borrowingRepository.save(borrowingNew);
    expect(result.affectedRows).toBe(1);
  });

  test('save borrowing fail data not valid', async () => {
    try {
      const { id, member_code, book_code, return_date, due_date, penalty_end_date } = borrowingsTest[1];

      const borrowingNew = new Borrowing(id, member_code, book_code, null, return_date, due_date, penalty_end_date);

      await borrowingRepository.save(borrowingNew);

    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });
});

describe('BorrowingRepository FindByIdTest', () => {
  beforeAll(async ()=>{
    await borrowingRepository.dummyData([borrowingsTest[0]]);
  });

  test('findById borrowing success with data', async () => {
    const result = await borrowingRepository.findById(borrowingsTest[0].id);

    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(borrowingsTest[0].id);
    expect(result[0].member_code).toBe(borrowingsTest[0].member_code);
    expect(result[0].book_code).toBe(borrowingsTest[0].book_code);
    expect(moment(result[0].borrow_date).format('YYYY-MM-DD')).toBe('2024-08-01');
    expect(moment(result[0].due_date).format('YYYY-MM-DD')).toBe('2024-08-08');
    expect(result[0].return_date).toBeNull();
    expect(result[0].penalty_end_date).toBeNull();
  });

  test('findById borrowing not found', async () => {
    const result = await borrowingRepository.findById('not-found');
    expect(result).toHaveLength(0);
  });
});

describe('BorrowingRepository Update Test', ()=>{
  beforeAll(async ()=>{
    await borrowingRepository.dummyData([borrowingsTest[1]]);
  });

  afterAll(async ()=>{
    await borrowingRepository.truncate();
  });

  test('update borrowing success', async () => {
    const { id, member_code, book_code, borrow_date, due_date, penalty_end_date } = borrowingsTest[1];

    const borrowing = new Borrowing(id, member_code, book_code, borrow_date, '2024-08-05', due_date, penalty_end_date);

    const result = await borrowingRepository.update(borrowing);

    expect(result.affectedRows).toBe(1);

    const [borrowingUpdate] = await borrowingRepository.findById(id);

    expect(moment(borrowingUpdate.return_date).format('YYYY-MM-DD')).toBe('2024-08-05');
  });
});

describe('findBorrowedBooksCount Test', ()=>{
  beforeAll(async ()=>{
    await borrowingRepository.dummyData([borrowingsTest[0]]);
  });

  afterAll(async ()=>{
    await borrowingRepository.truncate();
  });
  test('findBorrowedBooksCount returns 1', async () => {
    const result = await borrowingRepository.findBorrowedBooksCount(borrowingsTest[0].member_code);

    expect(result[0].count).toEqual(1);
  });
  test('findBorrowedBooksCount returns 0', async () => {
    const result = await borrowingRepository.findBorrowedBooksCount(borrowingsTest[1].member_code);

    expect(result[0].count).toBe(0);
  });
});

describe('isAvailableBook Test', ()=>{
  beforeAll(async ()=>{
    await borrowingRepository.dummyData([borrowingsTest[0]]);
  });

  afterAll(async ()=>{
    await borrowingRepository.truncate();
  });


  test('isAvailableBook must return count=1', async () => {
    const result = await borrowingRepository.isAvailableBook(borrowingsTest[0].book_code);
    expect(result[0].count).toBe(1);
  });

  test('isAvailableBook must return count=0', async () => {
    const { id, member_code, book_code, borrow_date, due_date, penalty_end_date } = borrowingsTest[0];

    const borrowing = new Borrowing(id, member_code, book_code, borrow_date, '2024-08-03', due_date, penalty_end_date);

    await borrowingRepository.update(borrowing);

    const result = await borrowingRepository.isAvailableBook(borrowingsTest[0].book_code);
    expect(result[0].count).toBe(0);
  });
});




describe('isPenaltyActive Test', ()=>{
  beforeAll(async ()=>{
    await borrowingRepository.dummyData([borrowingsTest[0]]);
  });

  afterAll(async ()=>{
    await borrowingRepository.truncate();
  });


  test('isPenaltyActive must return penalty', async () => {
    const { id, member_code, book_code, borrow_date, due_date } = borrowingsTest[0];

    const borrowing = new Borrowing(id, member_code, book_code, borrow_date, moment().subtract(1, 'days').format('YYYY-MM-DD'), due_date, moment().add(1, 'days').format('YYYY-MM-DD'));

    await borrowingRepository.update(borrowing);

    const result = await borrowingRepository.isPenaltyActive(member_code);
    expect(result[0].penalty_status).toBe('penalty');
  });

  test('isPenaltyActive must return no penalty', async () => {
    const { id, member_code, book_code, borrow_date, due_date } = borrowingsTest[0];

    const borrowing = new Borrowing(id, member_code, book_code, borrow_date, moment().subtract(3, 'days').format('YYYY-MM-DD'), due_date, moment().subtract(1, 'days').format('YYYY-MM-DD'));

    await borrowingRepository.update(borrowing);

    const result = await borrowingRepository.isPenaltyActive(member_code);
    expect(result[0].penalty_status).toBe('no penalty');
  });
});

describe('isReturnedBookValid Tes', ()=>{
  beforeAll(async ()=>{
    await borrowingRepository.dummyData([borrowingsTest[0]]);
  });

  afterAll(async ()=>{
    await borrowingRepository.truncate();
  });

  test('isReturnedBookValid must return length = 0', async () => {
    const result = await borrowingRepository.isReturnedBookValid(membersTest[0].code, booksTest[0].code);

    expect(result.length).toBe(0);
  });

  test('isReturnedBookValid must return id', async () => {
    const result = await borrowingRepository.isReturnedBookValid(membersTest[0].code, booksTest[1].code);

    expect(result[0].id).toBe(borrowingsTest[0].id);
  });
});

describe('findAllBooks Test', ()=>{
  beforeAll(async ()=>{
    await borrowingRepository.dummyData(borrowingsTest);
  });

  afterAll(async ()=>{
    await borrowingRepository.truncate();
  });

  test('get All books success', async ()=>{
    const result = await borrowingRepository.findAllBooks();

    expect(result).toHaveLength(3);
  });
});


describe('findAllMembers Test', ()=>{
  beforeAll(async ()=>{
    await borrowingRepository.dummyData(borrowingsTest);
  });

  afterAll(async ()=>{
    await borrowingRepository.truncate();
  });

  test('get All members success', async ()=>{
    const result = await borrowingRepository.findAllMembers();

    expect(result).toHaveLength(3);
    expect(result[2].borrowed_books_count).toBe(0);
  });
});

