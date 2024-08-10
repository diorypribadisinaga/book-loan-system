import { afterAll, describe, expect, test } from '@jest/globals';

import MemberRepository from '../../src/repository/MemberRepository.js';
import pool from '../../src/database/pool.js';
import members from '../../src/data/members.js';

const memberRepository = new MemberRepository();

afterAll(async ()=>{
  pool.end();
});

describe('Member Repository Tests', () => {
  test('findMemberByCode success', async () => {
    const result = await memberRepository.findMemberByCode(members[0].code);
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe(members[0].code);
    expect(result[0].name).toBe(members[0].name);
  });

  test('findMemberByCode fail, not found', async () => {
    const result = await memberRepository.findMemberByCode('not-found');
    expect(result).toHaveLength(0);
  });
});