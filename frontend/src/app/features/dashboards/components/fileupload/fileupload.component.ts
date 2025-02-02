import { Component, OnInit } from '@angular/core';
import { AwsService } from '../../services/aws.service';
import { environment } from 'src/environments/environment';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.css'],
})
export class FileuploadComponent implements OnInit {
  imageUrl: string = '';
  data: any;
  constructor(private aws: AwsService, private http: HttpClient) {}
  ngOnInit(): void {
    this.getawsobject();
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
  onUpload(): void {
    if (this.selectedFile) {
      const fileName = this.selectedFile.name;
      const fileType = this.selectedFile.type;
      const flodername = 'files';
      // console.log('befors pre', this.user.user_id);
      const folderName="profile-photos";
      this.aws.getPresignedUrl(fileName, fileType, '-1',folderName).subscribe({
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
  modalFileContent: SafeResourceUrl | string | null = null; // Updated to accept string for images
  //   showFile(fileName: string): void {
  //     this.http
  //       .get<{ urls: { fileName: string; url: string }[] }>(
  //         'http://localhost:4000/api/get-presigned-urls-for-get',
  //         {
  //           params: { fileNames: fileName },
  //         }
  //       )
  //       .subscribe({
  //         next: (response) => {
  //           const fileData = response.urls.find(
  //             (file) => file.fileName === fileName
  //           );
  //           if (!fileData) {
  //             console.error('File URL not found for:', fileName);
  //             alert('File URL not found');
  //             return;
  //           }

  //           this.http.get(fileData.url, { responseType: 'blob' }).subscribe({
  //             next: (fileBlob: Blob) => {
  //               this.modalFileType = fileBlob.type;

  //               // Handle image files (JPEG, PNG, etc.)
  //               if (fileBlob.type.startsWith('image')) {
  //                 const fileReader = new FileReader();
  //                 fileReader.onload = () => {
  //                   this.modalFileContent = fileReader.result as string; // Data URL for the image
  //                   this.showModal = true;
  //                 };
  //                 fileReader.readAsDataURL(fileBlob);
  //               }
  //               // Handle PDF files
  //               else if (fileBlob.type === 'application/pdf') {
  //                 const pdfURL = URL.createObjectURL(fileBlob);
  //                 this.modalFileContent =
  //                   this.sanitizer.bypassSecurityTrustResourceUrl(pdfURL);
  //                 this.showModal = true;
  //               }
  //               // Handle text files
  //               else if (fileBlob.type.startsWith('text')) {
  //                 const fileReader = new FileReader();
  //                 fileReader.onload = () => {
  //                   this.modalFileContent = fileReader.result as string; // Plain text content
  //                   this.showModal = true;
  //                 };
  //                 fileReader.readAsText(fileBlob);
  //               }
  //               // Handle Excel files
  //               else if (
  //                 fileBlob.type ===
  //                 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  //               ) {
  //                 const fileURL = URL.createObjectURL(fileBlob);
  //                 this.modalFileContent = fileURL; // Direct link for download
  //                 this.showModal = true;
  //               } else {
  //                 console.error('Unsupported file type:', fileBlob.type);
  //                 alert('Unsupported file type for preview.');
  //               }
  //             },
  //             error: (err) => {
  //               console.error('Error fetching file content:', err);
  //               alert('Error fetching file content.');
  //             },
  //           });
  //         },
  //         error: (err) => {
  //           console.error('Error fetching file URL:', err);
  //           alert('Error fetching file URL.');
  //         },
  //       });
  //   }
}
