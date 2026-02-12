import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { renderToBuffer } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#032622',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#032622',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#032622',
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 11,
    color: '#666666',
  },
  value: {
    fontSize: 11,
    color: '#032622',
    fontWeight: 'bold',
  },
  amountBox: {
    backgroundColor: '#f8f5e4',
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 5,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#032622',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 9,
    color: '#999999',
  },
  successBadge: {
    backgroundColor: '#dcfce7',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  successText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: 'bold',
  },
});

// Formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Formater le montant
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Interface pour les données du reçu
interface ReceiptData {
  paiement: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    payment_method: string;
    paid_at: string;
  };
  candidature: {
    nom: string;
    prenom: string;
    email: string;
  };
  formation: {
    nom: string;
  } | null;
}

// Fonction pour créer le document PDF
const createReceiptDocument = (data: ReceiptData) => {
  const children = [
    // Header
    React.createElement(View, { key: 'header', style: styles.header },
      React.createElement(Text, { style: styles.title }, 'REÇU DE PAIEMENT'),
      React.createElement(Text, { style: styles.subtitle }, 'Campus Numérique - Elite Society')
    ),

    // Success Badge
    React.createElement(View, { key: 'badge', style: styles.successBadge },
      React.createElement(Text, { style: styles.successText }, 'PAIEMENT CONFIRMÉ')
    ),

    // Amount Box
    React.createElement(View, { key: 'amount', style: styles.amountBox },
      React.createElement(Text, { style: styles.amountLabel }, 'Montant payé'),
      React.createElement(Text, { style: styles.amount }, formatCurrency(data.paiement.amount, data.paiement.currency))
    ),

    // Payment Details Section
    React.createElement(View, { key: 'details', style: styles.section },
      React.createElement(Text, { style: styles.sectionTitle }, 'Détails du paiement'),
      React.createElement(View, { style: styles.row },
        React.createElement(Text, { style: styles.label }, 'Référence'),
        React.createElement(Text, { style: styles.value }, data.paiement.id.slice(0, 8).toUpperCase())
      ),
      React.createElement(View, { style: styles.row },
        React.createElement(Text, { style: styles.label }, 'Date du paiement'),
        React.createElement(Text, { style: styles.value }, formatDate(data.paiement.paid_at))
      ),
      React.createElement(View, { style: styles.row },
        React.createElement(Text, { style: styles.label }, 'Moyen de paiement'),
        React.createElement(Text, { style: styles.value }, data.paiement.payment_method === 'card' ? 'Carte bancaire' : data.paiement.payment_method)
      ),
      React.createElement(View, { style: styles.row },
        React.createElement(Text, { style: styles.label }, 'Statut'),
        React.createElement(Text, { style: styles.value }, 'Payé')
      )
    ),

    // Candidate Section
    React.createElement(View, { key: 'candidate', style: styles.section },
      React.createElement(Text, { style: styles.sectionTitle }, 'Informations du candidat'),
      React.createElement(View, { style: styles.row },
        React.createElement(Text, { style: styles.label }, 'Nom complet'),
        React.createElement(Text, { style: styles.value }, `${data.candidature.prenom} ${data.candidature.nom}`)
      ),
      React.createElement(View, { style: styles.row },
        React.createElement(Text, { style: styles.label }, 'Email'),
        React.createElement(Text, { style: styles.value }, data.candidature.email)
      )
    ),

    // Footer
    React.createElement(View, { key: 'footer', style: styles.footer },
      React.createElement(Text, { style: styles.footerText }, 'Ce document constitue un reçu de paiement officiel.'),
      React.createElement(Text, { style: styles.footerText }, 'Campus Numérique - Elite Society | contact@elite-society.fr')
    )
  ];

  // Add formation section if available
  if (data.formation) {
    children.splice(5, 0, React.createElement(View, { key: 'formation', style: styles.section },
      React.createElement(Text, { style: styles.sectionTitle }, 'Formation'),
      React.createElement(View, { style: styles.row },
        React.createElement(Text, { style: styles.label }, 'Programme'),
        React.createElement(Text, { style: styles.value }, data.formation.nom)
      )
    ));
  }

  return React.createElement(Document, {},
    React.createElement(Page, { size: 'A4', style: styles.page }, ...children)
  );
};

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Vérifier l'authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Récupérer l'ID du paiement depuis les paramètres
    const { searchParams } = new URL(request.url);
    const paiementId = searchParams.get('paiement_id');

    if (!paiementId) {
      return NextResponse.json(
        { success: false, error: 'ID de paiement requis' },
        { status: 400 }
      );
    }

    // Récupérer le paiement
    const { data: paiement, error: paiementError } = await supabase
      .from('paiements')
      .select('id, candidature_id, amount, currency, status, payment_method, paid_at')
      .eq('id', paiementId)
      .eq('status', 'succeeded')
      .single();

    if (paiementError || !paiement) {
      return NextResponse.json(
        { success: false, error: 'Paiement non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur a accès à ce paiement
    const { data: candidature, error: candError } = await supabase
      .from('candidatures')
      .select('id, user_id, formation_id, nom, prenom, email')
      .eq('id', paiement.candidature_id)
      .single();

    if (candError || !candidature) {
      return NextResponse.json(
        { success: false, error: 'Candidature non trouvée' },
        { status: 404 }
      );
    }

    if (candidature.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Récupérer les informations de la formation
    let formation = null;
    if (candidature.formation_id) {
      const { data: formationData } = await supabase
        .from('formations')
        .select('id, nom')
        .eq('id', candidature.formation_id)
        .single();
      formation = formationData;
    }

    // Préparer les données pour le PDF
    const receiptData: ReceiptData = {
      paiement: {
        id: paiement.id,
        amount: paiement.amount,
        currency: paiement.currency || 'EUR',
        status: paiement.status,
        payment_method: paiement.payment_method || 'card',
        paid_at: paiement.paid_at,
      },
      candidature: {
        nom: candidature.nom || '',
        prenom: candidature.prenom || '',
        email: candidature.email || '',
      },
      formation: formation ? { nom: formation.nom } : null,
    };

    // Générer le PDF
    const pdfBuffer = await renderToBuffer(createReceiptDocument(receiptData));

    // Retourner le PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="recu-paiement-${paiement.id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération du reçu PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la génération du reçu' },
      { status: 500 }
    );
  }
}
