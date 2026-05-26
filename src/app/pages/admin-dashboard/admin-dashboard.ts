import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardSummary, Order, OrderStatus, OrderType, Product, User } from '../../services/models';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  summary: DashboardSummary | null = null;
  orders: Order[] = [];
  products: Product[] = [];
  users: User[] = [];
  editingId: number | null = null;
  selectedStatus: 'All' | OrderStatus = 'All';
  searchTerm = '';
  message = '';
  error = '';
  loading = false;

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
    private usersApi: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.auth.user?.role !== 'Admin') {
      this.router.navigateByUrl('/login');
      return;
    }
    this.load();
  }

  get customerUsers(): User[] {
    return this.users.filter((user) => user.role === 'Customer');
  }

  get filteredOrders(): Order[] {
    const keyword = this.searchTerm.trim().toLowerCase();

    return this.orders.filter((order) => {
      const matchesStatus = this.selectedStatus === 'All' || order.status === this.selectedStatus;
      const matchesKeyword = !keyword
        || order.title.toLowerCase().includes(keyword)
        || order.customerName.toLowerCase().includes(keyword)
        || String(order.orderId).includes(keyword)
        || order.items.some((item) => item.productName.toLowerCase().includes(keyword));
      return matchesStatus && matchesKeyword;
    });
  }

  get editTotal(): number {
    const { productId, quantity } = this.form.getRawValue();
    const product = this.products.find((item) => item.productId === productId);
    return (product?.price || 0) * quantity;
  }

  load() {
    this.loading = true;
    this.error = '';

    this.dashboardApi.getSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => this.setLoadError(err, 'โหลด Dashboard ไม่ได้')
    });

    this.ordersApi.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => this.setLoadError(err, 'โหลด Orders ไม่ได้')
    });

    this.productsApi.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        if (products.length && !this.editingId) {
          this.form.patchValue({ productId: products[0].productId });
        }
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => this.setLoadError(err, 'โหลด Products ไม่ได้')
    });

    this.usersApi.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.cdr.detectChanges();
      },
      error: () => {
        this.users = [];
        this.cdr.detectChanges();
      }
    });
  }

  updateStatus(order: Order, event: Event) {
    const status = (event.target as HTMLSelectElement).value as OrderStatus;
    if (status === order.status) {
      return;
    }

    this.message = '';
    this.error = '';
    this.ordersApi.updateStatus(order.orderId, status).subscribe({
      next: () => {
        this.message = `อัปเดต Order #${order.orderId} เป็น ${status} แล้ว`;
        this.load();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'อัปเดตสถานะไม่สำเร็จ';
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
      type: value.type as OrderType,
      items: [{ productId: value.productId, quantity: value.quantity }]
    }).subscribe({
      next: () => {
        this.message = `แก้ไข Order #${this.editingId} แล้ว`;
        this.reset();
        this.load();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'แก้ไขออเดอร์ไม่สำเร็จ';
        this.cdr.detectChanges();
      }
    });
  }

  delete(order: Order) {
    this.message = '';
    this.error = '';
    this.ordersApi.deleteOrder(order.orderId).subscribe({
      next: () => {
        this.message = `ลบ Order #${order.orderId} แล้ว`;
        this.load();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'ลบออเดอร์ไม่สำเร็จ';
        this.cdr.detectChanges();
      }
    });
  }

  reset() {
    this.editingId = null;
    this.form.reset({
      customerId: this.customerUsers[0]?.userId || 0,
      title: '',
      description: '',
      type: 'Dine-in',
      productId: this.products[0]?.productId || 0,
      quantity: 1
    });
  }

  statusClass(status: Order['status']): string {
    return `status-${status.toLowerCase()}`;
  }

  private setLoadError(err: HttpErrorResponse, fallback: string) {
    this.loading = false;
    this.error = err.error?.message || `${fallback} — เช็กว่า Backend รันที่ http://localhost:5124 แล้วหรือยัง`;
    this.cdr.detectChanges();
  }
}
