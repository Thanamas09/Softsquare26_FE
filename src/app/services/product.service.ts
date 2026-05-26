import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category, Product, ProductInput } from './models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly apiUrl = 'http://localhost:5124/api';

  constructor(private http: HttpClient) {}

  getProducts() {
    return this.http.get<Product[]>(`${this.apiUrl}/Products`);
  }

  getCategories() {
    return this.http.get<Category[]>(`${this.apiUrl}/Categories`);
  }

  createCategory(categoryName: string) {
    return this.http.post<{ data: Category }>(`${this.apiUrl}/Categories`, { categoryName });
  }

  createProduct(product: ProductInput) {
    return this.http.post<{ data: Product }>(`${this.apiUrl}/Products`, product);
  }

  updateProduct(id: number, product: ProductInput) {
    return this.http.put<{ data: Product }>(`${this.apiUrl}/Products/${id}`, product);
  }

  deleteProduct(id: number) {
    return this.http.delete(`${this.apiUrl}/Products/${id}`);
  }
}
