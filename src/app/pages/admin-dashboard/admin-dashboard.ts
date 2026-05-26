import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardSummary, Order, Product } from '../../services/models';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  summary: DashboardSummary | null = null;
  orders: Order[] = [];
  products: Product[] = [];
  editingId: number | null = null;
  message = '';
  error = '';

  form = this.fb.nonNullable.group({
    customerId: [0, [Validators.required, Validators.min(1)]],
    title: ['', Validators.required],
    description: [''],
    type: ['Dine-in', Validators.required],
    productId: [0, [Validators.required, Validators.min(1)]],
    quantity: [1, [Validators.required, Validators.min(1)]]
  });

  constructor(
    public auth: AuthService,
    private dashboardApi: DashboardService,
    private ordersApi: OrderService,
    private productsApi: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.auth.user?.role !== 'Admin') {
      this.router.navigateByUrl('/login');
      return;
    }
    this.load();
  }

  load() {
    this.dashboardApi.getSummary().subscribe((summary) => {
      this.summary = summary;
      this.cdr.detectChanges();
    });
    this.ordersApi.getOrders().subscribe((orders) => {
      this.orders = orders;
      this.cdr.detectChanges();
    });
    this.productsApi.getProducts().subscribe((products) => {
      this.products = products;
      if (products.length && !this.editingId) {
        this.form.patchValue({ productId: products[0].productId });
      }
      this.cdr.detectChanges();
    });
  }

  updateStatus(order: Order, event: Event) {
    const status = (event.target as HTMLSelectElement).value;
    this.message = '';
    this.error = '';
    this.ordersApi.updateStatus(order.orderId, status).subscribe({
      next: () => {
        this.message = 'อัปเดตสถานะแล้ว';
        this.load();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Status update failed';
        this.cdr.detectChanges();
      }
    });
  }

  edit(order: Order) {
    const item = order.items[0];
    this.editingId = order.orderId;
    this.form.setValue({
      customerId: order.customerId,
      title: order.title,
      description: order.description || '',
      type: order.type,
      productId: item?.productId || this.products[0]?.productId || 0,
      quantity: item?.quantity || 1
    });
  }

  save() {
    this.message = '';
    this.error = '';
    if (!this.editingId || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.ordersApi.updateOrder(this.editingId, {
      customerId: value.customerId,
      title: value.title,
      description: value.description,
      type: value.type,
      items: [{ productId: value.productId, quantity: value.quantity }]
    }).subscribe({
      next: () => {
        this.message = 'แก้ไขออเดอร์แล้ว';
        this.reset();
        this.load();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Order update failed';
        this.cdr.detectChanges();
      }
    });
  }

  delete(order: Order) {
    this.message = '';
    this.error = '';
    this.ordersApi.deleteOrder(order.orderId).subscribe({
      next: () => {
        this.message = 'ลบออเดอร์แล้ว';
        this.load();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Delete failed';
        this.cdr.detectChanges();
      }
    });
  }

  reset() {
    this.editingId = null;
    this.form.reset({
      customerId: 0,
      title: '',
      description: '',
      type: 'Dine-in',
      productId: this.products[0]?.productId || 0,
      quantity: 1
    });
  }
}
