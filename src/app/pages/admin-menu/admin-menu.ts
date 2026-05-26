import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Category, Product } from '../../services/models';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-menu',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-menu.html'
})
export class AdminMenuComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  categories: Category[] = [];
  editingId: number | null = null;
  message = '';
  error = '';

  form = this.fb.nonNullable.group({
    productName: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    categoryId: [1, Validators.required],
    imageUrl: [''],
    isAvailable: [true]
  });
  categoryForm = this.fb.nonNullable.group({
    categoryName: ['', Validators.required]
  });

  constructor(
    public auth: AuthService,
    private productsApi: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.auth.user?.role !== 'Admin') {
      this.router.navigateByUrl('/login');
      return;
    }
    this.load();
  }

  load() {
    this.productsApi.getProducts().subscribe((products) => {
      this.products = products;
      this.cdr.detectChanges();
    });
    this.productsApi.getCategories().subscribe((categories) => {
      this.categories = categories;
      if (categories.length && !this.editingId) {
        this.form.patchValue({ categoryId: categories[0].categoryId });
      }
      this.cdr.detectChanges();
    });
  }

  save() {
    this.message = '';
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request = this.editingId
      ? this.productsApi.updateProduct(this.editingId, value)
      : this.productsApi.createProduct(value);

    request.subscribe({
      next: () => {
        this.message = this.editingId ? 'แก้ไขเมนูแล้ว' : 'เพิ่มเมนูแล้ว';
        this.reset();
        this.load();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Save failed';
        this.cdr.detectChanges();
      }
    });
  }

  addCategory() {
    this.message = '';
    this.error = '';
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.productsApi.createCategory(this.categoryForm.getRawValue().categoryName).subscribe({
      next: () => {
        this.message = 'เพิ่มหมวดหมู่แล้ว';
        this.categoryForm.reset({ categoryName: '' });
        this.load();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Category save failed';
        this.cdr.detectChanges();
      }
    });
  }

  edit(product: Product) {
    this.editingId = product.productId;
    this.form.setValue({
      productName: product.productName,
      price: product.price,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl || '',
      isAvailable: product.isAvailable
    });
  }

  delete(product: Product) {
    this.message = '';
    this.error = '';
    this.productsApi.deleteProduct(product.productId).subscribe({
      next: () => {
        this.message = 'ลบเมนูแล้ว';
        this.load();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Delete failed';
        this.cdr.detectChanges();
      }
    });
  }

  reset() {
    this.editingId = null;
    this.form.reset({
      productName: '',
      price: 0,
      categoryId: this.categories[0]?.categoryId || 1,
      imageUrl: '',
      isAvailable: true
    });
  }
}
