import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Use email as username field
    });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log('LocalStrategy validate called with:', {
      email,
      password: '***',
    });

    const user = await this.authService.validateUser(email, password);
    console.log(
      'User validation result:',
      user ? 'User found' : 'User not found',
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
