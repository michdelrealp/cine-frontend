import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // <--- IMPORTANTE
import { MovieService } from './services/movie.service';
import { Movie } from './interfaces/movie';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // OJO AQUÍ: He ajustado esto para que coincida con tus nombres de archivo
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  movieService = inject(MovieService);
  sanitizer = inject(DomSanitizer); // <--- el guardia de seguridad para URLs 

  movies = signal<Movie[]>([]);
  currentView = signal<string>('home');
  selectedMovie = signal<Movie | null>(null);
  
  //Variables para el video seguro
  safeTrailerUrl = signal<SafeResourceUrl | null>(null);

  formData: Movie = { name: '', synopsis: '', image: '', year: 2024, trailer_url: '' };
  isEditing = signal<boolean>(false);

  ngOnInit() { this.loadMovies(); }

  loadMovies() {
    this.movieService.getMovies().subscribe({
      next: (data) => this.movies.set(data),
      error: (e) => console.error('Error conectando a Laravel:', e)
    });
  }

  navigate(view: string) {
    this.currentView.set(view);
    if (view === 'catalog') {
      this.selectedMovie.set(null);
      this.safeTrailerUrl.set(null); // Limpiamos el video
    }
  }

  //-- Logica para youtube ---
  getSafeUrl(url: string | undefined): SafeResourceUrl | null {
    if (!url) return null;

    // Convertimos 'watch?v=ID' a 'embed/ID' para que funcione el iframe
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
    }

    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      // Le decimos a Angular: "Confía en este link, yo lo revisé"
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }
    return null;
  }

  goToDetail(movie: Movie) {
    this.selectedMovie.set(movie);
    // Procesamos el video al entrar al detalle
    this.safeTrailerUrl.set(this.getSafeUrl(movie.trailer_url));
    this.navigate('detail');
  }
  // -----------------------------------
  

  goToAdd() {
    this.formData = { name: '', synopsis: '', image: '', year: 2024, trailer_url: '' };
    this.isEditing.set(false);
    this.navigate('form');
  }

  goToEdit(movie: Movie) {
    this.formData = { ...movie };
    this.isEditing.set(true);
    this.navigate('form');
  }

  deleteMovie(id: number) {
    if(confirm('¿Borrar?')) {
      this.movieService.deleteMovie(id).subscribe(() => {
        this.loadMovies();
        this.navigate('catalog');
      });
    }
  }

  saveMovie() {
    // Si el usuario no puso nada en trailer, lo mandamos como null
    if (!this.formData.trailer_url) {
      delete this.formData.trailer_url;
    }

    if (this.isEditing() && this.formData.id) {
      this.movieService.updateMovie(this.formData.id, this.formData).subscribe(() => {
        this.loadMovies();
        this.goToDetail(this.formData); // Volvemos al detalle actualizado
      });
    } else {
      this.movieService.createMovie(this.formData).subscribe(() => {
        this.loadMovies();
        this.navigate('catalog');
      });
    }
  }
  
  cancelForm() { this.navigate('catalog'); }
}
