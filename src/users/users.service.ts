import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(email: string, password: string) {
    const newUser = this.usersRepository.create({ email, password });
    await this.usersRepository.save(newUser);
    return newUser;
  }

  findOne(id: number) {
    if (!id) {
      return null;
    }
    return this.usersRepository.findOne({ where: { id } });
  }

  async find(email: string) {
    const user = await this.usersRepository.find({ where: { email } });
    return user;
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      return new NotFoundException('User not found');
    }

    Object.assign(user, attrs);
    await this.usersRepository.save(user);

    return user;
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      return new NotFoundException('User not found');
    }
    await this.usersRepository.remove(user);
    return 'User deleted successfully';
  }
}
