import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { UsersModule } from './modules/users/users.module';
import { NewsModule } from './modules/news/news.module';

@Module({
  imports: [AuthModule, QuizModule, UsersModule, NewsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
