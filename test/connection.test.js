import { describe, expect, test } from '@jest/globals';

import pool from '../src/database/pool.js';

describe('Test Connection', () => {
  test('Connection Success', async () => {
    const connection = await pool.getConnection();
    const [result] = await connection.query('SELECT 1+1 as hasil');
    expect(result[0].hasil).toBe(2);
    connection.close();
  });
});