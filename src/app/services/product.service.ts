import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiMessageResponse, Category, Product, ProductInput } from './models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly apiUrl = 'http://localhost:5124/api';

  constructor(private http: HttpClient) {}

  getProducts() {
    return this.http.get<Product[]>(`${this.apiUrl}/Products`);
  }

  getProduct(id: number) {
    return this.http.get<Product>(`${this.apiUrl}/Products/${id}`);
  }

  getCategories() {
    return this.http.get<Category[]>(`${this.apiUrl}/Categories`);
  }

  createCategory(categoryName: string) {
    return this.http.post<ApiMessageResponse<Category>>(`${this.apiUrl}/Categories`, { categoryName });
  }

  updateCategory(id: number, categoryName: string) {
    return this.http.put<ApiMessageResponse<Category>>(`${this.apiUrl}/Categories/${id}`, { categoryName });
  }

  deleteCategory(id: number) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/Categories/${id}`);
  }

  createProduct(product: ProductInput) {
    return this.http.post<ApiMessageResponse<Product>>(`${this.apiUrl}/Products`, product);
  }

  updateProduct(id: number, product: ProductInput) {
    return this.http.put<ApiMessageResponse<Product>>(`${this.apiUrl}/Products/${id}`, product);
  }

  deleteProduct(id: number) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/Products/${id}`);
  }
}
