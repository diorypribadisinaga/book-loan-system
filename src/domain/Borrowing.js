class Borrowing{
  constructor(id, member_code, book_code, borrow_date, return_date, due_date, penalty_end_date){
    this.id = id;
    this.member_code = member_code;
    this.book_code = book_code;
    this.borrow_date = borrow_date;
    this.return_date = return_date;
    this.due_date = due_date;
    this.penalty_end_date = penalty_end_date;
  }
}

export default Borrowing;
