import pool from '../database/pool.js';

class MemberRepository {
  async findMemberByCode(code){
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute('SELECT * FROM members WHERE code=?', [code]);
      return result;
    } finally {
      connection.release();
    }
  }
}

export default MemberRepository;
