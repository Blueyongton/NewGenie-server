import { ChatOpenAI } from "@langchain/openai";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HumanMessage, SystemMessage } from "langchain";

@Injectable()
export class LlmService {
    private chatModel: ChatOpenAI;
    constructor(
        private configService: ConfigService
    ) {
        this.chatModel = new ChatOpenAI({
            apiKey: this.configService.get<string>('OPENROUTER_API_KEY'),
            model: this.configService.get<string>('OPENROUTER_MODEL'),
            configuration: {
                baseURL: 'https://openrouter.ai/api/v1',
                defaultHeaders: {
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'NewGenie',
                },
            }
        })
    }

    async invoke(systemPrompt: string, userMessage: string): Promise<string> {
        const response = await this.chatModel.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(userMessage),
        ]);
        return response.content as string;
    }
}