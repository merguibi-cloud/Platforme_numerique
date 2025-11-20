import { NextRequest } from 'next/server';
import { getSupabaseServerClient } from './supabase';
import { getAuthenticatedUser } from './api-helpers';
import { getUserProfileServer } from './blocs-api';

/**
 * Interface pour les données de log
 */
export interface AuditLogData {
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'LOGIN' | 'LOGOUT' | 
               'EXPORT' | 'IMPORT' | 'DOWNLOAD' | 'UPLOAD' | 'VALIDATE' | 
               'REJECT' | 'APPROVE' | 'INVITE' | 'PASSWORD_CHANGE' | 'ROLE_CHANGE' |
               'SIGNUP' | 'PASSWORD_RESET' | 'EMAIL_CONFIRM';
  table_name: string;
  resource_id?: string | number;
  resource_type?: string;
  old_data?: any;
  new_data?: any;
  changed_fields?: string[];
  status?: 'success' | 'error' | 'warning';
  error_message?: string;
  error_code?: string;
  metadata?: any;
  description?: string;
}

/**
 * Récupère les informations utilisateur pour les logs
 */
async function getUserInfoForLog(userId: string): Promise<{
  user_email: string | null;
  user_nom: string | null;
  user_prenom: string | null;
  user_role: string;
  performed_by: string;
}> {
  try {
    const supabase = getSupabaseServerClient();
    
    // Récupérer depuis la table administrateurs
    const { data: admin } = await supabase
      .from('administrateurs')
      .select('nom, prenom, email, niveau, role_secondaire')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (admin) {
      const nom = admin.nom || '';
      const prenom = admin.prenom || '';
      const email = admin.email || '';
      const role = admin.niveau === 'superadmin' ? 'superadmin' : 
                   admin.niveau === 'admin' ? 'admin' : 
                   admin.role_secondaire || 'admin';
      
      return {
        user_email: email,
        user_nom: nom,
        user_prenom: prenom,
        user_role: role,
        performed_by: `${prenom} ${nom} (${email})`.trim() || email || 'Unknown',
      };
    }
    
    // Récupérer depuis user_profiles
    const profileResult = await getUserProfileServer(userId);
    if (profileResult && profileResult.role) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('email, nom, prenom, role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (profile) {
        const nom = profile.nom || '';
        const prenom = profile.prenom || '';
        const email = profile.email || '';
        const role = profile.role || 'unknown';
        
        return {
          user_email: email,
          user_nom: nom,
          user_prenom: prenom,
          user_role: role,
          performed_by: `${prenom} ${nom} (${email})`.trim() || email || 'Unknown',
        };
      }
    }
    
    // Récupérer depuis auth.users
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    if (user) {
      return {
        user_email: user.email || null,
        user_nom: null,
        user_prenom: null,
        user_role: 'unknown',
        performed_by: user.email || 'Unknown',
      };
    }
    
    return {
      user_email: null,
      user_nom: null,
      user_prenom: null,
      user_role: 'unknown',
      performed_by: 'Unknown',
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des infos utilisateur pour log:', error);
    return {
      user_email: null,
      user_nom: null,
      user_prenom: null,
      user_role: 'unknown',
      performed_by: 'Unknown',
    };
  }
}

/**
 * Extrait l'IP et le user agent depuis la requête
 */
function getRequestContext(request: NextRequest): {
  ip_address: string | null;
  user_agent: string | null;
  endpoint: string | null;
  http_method: string | null;
} {
  try {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               null;
    
    const userAgent = request.headers.get('user-agent') || null;
    const endpoint = request.nextUrl.pathname || null;
    const method = request.method || null;
    
    return {
      ip_address: ip ? ip.split(',')[0].trim() : null,
      user_agent: userAgent,
      endpoint,
      http_method: method,
    };
  } catch (error) {
    return {
      ip_address: null,
      user_agent: null,
      endpoint: null,
      http_method: null,
    };
  }
}

/**
 * Fonction principale pour logger une action
 */
