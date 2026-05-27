import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Order, OrderType, Product } from '../../services/models';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';

interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-customer-menu',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customer-menu.html'
})
export class CustomerMenuComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  orders: Order[] = [];
  cart: CartItem[] = [];
  orderType: OrderType = 'Dine-in';
  searchTerm = '';
  selectedCategory = 'All';
  message = '';
  error = '';
  loadingProducts = false;
  loadingOrders = false;
  submitting = false;

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

    if (this.auth.user.role === 'Admin') {
      this.router.navigateByUrl('/admin/dashboard');
      return;
    }

    this.load();
  }

  get categoryNames(): string[] {
    return Array.from(new Set(this.products.map((product) => product.categoryName).filter(Boolean))).sort();
  }

  get filteredProducts(): Product[] {
    const keyword = this.searchTerm.trim().toLowerCase();

    return this.products.filter((product) => {
      const matchKeyword = !keyword
        || product.productName.toLowerCase().includes(keyword)
        || product.categoryName.toLowerCase().includes(keyword);
      const matchCategory = this.selectedCategory === 'All' || product.categoryName === this.selectedCategory;
      return matchKeyword && matchCategory;
    });
  }

  get cartTotal(): number {
    return this.cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }

  get cartCount(): number {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  load() {
    this.loadingProducts = true;
    this.productsApi.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loadingProducts = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.loadingProducts = false;
        this.error = err.error?.message || 'โหลดเมนูไม่ได้ เช็กว่า Backend รันที่ http://localhost:5124 แล้วหรือยัง';
        this.cdr.detectChanges();
      }
    });
    this.loadOrders();
  }

  loadOrders() {
    const user = this.auth.user;
    if (!user) {
      return;
    }

    this.loadingOrders = true;
    this.ordersApi.getCustomerOrders(user.userId).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loadingOrders = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.loadingOrders = false;
        this.error = err.error?.message || 'โหลดออเดอร์ไม่ได้';
        this.cdr.detectChanges();
      }
    });
  }

  addToCart(product: Product) {
    if (!product.isAvailable) {
      return;
    }

    const existing = this.cart.find((item) => item.product.productId === product.productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ product, quantity: 1 });
    }
    this.message = '';
    this.error = '';
  }

  increase(item: CartItem) {
    item.quantity += 1;
  }

  decrease(item: CartItem) {
    if (item.quantity <= 1) {
      this.removeFromCart(item.product.productId);
      return;
    }
    item.quantity -= 1;
  }

  setQuantity(item: CartItem, event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    item.quantity = Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
  }

  removeFromCart(productId: number) {
    this.cart = this.cart.filter((item) => item.product.productId !== productId);
  }

  clearCart() {
    this.cart = [];
  }

  submitOrder() {
    const user = this.auth.user;
    if (!user || !this.cart.length) {
      return;
    }

    this.submitting = true;
    this.message = '';
    this.error = '';

    const itemSummary = this.cart.map((item) => `${item.product.productName} x${item.quantity}`).join(', ');

    this.ordersApi.createOrder({
      customerId: user.userId,
      title: this.cart.length === 1 ? this.cart[0].product.productName : `${this.cartCount} items order`,
      description: itemSummary,
      type: this.orderType,
      items: this.cart.map((item) => ({ productId: item.product.productId, quantity: item.quantity }))
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.message = 'สั่งอาหารสำเร็จแล้ว รอร้านอาหารยืนยันสถานะได้เลย';
        this.clearCart();
        this.loadOrders();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        this.error = err.error?.message || 'สั่งอาหารไม่สำเร็จ';
        this.cdr.detectChanges();
      }
    });
  }

  cancel(order: Order) {
    this.message = '';
    this.error = '';
    this.ordersApi.cancelOrder(order.orderId).subscribe({
      next: () => {
        this.message = `ยกเลิก Order #${order.orderId} แล้ว`;
        this.loadOrders();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'ยกเลิกออเดอร์ไม่สำเร็จ';
        this.cdr.detectChanges();
      }
    });
  }

  statusClass(status: Order['status']): string {
    return `status-${status.toLowerCase()}`;
  }
}
