import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) return null;
  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IconComponent
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div class="w-full max-w-md space-y-6">
        <!-- Logo & Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs mb-1">
            <app-icon name="dumbbell" class="w-6 h-6" />
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground">
            Kreirajte novi nalog
          </h1>
          <p class="text-sm text-muted-foreground">
            Započnite praćenje vaših treninga i napretka
          </p>
        </div>

        <!-- Card Form -->
        <div class="rounded-xl border border-border bg-card p-8 shadow-sm">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Server Error Alert -->
            @if (errorMessage()) {
              <div class="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                <app-icon name="alert-circle" class="w-4 h-4 mt-0.5 shrink-0" />
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- Username -->
            <div class="space-y-1.5">
              <label for="username" class="text-sm font-medium text-foreground">
                Korisničko ime
              </label>
              <input
                id="username"
                type="text"
                formControlName="username"
                placeholder="npr. strahinja"
                autocomplete="username"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                [class.border-destructive]="isFieldInvalid('username')"
              />
              @if (isFieldInvalid('username')) {
                <p class="text-xs text-destructive">
                  @if (registerForm.get('username')?.errors?.['required']) {
                    Korisničko ime je obavezno.
                  } @else if (registerForm.get('username')?.errors?.['minlength']) {
                    Mora imati barem 3 karaktera.
                  }
                </p>
              }
            </div>

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
                  @if (registerForm.get('email')?.errors?.['required']) {
                    Email je obavezan.
                  } @else if (registerForm.get('email')?.errors?.['email']) {
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
                placeholder="Minimalno 6 karaktera"
                autocomplete="new-password"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                [class.border-destructive]="isFieldInvalid('password')"
              />
              @if (isFieldInvalid('password')) {
                <p class="text-xs text-destructive">
                  @if (registerForm.get('password')?.errors?.['required']) {
                    Lozinka je obavezna.
                  } @else if (registerForm.get('password')?.errors?.['minlength']) {
                    Mora imati barem 6 karaktera.
                  }
                </p>
              }
            </div>

            <!-- Confirm Password -->
            <div class="space-y-1.5">
              <label for="confirmPassword" class="text-sm font-medium text-foreground">
                Potvrda lozinke
              </label>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                placeholder="Ponovite lozinku"
                autocomplete="new-password"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                [class.border-destructive]="isFieldInvalid('confirmPassword') || (registerForm.errors?.['passwordMismatch'] && (registerForm.get('confirmPassword')?.dirty || registerForm.get('confirmPassword')?.touched))"
              />
              @if (registerForm.errors?.['passwordMismatch'] && (registerForm.get('confirmPassword')?.dirty || registerForm.get('confirmPassword')?.touched)) {
                <p class="text-xs text-destructive">
                  Lozinke se ne poklapaju.
                </p>
              }
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="isLoading() || registerForm.invalid"
              class="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (isLoading()) {
                <app-icon name="loader" class="w-4 h-4 animate-spin" />
                <span>Registracija...</span>
              } @else {
                <span>Registruj se</span>
              }
            </button>
          </form>
        </div>

        <!-- Footer Link -->
        <p class="text-center text-sm text-muted-foreground">
          Već imate nalog?
          <a routerLink="/login" class="font-medium text-primary hover:underline underline-offset-4 ml-1">
            Prijavite se
          </a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly registerForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: [passwordMatchValidator]
  });

  isFieldInvalid(field: 'username' | 'email' | 'password' | 'confirmPassword'): boolean {
    const control = this.registerForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { username, email, password } = this.registerForm.getRawValue();

    this.authService.register({ username, email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/workouts']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err.error?.message || 'Neuspešna registracija. Pokušajte ponovo.';
        this.errorMessage.set(message);
      }
    });
  }
}
