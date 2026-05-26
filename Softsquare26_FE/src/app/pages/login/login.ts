import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  mode: 'login' | 'register' = 'login';
  error = '';

  form = this.fb.nonNullable.group({
    fullName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  submit() {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { fullName, email, password } = this.form.getRawValue();
    const request = this.mode === 'login'
      ? this.auth.login(email, password)
      : this.auth.register(fullName || 'Customer', email, password);

    request.subscribe({
      next: ({ data }) => {
        const path = data.role === 'Admin' ? '/admin/dashboard' : '/customer/menu';
        this.router.navigateByUrl(path);
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Login failed';
        this.cdr.detectChanges();
      }
    });
  }
}
