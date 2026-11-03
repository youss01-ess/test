import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as argon2 from '@node-rs/argon2';
import { SafeUser, toSafeUser } from '../users/safe-user';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export type { SafeUser };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<SafeUser> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }

    const passwordHash = await argon2.hash(dto.password);

    try {
      const user = await this.usersService.create({
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        age: dto.age,
      });
      return toSafeUser(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Un compte existe déjà avec cet email');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: SafeUser }> {
    const user = await this.usersService.findByEmail(dto.email);
    const passwordIsValid = user
      ? await argon2.verify(user.passwordHash, dto.password)
      : false;

    if (!user || !passwordIsValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { accessToken, user: toSafeUser(user) };
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }
    return toSafeUser(user);
  }

}