import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from '@node-rs/argon2';
import { Prisma, User } from '@prisma/client';
import { SafeUser, toSafeUser } from '../users/safe-user';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly usersService: UsersService) {}

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<SafeUser> {
    await this.getUser(userId);

    const user = await this.usersService.update(userId, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      age: dto.age,
    });

    return toSafeUser(user);
  }

  async updateEmail(userId: string, dto: UpdateEmailDto): Promise<SafeUser> {
    const user = await this.getUser(userId);
    await this.assertPassword(user, dto.currentPassword);

    if (dto.email === user.email) {
      return toSafeUser(user);
    }

    if (await this.usersService.findByEmail(dto.email)) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    try {
      const updated = await this.usersService.update(userId, {
        email: dto.email,
      });
      return toSafeUser(updated);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
      throw error;
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.getUser(userId);
    await this.assertPassword(user, dto.currentPassword);

    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException(
        "Le nouveau mot de passe doit être différent de l'ancien",
      );
    }

    const passwordHash = await argon2.hash(dto.newPassword);
    await this.usersService.update(userId, { passwordHash });
  }

  private async getUser(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }
    return user;
  }

  private async assertPassword(user: User, password: string): Promise<void> {
    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) {
      throw new ForbiddenException('Mot de passe actuel incorrect');
    }
  }
}