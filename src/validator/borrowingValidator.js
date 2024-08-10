import Joi from 'joi';
import InvariantError from '../exception/InvariantError.js';

export default {
  validateAddBorrowingRequest(borrowingAddRequest) {
    const schema = Joi.object({
      member_code: Joi.string().required(),
      book_code: Joi.string().required(),
    });
    const { error, value } = schema.validate(borrowingAddRequest);
    if (error){
      throw new InvariantError(error.message);
    }
    return value;
  },
  validateBookReturnRequest(borrowingAddRequest) {
    const schema = Joi.object({
      member_code: Joi.string().required(),
      book_code: Joi.string().required(),
    });
    const { error, value } = schema.validate(borrowingAddRequest);
    if (error){
      throw new InvariantError(error.message);
    }
    return value;
  }
};