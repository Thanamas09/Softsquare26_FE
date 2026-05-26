import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Category, Product } from '../../services/models';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-menu',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-menu.html'
})
export class AdminMenuComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  categories: Category[] = [];
  editingId: number | null = null;
  editingCategoryId: number | null = null;
  searchTerm = '';
  selectedCategoryId = 0;
  availabilityFilter: 'All' | 'Available' | 'Unavailable' = 'All';
  message = '';
  error = '';
  loading = false;

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

  get filteredProducts(): Product[] {
    const keyword = this.searchTerm.trim().toLowerCase();

    return this.products.filter((product) => {
      const matchesKeyword = !keyword
        || product.productName.toLowerCase().includes(keyword)
        || product.categoryName.toLowerCase().includes(keyword)
        || String(product.productId).includes(keyword);
      const matchesCategory = !this.selectedCategoryId || product.categoryId === Number(this.selectedCategoryId);
      const matchesAvailability = this.availabilityFilter === 'All'
        || (this.availabilityFilter === 'Available' && product.isAvailable)
        || (this.availabilityFilter === 'Unavailable' && !product.isAvailable);
      return matchesKeyword && matchesCategory && matchesAvailability;
    });
  }

  get availableCount(): number {
    return this.products.filter((product) => product.isAvailable).length;
  }

  load() {
    this.loading = true;
    this.error = '';

    this.productsApi.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => this.setLoadError(err, 'โหลดสินค้าไม่ได้')
    });

    this.productsApi.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        if (categories.length && !this.editingId) {
          this.form.patchValue({ categoryId: categories[0].categoryId });
        }
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => this.setLoadError(err, 'โหลดหมวดหมู่ไม่ได้')
    });
  }

  saveProduct() {
    this.message = '';
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload = {
      ...value,
      productName: value.productName.trim(),
      imageUrl: value.imageUrl.trim()
    };

    const request = this.editingId
      ? this.productsApi.updateProduct(this.editingId, payload)
      : this.productsApi.createProduct(payload);

    request.subscribe({
      next: () => {
        this.message = this.editingId ? 'แก้ไขเมนูแล้ว' : 'เพิ่มเมนูใหม่แล้ว';
        this.resetProduct();
        this.load();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'บันทึกเมนูไม่สำเร็จ';
        this.cdr.detectChanges();
      }
    });
  }

  saveCategory() {
    this.message = '';
    this.error = '';
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const categoryName = this.categoryForm.getRawValue().categoryName.trim();
    const request = this.editingCategoryId
      ? this.productsApi.updateCategory(this.editingCategoryId, categoryName)
      : this.productsApi.createCategory(categoryName);

    request.subscribe({
      next: () => {
        this.message = this.editingCategoryId ? 'แก้ไขหมวดหมู่แล้ว' : 'เพิ่มหมวดหมู่แล้ว';
        this.resetCategory();
        this.load();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'บันทึกหมวดหมู่ไม่สำเร็จ';
        this.cdr.detectChanges();
      }
    });
  }

  editProduct(product: Product) {
    this.editingId = product.productId;
    this.form.setValue({
      productName: product.productName,
      price: product.price,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl || '',
      isAvailable: product.isAvailable
    });
  }

  deleteProduct(product: Product) {
    this.message = '';
    this.error = '';
    this.productsApi.deleteProduct(product.productId).subscribe({
      next: () => {
        this.message = `ลบ ${product.productName} แล้ว`;
        this.load();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'ลบเมนูไม่สำเร็จ อาจมีออเดอร์อ้างอิงเมนูนี้อยู่';
        this.cdr.detectChanges();
      }
    });
  }

  editCategory(category: Category) {
    this.editingCategoryId = category.categoryId;
    this.categoryForm.setValue({ categoryName: category.categoryName });
  }

  deleteCategory(category: Category) {
    this.message = '';
    this.error = '';
    this.productsApi.deleteCategory(category.categoryId).subscribe({
      next: () => {
        this.message = `ลบหมวดหมู่ ${category.categoryName} แล้ว`;
        this.load();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'ลบหมวดหมู่ไม่สำเร็จ อาจมีเมนูใช้งานอยู่';
        this.cdr.detectChanges();
      }
    });
  }

  resetProduct() {
    this.editingId = null;
    this.form.reset({
      productName: '',
      price: 0,
      categoryId: this.categories[0]?.categoryId || 1,
      imageUrl: '',
      isAvailable: true
    });
  }

  resetCategory() {
    this.editingCategoryId = null;
    this.categoryForm.reset({ categoryName: '' });
  }

  private setLoadError(err: HttpErrorResponse, fallback: string) {
    this.loading = false;
    this.error = err.error?.message || `${fallback} — เช็กว่า Backend รันที่ http://localhost:5124 แล้วหรือยัง`;
    this.cdr.detectChanges();
  }
}
