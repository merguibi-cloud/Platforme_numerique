import { supabase, isSupabaseAvailable } from './supabase'
import { Formation } from '@/types/formations'

export async function getAllFormations(): Promise<Formation[]> {
  if (!isSupabaseAvailable() || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('formations')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

export async function getFormationById(id: number): Promise<Formation | null> {
  if (!isSupabaseAvailable() || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('formations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

export async function getFormationsByTheme(theme: string): Promise<Formation[]> {
  if (!isSupabaseAvailable() || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('formations')
      .select('*')
      .eq('theme', theme)
      .order('id', { ascending: true });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

export async function getFormationsByEcole(ecole: string): Promise<Formation[]> {
  if (!isSupabaseAvailable() || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('formations')
      .select('*')
      .eq('ecole', ecole)
      .order('id', { ascending: true });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

export async function getFormationsByNiveau(niveau: string): Promise<Formation[]> {
  if (!isSupabaseAvailable() || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('formations')
      .select('*')
      .eq('niveau', niveau)
      .order('id', { ascending: true });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

export async function getFormationsByRythme(rythme: string): Promise<Formation[]> {
  if (!isSupabaseAvailable() || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('formations')
      .select('*')
      .eq('rythme', rythme)
      .order('id', { ascending: true });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

export async function searchFormations(filters: {
  theme?: string;
  ecole?: string;
  niveau?: string;
  rythme?: string;
}): Promise<Formation[]> {
  if (!isSupabaseAvailable() || !supabase) {
    return [];
  }

  try {
    let query = supabase.from('formations').select('*');

    if (filters.theme) {
      query = query.eq('theme', filters.theme);
    }

    if (filters.ecole) {
      query = query.eq('ecole', filters.ecole);
    }

    if (filters.niveau) {
      query = query.eq('niveau', filters.niveau);
    }

    if (filters.rythme) {
      query = query.eq('rythme', filters.rythme);
    }

    const { data, error } = await query.order('id', { ascending: true });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}
