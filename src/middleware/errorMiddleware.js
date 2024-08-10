import ClientError from '../exception/ClientError.js';

const errorMiddleware = (err, req, res, next) => {
  console.log(err.message);
  if (err instanceof ClientError) {
    return res.status(err.statusCode).send(err.message);
  }
  return res.status(500).send('Internal Server Error');
};

export default errorMiddleware;
