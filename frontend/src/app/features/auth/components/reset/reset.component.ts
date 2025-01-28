import { HttpClient } from '@angular/common/http';
// import { ResetComponent } from './reset.component';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-password',
  templateUrl: './reset.component.html',
})
export class ResetComponent implements OnInit {
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    this.passwordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }
  token: any;
  email: any;
  ngOnInit(): void {
    this.route.params.subscribe((data) => {
      // console.log('data', data);
      this.token = data['id'];
      this.email = JSON.parse(atob(this.token.split('.')[1]))?.email;
      console.log(this.email);
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      console.log('Password successfully set:', this.passwordForm.value);
      this.http
        .put(`${environment.url}/auth/updateuser`, {
          email: this.email,
          password: this.passwordForm.get('confirmPassword')?.value,
        })
        .subscribe();
    }
  }
}
