import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HumanMessage, SystemMessage } from 'langchain';

@Injectable()
export class LlmService {
    private chatModel: ChatOpenAI;
    constructor(private configService: ConfigService) {
        this.chatModel = new ChatOpenAI({
            apiKey: this.configService.get<string>('OPENROUTER_API_KEY'),
            model: this.configService.get<string>('OPENROUTER_MODEL'),
            configuration: {
                baseURL: 'https://openrouter.ai/api/v1',
                defaultHeaders: {
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'NewGenie',
                },
            },
        });
    }

    async invoke(systemPrompt: string, userMessage: string): Promise<string> {
        const response = await this.chatModel.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(userMessage),
        ]);
        return response.content as string;
    }

    async invokeJson<T>(systemPrompt: string, userMessage: string): Promise<T> {
        const response = await this.invoke(systemPrompt, userMessage);

        let jsonStr = response.trim();

        // 코드 블록 제거
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0];
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0];
        }

        // JSON 배열 또는 객체 추출 (앞뒤 설명 텍스트 제거)
        const jsonMatch = jsonStr.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
        if (!jsonMatch) {
            throw new Error(
                `JSON을 찾을 수 없습니다. 응답: ${response.substring(0, 200)}`,
            );
        }

        try {
            return JSON.parse(jsonMatch[1].trim()) as T;
        } catch (parseError) {
            throw new Error(
                `JSON 파싱 실패. 추출된 내용: ${jsonMatch[1].substring(0, 200)}`,
            );
        }
    }
}
