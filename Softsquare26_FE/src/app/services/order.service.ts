import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order, OrderInput } from './models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly apiUrl = 'http://localhost:5124/api';

  constructor(private http: HttpClient) {}

  getOrders() {
    return this.http.get<Order[]>(`${this.apiUrl}/Orders`);
  }

  getCustomerOrders(customerId: number) {
    return this.http.get<Order[]>(`${this.apiUrl}/Orders/customer/${customerId}`);
  }

  createOrder(order: OrderInput) {
    return this.http.post<{ data: Order }>(`${this.apiUrl}/Orders`, order);
  }

  updateOrder(id: number, order: OrderInput) {
    return this.http.put(`${this.apiUrl}/Orders/${id}`, order);
  }

  updateStatus(id: number, status: string) {
    return this.http.patch(`${this.apiUrl}/Orders/${id}/status`, { status });
  }

  cancelOrder(id: number) {
    return this.http.patch(`${this.apiUrl}/Orders/${id}/cancel`, {});
  }

  deleteOrder(id: number) {
    return this.http.delete(`${this.apiUrl}/Orders/${id}`);
  }
}
