import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { ApiMessageResponse, User } from './models';

interface AuthResponse extends ApiMessageResponse<User> {
  token: string;
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
    this.restoreSession();
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.user && !!this.token;
  }

  get isAdmin(): boolean {
    return this.user?.role === 'Admin';
  }

  get token(): string {
    return this.browser ? localStorage.getItem('token') || '' : '';
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Users/login`, { email, password }).pipe(
      tap((res) => this.saveSession(res.token, res.data))
    );
  }

  register(fullName: string, email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Users/register`, { fullName, email, password }).pipe(
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

  initials(user: User | null = this.user): string {
    if (!user?.fullName) {
      return 'U';
    }

    return user.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'U';
  }

  private saveSession(token: string, user: User) {
    if (this.browser) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.userSubject.next(user);
  }

  private restoreSession() {
    if (!this.browser) {
      return;
    }

    const saved = localStorage.getItem('user');
    if (!saved) {
      return;
    }

    try {
      this.userSubject.next(JSON.parse(saved) as User);
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
}
