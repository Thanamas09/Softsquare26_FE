import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Order, Product } from '../../services/models';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-customer-menu',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customer-menu.html'
})
export class CustomerMenuComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  orders: Order[] = [];
  orderType = 'Dine-in';
  message = '';
  error = '';

  constructor(
    public auth: AuthService,
    private productsApi: ProductService,
    private ordersApi: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.auth.user) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.load();
  }

  load() {
    this.productsApi.getProducts().subscribe((products) => {
      this.products = products;
      this.cdr.detectChanges();
    });
    this.loadOrders();
  }

  loadOrders() {
    const user = this.auth.user;
    if (!user) {
      return;
    }
    this.ordersApi.getCustomerOrders(user.userId).subscribe((orders) => {
      this.orders = orders;
      this.cdr.detectChanges();
    });
  }

  order(product: Product) {
    const user = this.auth.user;
    if (!user) {
      return;
    }

    this.message = '';
    this.error = '';
    this.ordersApi.createOrder({
      customerId: user.userId,
      title: product.productName,
      description: `Order ${product.productName}`,
      type: this.orderType,
      items: [{ productId: product.productId, quantity: 1 }]
    }).subscribe({
      next: () => {
        this.message = 'สั่งอาหารแล้ว';
        this.loadOrders();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Order failed';
        this.cdr.detectChanges();
      }
    });
  }

  cancel(order: Order) {
    this.message = '';
    this.error = '';
    this.ordersApi.cancelOrder(order.orderId).subscribe({
      next: () => {
        this.message = 'ยกเลิกออเดอร์แล้ว';
        this.loadOrders();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Cancel failed';
        this.cdr.detectChanges();
      }
    });
  }
}
