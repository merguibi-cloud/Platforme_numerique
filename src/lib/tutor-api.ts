import type { Tuteur, TuteurEtudiant, TutorDashboardStats } from '@/types/tutor';

export class TutorAPI {
  private static async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'An error occurred' }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  static async getDashboardStats(): Promise<TutorDashboardStats> {
    return this.fetch<TutorDashboardStats>('/api/espace-tuteur/dashboard-stats');
  }

  static async getTutorProfile(): Promise<Tuteur> {
    return this.fetch<Tuteur>('/api/espace-tuteur/profile');
  }

  static async updateTutorProfile(data: { bio?: string; specialites?: string[] }): Promise<Tuteur> {
    return this.fetch<Tuteur>('/api/espace-tuteur/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async getTutees(): Promise<TuteurEtudiant[]> {
    return this.fetch<TuteurEtudiant[]>('/api/espace-tuteur/tutees');
  }
}
