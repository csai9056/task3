import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-editform',
  templateUrl: './editform.component.html',
  styleUrls: ['./editform.component.css'],
})
export class EditformComponent implements OnInit {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private dash: DashboardService) {
    this.signupForm = new FormGroup({
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
      ]),
      Region: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
      ]),
    });
  }
  personaldata: any;
  ngOnInit(): void {
    this.dash.personalDataSubject.subscribe((data) => {
      this.personaldata = data;
      this.populateFormForEdit();
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      console.log('User Details:', this.signupForm.value);
      alert('User details updated successfully!');
    }
  }
  populateFormForEdit() {
    console.log('sdfghj', this.personaldata);

    this.signupForm.patchValue({
      firstname: this.personaldata.first_name,
      lastname: this.personaldata.username,
      email: this.personaldata.email,
      Region: this.personaldata.region,
    });
  }
}
