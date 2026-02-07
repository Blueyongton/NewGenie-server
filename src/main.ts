import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './Interceptors/response/response.interceptor';
import { HttpExceptionFilter } from './Interceptors/filters/http-error/http-error.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS 설정
    app.enableCors({
        origin: [
            // 로컬 개발 환경
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            // Vercel 배포 환경 (모든 Vercel 도메인 허용)
            /\.vercel\.app$/,
            // 프로덕션 커스텀 도메인이 있다면 추가
            // 'https://yourdomain.com',
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    // 전역 Exception Filter 설정
    app.useGlobalFilters(new HttpExceptionFilter());

    // 전역 Interceptor 설정
    app.useGlobalInterceptors(new ResponseInterceptor());

    // 전역 ValidationPipe 설정
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // DTO에 정의되지 않은 속성 제거
            forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 에러
            transform: false, // 자동 타입 변환
        }),
    );

    const config = new DocumentBuilder()
        .setTitle('NewGenie API')
        .setDescription('NewGenie API 문서')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'Authorization',
                description: 'JWT 액세스 토큰을 입력하세요',
                in: 'header',
            },
            'access-token', // 이 이름을 컨트롤러에서 참조
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
