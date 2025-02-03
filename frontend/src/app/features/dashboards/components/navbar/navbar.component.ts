import { Component, OnInit } from '@angular/core';
import { AwsService } from '../../services/aws.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { io, Socket } from 'socket.io-client';
import { AuthService } from 'src/app/features/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  bootstrap: any;
  socket!: Socket;
  user: any = {};
  selectedFile: any;
  fileUrl: string = '';
  constructor(
    private aws: AwsService,
    private router: Router,
    private Http: HttpClient,
    private auth: AuthService,
    private toast: ToastrService
  ) {}
  jwtToken: string = ' ';
  notifications: any;
  ngOnInit(): void {
    this.Http.get(`${environment.url}/auth/getnotifications`).subscribe(
      (data: any) => {
        console.log('notifications', data);
        if (data.data) this.toast.info(data.data);
      }
    );
    if (sessionStorage) {
      const jwtToken = sessionStorage.getItem('access_token');
      if (jwtToken) {
        const payload = jwtToken.split('.')[1];
        this.user = JSON.parse(atob(payload));
        console.log(this.user);
        this.getUserInfo(this.user.userId);
      } else {
        console.error('Token not found .');
      }
    }
  }
  getUserInfo(id: number): void {
    this.Http.post(`${environment.url}/dash/userdata`, { id: id }).subscribe(
      (data1) => {
        this.user = data1;
        this.user = this.user.data;
        console.log(data1);
        this.auth.userConnected(this.user);
      }
    );
  }

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      console.log('File selected:', this.selectedFile);
    }
  }

  onUpload(): void {
    if (this.selectedFile) {
      const fileName = this.selectedFile.name;
      const fileType = this.selectedFile.type;
      console.log('befors pre', this.user.user_id);
      const folderName = 'profile-photos';
      this.aws
        .getPresignedUrl(fileName, fileType, this.user.user_id, folderName)
        .subscribe({
          next: (response: any) => {
            const { presignedUrl, fileName, userId } = response;
            const image = response.image;
            this.uploadToS3(presignedUrl, fileName, userId, image);
          },
          error: (error) => {
            console.error('Error getting presigned URL:', error);
          },
        });
    }
  }
  uploadToS3(
    presignedUrl: string,
    fileName: string,
    userId: string,
    image: string
  ): void {
    if (this.selectedFile) {
      console.log(presignedUrl);
      this.aws.uploadFileToS3(presignedUrl, this.selectedFile).subscribe({
        next: () => {
          console.log('File successful uploaded in S3');
          console.log('image', image);

          this.user.profile_pic = image;
          // console.log('before' + this.user.user_id);
          this.aws
            .updateProfilePic(this.user.user_id, fileName, presignedUrl)
            .subscribe({
              next: (response) => {
                // console.log(response.message);
                this.closeModal();
              },
              error: (error) => {
                console.error('Error updating profile picture:', error);
              },
            });
        },
        error: (error) => {
          console.error('Error uploading file:', error);
        },
      });
    }
  }

  closeModal() {
    const modalElement = document.getElementById('uploadModal');
  }

  onLogout() {
    sessionStorage.clear();
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    this.router.navigate(['/auth/login']);
  }
}
