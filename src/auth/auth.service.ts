import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { RegisterDto } from './dto/register.dto';
import { UserService } from 'src/user/user.service';
import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
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

    this.logger.log(`New user has been created: ${newUser.id}`);

    const payload = { sub: newUser.id, email: newUser.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.getUserByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Email or password is incorrect!');
    }

    const match = await bcrypt.compare(loginDto.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Email or password is incorrect!');
    }

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
