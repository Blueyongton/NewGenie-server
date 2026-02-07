import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { Repository } from 'typeorm';
import { LlmService } from 'src/common/llm/llm.service';
import { ANALYZE_PROMPT } from 'src/common/prompts/analyze.prompt';

@Injectable()
export class NewsService {
    constructor(
        @InjectRepository(News)
        private newsRepository: Repository<News>,
        private llmService: LlmService,
    ) {}

    async create(title: string) {
        const news = this.newsRepository.create({ title });
        return this.newsRepository.save(news);
    }

    async analyze(content: string): Promise<string> {
        return this.llmService.invoke(ANALYZE_PROMPT.SYSTEM, content);
    }
}
