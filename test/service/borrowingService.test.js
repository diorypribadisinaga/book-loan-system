import { afterAll, beforeAll, describe, expect, test, jest, afterEach } from '@jest/globals';
import moment from 'moment';

import BorrowingService from '../../src/service/BorrowingService.js';
import BorrowingRepository from '../../src/repository/BorrowingRepository.js';

const borrowingRepository = new BorrowingRepository();
const borrowingService = new BorrowingService(borrowingRepository);

import pool from '../../src/database/pool.js';
import BorrowingAddRequest from '../../src/model/BorrowingAddRequest.js';

import books from '../../src/data/books.js';
import members from '../../src/data/members.js';
import InvariantError from '../../src/exception/InvariantError.js';
import NotFoundError from '../../src/exception/NotFoundError.js';
import ClientError from '../../src/exception/ClientError.js';
import Borrowing from '../../src/domain/Borrowing.js';
import BookReturnRequest from '../../src/model/BookReturnRequest.js';

const membersTest = [...members];

const booksTest = [...books];

const borrowingsTest = [
  {
    id: 'dsjWjdsp1d', member_code: membersTest[0].code, book_code: booksTest[1].code, borrow_date: '2024-08-01', return_date: null, due_date: '2024-08-08', penalty_end_date: null
  },
  {
    id: 'zseWrd3p2g', member_code: membersTest[1].code, book_code: booksTest[0].code, borrow_date: '2024-08-03', return_date: null, due_date: '2024-08-10', penalty_end_date: null
  },
  {
    id: 'arjkpdser3', member_code: membersTest[0].code, book_code: booksTest[2].code, borrow_date: '2024-08-04', return_date: null, due_date: '2024-08-11', penalty_end_date: null
  },
];

beforeAll(async ()=>{
  await borrowingRepository.truncate();
});

afterAll(async ()=>{
  await pool.end();
});

jest.mock('nanoid', () => {
  return {
    nanoid: jest.fn(() => 'ds349S2r3f')
  };
});

