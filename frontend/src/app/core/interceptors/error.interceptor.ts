// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (environment.enableLogging) {
        console.error(`[HTTP Error] ${req.method} ${req.url}`, {
          status:  err.status,
          message: err.error?.message ?? err.message,
        });
      }
      return throwError(() => err);
    })
  );
};
