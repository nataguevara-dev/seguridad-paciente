import { User, UserModel } from '../models/user';

export class UserRepository {
  constructor(private userModel: UserModel) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id);
  }

  async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return this.userModel.create(data);
  }
}
