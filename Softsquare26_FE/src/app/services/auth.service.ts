import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { User } from './models';

interface LoginResponse {
  token: string;
  data: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:5124/api';
  private readonly browser: boolean;
  private readonly userSubject = new BehaviorSubject<User | null>(null);

  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.browser = isPlatformBrowser(platformId);
    if (this.browser) {
      const saved = localStorage.getItem('user');
      this.userSubject.next(saved ? JSON.parse(saved) : null);
    }
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  get token(): string {
    return this.browser ? localStorage.getItem('token') || '' : '';
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/Users/login`, { email, password }).pipe(
      tap((res) => this.saveSession(res.token, res.data))
    );
  }

  register(fullName: string, email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/Users/register`, { fullName, email, password }).pipe(
      tap((res) => this.saveSession(res.token, res.data))
    );
  }

  logout() {
    if (this.browser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.userSubject.next(null);
    this.router.navigateByUrl('/login');
  }

  private saveSession(token: string, user: User) {
    if (this.browser) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.userSubject.next(user);
  }
}
