import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { error } from 'console';
// import { EventEmitter } from 'stream';

@Component({
  selector: 'app-movetocard',
  templateUrl: './movetocard.component.html',
  styleUrls: ['./movetocard.component.css'],
})
export class MovetocardComponent implements OnInit {
  cart: any[] = [];
  @Output() gettable = new EventEmitter();
  constructor(
    private dashservice: DashboardService,
    private toastrService: ToastrService
  ) {
    this.cart = this.dashservice.cartArray;
    // console.log('move', this.cart, this.dashservice.cartArray);
  }
  quantity: number[] = Array(10).fill(0);
  i: number = 10;

  ngOnInit(): void {
    // console.log('cart');
    // console.log(this.quantity[0]);
    this.dashservice.cart.subscribe((data) => {
      cart: data;
      this.quantity[this.i++] = 0;
      // this.cart.push(data);
      console.log(data);

      this.cart = data;
      console.log('cart', data);
    });
  }
  value: any;
  add(index: number) {
    if (this.sendingdata[index]) {
      this.sendingdata[index].quantitys = this.sendingdata[index].quantitys + 1;
      // console.log(this.sendingdata[index].quantitys);
    }
    this.quantity[index] = this.quantity[index] + 1;
  }
  sub(index: number) {
    if (this.sendingdata[index]) {
      this.sendingdata[index].quantitys = this.sendingdata[index].quantitys - 1;
      // console.log(this.sendingdata[index].quantitys);
    }
    this.quantity[index] = this.quantity[index] - 1;
  }
  sendingdata: any[] = [];
  addcards(item: any, event: any, index: number) {
    const checkvalid = (event.target as HTMLInputElement).checked;
    this.userid = this.dashservice.getuserid();
    if (checkvalid) {
      item.quantitys = this.quantity[index];
      item.quantity = item.quantity - 1;
      this.sendingdata.push(item);
      item.userid = this.userid;
    }
  }
  userid: number = 1;
  async onmove() {
    if (this.sendingdata?.length > 0) {
      for (let item of this.sendingdata) {
        console.log('cart items ', item);
        await this.dashservice.onmove(item).subscribe({
          next: (res: any) => {
            // console.log(res);
            this.toastrService.success('successfully added');
            this.gettable.emit('1');
            // this.dashservice.getProducts1(1, 5, '','');
          },
          error: (err: any) => {
            this.toastrService.error(err.message);
          },
        });
      }
    } else {
      this.toastrService.error('add items');
    }
  }

  data12: number = 1;
  call() {}
  ondeletecart(index: number, val: number) {
    console.log('n');
    console.log(val);
    this.cart = this.cart.filter((product) => product.product_id !== val);
    this.sendingdata.splice(index, 1);
    console.log(this.sendingdata);
  }
}
