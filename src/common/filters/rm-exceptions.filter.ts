import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { HttpException } from '@nestjs/common';

@Catch(HttpException)
export class RmqExceptionFilter implements RpcExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): Observable<any> {
    const status = exception.getStatus();
    const response = exception.getResponse();
    
    return throwError(() => ({
      statusCode: status,
      message: response
    }));
  }
}