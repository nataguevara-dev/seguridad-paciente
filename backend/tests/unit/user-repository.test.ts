import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRepository } from '../../src/repositories/user-repository';
import { UserModel } from '../../src/models/user';

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockModel: Partial<UserModel>;

  const mockUser = { id: 'u1', email: 'test@test.com', passwordHash: 'hash', role: 'reporter', createdAt: '2026-01-01T00:00:00Z' };

  beforeEach(() => {
    mockModel = {
      create: vi.fn().mockResolvedValue(mockUser),
      findByEmail: vi.fn().mockResolvedValue(mockUser),
      findById: vi.fn().mockResolvedValue(mockUser)
    };
    repository = new UserRepository(mockModel as UserModel);
  });

  it('should delegate create', async () => {
    const result = await repository.create({ email: 'test@test.com', passwordHash: 'hash', role: 'reporter' });
    expect(result).toEqual(mockUser);
    expect(mockModel.create).toHaveBeenCalledWith({ email: 'test@test.com', passwordHash: 'hash', role: 'reporter' });
  });

  it('should delegate findByEmail', async () => {
    const result = await repository.findByEmail('test@test.com');
    expect(result).toEqual(mockUser);
    expect(mockModel.findByEmail).toHaveBeenCalledWith('test@test.com');
  });

  it('should delegate findById', async () => {
    const result = await repository.findById('u1');
    expect(result).toEqual(mockUser);
    expect(mockModel.findById).toHaveBeenCalledWith('u1');
  });
});
