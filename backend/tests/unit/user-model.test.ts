import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserModel } from '../../src/models/user';

function createMockDb() {
  const mockPrepare = vi.fn();
  const mockRun = vi.fn();
  const mockGet = vi.fn();
  mockPrepare.mockReturnValue({ run: mockRun, get: mockGet });
  return { prepare: mockPrepare, _run: mockRun, _get: mockGet };
}

describe('UserModel', () => {
  let model: UserModel;
  let db: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    db = createMockDb();
    model = new UserModel(db as any);
  });

  it('should create a user', async () => {
    db._run.mockReturnValue({ changes: 1 });
    const data = { email: 'test@test.com', passwordHash: 'hash', role: 'reporter' };

    const result = await model.create(data);

    expect(result.id).toBeDefined();
    expect(result.email).toBe('test@test.com');
    expect(db._run).toHaveBeenCalled();
  });

  it('should find by email', async () => {
    const mockUser = { id: 'u1', email: 'test@test.com', role: 'reporter' };
    db._get.mockReturnValue(mockUser);

    const result = await model.findByEmail('test@test.com');

    expect(result).toEqual(mockUser);
  });

  it('should find by id', async () => {
    const mockUser = { id: 'u1', email: 'test@test.com', role: 'reporter' };
    db._get.mockReturnValue(mockUser);

    const result = await model.findById('u1');

    expect(result).toEqual(mockUser);
  });

  it('should return null when user not found by email', async () => {
    db._get.mockReturnValue(undefined);

    const result = await model.findByEmail('missing@test.com');

    expect(result).toBeNull();
  });
});
