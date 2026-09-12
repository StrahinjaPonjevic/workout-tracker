import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideDumbbell, LucideLoader2, LucideAlertCircle } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideDumbbell,
    LucideLoader2,
    LucideAlertCircle
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div class="w-full max-w-md space-y-6">
        <!-- Logo & Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground shadow-sm">
            <svg lucideDumbbell class="w-6 h-6"></svg>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground">
            Dobrodošli nazad
          </h1>
          <p class="text-sm text-muted-foreground">
            Prijavite se na vaš Workout Tracker nalog
          </p>
        </div>

        <!-- Card Form -->
        <div class="rounded-xl border border-border bg-card p-8 shadow-sm">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Server Error Alert -->
            @if (errorMessage()) {
              <div class="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                <svg lucideAlertCircle class="w-4 h-4 mt-0.5 shrink-0"></svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- Email -->
            <div class="space-y-1.5">
              <label for="email" class="text-sm font-medium text-foreground">
                Email adresa
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="ime@primer.com"
                autocomplete="email"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                [class.border-destructive]="isFieldInvalid('email')"
              />
              @if (isFieldInvalid('email')) {
                <p class="text-xs text-destructive">
                  @if (loginForm.get('email')?.errors?.['required']) {
                    Email je obavezan.
                  } @else if (loginForm.get('email')?.errors?.['email']) {
                    Unesite ispravnu email adresu.
                  }
                </p>
              }
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <label for="password" class="text-sm font-medium text-foreground">
                Lozinka
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="••••••••"
                autocomplete="current-password"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                [class.border-destructive]="isFieldInvalid('password')"
              />
              @if (isFieldInvalid('password')) {
                <p class="text-xs text-destructive">
                  Lozinka je obavezna.
                </p>
              }
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="isLoading() || loginForm.invalid"
              class="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (isLoading()) {
                <svg lucideLoader2 class="w-4 h-4 animate-spin"></svg>
                <span>Prijavljivanje...</span>
              } @else {
                <span>Prijavi se</span>
              }
            </button>
          </form>
        </div>

        <!-- Footer Link -->
        <p class="text-center text-sm text-muted-foreground">
          Nemate nalog?
          <a routerLink="/register" class="font-medium text-primary hover:underline underline-offset-4 ml-1">
            Registrujte se
          </a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  isFieldInvalid(fieldName: 'email' | 'password'): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/workouts']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err.error?.message || 'Neuspešna prijava. Proverite podatke i pokušajte ponovo.';
        this.errorMessage.set(message);
      }
    });
  }
}
