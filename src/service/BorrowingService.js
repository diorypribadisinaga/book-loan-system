import { nanoid } from 'nanoid';
import moment from 'moment';

import borrowingValidator from '../validator/borrowingValidator.js';
import Borrowing from '../domain/Borrowing.js';
import MemberRepository from '../repository/MemberRepository.js';
import BookRepository from '../repository/BookRepository.js';
import NotFoundError from '../exception/NotFoundError.js';
import ClientError from '../exception/ClientError.js';
import InvariantError from '../exception/InvariantError.js';

class BorrowingService {
  #borrowingRepository;
  #memberRepository;
  #bookRepository;

  constructor(borrowingRepository) {
    this.#borrowingRepository = borrowingRepository;
    this.#memberRepository = new MemberRepository();
    this.#bookRepository = new BookRepository();
  }

  async addBorrowing(borrowingAddRequest) {
    const { member_code, book_code } = borrowingValidator.validateAddBorrowingRequest(borrowingAddRequest);

    await this.checkMemberCode(member_code);
    await this.checkBookCode(book_code);

    await this.checkBorrowLimit(member_code);

    await this.checkBookAvailability(book_code);
    await this.checkPenaltyStatus(member_code);

    const id = nanoid(10);
    const borrowingNew = new Borrowing(id, member_code, book_code, moment().format('YYYY-MM-DD'), null, moment().add(7, 'days').format('YYYY-MM-DD'), null);

    await this.#borrowingRepository.save(borrowingNew);

    return id;
  }

  async checkMemberCode(code) {
    const result = await this.#memberRepository.findMemberByCode(code);
    if (result.length === 0) {
      throw new NotFoundError('member not exist');
    }
  }

  async checkBookCode(code){
    const result = await this.#bookRepository.findBookByCode(code);
    if (result.length === 0) {
      throw new NotFoundError('book not exist');
    }
  }

  async checkBorrowLimit(member_code){
    const result = await this.#borrowingRepository.findBorrowedBooksCount(member_code);
    if (result[0].count > 2) {
      throw new ClientError('has exceeded the loan limit. You can only borrow 2 books', 403);
    }
    return result;
  }

  async checkBookAvailability(book_code){
    const result = await this.#borrowingRepository.isAvailableBook(book_code);
    if (result[0].count > 0){
      throw new ClientError('book not available', 403);
    }
  }

  async checkPenaltyStatus(member_code){
    const result = await this.#borrowingRepository.isPenaltyActive(member_code);

    if (result.length !== 0 && result[0].penalty_status === 'penalty'){
      throw new ClientError('penalty status is active. You can\'t borrow books', 403);
    }
  }


  async processBookReturn(bookReturnRequest){
    const { member_code, book_code } = borrowingValidator.validateAddBorrowingRequest(bookReturnRequest);

    await this.checkMemberCode(member_code);
    await this.checkBookCode(book_code);

    const result = await this.checkReturnedBookValid(member_code, book_code);

    const id = result[0].id;

    const resultFindById = await this.#borrowingRepository.findById(id);
    const { borrow_date, due_date, penalty_end_date } = resultFindById[0];

    const borrowingUpdate = new Borrowing(id, member_code, book_code, borrow_date, moment().format('YYYY-MM-DD'), due_date, penalty_end_date);

    await this.#borrowingRepository.update(borrowingUpdate);

    const diff = moment(moment().format('YYYY-MM-DD')).diff(moment(borrow_date).format('YYYY-MM-DD'), 'days');


    if (diff > 7){
      borrowingUpdate.penalty_end_date = moment().add(2, 'days').format('YYYY-MM-DD'); // 3 Hari terhitung hari pengembalian
      await this.#borrowingRepository.update(borrowingUpdate);
      return { id, message: 'Your book return is successful. But you have to be penalized. You can borrow 3 days later counting the day of return' };
    }

    await this.#borrowingRepository.update(borrowingUpdate);
    return id;
  }

  async checkReturnedBookValid(member_code, book_code){
    const result = await this.#borrowingRepository.isReturnedBookValid(member_code, book_code);
    if (result.length ===  0){
      throw new InvariantError('book code not valid');
    }
    return result;
  }

  async getAllBooks(){
    return await this.#borrowingRepository.findAllBooks();
  }

  async getAllMembers(){
    return await this.#borrowingRepository.findAllMembers();
  }
}

export default BorrowingService;
