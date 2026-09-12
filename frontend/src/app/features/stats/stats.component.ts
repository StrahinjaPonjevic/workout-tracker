import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { WorkoutService } from '../../core/services/workout.service';
import { MonthlyStats } from '../../core/models/workout.models';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    RouterLink,
    NavbarComponent,
    IconComponent
  ],
  template: `
    <div class="min-h-screen bg-background flex flex-col">
      <!-- Navigation -->
      <app-navbar />

      <!-- Main Container -->
      <main class="flex-1 container py-8 space-y-8">
        <!-- Header & Month Navigator -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Statistika i napredak
            </h1>
            <p class="text-sm text-muted-foreground mt-1">
              Mesečni i nedeljni pregled performansi, sagorenih kalorija i opterećenja
            </p>
          </div>

          <!-- Month Selector Controls -->
          <div class="flex items-center gap-2">
            <button
              (click)="prevMonth()"
              class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              title="Prethodni mesec"
            >
              <app-icon name="chevron-left" class="h-4 w-4" />
            </button>

            <div class="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card shadow-xs">
              <app-icon name="calendar" class="h-4 w-4 text-muted-foreground" />
              <span class="text-sm font-semibold text-foreground min-w-[120px] text-center">
                {{ currentMonthName() }} {{ currentYear() }}
              </span>
            </div>

            <button
              (click)="nextMonth()"
              class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              title="Sledeći mesec"
            >
              <app-icon name="chevron-right" class="h-4 w-4" />
            </button>

            @if (!isCurrentMonthToday()) {
              <button
                (click)="jumpToCurrentMonth()"
                class="inline-flex h-9 items-center justify-center rounded-md border border-primary/20 bg-primary/10 px-3 text-xs font-medium text-primary shadow-xs transition-colors hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Danas
              </button>
            }
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-24 space-y-4">
            <app-icon name="loader" class="h-10 w-10 animate-spin text-primary" />
            <p class="text-sm text-muted-foreground animate-pulse">Učitavanje statistike...</p>
          </div>
        } @else {
          <!-- Monthly KPI Cards -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                <app-icon name="sparkles" class="h-4 w-4 text-primary" />
                <span>Mesečni zbir ({{ currentMonthName() }})</span>
              </h2>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <!-- Total Workouts -->
              <div class="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2 hover:border-primary/30 transition-colors">
                <div class="flex items-center justify-between text-muted-foreground">
                  <span class="text-xs font-medium uppercase tracking-wider">Treninzi</span>
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <app-icon name="activity" class="h-4 w-4" />
                  </div>
                </div>
                <div class="text-3xl font-bold text-foreground tracking-tight">
                  {{ stats()?.totalWorkouts ?? 0 }}
                </div>
                <p class="text-xs text-muted-foreground">
                  {{ (stats()?.totalWorkouts ?? 0) === 1 ? 'završen trening' : 'završenih treninga' }}
                </p>
              </div>

              <!-- Total Duration -->
              <div class="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2 hover:border-primary/30 transition-colors">
                <div class="flex items-center justify-between text-muted-foreground">
                  <span class="text-xs font-medium uppercase tracking-wider">Ukupno vreme</span>
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                    <app-icon name="clock" class="h-4 w-4" />
                  </div>
                </div>
                <div class="text-3xl font-bold text-foreground tracking-tight">
                  {{ formatDuration(stats()?.totalDurationMinutes ?? 0) }}
                </div>
                <p class="text-xs text-muted-foreground">
                  {{ stats()?.totalDurationMinutes ?? 0 }} min aktivnosti
                </p>
              </div>

              <!-- Total Calories -->
              <div class="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2 hover:border-primary/30 transition-colors">
                <div class="flex items-center justify-between text-muted-foreground">
                  <span class="text-xs font-medium uppercase tracking-wider">Kalorije</span>
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                    <app-icon name="flame" class="h-4 w-4" />
                  </div>
                </div>
                <div class="text-3xl font-bold text-foreground tracking-tight">
                  {{ (stats()?.totalCaloriesBurned ?? 0) | number }}
                  <span class="text-base font-normal text-muted-foreground">kcal</span>
                </div>
                <p class="text-xs text-muted-foreground">
                  ukupno sagoreno
                </p>
              </div>

              <!-- Average Difficulty -->
              <div class="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2 hover:border-primary/30 transition-colors">
                <div class="flex items-center justify-between text-muted-foreground">
                  <span class="text-xs font-medium uppercase tracking-wider">Prosečna težina</span>
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                    <app-icon name="trending-up" class="h-4 w-4" />
                  </div>
                </div>
                <div class="text-3xl font-bold text-foreground tracking-tight">
                  {{ formatScore(stats()?.averageDifficulty ?? 0) }}
                  <span class="text-base font-normal text-muted-foreground">/ 10</span>
                </div>
                <!-- Difficulty Progress Bar -->
                <div class="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    class="h-full bg-violet-500 rounded-full transition-all duration-500"
                    [style.width.%]="(stats()?.averageDifficulty ?? 0) * 10"
                  ></div>
                </div>
              </div>

              <!-- Average Fatigue -->
              <div class="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2 hover:border-primary/30 transition-colors">
                <div class="flex items-center justify-between text-muted-foreground">
                  <span class="text-xs font-medium uppercase tracking-wider">Prosečan umor</span>
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                    <app-icon name="dumbbell" class="h-4 w-4" />
                  </div>
                </div>
                <div class="text-3xl font-bold text-foreground tracking-tight">
                  {{ formatScore(stats()?.averageFatigue ?? 0) }}
                  <span class="text-base font-normal text-muted-foreground">/ 10</span>
                </div>
                <!-- Fatigue Progress Bar -->
                <div class="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    class="h-full bg-rose-500 rounded-full transition-all duration-500"
                    [style.width.%]="(stats()?.averageFatigue ?? 0) * 10"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Weekly Breakdown Section -->
          <div class="space-y-4 pt-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold tracking-tight text-foreground">
                  Nedeljni pregled
                </h2>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Pregled raspodele treninga po nedeljama u mesecu
                </p>
              </div>
            </div>

            @if ((stats()?.weeklyBreakdown?.length ?? 0) === 0 || (stats()?.totalWorkouts ?? 0) === 0) {
              <!-- Empty State -->
              <div class="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center space-y-4">
                <div class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <app-icon name="chart" class="h-7 w-7" />
                </div>
                <div class="space-y-1 max-w-sm mx-auto">
                  <h3 class="text-base font-semibold text-foreground">
                    Nema podataka za ovaj mesec
                  </h3>
                  <p class="text-xs text-muted-foreground">
                    Niste zabeležili nijedan trening tokom {{ currentMonthName() }} {{ currentYear() }}.
                  </p>
                </div>
                <div>
                  <a
                    routerLink="/workouts"
                    class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <span>Zabeleži trening</span>
                    <app-icon name="arrow-right" class="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            } @else {
              <!-- Weekly Cards Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                @for (week of stats()?.weeklyBreakdown; track week.weekNumber) {
                  <div class="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-primary/40 transition-colors">
                    <div class="space-y-3">
                      <!-- Week Header -->
                      <div class="flex items-center justify-between border-b border-border pb-3">
                        <div class="font-semibold text-foreground text-sm">
                          Nedelja {{ week.weekNumber }}
                        </div>
                        <span class="rounded bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground font-mono">
                          {{ week.dateRange }}
                        </span>
                      </div>

                      <!-- Key figures -->
                      <div class="grid grid-cols-3 gap-2 text-center py-1 bg-secondary/30 rounded-lg p-2">
                        <div>
                          <div class="text-[10px] text-muted-foreground uppercase">Treninzi</div>
                          <div class="text-base font-bold text-foreground">{{ week.totalWorkouts }}</div>
                        </div>
                        <div>
                          <div class="text-[10px] text-muted-foreground uppercase">Vreme</div>
                          <div class="text-base font-bold text-foreground">{{ formatDuration(week.totalDurationMinutes) }}</div>
                        </div>
                        <div>
                          <div class="text-[10px] text-muted-foreground uppercase">Kalorije</div>
                          <div class="text-base font-bold text-foreground">{{ week.totalCaloriesBurned }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Metrics bars -->
                    <div class="space-y-2.5 pt-2 border-t border-border">
                      <div>
                        <div class="flex items-center justify-between text-xs mb-1">
                          <span class="text-muted-foreground">Težina:</span>
                          <span class="font-medium text-foreground">{{ formatScore(week.averageDifficulty) }}/10</span>
                        </div>
                        <div class="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            class="h-full bg-violet-500 rounded-full transition-all duration-300"
                            [style.width.%]="week.averageDifficulty * 10"
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div class="flex items-center justify-between text-xs mb-1">
                          <span class="text-muted-foreground">Umor:</span>
                          <span class="font-medium text-foreground">{{ formatScore(week.averageFatigue) }}/10</span>
                        </div>
                        <div class="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            class="h-full bg-rose-500 rounded-full transition-all duration-300"
                            [style.width.%]="week.averageFatigue * 10"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </main>
    </div>
  `
})
export class StatsComponent implements OnInit {
  private readonly workoutService = inject(WorkoutService);

