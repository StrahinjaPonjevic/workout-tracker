import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateWorkoutRequest,
  MonthlyStats,
  UpdateWorkoutRequest,
  Workout
} from '../models/workout.models';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Workouts`;

  getAll(): Observable<Workout[]> {
    return this.http.get<Workout[]>(this.apiUrl);
  }

  getById(id: string): Observable<Workout> {
    return this.http.get<Workout>(`${this.apiUrl}/${id}`);
  }

  create(workout: CreateWorkoutRequest): Observable<Workout> {
    return this.http.post<Workout>(this.apiUrl, workout);
  }

  update(id: string, workout: UpdateWorkoutRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, workout);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMonthlyStats(year: number, month: number): Observable<MonthlyStats> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    return this.http.get<MonthlyStats>(`${this.apiUrl}/stats`, { params });
  }
}
