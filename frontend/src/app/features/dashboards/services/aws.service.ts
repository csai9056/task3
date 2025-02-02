import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AwsService {
  constructor(private http: HttpClient) {}
  getUserInfo(): Observable<any> {
    return this.http.get<any>(`${environment.url}/dash/userdata`);
  }
  getPresignedUrl(
    fileName: any,
    fileType: string,
    userId: string,
    foldername: string
  ): Observable<{ presignedUrl: string; fileName: string; userId: string }> {
    // console.log('fln', fileName);
    console.log('userId', userId);

    return this.http.post<{
      presignedUrl: string;
      fileName: string;
      userId: string;
    }>(`${environment.url}/api/get-presigned-url`, {
      fileName,
      fileType,
      userId,
      foldername,
    });
  }
  uploadFileToS3(presignedurl: string, file: File): Observable<any> {
    return this.http.put(presignedurl, file);
  }
  updateProfilePic(
    userid: any,
    filename: any,
    presignedurl: any
  ): Observable<any> {
    console.log('serveice', userid);
    return this.http.post(`${environment.url}/api/update-profile-pic`, {
      userid,
      filename,
      presignedurl,
    });
  }
  getobjects() {
    return this.http.get(`${environment.url}/api/get-data`);
  }
}
