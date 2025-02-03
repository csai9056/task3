import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ToastrService } from 'ngx-toastr';
// import jwt_decode from 'jwt-decode';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private socket!: Socket;
  constructor(private http: HttpClient, private toastr: ToastrService) {
    this.socket = io('http://localhost:4000');
    console.log(this.socket);

    this.socket.on(
      'fileProcessed',
      (data: { fileId: string; status: string }) => {
        console.log('File processing complete:', data);
        if (data.status === 'success') {
          this.toastr.success(
            `File ${data.fileId} processed successfully!`,
            'Success'
          );
        } else {
          this.toastr.error(`File ${data.fileId} processing failed.`, 'Error');
        }
      }
    );
  }
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
  userConnected(userId: any) {
    console.log('heudgeuo', userId.user_id);
    this.socket.emit('userConnected', userId.user_id);
  }
}
