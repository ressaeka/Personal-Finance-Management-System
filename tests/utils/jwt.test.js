import { generateToken, verifyToken } from '../../src/utils/jwt.js';

describe('Jwt Utils', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret_key';
    process.env.JWT_EXPIRES_IN = '1h';
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
  });

  describe('generateToken', () => {
    test('should generate a valid JWT token', () => {
      const payload = { id_user: 1, username: 'testuser' };
      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    test('should verify a valid token and return payload', () => {
      const payload = { id_user: 1, username: 'testuser' };
      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id_user).toBe(1);
      expect(decoded.username).toBe('testuser');
    });

    test('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid_token_here')).toThrow();
    });
  });
});