  readonly currentYear = signal<number>(new Date().getFullYear());
  readonly currentMonth = signal<number>(new Date().getMonth() + 1);
  readonly stats = signal<MonthlyStats | null>(null);
  readonly isLoading = signal<boolean>(false);

  readonly monthNames = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ];

  readonly currentMonthName = computed(() => this.monthNames[this.currentMonth() - 1]);

  readonly isCurrentMonthToday = computed(() => {
    const now = new Date();
    return this.currentYear() === now.getFullYear() && this.currentMonth() === (now.getMonth() + 1);
  });

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading.set(true);
    this.workoutService.getMonthlyStats(this.currentYear(), this.currentMonth()).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.stats.set(null);
        this.isLoading.set(false);
      }
    });
  }

  prevMonth(): void {
    if (this.currentMonth() === 1) {
      this.currentMonth.set(12);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
    this.loadStats();
  }

  nextMonth(): void {
    if (this.currentMonth() === 12) {
      this.currentMonth.set(1);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
    this.loadStats();
  }

  jumpToCurrentMonth(): void {
    const now = new Date();
    this.currentYear.set(now.getFullYear());
    this.currentMonth.set(now.getMonth() + 1);
    this.loadStats();
  }

  formatDuration(minutes: number): string {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    }
    if (hours > 0) {
      return `${hours}h`;
    }
    return `${mins} min`;
  }

  formatScore(value: number): string {
    if (!value || isNaN(value)) return '0.0';
    return Number(value).toFixed(1);
  }
}
