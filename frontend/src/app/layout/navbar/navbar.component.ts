import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IconComponent
  ],
  template: `
    <header class="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-16 items-center justify-between">
        <!-- Logo & Navigation -->
        <div class="flex items-center gap-8">
          <a routerLink="/workouts" class="flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-colors hover:text-foreground/80">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <app-icon name="dumbbell" class="h-5 w-5" />
            </div>
            <span class="text-lg">Workout<span class="text-primary font-extrabold">Tracker</span></span>
          </a>

          <nav class="hidden md:flex items-center gap-1 text-sm font-medium">
            <a
              routerLink="/workouts"
              routerLinkActive="bg-secondary text-foreground font-semibold"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
            >
              <app-icon name="activity" class="h-4 w-4" />
              <span>Moji treninzi</span>
            </a>
            <a
              routerLink="/stats"
              routerLinkActive="bg-secondary text-foreground font-semibold"
              class="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
            >
              <app-icon name="chart" class="h-4 w-4" />
              <span>Statistika</span>
            </a>
          </nav>
        </div>

        <!-- User profile & Logout -->
        <div class="flex items-center gap-3">
          @if (authService.currentUser()?.username) {
            <div class="hidden sm:flex items-center gap-2 rounded-full border border-border bg-secondary/70 px-3 py-1.5 text-xs font-medium text-foreground shadow-xs">
              <div class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {{ authService.currentUser()!.username[0].toUpperCase() }}
              </div>
              <span>{{ authService.currentUser()!.username }}</span>
            </div>
          }

          <button
            (click)="authService.logout()"
            class="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-xs transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 focus:outline-none focus:ring-2 focus:ring-ring"
            title="Odjavi se"
          >
            <app-icon name="logout" class="h-3.5 w-3.5" />
            <span class="hidden sm:inline">Odjavi se</span>
          </button>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
}