describe('BorrowingService Add Test', () => {
  afterEach(async ()=>{
    await borrowingRepository.truncate();
  });
  test('add borrowing success', async () => {
    const borrowingAddRequest = new BorrowingAddRequest(membersTest[0].code, booksTest[1].code);
    const id = await borrowingService.addBorrowing(borrowingAddRequest);

    const result = await borrowingRepository.findById(id);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(id);
    expect(result[0].member_code).toBe(borrowingAddRequest.member_code);
    expect(result[0].book_code).toBe(borrowingAddRequest.book_code);

    const borrow_date = result[0].borrow_date;
    const due_date = result[0].due_date;

    expect(borrow_date).not.toBeNull();
    expect(due_date).not.toBeNull();

    expect(moment(borrow_date).add(7, 'days').format('YYYY-MM-DD')).toBe(moment(due_date).format('YYYY-MM-DD'));
  });

  test('add borrowing fail with invalid data', async ()=>{
    const dataProvider = [
      {
        member_code: undefined,
        book_code: undefined,
      },
      {
        member_code: null,
        book_code: null,
      },
      {
        member_code: true,
        book_code: booksTest[0].code,
      },
      {
        member_code: members[1].code,
        book_code: 24343,
      },
    ];

    for (const datum of dataProvider) {
      try {
        const borrowingAddRequest = new BorrowingAddRequest(datum.member_code, datum.book_code);
        await borrowingService.addBorrowing(borrowingAddRequest);
      } catch (e) {
        expect(e).toBeInstanceOf(InvariantError);
        expect(e.statusCode).toBe(400);
        expect(e.message).not.toBe('');
      }
    }
  });

  test('add borrowing fail, member not exist', async ()=>{
    const borrowingAddRequest = new BorrowingAddRequest('not-found', booksTest[1].code);
    try {
      await borrowingService.addBorrowing(borrowingAddRequest);
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundError);
      expect(e.statusCode).toBe(404);
      expect(e.message).toBe('member not exist');
    }
  });

  test('add borrowing fail, book not exist', async ()=>{
    const borrowingAddRequest = new BorrowingAddRequest(membersTest[0].code, 'not-found');
    try {
      await borrowingService.addBorrowing(borrowingAddRequest);
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundError);
      expect(e.statusCode).toBe(404);
      expect(e.message).toBe('book not exist');
    }
  });

  test('add borrowing fail, has exceeded the loan limit', async ()=>{
    try {
      await borrowingRepository.dummyData(borrowingsTest);

      const borrowingAddRequest = new BorrowingAddRequest(membersTest[0].code, booksTest[3].code);

      await borrowingService.addBorrowing(borrowingAddRequest);
    } catch (e) {
      expect(e).toBeInstanceOf(ClientError);
      expect(e.statusCode).toBe(403);
      expect(e.message).toBe('has exceeded the loan limit. You can only borrow 2 books');
    }
  });

  test('add borrowing fail, book is not available', async ()=>{
    try {
      await borrowingRepository.dummyData(borrowingsTest);

      const borrowingAddRequest = new BorrowingAddRequest(membersTest[1].code, booksTest[2].code);

      await borrowingService.addBorrowing(borrowingAddRequest);
    } catch (e) {

      expect(e).toBeInstanceOf(ClientError);
      expect(e.statusCode).toBe(403);
      expect(e.message).toBe('book not available');
    }
  });

  test('add borrowing success, book is available', async ()=>{
    await borrowingRepository.dummyData(borrowingsTest);

    const { id, member_code, book_code, borrow_date, due_date, penalty_end_date } = borrowingsTest[0];

    const borrowing = new Borrowing(id, member_code, book_code, borrow_date, '2024-08-03', due_date, penalty_end_date);

    await borrowingRepository.update(borrowing);

    const borrowingAddRequest = new BorrowingAddRequest(membersTest[1].code, booksTest[1].code);

    const borrowingId = await borrowingService.addBorrowing(borrowingAddRequest);

    const result = await borrowingRepository.findById(borrowingId);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(borrowingId);
    expect(result[0].member_code).toBe(borrowingAddRequest.member_code);
    expect(result[0].book_code).toBe(borrowingAddRequest.book_code);

    expect(result[0].borrow_date).not.toBe(borrowing.borrow_date);
    expect(result[0].due_date).not.toBe(borrowing.due_date);
  });

  test('add borrowing fail, penalty status is active', async ()=>{
    try {
      await borrowingRepository.dummyData(borrowingsTest);

      const { id, member_code, book_code, borrow_date, due_date } = borrowingsTest[0];

      const borrowing = new Borrowing(id, member_code, book_code, borrow_date, moment().subtract(1, 'days').format('YYYY-MM-DD'), due_date, moment().add(1, 'days').format('YYYY-MM-DD'));

      await borrowingRepository.update(borrowing);

      const borrowingAddRequest = new BorrowingAddRequest(membersTest[1].code, booksTest[3].code);

      await borrowingService.addBorrowing(borrowingAddRequest);
    } catch (e) {
      expect(e).toBeInstanceOf(ClientError);
      expect(e.statusCode).toBe(403);
      expect(e.message).toBe('penalty status is active. You can\'t borrow books');
    }
  });



  test('add borrowing fail, penalty status is not active', async ()=>{

    await borrowingRepository.dummyData(borrowingsTest);

    const { id, member_code, book_code, borrow_date, due_date } = borrowingsTest[0];

    const borrowing = new Borrowing(id, member_code, book_code, borrow_date, moment().subtract(3, 'days').format('YYYY-MM-DD'), due_date, moment().subtract(1, 'days').format('YYYY-MM-DD'));

    await borrowingRepository.update(borrowing);

    const borrowingAddRequest = new BorrowingAddRequest(membersTest[1].code, booksTest[3].code);

    await expect(borrowingService.addBorrowing(borrowingAddRequest)).resolves.not.toThrow();
  });
});

