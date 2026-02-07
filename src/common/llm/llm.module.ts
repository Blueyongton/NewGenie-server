import { Global, Module } from "@nestjs/common";
import { LlmService } from "./llm.service";

@Global() // 전역 모듈로 설정하여 어디서든 사용 가능
@Module({
    providers: [LlmService],
    exports: [LlmService],
})
export class LlmModule {}