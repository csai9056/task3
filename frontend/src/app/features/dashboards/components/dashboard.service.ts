import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import * as xlsx from 'xlsx';
import { jsPDF } from 'jspdf';
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  dataSource = new Subject<any>();
  cart = new Subject<any>();
  delaySubject = new BehaviorSubject<number>(1);
  user: any;
  constructor(private http: HttpClient) {}
  data: any;
  cartArray: any[] = [];
  addcart(item: any) {
    this.cart.next(item);
    // this.cartArray.push(item);
  }
  getuserid() {
    if (sessionStorage) {
      const jwtToken = sessionStorage.getItem('access_token');
      if (jwtToken) {
        const payload = jwtToken.split('.')[1];
        this.user = JSON.parse(atob(payload));
        console.log(this.user);
        return this.user.userId;
      } else {
        console.error('Token not found .');
        return -1;
      }
    }
  }
  onproductdelete(id: number) {
    return this.http.put(`${environment.url}/dash/product/delete`, { id: id });
  }
  getproducts(): Observable<any> {
    return this.http.get(`${environment.url}/dash/product`);
  }
  addproducts(productdata: any) {
    return this.http.post(`${environment.url}/dash/product`, productdata);
  }
  setdata(item: any) {
    this.dataSource.next(item);
    this.data = item;
  }
  ondownloadxl(products: any) {
    const ws = xlsx.utils.json_to_sheet(products);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'place');
    xlsx.writeFile(wb, 'dashboard.xlsx');
  }
  ondownloadpdf(item: any) {
    const doc = new jsPDF();
    doc.text('products details', 20, 10);
    let y = 20;
    Object.entries(item).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 20, y);
      y += 10;
    });
    doc.save('product.pdf');
  }
  getcartdata(id: number) {
    return this.http.get(`${environment.url}/dash/getcarts/${id}`);
  }
  getdata() {
    return this.data;
  }
  editproduct(edit: any) {
    return this.http.put(`${environment.url}/dash/product/edit`, edit);
  }
  getvendors() {
    return this.http.get(`${environment.url}/dash/vendor`);
  }
  getcategories() {
    return this.http.get(`${environment.url}/dash/categories`);
  }
  getProducts1(
    page: number,
    limit: number,
    searchTerm: string,
    filter: any
  ): Observable<{
    success: string;
    products: any;
    total: number;
    page: number;
    limit: number;
  }> {
    // console.log('service', filter);
    // filter = JSON.stringify(filter);
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', searchTerm || '')
      .set('filters', JSON.stringify(filter));
    return this.http.get<{
      success: string;
      products: any;
      total: number;
      page: number;
      limit: number;
    }>(`${environment.url}/dash/product`, { params });
  }
  onmove(item: any) {
    return this.http.post(`${environment.url}/dash/postcart`, item);
  }
  deletecart(item: any) {
    return this.http.put(`${environment.url}/dash/postcart/delete`, item);
  }
}
