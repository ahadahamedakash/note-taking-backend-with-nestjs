import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { RegisterDto } from './dto/register.dto';
import { UserService } from 'src/user/user.service';
import { ConflictException, Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.userService.getUserByEmail(registerDto.email);
    if (user) {
      throw new ConflictException('Email already taken');
    }
    const saltRounds = 10;

    const hashedPass = await bcrypt.hash(registerDto.password, saltRounds);

    const newUser = await this.userService.createUser({
      ...registerDto,
      password: hashedPass,
    });

    const payload = { sub: newUser.id, email: newUser.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
