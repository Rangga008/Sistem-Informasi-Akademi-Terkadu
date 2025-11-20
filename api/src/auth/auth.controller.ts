import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      name: string;
      role?: string;
    },
  ) {
    return this.authService.register(
      body.email,
      body.password,
      body.name,
      body.role,
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    console.log('Login request received:', req.body);
    console.log('User from guard:', req.user);

    const result = await this.authService.login(req.user);
    console.log('Login result:', result);

    const response = {
      token: result.access_token,
      user: req.user,
    };
    console.log('Login response:', response);

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset-password')
  async resetPassword(
    @Request() req,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.authService.resetPasswordSelf(
      req.user.id,
      body.oldPassword,
      body.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset-password-admin')
  async resetPasswordAdmin(
    @Request() req,
    @Body() body: { targetUserId: string; newPassword: string },
  ) {
    // Only teachers can reset other users' passwords
    if (req.user.role !== 'TEACHER') {
      throw new Error('Only teachers can reset passwords');
    }
    return this.authService.resetPasswordAdmin(
      body.targetUserId,
      body.newPassword,
    );
  }
}
