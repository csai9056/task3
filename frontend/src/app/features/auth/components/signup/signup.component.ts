import { Toast, ToastrService } from 'ngx-toastr';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Route, Router } from '@angular/router';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  signupForm: FormGroup;
  constructor(
    private authservice: AuthService,
    private routes: Router,
    private toast: ToastrService
  ) {
    this.signupForm = new FormGroup({
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
      ]),
    });
  }
  onSubmit() {
    this.authservice.signup(this.signupForm.value).subscribe({
      next: (data: any) => {
        // alert(' sign up sucessfull ');
        sessionStorage.setItem('token', data.token);
        console.log('sign up successfull', data.message);
        this.routes.navigateByUrl('/auth/login');
      },
      error: (err: any) => {
        if (err.status == 409) {
          // alert('username / email already exist');
          this.toast.error('username / email already exist');
        } else if (err.status === 500) {
          this.toast.error(err.error.message);
        } else if (err.status === 400) {
          // alert('Login failed: ' + err.error.message);
          this.toast.error(err.error.message);
        } else {
          this.toast.error('sign up  failed');
        }
      },
    });
  }
}
