import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiMessageResponse, User } from './models';

export interface UserInput {
  fullName: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = 'http://localhost:5124/api';

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<User[]>(`${this.apiUrl}/Users`);
  }

  updateUser(id: number, user: UserInput) {
    return this.http.put<ApiMessageResponse<User>>(`${this.apiUrl}/Users/${id}`, user);
  }

  deleteUser(id: number) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/Users/${id}`);
  }
}
