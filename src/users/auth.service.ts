import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async singUp(email: string, password: string) {
    //check if the email exists in the database and if return that email is alread exist
    try {
      const users = await this.usersService.find(email);
      if (users.length) {
        throw new BadRequestException('Email already exists');
      }
      //Hashing the password
      const hashedPassword = await bcrypt.hash(password, 10);

      //save the user to database
      const newUser = await this.usersService.create(email, hashedPassword);

      return newUser;
    } catch (error) {
      console.log(error);
    }
  }

  async signIn(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException("Email isn't exists");
    }
    const hashedPassword = user.password;
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
      throw new BadRequestException('Password is incorrect');
    }
    return user;
  }
}
