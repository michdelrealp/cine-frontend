import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../interfaces/movie'; // Importamos la interfaz

@Injectable({ providedIn: 'root' })
export class MovieService { // <--- Fíjate que ahora se llama MovieService
  private http = inject(HttpClient);
  
  // Esta es la dirección donde vive tu Laravel
  private apiUrl = 'https://cine-backend-production-acb6.up.railway.app/api/movies'; 

  getMovies(): Observable<Movie[]> { return this.http.get<Movie[]>(this.apiUrl); }
  
  createMovie(movie: Movie): Observable<Movie> { return this.http.post<Movie>(this.apiUrl, movie); }
  
  updateMovie(id: number, movie: Movie): Observable<Movie> { return this.http.put<Movie>(`${this.apiUrl}/${id}`, movie); }
  
  deleteMovie(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }
}

export type { Movie };
