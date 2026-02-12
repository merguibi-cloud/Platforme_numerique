import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const permissionResult = await requireAdminOrRole(user.id, ['admin', 'superadmin']);
    if ('error' in permissionResult) {
      return permissionResult.error;
    }

    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    let query = supabase
      .from('paiements')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);
    }

    const { data: paiements, error: paiementsError } = await query;

    if (paiementsError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des paiements' },
        { status: 500 }
      );
    }

    if (!paiements || paiements.length === 0) {
      return new NextResponse('Aucun paiement trouvé', { status: 404 });
    }

    // Fetch candidatures
    const candidatureIds = [...new Set(paiements.map(p => p.candidature_id).filter(Boolean))];
    let candidaturesMap: Record<string, any> = {};

    if (candidatureIds.length > 0) {
      const { data: candidatures } = await supabase
        .from('candidatures')
        .select('id, nom, prenom, email, formation_id')
        .in('id', candidatureIds);

      if (candidatures) {
        candidaturesMap = candidatures.reduce((acc: Record<string, any>, c: any) => {
          acc[c.id] = c;
          return acc;
        }, {});
      }
    }

    // Fetch formations
    const formationIds = [...new Set(
      Object.values(candidaturesMap).map((c: any) => c.formation_id).filter(Boolean)
    )] as number[];

    let formationsMap: Record<number, { titre: string; ecole: string }> = {};
    if (formationIds.length > 0) {
      const { data: formations } = await supabase
        .from('formations')
        .select('id, titre, ecole')
        .in('id', formationIds);

      if (formations) {
        formationsMap = formations.reduce((acc: Record<number, { titre: string; ecole: string }>, f: any) => {
          acc[f.id] = { titre: f.titre, ecole: f.ecole };
          return acc;
        }, {});
      }
    }

    // Build CSV
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    const headers = [
      'ID Paiement',
      'Candidat',
      'Email',
      'Formation',
      'École',
      'Montant',
      'Devise',
      'Statut',
      'Méthode',
      'Stripe ID',
      'Date de paiement',
      'Date de création',
      'Raison échec',
    ];

    const escapeCSV = (val: string | null | undefined): string => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = paiements.map(p => {
      const candidature = candidaturesMap[p.candidature_id] || {};
      const formationData = candidature.formation_id ? formationsMap[candidature.formation_id] : null;
      const candidatName = `${candidature.prenom || ''} ${candidature.nom || ''}`.trim();

      const statusLabel = p.status === 'succeeded' ? 'Réussi' : p.status === 'pending' ? 'En attente' : 'Échoué';
      const methodLabel = p.payment_method === 'card' ? 'Carte bancaire' : p.payment_method === 'transfer' ? 'Virement' : (p.payment_method || '');

      return [
        p.id,
        candidatName,
        candidature.email || '',
        formationData?.titre || '',
        formationData?.ecole || '',
        p.amount,
        p.currency || 'EUR',
        statusLabel,
        methodLabel,
        p.stripe_payment_intent_id || '',
        p.paid_at ? new Date(p.paid_at).toLocaleString('fr-FR') : '',
        p.created_at ? new Date(p.created_at).toLocaleString('fr-FR') : '',
        p.failure_reason || '',
      ].map(escapeCSV).join(',');
    });

    const csv = BOM + headers.join(',') + '\n' + rows.join('\n');

    const filename = `paiements_export_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Erreur dans GET /api/admin/paiements/export:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}