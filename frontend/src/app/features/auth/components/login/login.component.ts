import { Success } from './../../../../../../../backend/node_modules/aws-sdk/clients/cloudwatchlogs.d';
// import { Router } from 'express';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  constructor(
    private authservice: AuthService,
    private router: Router,
    private t: ToastrService
  ) {}
  form = {
    email: '',
    password: '',
  };
  loginform!: FormGroup;
  ngOnInit(): void {
    this.loginform = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
      ]),
    });
  }
  onSubmit() {
    this.authservice.login(this.loginform.value).subscribe({
      next: (data: any) => {
        // alert(' login successfull');
        this.t.success('login suuccessfull', 'Success');
        sessionStorage.setItem('access_token', data.accessToken);
        sessionStorage.setItem('refresh_token', data.refreshToken);
        this.router.navigateByUrl('dashboard/dash');
        console.log('Login successful:', data.message);
      },
      error: (err: any) => {
        if (err.status === 401) {
          // alert('invalid email or password. Please try again.');
          this.t.error('invalid email or password', 'Please try again.');
        } else if (err.status === 400) {
          // alert('Login failed: ' + err.error.message);
          this.t.error('login failed', err.error.message);
        } else {
          this.t.error('loggin failed');
        }
      },
    });
  }
  onforgot() {
    this.router.navigateByUrl('auth/forgot');
  }
}