describe('ProcessBook Return Test', ()=>{
  beforeAll(async ()=>{
    await borrowingRepository.dummyData(borrowingsTest);
  });

  afterAll(async ()=>{
    await borrowingRepository.truncate();
  });

  test('process return success', async ()=>{

    const { id, member_code, book_code, return_date } = borrowingsTest[0];

    const borrowingUpdate = new Borrowing(id, member_code, book_code, moment().subtract(1, 'days').format('YYYY-MM-DD'), return_date, moment().add(6, 'days').format('YYYY-MM-DD'), null);

    await borrowingRepository.update(borrowingUpdate);

    const bookReturnRequest = new BookReturnRequest(membersTest[0].code, booksTest[1].code);

    const borrowingId = await borrowingService.processBookReturn(bookReturnRequest);

    const result = await borrowingRepository.findById(borrowingId);
    const borrowing = result[0];

    expect(borrowing.id).toBe(borrowingId);
    expect(borrowing.penalty_end_date).toBeNull();
  });

  test('process return success, with penalty', async ()=>{
    const bookReturnRequest = new BookReturnRequest(membersTest[0].code, booksTest[1].code);

    const { id:borrowingId, message } = await borrowingService.processBookReturn(bookReturnRequest);

    expect(message).toBe('Your book return is successful. But you have to be penalized. You can borrow 3 days later counting the day of return');

    const result = await borrowingRepository.findById(borrowingId);

    const borrowing = result[0];
    expect(borrowing.id).toBe(borrowingId);
    expect(moment(borrowing.borrow_date).format('YYYY-MM-DD')).toBe(borrowingsTest[0].borrow_date);
    expect(moment(borrowing.due_date).format('YYYY-MM-DD')).toBe(borrowingsTest[0].due_date);
    expect(moment(borrowing.return_date).format('YYYY-MM-DD')).not.toBeNull();
    expect(moment(borrowing.return_date).format('YYYY-MM-DD')).not.toBe(moment(borrowingsTest[0].return_date).format('YYYY-MM-DD'));
    expect(borrowing.penalty_end_date).not.toBeNull();
    expect(moment(borrowing.penalty_end_date).format('YYYY-MM-DD')).not.toBe(moment(borrowingsTest[0].penalty_end_date).format('YYYY-MM-DD'));
  });

  test('process return fail, invalid data', async ()=>{
    const dataProvider = [
      {
        member_code: undefined,
        book_code: undefined,
      },
      {
        member_code: null,
        book_code: null,
      },
      {
        member_code: true,
        book_code: booksTest[0].code,
      },
      {
        member_code: members[1].code,
        book_code: 24343,
      },
    ];

    for (const datum of dataProvider) {
      try {
        const bookReturnRequest = new BookReturnRequest(datum.member_code, datum.book_code);
        await borrowingService.processBookReturn(bookReturnRequest);
      } catch (e) {
        expect(e).toBeInstanceOf(InvariantError);
        expect(e.statusCode).toBe(400);
        expect(e.message).not.toBe('');
      }
    }
  });

  test('process return fail, member not exist', async ()=>{
    const bookReturnRequest = new BookReturnRequest('not-found', booksTest[1].code);
    try {
      await borrowingService.processBookReturn(bookReturnRequest);
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundError);
      expect(e.statusCode).toBe(404);
      expect(e.message).toBe('member not exist');
    }
  });

  test('process return fail, book not exist', async ()=>{
    const bookReturnRequest = new BookReturnRequest(membersTest[0].code, 'not-found');
    try {
      await borrowingService.processBookReturn(bookReturnRequest);
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundError);
      expect(e.statusCode).toBe(404);
      expect(e.message).toBe('book not exist');
    }
  });

  test('process return fail, book code not valid', async ()=>{
    const bookReturnRequest = new BookReturnRequest(membersTest[0].code, booksTest[0].code);
    try {
      await borrowingService.processBookReturn(bookReturnRequest);
    } catch (e) {

      expect(e).toBeInstanceOf(InvariantError);
      expect(e.statusCode).toBe(400);
      expect(e.message).toBe('book code not valid');
    }
  });
});



