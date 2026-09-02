import { create } from 'zustand';

const useMovieStore = create((set) => ({
  movies: [],
  infringements: [],
  setMovies: (movies) => set({ movies }),
  setInfringements: (infringements) => set({ infringements }),
  addMovie: (movie) => set((state) => ({ movies: [movie, ...state.movies] })),
}));

export default useMovieStore;