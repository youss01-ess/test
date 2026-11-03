import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SafeUser } from '../users/safe-user';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Patch()
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ): Promise<SafeUser> {
    return this.profileService.updateProfile(req.user.sub, dto);
  }

  @Patch('email')
  updateEmail(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateEmailDto,
  ): Promise<SafeUser> {
    return this.profileService.updateEmail(req.user.sub, dto);
  }

  @Patch('password')
  @HttpCode(204)
  changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    return this.profileService.changePassword(req.user.sub, dto);
  }
}