import { ToastrService } from 'ngx-toastr';
import { MovetocardComponent } from './../movetocard/movetocard.component';
import { HttpClient } from '@angular/common/http';
import { ProductformComponent } from './../productform/productform.component';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DashboardService } from '../dashboard.service';
import { BehaviorSubject, debounceTime, Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import { error } from 'node:console';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  searchTerm: string = '';
  products: any;
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 5;
  totalitems: number = 0;
  pages: number[] = [];
  view: boolean = true;
  movetocart: boolean = true;
  movecart() {
    // this.movetocart = false;
    this.dashservice.addcart(this.download);
  }

  constructor(
    private http: HttpClient,
    private dashservice: DashboardService,
    private toastrService: ToastrService
  ) {}
  ngOnInit(): void {
    this.dashservice.delaySubject
      .pipe(debounceTime(500))
      .subscribe((page: number) => {
        this.fetchPage1(page);
        // this.oncart();
      });
    // this.fetchPage1(1);
  }

  data: any;
  onfilechange(event: any): void {
    // console.log('event');
    const file = event.target.files[0];
    // console.log(file);
    if (!file) {
      // alert('No file selected.');
      this.toastrService.error('no file selected');
      return;
    }
    // Validate the file type
    const fileType = file.name.split('.').pop();
    if (fileType !== 'xlsx' && fileType !== 'xls') {
      this.toastrService.error(
        'Invalid file type. Please upload an Excel file.'
      );
      return;
    }
    const reader = new FileReader();
    console.log(reader);
    reader.onload = (e: any) => {
      console.log('Reader onload called!');
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      this.data = XLSX.utils.sheet_to_json(worksheet);
      console.log('data is ', this.data);
      this.adddata();
    };
    reader.readAsArrayBuffer(file);
  }
  adddata() {
    if (this.data) {
      console.log('loop');
      for (let items of this.data) {
        this.dashservice.addproducts(items).subscribe((data) => {
          console.log(data);
        });
      }
      this.toastrService.success('successfully updated');
      setTimeout(() => {
        this.fetchPage1(1);
      }, 500);
    }
  }
  fetchPage(page: number) {
    this.dashservice.delaySubject.next(page);
  }
  fetchPage1(page: number): void {
    this.dashservice
      .getProducts1(page, this.pageSize, this.searchTerm, this.selectedFilters)
      .pipe()
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.products = data;
          console.log('products', data);
          this.totalitems = data.total;
          if (data.page) this.currentPage = data.page;
          else this.currentPage = 1;
          this.totalPages = Math.ceil(this.totalitems / this.pageSize);
          this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
          console.log(this.pages);
        },
        error: (error: any) => {
          console.error('Error fetching products:', error);
        },
      });
  }
  onview() {
    this.view = true;
  }
  cart: any;
  user: any;
  userid: number = 1;
  oncart() {
    this.view = false;
    this.userid = this.dashservice.getuserid();
    this.dashservice.getcartdata(this.userid).subscribe((data: any) => {
      this.cart = data.data;
      console.log(data);
    });
  }
  download: any[] = [];
  check(item: any, event: any, id: any) {
    const checkvalid = (event.target as HTMLInputElement).checked;
    // console.log(event);
    if (checkvalid) {
      // console.log(item.quantity);
      if (item.quantity > 0) this.download.push(item);
      else this.toastrService.info('item was sold out');
      // this.dashservice.addcart(item);
    } else {
      console.log('uncheck');
      // this.dashservice.removeFromCart(item);
      this.download = this.download.filter(
        (product: any) => product?.product_id !== id
      );
      console.log(this.download);

      // // this.download.slice(i, 1);
      // console.log();
    }
  }

  handleform(productdata: any) {
    if (productdata.status === 'Available') productdata.status = '1';
    else productdata.status = '0';
    console.log(productdata);
    this.dashservice.addproducts(productdata).subscribe((data: any) => {
      console.log(data);
      this.toastrService.success(data.message);
    });
  }
  ondownload() {
    if (this.download.length > 0) this.dashservice.ondownloadxl(this.download);
    else this.dashservice.ondownloadxl(this.products?.data);
  }
  onpdfdownload(item: any) {
    this.dashservice.ondownloadpdf(item);
  }
  onproductdelete(id: number) {
    const modal = document.getElementById('confirmAction');
    modal?.addEventListener('click', () => {
      console.log(id);
      this.dashservice.onproductdelete(id).subscribe((data: any) => {
        console.log(data);

        this.toastrService.success(data.message);
        this.fetchPage1(1);
      });
    });
  }
  onproductedit(item: any) {
    this.dashservice.setdata(item);
  }
  editform(edit: any) {
    this.dashservice.editproduct(edit).subscribe((data) => {
      this.toastrService.success('success edited');
      setTimeout(() => {
        this.fetchPage1(1);
      }, 500);
    });
  }
  isDropdownOpen: boolean = true;
  selectedFilters: { [key: string]: boolean } = {};
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  onCheckboxChange(criteria: string, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.selectedFilters[criteria] = checkbox.checked;
    console.log(this.selectedFilters);
  }
  call2(data: any) {
    console.log('sdfgh');
    setTimeout(() => {
      this.fetchPage1(1);
    }, 500);
  }
  ondelete(item: any) {
    console.log(item);
    this.dashservice.deletecart(item).subscribe({
      next: (data) => {
        this.toastrService.success('successfully deleted');
        console.log('bjj');
        this.oncart();
        this.fetchPage1(1);
      },
      error: (error1: any) => {
        this.toastrService.error('error has occured');
      },
    });
  }
}
