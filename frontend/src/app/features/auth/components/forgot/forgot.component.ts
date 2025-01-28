import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot.component.html',
})
export class ForgotComponent {
  forgotForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toast: ToastrService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    console.log(this.forgotForm.value);

    const email = this.forgotForm.get('email')?.value;
    this.http
      .post(`${environment.url}/auth/forgot`, { email: email })
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (error) => {
          console.log('err', error);
          this.toast.error(error.statusText);
        },
      });
    // faxs nkrb qqzl wota
  }
}
