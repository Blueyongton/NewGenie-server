import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

interface SuccessResponse<T> {
    resultType: 'SUCCESS';
    success: {
        data: T;
    };
    error: null;
    meta: {
        timestamp: string;
        path: string;
    };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
    T,
    SuccessResponse<T>
> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<SuccessResponse<T>> {
        const request = context.switchToHttp().getRequest<Request>();
        const path = request.url;

        return next.handle().pipe(
            map((data: T) => ({
                resultType: 'SUCCESS' as const,
                success: {
                    data,
                },
                error: null,
                meta: {
                    timestamp: new Date().toISOString(),
                    path,
                },
            })),
        );
    }
}
