import { Toast, ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { DashboardService } from '../dashboard.service';
import { AwsService } from '../../services/aws.service';
import { AnyARecord } from 'node:dns';
@Component({
  selector: 'app-add-product',
  templateUrl: './productform.component.html',
  styleUrls: ['./productform.component.css'],
})
export class ProductformComponent implements OnInit {
  productForm: FormGroup;
  @Output() call1 = new EventEmitter<any>();
  @Output() formSubmitted = new EventEmitter<any>();

  item: any;
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dashservice: DashboardService,
    private aws: AwsService,
    private toast: ToastrService
  ) {
    // console.log('form', dashservice.getdata());
    this.item = '';
    this.dashservice.dataSource.subscribe((data) => {
      console.log('subject', data);
      this.item = data;
      // this.productName = this.item.product_name;
      // console.log(this.productName);
      console.log(this.item);

      if (this.item) {
        this.populateFormForEdit();
      }
    });
    // console.log('item', this.item?.product_name);

    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      category: ['', Validators.required],
      vendor: [[]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      unit: ['', Validators.required],
      status: ['', Validators.required],
      productImage: [''],
    });
  }
  vendors: any;
  categories: any;
  ngOnInit(): void {
    // console.log('form', this.dashservice.getdata());
    // console.log('aj');
    this.dashservice.getvendors().subscribe((data) => {
      this.vendors = data;
      console.log(data);
    });
    this.dashservice.getcategories().subscribe((data) => {
      this.categories = data;
      console.log(data);
    });
  }
  selectedFile: File | null = null;
  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      console.log('File selected:', this.selectedFile);
    }
  }
  image: any;
  uploadToS3(
    presignedUrl: string,
    fileName: string,
    userId: string,
    image: string
  ): void {
    if (this.selectedFile) {
      console.log(presignedUrl);
      this.aws.uploadFileToS3(presignedUrl, this.selectedFile).subscribe({
        next: (resonse) => {
          console.log('File successful uploaded in S3');
          this.image = image;
          console.log(this.image);
          if (this.item) {
            this.http
              .put(`${environment.url}/dash/product/updateimage`, {
                id: this.item?.product_id,
                image: image,
              })
              .subscribe({
                next: (data: any) => {
                  this.toast.success('successfully updated image');
                  // this.call1.emit(this.productForm.value);
                  this.dashservice.delaySubject.next(1);
                },
                error: (err: any) => {
                  console.log(err);

                  this.toast.error('error has occured');
                },
              });
          }
        },
        error: (error: any) => {
          console.error('Error uploading file:', error);
        },
      });
    }
  }
  onUpload(): void {
    if (this.selectedFile) {
      const fileName = this.selectedFile.name;
      const fileType = this.selectedFile.type;
      console.log('befors pre');
      const folderName = 'profile-photos';
      this.aws.getPresignedUrl(fileName, fileType, '3', folderName).subscribe({
        next: (response: any) => {
          const { presignedUrl, fileName, userId } = response;
          // console.log(response.image);

          this.uploadToS3(presignedUrl, fileName, userId, response.image);
        },
        error: (error: any) => {
          console.error('Error getting presigned URL:', error);
        },
      });
    }
  }

  form: any;
  onSubmit() {
    if (this.productForm.valid) {
      // console.log(this.productForm.value);
      this.form = this.productForm.value;
      if (this.item) {
        this.form.product_id = this.item.product_id;
        // console.log('edit', this.form);
        this.form.productImage = this.image;
        // console.log(this.form.product_image, this.image);

        this.dashservice.editproduct(this.form).subscribe({
          next: (res) => {
            this.toast.success('successfully edited');
            this.dashservice.delaySubject.next(1);
            console.log(res);
          },
          error: (err) => {
            console.log(err);
          },
        });
      } else {
        this.form.productImage = this.image;
        // console.log(this.form);
        this.formSubmitted.emit(this.form);
      }
    }
  }
  populateFormForEdit() {
    this.productForm.patchValue({
      productName: this.item.product_name,
      quantity: this.item.quantity,
      unit: this.item.unit,
      status: this.item.status,
    });
  }
  selectedVendors: any[] = [];
  onVendorChange(event: any) {
    console.log('dfghjk');

    const vendorId = event.target.value;
    console.log(vendorId);

    if (event.target.checked) {
      this.selectedVendors.push(vendorId);
    } else {
      this.selectedVendors = this.selectedVendors.filter(
        (id) => id !== vendorId
      );
    }
    this.productForm.get('vendor')?.setValue(this.selectedVendors);
  }
  isSelected(vendorId: number): boolean {
    return this.selectedVendors.includes(vendorId);
  }
}
