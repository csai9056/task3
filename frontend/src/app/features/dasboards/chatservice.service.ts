import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { userInfo } from 'node:os';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class ChatserviceService {
  socket: Socket;
  private messageSubject = new BehaviorSubject<any[]>([]);
  public messages$ = this.messageSubject.asObservable();
  constructor(private toastr: ToastrService) {
    this.socket = io('http://localhost:4000');
    console.log(this.socket);

    this.socket.on('receiveMessage', (messageData) => {
      const messages = this.messageSubject.value;
      messages.push(messageData);
      this.messageSubject.next(messages);

      if (messageData.user !== sessionStorage.getItem('username')) {
        this.showAlert(messageData);
      }
    });
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
    // this.socket.on('taskStatus', (data) => {F
    //   console.log('hello');
    //   alert(`File processing completed. Status: ${data.stFatus}`);
    // });
  }

  sendMessage(messageData: any) {
    this.socket.emit('sendMessageRoom', messageData);
  }

  joinRoom(roomName: string) {
    this.socket.emit('joinRoom', roomName);
  }

  createRoom(roomName: string) {
    this.socket.emit('createRoom', roomName);
  }
  leaveRoom(roomName: string) {
    this.socket.emit('leaveRoom', roomName);
  }

  userConnected(userId: any) {
    console.log('heudgeuo', userId.user_id);
    this.socket.emit('userConnected', userId.user_id, userId.username);
  }
  private showAlert(messageData: any) {
    // alert(`${messageData.user} sent a message: ${messageData.message}`);
  }
}
