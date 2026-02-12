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
    const ecole = searchParams.get('ecole');
    const formation = searchParams.get('formation');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    // Fetch all paiements
    let query = supabase
      .from('paiements')
      .select('*', { count: 'exact' })
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

    query = query.range(offset, offset + limit - 1);

    const { data: paiements, error: paiementsError, count } = await query;

    if (paiementsError) {
      console.error('Erreur récupération paiements:', paiementsError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des paiements' },
        { status: 500 }
      );
    }

    if (!paiements || paiements.length === 0) {
      return NextResponse.json({
        success: true,
        paiements: [],
        total: 0,
        page,
        limit,
      });
    }

    // Get candidature IDs
    const candidatureIds = [...new Set(paiements.map(p => p.candidature_id).filter(Boolean))];

    // Fetch candidatures
    let candidaturesMap: Record<string, any> = {};
    if (candidatureIds.length > 0) {
      const { data: candidatures } = await supabase
        .from('candidatures')
        .select('id, user_id, nom, prenom, email, formation_id')
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
      Object.values(candidaturesMap)
        .map((c: any) => c.formation_id)
        .filter(Boolean)
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

    // Enrich paiements
    let enrichedPaiements = paiements.map(p => {
      const candidature = candidaturesMap[p.candidature_id] || null;
      const formationData = candidature?.formation_id ? formationsMap[candidature.formation_id] : null;

      return {
        id: p.id,
        candidature_id: p.candidature_id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        payment_method: p.payment_method,
        stripe_payment_intent_id: p.stripe_payment_intent_id,
        paid_at: p.paid_at,
        failed_at: p.failed_at,
        failure_reason: p.failure_reason,
        created_at: p.created_at,
        candidat_nom: candidature ? `${candidature.prenom || ''} ${candidature.nom || ''}`.trim() : null,
        candidat_email: candidature?.email || null,
        formation_titre: formationData?.titre || null,
        ecole: formationData?.ecole || null,
      };
    });

    // Client-side filters that require joined data
    if (ecole && ecole !== 'all') {
      enrichedPaiements = enrichedPaiements.filter(p => p.ecole === ecole);
    }
    if (formation && formation !== 'all') {
      enrichedPaiements = enrichedPaiements.filter(p => p.formation_titre === formation);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      enrichedPaiements = enrichedPaiements.filter(p =>
        (p.candidat_nom && p.candidat_nom.toLowerCase().includes(searchLower)) ||
        (p.candidat_email && p.candidat_email.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json({
      success: true,
      paiements: enrichedPaiements,
      total: count || enrichedPaiements.length,
      page,
      limit,
    });
  } catch (error) {
    console.error('Erreur dans GET /api/admin/paiements:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}