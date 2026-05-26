import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiMessageResponse, Order, OrderInput, OrderStatus } from './models';

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
    return this.http.post<ApiMessageResponse<Order>>(`${this.apiUrl}/Orders`, order);
  }

  updateOrder(id: number, order: OrderInput) {
    return this.http.put<{ message: string }>(`${this.apiUrl}/Orders/${id}`, order);
  }

  updateStatus(id: number, status: OrderStatus) {
    return this.http.patch<{ message: string; orderId: number; status: OrderStatus }>(`${this.apiUrl}/Orders/${id}/status`, { status });
  }

  cancelOrder(id: number) {
    return this.http.patch<{ message: string; orderId: number; status: OrderStatus }>(`${this.apiUrl}/Orders/${id}/cancel`, {});
  }

  deleteOrder(id: number) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/Orders/${id}`);
  }
}
