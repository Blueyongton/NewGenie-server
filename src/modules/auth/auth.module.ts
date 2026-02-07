import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const expiresIn =
          configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') || '1h';
        return {
          secret:
            configService.get<string>('JWT_SECRET') || 'default-secret-key',
          signOptions: {
            expiresIn: expiresIn as
              | `${number}${'ms' | 's' | 'm' | 'h' | 'd'}`
              | `${number}`,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule], // 다른 모듈에서도 사용할 수 있도록 export
})
export class AuthModule {}