export async function logAuditAction(
  request: NextRequest,
  logData: AuditLogData
): Promise<void> {
  try {
    const supabase = getSupabaseServerClient();
    
    // Récupérer l'utilisateur depuis la requête
    let userId: string | null = null;
    let userInfo = {
      user_email: null as string | null,
      user_nom: null as string | null,
      user_prenom: null as string | null,
      user_role: 'unknown' as string,
      performed_by: 'System' as string,
    };
    
    try {
      const authResult = await getAuthenticatedUser(request);
      if (!('error' in authResult)) {
        userId = authResult.user.id;
        userInfo = await getUserInfoForLog(userId);
      }
    } catch (error) {
      // Si pas d'utilisateur authentifié, on continue avec 'System'
      console.log('Pas d\'utilisateur authentifié pour le log');
    }
    
    // Récupérer le contexte de la requête
    const context = getRequestContext(request);
    
    // Préparer les données pour l'insertion
    const insertData: any = {
      user_id: userId,
      user_email: userInfo.user_email,
      user_nom: userInfo.user_nom,
      user_prenom: userInfo.user_prenom,
      user_role: userInfo.user_role,
      performed_by: userInfo.performed_by,
      action_type: logData.action_type,
      table_name: logData.table_name,
      resource_id: logData.resource_id ? String(logData.resource_id) : null,
      resource_type: logData.resource_type || null,
      old_data: logData.old_data ? JSON.parse(JSON.stringify(logData.old_data)) : null,
      new_data: logData.new_data ? JSON.parse(JSON.stringify(logData.new_data)) : null,
      changed_fields: logData.changed_fields || null,
      status: logData.status || 'success',
      error_message: logData.error_message || null,
      error_code: logData.error_code || null,
      metadata: logData.metadata ? JSON.parse(JSON.stringify(logData.metadata)) : null,
      description: logData.description || null,
      ip_address: context.ip_address,
      user_agent: context.user_agent,
      endpoint: context.endpoint,
      http_method: context.http_method,
    };
    
    // Insérer le log
    const { error } = await supabase
      .from('audit_logs')
      .insert(insertData);
    
    if (error) {
      console.error('Erreur lors de l\'insertion du log d\'audit:', error);
      // Ne pas throw pour ne pas interrompre le flux principal
    }
  } catch (error) {
    console.error('Erreur lors du logging d\'audit:', error);
    // Ne pas throw pour ne pas interrompre le flux principal
  }
}

/**
 * Fonction helper pour logger une création
 */
export async function logCreate(
  request: NextRequest,
  tableName: string,
  resourceId: string | number,
  newData: any,
  description?: string
): Promise<void> {
  await logAuditAction(request, {
    action_type: 'CREATE',
    table_name: tableName,
    resource_id: resourceId,
    new_data: newData,
    description: description || `Création d'un enregistrement dans ${tableName}`,
  });
}

/**
 * Fonction helper pour logger une mise à jour
 */
export async function logUpdate(
  request: NextRequest,
  tableName: string,
  resourceId: string | number,
  oldData: any,
  newData: any,
  changedFields?: string[],
  description?: string
): Promise<void> {
  await logAuditAction(request, {
    action_type: 'UPDATE',
    table_name: tableName,
    resource_id: resourceId,
    old_data: oldData,
    new_data: newData,
    changed_fields: changedFields,
    description: description || `Mise à jour d'un enregistrement dans ${tableName}`,
  });
}

/**
 * Fonction helper pour logger une suppression
 */
export async function logDelete(
  request: NextRequest,
  tableName: string,
  resourceId: string | number,
  oldData: any,
  description?: string
): Promise<void> {
  await logAuditAction(request, {
    action_type: 'DELETE',
    table_name: tableName,
    resource_id: resourceId,
    old_data: oldData,
    description: description || `Suppression d'un enregistrement dans ${tableName}`,
  });
}

/**
 * Fonction helper pour logger une connexion
 */
export async function logLogin(
  request: NextRequest,
  userId: string,
  email: string,
  status: 'success' | 'error' = 'success',
  errorMessage?: string
): Promise<void> {
  const userInfo = await getUserInfoForLog(userId);
  await logAuditAction(request, {
    action_type: 'LOGIN',
    table_name: 'auth.users',
    resource_id: userId,
    status,
    error_message: errorMessage,
    description: status === 'success' 
      ? `Connexion réussie de ${email}`
      : `Échec de connexion pour ${email}`,
  });
}

/**
 * Fonction helper pour logger un changement de mot de passe
 */
export async function logPasswordChange(
  request: NextRequest,
  userId: string,
  status: 'success' | 'error' = 'success',
  errorMessage?: string
): Promise<void> {
  await logAuditAction(request, {
    action_type: 'PASSWORD_CHANGE',
    table_name: 'auth.users',
    resource_id: userId,
    status,
    error_message: errorMessage,
    description: status === 'success' 
      ? 'Changement de mot de passe réussi'
      : `Échec du changement de mot de passe: ${errorMessage}`,
  });
}

