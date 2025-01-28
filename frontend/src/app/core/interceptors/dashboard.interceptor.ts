import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import {
  catchError,
  Observable,
  of,
  switchMap,
  filter,
  take,
  throwError,
} from 'rxjs';
import { AuthService } from 'src/app/features/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class DashboardInterceptor implements HttpInterceptor {
  private refreshingToken = false;
  private refreshTokenSubject: Observable<any> | null = null;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const accessToken = this.authService.getAccessToken();
    if (accessToken) {
      request = this.addToken(request, accessToken);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    // console.log('re1');
    this.refreshTokenSubject = this.authService.refreshToken().pipe(
      switchMap((newTokens: any) => {
        console.log('re2');
        console.log('re', newTokens);
        this.refreshingToken = false;
        this.authService.setToken(newTokens.accessToken);
        return of(newTokens.accessToken);
      })
    );

    return this.refreshTokenSubject!.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((newAccessToken: string) => {
        return next.handle(this.addToken(request, newAccessToken));
      })
    );
  }
}
