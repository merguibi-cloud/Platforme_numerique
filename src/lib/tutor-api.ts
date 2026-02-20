// API client for tutor operations
import type {
  Tuteur,
  TuteurEtudiant,
  TuteurCours,
  TutorDashboardStats,
  StudentProgress
} from '@/types/tutor';

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
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Dashboard
  static async getDashboardStats(): Promise<TutorDashboardStats> {
    return this.fetch<TutorDashboardStats>('/api/espace-tuteur/dashboard');
  }

  // Courses
  static async getAssignedCourses(): Promise<TuteurCours[]> {
    return this.fetch<TuteurCours[]>('/api/espace-tuteur/courses');
  }

  static async getCourseStudents(courseId: string): Promise<StudentProgress[]> {
    return this.fetch<StudentProgress[]>(`/api/espace-tuteur/courses/${courseId}/students`);
  }

  // Students (Tutees)
  static async getTutees(): Promise<TuteurEtudiant[]> {
    return this.fetch<TuteurEtudiant[]>('/api/espace-tuteur/tutees');
  }

  static async getTuteeProgress(studentId: string): Promise<StudentProgress[]> {
    return this.fetch<StudentProgress[]>(`/api/espace-tuteur/tutees/${studentId}/progress`);
  }

  static async getStudentProgress(studentId: string): Promise<StudentProgress[]> {
    return this.fetch<StudentProgress[]>(`/api/espace-tuteur/students/${studentId}/progress`);
  }

  // Tutor profile
  static async getTutorProfile(): Promise<Tuteur> {
    return this.fetch<Tuteur>('/api/espace-tuteur/profile');
  }

  static async updateTutorProfile(data: Partial<Tuteur>): Promise<Tuteur> {
    return this.fetch<Tuteur>('/api/espace-tuteur/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}
