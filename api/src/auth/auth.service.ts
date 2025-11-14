import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    console.log('AuthService validateUser called with:', {
      email,
      password: '***',
    });

    const user = await this.prisma.user.findUnique({ where: { email } });
    console.log('User found in database:', user ? 'Yes' : 'No');

    if (user) {
      console.log('Comparing passwords...');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password valid:', isPasswordValid);

      if (isPasswordValid) {
        const { password, ...result } = user;
        console.log('Returning user data:', result);
        return result;
      }
    }
    console.log('Validation failed');
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(
    email: string,
    password: string,
    name: string,
    role: string = 'siswa',
  ) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // Map role string to enum
    const roleEnum = role === 'guru' ? 'TEACHER' : 'STUDENT';

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: roleEnum as any,
      },
    });
    const { password: _, ...result } = user;
    return result;
  }
}
