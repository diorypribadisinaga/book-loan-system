import express from 'express';
import BorrowingController from '../controller/BorrowingController.js';


const router = express.Router();

const borrowingController = new BorrowingController();


/**
 * @swagger
 * /borrowings:
 *   post:
 *     tags: {Borrowings}
 *     summary: Create a new borrowing record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               member_code:
 *                 type: string
 *                 example: "M001"
 *               book_code:
 *                 type: string
 *                 example: "JK-45"
 *     responses:
 *       201:
 *         description: Borrowing record created successfully
 *       400:
 *         description: Bad request invalid data
 *       404:
 *         description: Not Found book code or member code
 *       403:
 *         description: Forbidden
 *       500:
 *          description: Internal Server Errror
 */
router.post('/borrowings', borrowingController.postAddBorrowing);


/**
 * @swagger
 * /borrowings/return:
 *   post:
 *     tags: {Return Book}
 *     summary: Return book
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               member_code:
 *                 type: string
 *                 example: "M001"
 *               book_code:
 *                 type: string
 *                 example: "JK-45"
 *     responses:
 *       200:
 *         description: return book success successfully
 *       400:
 *         description: Bad request invalid data
 *       404:
 *         description: Not Found book code or member code
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */

router.post('/borrowings/return', borrowingController.postProcessBookReturn);


/**
 * @swagger
 * /borrowings:
 *   get:
 *     tags: {Get Book}
 *     summary: Get books
 *     responses:
 *       200:
 *         description: get books success
 *       500:
 *         description: Internal Server Error
 */

router.get('/borrowings', borrowingController.getAllBorrowings);


/**
 * @swagger
 * /members:
 *   get:
 *     tags: {Get Members}
 *     summary: Get Members
 *     responses:
 *       200:
 *         description: get books success
 *       500:
 *         description: Internal Server Error
 */

router.get('/members', borrowingController.getAllMembers);

export default router;
