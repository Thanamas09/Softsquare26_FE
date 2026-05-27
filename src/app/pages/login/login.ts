import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  mode: 'login' | 'register' = 'login';
  error = '';
  loading = false;

  form = this.fb.nonNullable.group({
    fullName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn) {
      this.router.navigateByUrl(this.auth.isAdmin ? '/admin/dashboard' : '/customer/menu');
    }
  }

  submit() {
    this.error = '';

    if (this.mode === 'register' && !this.form.controls.fullName.value.trim()) {
      this.form.controls.fullName.setErrors({ required: true });
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { fullName, email, password } = this.form.getRawValue();
    const request = this.mode === 'login'
      ? this.auth.login(email.trim(), password)
      : this.auth.register(fullName.trim(), email.trim(), password);

    this.loading = true;
    request.subscribe({
      next: ({ data }) => {
        this.loading = false;
        const path = data.role === 'Admin' ? '/admin/dashboard' : '/customer/menu';
        this.router.navigateByUrl(path);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error = err.error?.message || 'เชื่อมต่อไม่ได้ / อีเมลหรือรหัสผ่านไม่ถูกต้อง';
        this.cdr.detectChanges();
      }
    });
  }

  switchMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.error = '';
    this.form.reset({ fullName: '', email: '', password: '' });
  }
}
