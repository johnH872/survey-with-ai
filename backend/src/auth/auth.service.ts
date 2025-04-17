import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      return user;
    }
    return undefined;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    };
  }

  async handleGoogleLogin(profile: any) {
    try {
      const email = profile.emails[0].value;
      let user = await this.usersService.findByEmail(email);
      
      if (!user) {
        user = await this.usersService.create({
          email: email,
          name: profile.displayName,
          googleId: profile.id,
          picture: profile.photos[0]?.value,
        });
      }

      return this.login(user);
    } catch (error) {
      console.error('Error in handleGoogleLogin:', error);
      throw error;
    }
  }

  async handleGoogleToken(credential: string) {
    try {
      // Verify the token with Google
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
      );
      
      const { email, name, picture, sub: googleId } = response.data;
      
      // Find or create user
      let user = await this.usersService.findByEmail(email);
      
      if (!user) {
        user = await this.usersService.create({
          email,
          name,
          googleId,
          picture,
        });
      }

      return this.login(user);
    } catch (error) {
      console.error('Error verifying Google token:');
      throw error;
    }
  }
} 