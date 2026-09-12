import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { WorkoutModalComponent } from './workout-modal/workout-modal.component';
import { WorkoutService } from '../../core/services/workout.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import {
  ExerciseType,
  ExerciseTypeBadges,
  ExerciseTypeLabels,
  Workout
} from '../../core/models/workout.models';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    NavbarComponent,
    WorkoutModalComponent,
    IconComponent
  ],
  template: `
    <div class="min-h-screen bg-background flex flex-col">
      <!-- Top Navigation -->
      <app-navbar />

      <!-- Main Content -->
      <main class="flex-1 container py-8 space-y-8">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Moji treninzi
            </h1>
            <p class="text-sm text-muted-foreground mt-1">
              Evidencija, praćenje i analiza vaših treninga
            </p>
          </div>

          <button
            (click)="openCreateModal()"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          >
            <app-icon name="plus" class="h-4 w-4" />
            <span>Zabeleži trening</span>
          </button>
        </div>

        <!-- Dashboard KPI Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Workouts -->
          <div class="rounded-xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
            <div class="space-y-1">
              <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ukupno treninga
              </span>
              <div class="text-2xl font-bold text-foreground">
                {{ workouts().length }}
              </div>
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <app-icon name="activity" class="h-5 w-5" />
            </div>
          </div>

          <!-- Total Duration -->
          <div class="rounded-xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
            <div class="space-y-1">
              <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ukupno trajanje
              </span>
              <div class="text-2xl font-bold text-foreground">
                {{ totalMinutes() }}
                <span class="text-sm font-normal text-muted-foreground">min</span>
              </div>
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <app-icon name="clock" class="h-5 w-5" />
            </div>
          </div>

          <!-- Total Calories -->
          <div class="rounded-xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
            <div class="space-y-1">
              <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Potrošene kalorije
              </span>
              <div class="text-2xl font-bold text-foreground">
                {{ totalCalories() | number }}
                <span class="text-sm font-normal text-muted-foreground">kcal</span>
              </div>
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <app-icon name="flame" class="h-5 w-5" />
            </div>
          </div>

          <!-- Average Difficulty -->
          <div class="rounded-xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
            <div class="space-y-1">
              <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Prosečna težina
              </span>
              <div class="text-2xl font-bold text-foreground">
                {{ averageDifficulty() }}
                <span class="text-sm font-normal text-muted-foreground">/ 10</span>
              </div>
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20">
              <app-icon name="trending-up" class="h-5 w-5" />
            </div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border">
          <button
            (click)="selectedFilter.set('ALL')"
            [class.bg-primary]="selectedFilter() === 'ALL'"
            [class.text-primary-foreground]="selectedFilter() === 'ALL'"
            [class.bg-secondary]="selectedFilter() !== 'ALL'"
            [class.text-muted-foreground]="selectedFilter() !== 'ALL'"
            class="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors hover:text-foreground"
          >
            <span>Svi treninzi</span>
            <span
              class="rounded px-1.5 py-0.5 text-[10px] font-semibold"
              [ngClass]="selectedFilter() === 'ALL' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'"
            >
              {{ workouts().length }}
            </span>
          </button>

          @for (option of filterOptions; track option.value) {
            <button
              (click)="selectedFilter.set(option.value)"
              [class.bg-primary]="selectedFilter() === option.value"
              [class.text-primary-foreground]="selectedFilter() === option.value"
              [class.bg-secondary]="selectedFilter() !== option.value"
              [class.text-muted-foreground]="selectedFilter() !== option.value"
              class="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors hover:text-foreground shrink-0"
            >
              <span>{{ option.label }}</span>
              <span
                class="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                [ngClass]="selectedFilter() === option.value ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'"
              >
                {{ countForType(option.value) }}
              </span>
            </button>
          }
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-16 text-muted-foreground space-y-3">
            <app-icon name="loader" class="h-8 w-8 animate-spin text-primary" />
            <p class="text-sm">Učitavanje treninga...</p>
          </div>
        }

        <!-- Empty State -->
        @else if (filteredWorkouts().length === 0) {
          <div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 px-4 text-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-4">
              <app-icon name="dumbbell" class="h-6 w-6" />
            </div>
            <h3 class="text-base font-semibold text-foreground">Nema pronađenih treninga</h3>
            <p class="text-xs text-muted-foreground mt-1 max-w-sm">
              @if (selectedFilter() !== 'ALL') {
                Nema zabeleženih treninga za izabranu kategoriju.
              } @else {
                Još uvek niste zabeležili nijedan trening. Kliknite na dugme ispod da zabeležite svoj prvi trening!
              }
            </p>
            @if (selectedFilter() === 'ALL') {
              <button
                (click)="openCreateModal()"
                class="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
              >
                <app-icon name="plus" class="h-3.5 w-3.5" />
                <span>Zabeleži prvi trening</span>
              </button>
            }
          </div>
        }

        <!-- Workouts Grid -->
        @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (workout of filteredWorkouts(); track workout.id) {
              <div class="rounded-xl border border-border bg-card p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full">
                <!-- Top Content -->
                <div class="space-y-3.5">
                  <!-- Card Header -->
                  <div class="flex items-center justify-between gap-3">
                    <span
                      class="inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold"
                      [ngClass]="[
                        getBadge(workout.exerciseType).bg,
                        getBadge(workout.exerciseType).text,
                        getBadge(workout.exerciseType).border
                      ]"
                    >
                      {{ getLabel(workout.exerciseType) }}
                    </span>

                    <div class="flex items-center gap-1">
                      <button
                        (click)="openEditModal(workout)"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        title="Izmeni trening"
                      >
                        <app-icon name="pencil" class="h-4 w-4" />
                      </button>
                      <button
                        (click)="confirmDelete(workout)"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Obriši trening"
                      >
                        <app-icon name="trash" class="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Date -->
                  <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <app-icon name="calendar" class="h-3.5 w-3.5" />
                    <span>{{ (workout.workoutDate | date: 'dd.MM.yyyy. HH:mm') || workout.workoutDate }}</span>
                  </div>

                  <!-- Duration & Calories -->
                  <div class="grid grid-cols-2 gap-2 py-2 border-y border-border/60">
                    <div class="flex items-center gap-2.5">
                      <div class="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-muted-foreground shrink-0">
                        <app-icon name="clock" class="h-4 w-4" />
                      </div>
                      <div class="min-w-0">
                        <div class="text-[11px] text-muted-foreground">Trajanje</div>
                        <div class="text-sm font-semibold text-foreground truncate">{{ workout.durationMinutes }} min</div>
                      </div>
                    </div>

                    <div class="flex items-center gap-2.5">
                      <div class="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-500 shrink-0">
                        <app-icon name="flame" class="h-4 w-4" />
                      </div>
                      <div class="min-w-0">
                        <div class="text-[11px] text-muted-foreground">Kalorije</div>
                        <div class="text-sm font-semibold text-foreground truncate">{{ workout.caloriesBurned }} kcal</div>
                      </div>
                    </div>
                  </div>

                  <!-- Difficulty & Fatigue Bars -->
                  <div class="space-y-2 pt-1 text-xs">
                    <!-- Difficulty -->
                    <div>
                      <div class="flex justify-between text-[11px] mb-1">
                        <span class="text-muted-foreground">Težina:</span>
                        <span class="font-semibold text-foreground">{{ workout.difficulty }}/10</span>
                      </div>
                      <div class="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div
                          class="bg-primary h-1.5 rounded-full transition-all duration-300"
                          [style.width.%]="workout.difficulty * 10"
                        ></div>
                      </div>
                    </div>

                    <!-- Fatigue -->
                    <div>
                      <div class="flex justify-between text-[11px] mb-1">
                        <span class="text-muted-foreground">Umor:</span>
                        <span class="font-semibold text-foreground">{{ workout.fatigue }}/10</span>
                      </div>
                      <div class="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div
                          class="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                          [style.width.%]="workout.fatigue * 10"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Notes Container (Always present and aligned across all cards) -->
                <div class="pt-3 border-t border-border/40 mt-3">
                  @if (workout.notes && workout.notes.trim()) {
                    <div class="rounded-md bg-secondary/50 border border-border/40 p-2.5 text-xs text-foreground/80 italic min-h-[42px] flex items-center">
                      <span class="line-clamp-2">"{{ workout.notes.trim() }}"</span>
                    </div>
                  } @else {
                    <div class="rounded-md border border-dashed border-border/60 p-2.5 text-xs text-muted-foreground/45 italic min-h-[42px] flex items-center justify-center select-none">
                      <span>Nema zabeleženih napomena</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </main>

      <!-- Workout Create/Edit Modal -->
      <app-workout-modal
        [isOpen]="isModalOpen()"
        [workoutToEdit]="selectedWorkoutForEdit()"
        (close)="closeModal()"
        (saved)="loadWorkouts()"
      />

      <!-- Delete Confirmation Modal -->
      @if (workoutToDelete()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
          <div class="fixed inset-0" (click)="workoutToDelete.set(null)"></div>
          <div class="relative w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg z-10 space-y-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive shrink-0">
                <app-icon name="trash" class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-sm font-semibold text-foreground">Obriši trening</h3>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Da li ste sigurni da želite da obrišete ovaj trening? Ova akcija se ne može poništiti.
                </p>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                (click)="workoutToDelete.set(null)"
                class="rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Otkaži
              </button>
              <button
                type="button"
                (click)="executeDelete()"
                [disabled]="isDeleting()"
                class="inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-2 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                @if (isDeleting()) {
                  <app-icon name="loader" class="h-3 w-3 animate-spin" />
                  <span>Brisanje...</span>
                } @else {
                  <span>Obriši</span>
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class WorkoutsComponent implements OnInit {
  private readonly workoutService = inject(WorkoutService);

  readonly workouts = signal<Workout[]>([]);
  readonly isLoading = signal(true);
  readonly isDeleting = signal(false);

  readonly isModalOpen = signal(false);
  readonly selectedWorkoutForEdit = signal<Workout | null>(null);
  readonly workoutToDelete = signal<Workout | null>(null);

  readonly selectedFilter = signal<'ALL' | ExerciseType>('ALL');

  readonly filterOptions = [
    { value: ExerciseType.Strength, label: ExerciseTypeLabels[ExerciseType.Strength] },
    { value: ExerciseType.Cardio, label: ExerciseTypeLabels[ExerciseType.Cardio] },
    { value: ExerciseType.Flexibility, label: ExerciseTypeLabels[ExerciseType.Flexibility] },
    { value: ExerciseType.Other, label: ExerciseTypeLabels[ExerciseType.Other] }
  ];

  readonly filteredWorkouts = computed(() => {
    const list = this.workouts();
    const filter = this.selectedFilter();
    if (filter === 'ALL') return list;
    return list.filter(w => Number(w.exerciseType) === Number(filter));
  });

  readonly totalMinutes = computed(() =>
    this.workouts().reduce((acc, w) => acc + (w.durationMinutes || 0), 0)
  );

  readonly totalCalories = computed(() =>
    this.workouts().reduce((acc, w) => acc + (w.caloriesBurned || 0), 0)
  );

  readonly averageDifficulty = computed(() => {
    const list = this.workouts();
    if (list.length === 0) return 0;
    const avg = list.reduce((acc, w) => acc + (w.difficulty || 0), 0) / list.length;
    return Math.round(avg * 10) / 10;
  });

  ngOnInit(): void {
    this.loadWorkouts();
  }

  loadWorkouts(): void {
    this.isLoading.set(true);
    this.workoutService.getAll().subscribe({
      next: (data) => {
        const sanitized: Workout[] = (data || []).map(w => ({
          ...w,
          exerciseType: Number(w.exerciseType) as ExerciseType,
          durationMinutes: Number(w.durationMinutes) || 0,
          caloriesBurned: Number(w.caloriesBurned) || 0,
          difficulty: Number(w.difficulty) || 0,
          fatigue: Number(w.fatigue) || 0
        }));
        this.workouts.set(sanitized);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  countForType(type: ExerciseType): number {
    return this.workouts().filter(w => Number(w.exerciseType) === Number(type)).length;
  }

  getLabel(type: any): string {
    const numericType = Number(type);
    if (numericType === ExerciseType.Strength || type === 'Strength' || type === 'Strenght') return 'Trening snage';
    if (numericType === ExerciseType.Cardio || type === 'Cardio') return 'Kardio';
    if (numericType === ExerciseType.Flexibility || type === 'Flexibility') return 'Fleksibilnost';
    return 'Ostalo';
  }

  getBadge(type: any) {
    const numericType = Number(type);
    if (numericType === ExerciseType.Strength || type === 'Strength' || type === 'Strenght') {
      return ExerciseTypeBadges[ExerciseType.Strength];
    }
    if (numericType === ExerciseType.Cardio || type === 'Cardio') {
      return ExerciseTypeBadges[ExerciseType.Cardio];
    }
    if (numericType === ExerciseType.Flexibility || type === 'Flexibility') {
      return ExerciseTypeBadges[ExerciseType.Flexibility];
    }
    return ExerciseTypeBadges[ExerciseType.Other];
  }

  openCreateModal(): void {
    this.selectedWorkoutForEdit.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(workout: Workout): void {
    this.selectedWorkoutForEdit.set(workout);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedWorkoutForEdit.set(null);
  }

  confirmDelete(workout: Workout): void {
    this.workoutToDelete.set(workout);
  }

  executeDelete(): void {
    const workout = this.workoutToDelete();
    if (!workout) return;

    this.isDeleting.set(true);
    this.workoutService.delete(workout.id).subscribe({
      next: () => {
        this.workouts.update(list => list.filter(w => w.id !== workout.id));
        this.isDeleting.set(false);
        this.workoutToDelete.set(null);
      },
      error: () => {
        this.isDeleting.set(false);
      }
    });
  }
}
