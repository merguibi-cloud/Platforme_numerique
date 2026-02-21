import type { SoumissionEtudeCas, GradeSubmission, BulkGradeRequest } from '@/types/grading';

export class GradingAPI {
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

  static async getSubmissions(filters?: {
    statut?: string;
    etude_cas_id?: string;
    limit?: number;
  }): Promise<SoumissionEtudeCas[]> {
    const params = new URLSearchParams();
    if (filters?.statut) params.append('statut', filters.statut);
    if (filters?.etude_cas_id) params.append('etude_cas_id', filters.etude_cas_id);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const query = params.toString();
    return this.fetch<SoumissionEtudeCas[]>(
      `/api/espace-tuteur/submissions${query ? `?${query}` : ''}`
    );
  }

  static async getSubmission(submissionId: string): Promise<SoumissionEtudeCas> {
    return this.fetch<SoumissionEtudeCas>(`/api/espace-tuteur/submissions/${submissionId}`);
  }

  static async gradeSubmission(
    submissionId: string,
    grade: GradeSubmission
  ): Promise<SoumissionEtudeCas> {
    return this.fetch<SoumissionEtudeCas>(
      `/api/espace-tuteur/submissions/${submissionId}/grade`,
      {
        method: 'POST',
        body: JSON.stringify(grade),
      }
    );
  }

  static async bulkGrade(request: BulkGradeRequest): Promise<{ success: boolean; count: number }> {
    return this.fetch<{ success: boolean; count: number }>(
      '/api/espace-tuteur/submissions/bulk-grade',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }
}
