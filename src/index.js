import express from 'express';
import bodyParser from 'body-parser';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import NotFoundError from './exception/NotFoundError.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import borrowingRoute from './router/borrowingRoute.js';

const app = express();

app.use(bodyParser.json());

//Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User API',
      version: '1.0.0',
    },
  },
  apis: ['./src/router/*.js'],
};

const swaggerDoc = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));


app.use(borrowingRoute);

app.use((req, res, next)=>{
  next(new NotFoundError('Route Not Found'));
});

app.use(errorMiddleware);

export default app;
