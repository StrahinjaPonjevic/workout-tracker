import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { WorkoutService } from '../../../core/services/workout.service';
import { CreateWorkoutRequest, ExerciseType, ExerciseTypeLabels, UpdateWorkoutRequest, Workout } from '../../../core/models/workout.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-workout-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconComponent
  ],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
        <!-- Backdrop click area -->
        <div class="fixed inset-0" (click)="onClose()"></div>

        <!-- Modal Dialog -->
        <div class="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg z-10 space-y-5 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 class="text-lg font-semibold tracking-tight text-foreground">
                {{ workoutToEdit ? 'Izmena treninga' : 'Zabeleži novi trening' }}
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                Popunite detalje o odrađenoj fizičkoj aktivnosti
              </p>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <app-icon name="x" class="h-4 w-4" />
            </button>
          </div>

          <!-- Error Alert -->
          @if (errorMessage()) {
            <div class="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              <app-icon name="alert-circle" class="h-4 w-4 shrink-0 mt-0.5" />
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Exercise Type -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-foreground">Vrsta vežbe</label>
              <select
                formControlName="exerciseType"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                @for (type of exerciseTypes; track type.value) {
                  <option [value]="type.value">{{ type.label }}</option>
                }
              </select>
            </div>

            <!-- Duration & Calories Row -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-foreground">Trajanje (minuti)</label>
                <input
                  type="number"
                  formControlName="durationMinutes"
                  min="1"
                  placeholder="npr. 60"
                  class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  [class.border-destructive]="isFieldInvalid('durationMinutes')"
                />
                @if (isFieldInvalid('durationMinutes')) {
                  <p class="text-[11px] text-destructive">Trajanje mora biti veće od 0.</p>
                }
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-medium text-foreground">Potrošene kalorije (kcal)</label>
                <input
                  type="number"
                  formControlName="caloriesBurned"
                  min="0"
                  placeholder="npr. 450"
                  class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  [class.border-destructive]="isFieldInvalid('caloriesBurned')"
                />
                @if (isFieldInvalid('caloriesBurned')) {
                  <p class="text-[11px] text-destructive">Kalorije ne mogu biti negativne.</p>
                }
              </div>
            </div>

            <!-- Difficulty Slider (1 - 10) -->
            <div class="space-y-2 rounded-lg border border-border p-3 bg-secondary/30">
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium text-foreground">Težina treninga</span>
                <span class="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {{ form.get('difficulty')?.value }}/10
                </span>
              </div>
              <input
                type="range"
                formControlName="difficulty"
                min="1"
                max="10"
                step="1"
                class="w-full accent-primary cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-muted-foreground">
                <span>1 - Veoma lagano</span>
                <span>5 - Srednje</span>
                <span>10 - Maksimalan napor</span>
              </div>
            </div>

            <!-- Fatigue Slider (1 - 10) -->
            <div class="space-y-2 rounded-lg border border-border p-3 bg-secondary/30">
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium text-foreground">Nivo umora posle treninga</span>
                <span class="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {{ form.get('fatigue')?.value }}/10
                </span>
              </div>
              <input
                type="range"
                formControlName="fatigue"
                min="1"
                max="10"
                step="1"
                class="w-full accent-primary cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-muted-foreground">
                <span>1 - Potpuno svež</span>
                <span>5 - Umeren umor</span>
                <span>10 - Iscrpljen</span>
              </div>
            </div>

            <!-- Workout Date & Time -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-foreground">Datum i vreme treninga</label>
              <input
                type="datetime-local"
                formControlName="workoutDate"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                [class.border-destructive]="isFieldInvalid('workoutDate')"
              />
              @if (isFieldInvalid('workoutDate')) {
                <p class="text-[11px] text-destructive">Datum i vreme su obavezni.</p>
              }
            </div>

            <!-- Notes -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-medium text-foreground">
                <span>Dodatne beleške</span>
                <span class="text-muted-foreground text-[11px]">
                  {{ (form.get('notes')?.value || '').length }}/500
                </span>
              </div>
              <textarea
                formControlName="notes"
                rows="3"
                maxlength="500"
                placeholder="Unesite zabeleške o serijama, ponavljanjima, formi ili osećaju..."
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              ></textarea>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                (click)="onClose()"
                [disabled]="isLoading()"
                class="rounded-md border border-input bg-background px-4 py-2 text-xs font-medium text-foreground shadow-sm hover:bg-secondary transition-colors"
              >
                Otkaži
              </button>
              <button
                type="submit"
                [disabled]="isLoading() || form.invalid"
                class="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                @if (isLoading()) {
                  <app-icon name="loader" class="h-3.5 w-3.5 animate-spin" />
                  <span>Čuvanje...</span>
                } @else {
                  <span>{{ workoutToEdit ? 'Sačuvaj izmene' : 'Dodaj trening' }}</span>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class WorkoutModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() workoutToEdit: Workout | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly workoutService = inject(WorkoutService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly exerciseTypes = [
    { value: ExerciseType.Strength, label: ExerciseTypeLabels[ExerciseType.Strength] },
    { value: ExerciseType.Cardio, label: ExerciseTypeLabels[ExerciseType.Cardio] },
    { value: ExerciseType.Flexibility, label: ExerciseTypeLabels[ExerciseType.Flexibility] },
    { value: ExerciseType.Other, label: ExerciseTypeLabels[ExerciseType.Other] }
  ];

  readonly form = this.fb.nonNullable.group({
    exerciseType: [ExerciseType.Strength, [Validators.required]],
    durationMinutes: [60, [Validators.required, Validators.min(1)]],
    caloriesBurned: [400, [Validators.required, Validators.min(0)]],
    difficulty: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
    fatigue: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
    workoutDate: [this.formatDateForInput(new Date()), [Validators.required]],
    notes: ['', [Validators.maxLength(500)]]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.errorMessage.set(null);
      if (this.workoutToEdit) {
        this.form.patchValue({
          exerciseType: this.workoutToEdit.exerciseType,
          durationMinutes: this.workoutToEdit.durationMinutes,
          caloriesBurned: this.workoutToEdit.caloriesBurned,
          difficulty: this.workoutToEdit.difficulty,
          fatigue: this.workoutToEdit.fatigue,
          workoutDate: this.formatDateForInput(new Date(this.workoutToEdit.workoutDate)),
          notes: this.workoutToEdit.notes || ''
        });
      } else {
        this.form.reset({
          exerciseType: ExerciseType.Strength,
          durationMinutes: 60,
          caloriesBurned: 400,
          difficulty: 5,
          fatigue: 5,
          workoutDate: this.formatDateForInput(new Date()),
          notes: ''
        });
      }
    }
  }

  isFieldInvalid(name: string): boolean {
    const field = this.form.get(name);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValues = this.form.getRawValue();
    const payload: CreateWorkoutRequest | UpdateWorkoutRequest = {
      exerciseType: Number(formValues.exerciseType),
      durationMinutes: Number(formValues.durationMinutes),
      caloriesBurned: Number(formValues.caloriesBurned),
      difficulty: Number(formValues.difficulty),
      fatigue: Number(formValues.fatigue),
      notes: formValues.notes ? formValues.notes.trim() : null,
      workoutDate: new Date(formValues.workoutDate).toISOString()
    };

    const request$: Observable<unknown> = this.workoutToEdit
      ? this.workoutService.update(this.workoutToEdit.id, payload)
      : this.workoutService.create(payload);

    request$.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.saved.emit();
        this.onClose();
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const message = err.error?.message || 'Došlo je do greške prilikom čuvanja treninga.';
        this.errorMessage.set(message);
      }
    });
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
