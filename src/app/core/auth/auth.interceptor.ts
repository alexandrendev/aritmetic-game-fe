import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

const isPublicEndpoint = (url: string): boolean => {
  return (
    url.includes('/api/login') ||
    url.includes('/api/register') ||
    url.includes('/api/token/refresh')
  );
};

const withToken = (request: HttpRequest<unknown>, token: string): HttpRequest<unknown> => {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthService);

  let outgoing = request;
  const currentToken = auth.accessToken();

  if (currentToken && !isPublicEndpoint(request.url)) {
    outgoing = withToken(request, currentToken);
  }

  return next(outgoing).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isPublicEndpoint(request.url)) {
        return throwError(() => error);
      }

      return auth.refreshToken().pipe(
        switchMap((newToken) => {
          if (!newToken) {
            auth.logout();
            return throwError(() => error);
          }

          return next(withToken(request, newToken));
        })
      );
    })
  );
};
