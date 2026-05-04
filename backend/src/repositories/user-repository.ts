import { User } from '../models';
import { UserModel } from '../models/user';

export class UserRepository {
  constructor(private userModel: UserModel) {}

  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return this.userModel.create(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id);
  }
}