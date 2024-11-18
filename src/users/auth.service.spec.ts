import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './entity/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  beforeEach(async () => {
    //create fake copy of users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUser = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUser);
      },
      create: (email: string, password: string) => {
        const newUser = {
          id: Math.floor(Math.random() * 999),
          email,
          password,
        } as User;
        users.push(newUser);
        return Promise.resolve(newUser);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with hashed password', async () => {
    const user = await service.singUp('test@test.com', 'test');
    expect(user.password).not.toEqual('test');
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.singUp('asdf@asdf.com', 'asdf');
    await expect(service.singUp('asdf@asdf.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(
      service.signIn('asdflkj@asdlfkj.com', 'passdflkj'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws if an invalid password is provided', async () => {
    await service.singUp('laskdjf@alskdfj.com', 'password');
    await expect(
      service.signIn('laskdjf@alskdfj.com', 'laksdlfkj'),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns a user if corrected password is provided', async () => {
    await service.singUp('asdf@asdf.com', 'mypassword');
    const user = await service.signIn('asdf@asdf.com', 'mypassword');
    expect(user).toBeDefined();
  });
});
