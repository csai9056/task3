import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, throwError, map } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { Router } from 'express';
import { Route } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    let accessToken: string | null;
    // console.log(request.url);
    if (
      !request.url.includes('/akv-interns') &&
      !request.url.includes('/api')
    ) {
      if (request.body) {
        // console.log(request.body);
        const encryptedBody = this.encryptPayload(request.body);
        request = request.clone({
          body: { data: encryptedBody },
        });
      }
      if (
        !request.url.includes('/akv-interns') &&
        !request.url.includes('/api') &&
        request.url.includes('/dash')
      ) {
        const currentUser = sessionStorage.getItem('access_token');
        request = request.clone({
          headers: new HttpHeaders({
            Authorization: `Bearer ${currentUser}`,
          }),
        });
      }
      return next.handle(request).pipe(
        map((event: HttpEvent<any>) => {
          // console.log('event', event);
          // console.log('came here');
          if (event instanceof HttpResponse && event.body) {
            // console.log('came here 2');
            const decryptedBody = this.decryptPayload(event.body);
            // console.log(request.url, decryptedBody);
            return event.clone({ body: decryptedBody });
          }
          return event;
        })
      );
    } else {
      // console.log('came to else', request.url);
      return next.handle(request);
    }
  }
  encryptionKey = 'key';
  private encryptPayload(payload: any): string {
    return CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      this.encryptionKey
    ).toString();
  }

  private decryptPayload(encryptedPayload: any): string {
    const bytes = CryptoJS.AES.decrypt(encryptedPayload, this.encryptionKey);
    // console.log('decrypt');
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
}
