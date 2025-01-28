import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
// import jwt_decode from 'jwt-decode';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}
  login(form: object) {
    return this.http.post(`${environment.url}/auth/login`, form);
  }
  signup(form: object) {
    console.log(form);
    return this.http.post(`${environment.url}/auth/signup`, form);
  }

  getAccessToken() {
    // if(sessionStorage)
    return sessionStorage.getItem('access_token');
  }

  refreshToken(): Observable<any> {
    const refreshToken = sessionStorage.getItem('refresh_token');
    return this.http.post(`${environment.url}/auth/refresh`, {
      refresh_token: refreshToken,
    });
  }

  setToken(token: string) {
    sessionStorage.setItem('access_token', token);
  }
  setRefreshToken(token: string) {
    sessionStorage.setItem('refresh_token', token);
  }
}
