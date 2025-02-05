import { Component, OnInit } from '@angular/core';
import { AwsService } from '../../services/aws.service';
import { environment } from 'src/environments/environment';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ChatserviceService } from 'src/app/features/dasboards/chatservice.service';
@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.css'],
})
export class FileuploadComponent implements OnInit {
  imageUrl: string = '';
  user: any;
  messages: any[] = [];
  newMessage: string = '';
  showChatWindow = false;
  username: string = '';
  roomName: string = '';
  roomJoined: boolean = false;
  data: any;
  constructor(
    private aws: AwsService,
    private http: HttpClient,
    private chatService: ChatserviceService
  ) {}
  ngOnInit(): void {
    this.getawsobject();
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
    this.getuser(this.user.userId);
    this.chatService.messages$.subscribe((messages) => {
      this.messages = messages;
    });
  }

  getUserInfo(id: number): void {
    this.http
      .post(`${environment.url}/dash/userdata`, { id: id })
      .subscribe((data1) => {
        this.user = data1;
        this.user = this.user.data;
        this.username = this.user.username;
        console.log(data1);
        this.chatService.userConnected(this.user);
      });
  }
  selectedFile: any;
  file1: any;
  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      console.log('File selected:', this.selectedFile);
    }
  }
  getawsobject() {
    this.aws.getobjects().subscribe((data: any) => {
      console.log('objects', data.objects);
      this.data = data.objects;
    });
  }
  onClick(key: string) {
    this.imageUrl = `https://akv-interns.s3.ap-south-1.amazonaws.com/${key}`;
  }
  files: any[] = [];
  file: any;
  toggleFileSelection(file: { selected: boolean }, event: any) {
    const checked = event.target.checked;
    file.selected = checked;
    console.log(this.files);
  }
  personalData: any;
  getuser(id: any) {
    this.personalData = this.http
      .get(`${environment.url}/dash/getpersonaldata/per`)
      .subscribe((data: any) => {
        this.personalData = data.data;
        console.log('personal', this.personalData);
      });
  }
  onUpload(): void {
    if (this.selectedFile) {
      const fileName = this.selectedFile.name;
      const fileType = this.selectedFile.type;
      const flodername = 'files';
      // console.log('befors pre', this.user.user_id);
      const folderName = 'profile-photos';
      this.aws.getPresignedUrl(fileName, fileType, '-1', folderName).subscribe({
        next: (response) => {
          const { presignedUrl, fileName, userId } = response;
          this.uploadToS3(presignedUrl, fileName, userId);
        },
        error: (error) => {
          console.error('Error getting presigned URL:', error);
        },
      });
    }
  }
  uploadToS3(presignedUrl: string, fileName: string, userId: string): void {
    if (this.selectedFile) {
      console.log(presignedUrl);
      this.aws.uploadFileToS3(presignedUrl, this.selectedFile).subscribe({
        next: () => {
          console.log('File successful uploaded in S3');
          this.getawsobject();
        },
        error: (error) => {
          console.error('Error uploading file:', error);
        },
      });
    }
  }
  getFileIcon(key: any): string {
    const extension = key.split('.').pop();
    // console.log(extension);
    return `bi bi-filetype-${extension} `;
  }
  downloadAllSelected(): void {
    const selectedFiles = this.data.filter((file: any) => file.selected);
    console.log(selectedFiles);

    if (selectedFiles.length === 0) {
      alert('Please select files to download.');
      return;
    }
    if (selectedFiles.length === 1) {
      const fileName = selectedFiles[0].key;
      const fileUrl = `${environment.fileurl}/${fileName}`;
      const fileExtension = fileName.split('.').pop();
      const fullFileName = fileExtension ? fileName : `${fileName}.txt`;

      fetch(fileUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = fullFileName;
          link.click();
        })
        .catch((error) => {
          console.error('Error downloading the file:', error);
        });
    } else {
      const zip = new JSZip();
      const promises = selectedFiles.map((file: any, index: any) => {
        const fileName = file.key;
        console.log(fileName);
        const fileUrl = `${environment.fileurl}/${fileName}`;
        const fileExtension = fileName?.split('.').pop();
        const fullFileName = fileExtension ? fileName : `${fileName}.txt`;

        return fetch(fileUrl)
          .then((response) => response.blob())
          .then((blob) => {
            zip.file(fullFileName, blob);
          })
          .catch((error) => {
            console.error('Error downloading file:', error);
          });
      });

      Promise.all(promises)
        .then(() => {
          zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, `downloaded_files_${Date.now()}.zip`);
          });
        })
        .catch((error) => {
          console.error('Error creating the ZIP file:', error);
        });
    }
  }
  modalFileType: string | null = null;
  modalFileContent: SafeResourceUrl | string | null = null;

  toggleChatWindow() {
    this.showChatWindow = !this.showChatWindow;
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      const messageData = {
        user: this.username,
        message: this.newMessage,
        room: this.roomName,
        timestamp: new Date(),
      };
      this.chatService.sendMessage(messageData);
      this.newMessage = '';
    }
  }
  createRoom() {
    if (this.roomName.trim()) {
      this.roomJoined = true;
      this.chatService.createRoom(this.roomName);
    }
  }
  joinRoom() {
    if (this.roomName.trim()) {
      this.roomJoined = true;
      this.chatService.joinRoom(this.roomName);
    }
  }
  exitRoom() {
    if (this.roomName.trim()) {
      this.roomJoined = false;
      this.chatService.leaveRoom(this.roomName);
      this.roomName = '';
    }
  }
}
