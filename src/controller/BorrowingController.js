import BorrowingRepository from '../repository/BorrowingRepository.js';
import BorrowingService from '../service/BorrowingService.js';
import BorrowingAddRequest from '../model/BorrowingAddRequest.js';
import BookReturnRequest from '../model/BookReturnRequest.js';

class BorrowingController {
  #borrowingService;
  constructor() {
    this.#borrowingService = new BorrowingService(new BorrowingRepository());

    this.postAddBorrowing = this.postAddBorrowing.bind(this);
    this.postProcessBookReturn = this.postProcessBookReturn.bind(this);
    this.getAllBorrowings = this.getAllBorrowings.bind(this);
    this.getAllMembers = this.getAllMembers.bind(this);
  }

  async postAddBorrowing(req, res, next) {
    try {
      const { member_code, book_code } = req.body;
      const borrowingAddRequest = new BorrowingAddRequest(member_code, book_code);

      const id = await this.#borrowingService.addBorrowing(borrowingAddRequest);

      return res.status(201).send({
        status: 'success',
        message: 'Borrowing added successfully',
        data: {
          borrowingId:id
        }
      });
    } catch (e){
      next(e);
    }
  }

  async postProcessBookReturn(req, res, next){
    try {
      const { member_code, book_code } = req.body;
      const bookReturnRequest = new BookReturnRequest(member_code, book_code);

      const result = await this.#borrowingService.processBookReturn(bookReturnRequest);

      let message = 'Your book return is successful';

      if (result.message !== undefined) {
        message = 'Your book return is successful. But you have to be penalized. You can borrow 3 days later counting the day of return';
      }
      return res.status(200).send({
        status: 'success',
        message
      });
    } catch (e){
      next(e);
    }
  }

  async getAllBorrowings(req, res, next) {
    try {
      const books = await this.#borrowingService.getAllBooks();

      return res.status(200).send({
        status: 'success',
        data:{
          books
        }
      });
    } catch (e) {
      next(e);
    }
  }

  async getAllMembers(req, res, next) {
    try {
      const members = await this.#borrowingService.getAllMembers();

      return res.status(200).send({
        status: 'success',
        data:{
          members
        }
      });
    } catch (e) {
      next(e);
    }
  }
}

export default BorrowingController;