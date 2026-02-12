import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Types pour les données du reçu
export interface ReceiptData {
  paiement: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    payment_method: string;
    paid_at: string;
  };
  candidature: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  formation: {
    id: number;
    nom: string;
  } | null;
}

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
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
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  receiptNumber: {
    fontSize: 10,
    color: '#999999',
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#032622',
    marginBottom: 10,
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '40%',
    fontSize: 10,
    color: '#666666',
  },
  value: {
    width: '60%',
    fontSize: 10,
    color: '#032622',
    fontFamily: 'Helvetica-Bold',
  },
  amountBox: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#032622',
    fontFamily: 'Helvetica-Bold',
  },
  statusBadge: {
    backgroundColor: '#D4EDDA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginTop: 10,
    alignSelf: 'center',
  },
  statusText: {
    fontSize: 10,
    color: '#155724',
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 5,
  },
  companyInfo: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#F8F5E4',
  },
  companyName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#032622',
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
  },
  companyDetail: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 2,
  },
});

// Fonction utilitaire pour formater la date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Fonction utilitaire pour formater le montant
const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Fonction pour obtenir le libellé du moyen de paiement
const getPaymentMethodLabel = (method: string): string => {
  switch (method) {
    case 'card':
      return 'Carte bancaire';
    case 'transfer':
      return 'Virement bancaire';
    default:
      return method;
  }
};

// Composant PDF du reçu
export const ReceiptPDF: React.FC<{ data: ReceiptData }> = ({ data }) => {
  const receiptNumber = `REC-${data.paiement.id.slice(0, 8).toUpperCase()}`;
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>REÇU DE PAIEMENT</Text>
          <Text style={styles.subtitle}>Frais d'inscription - Campus Numérique</Text>
          <Text style={styles.receiptNumber}>N° {receiptNumber}</Text>
        </View>

        {/* Montant */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>MONTANT PAYÉ</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(data.paiement.amount, data.paiement.currency)}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>PAIEMENT CONFIRMÉ</Text>
          </View>
        </View>

        {/* Détails du paiement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails du paiement</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Date du paiement</Text>
            <Text style={styles.value}>{formatDate(data.paiement.paid_at)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Moyen de paiement</Text>
            <Text style={styles.value}>{getPaymentMethodLabel(data.paiement.payment_method)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Référence</Text>
            <Text style={styles.value}>{receiptNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Statut</Text>
            <Text style={styles.value}>Réussi</Text>
          </View>
        </View>

        {/* Informations du candidat */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations du candidat</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nom complet</Text>
            <Text style={styles.value}>
              {data.candidature.prenom} {data.candidature.nom}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{data.candidature.email}</Text>
          </View>
          {data.formation && (
            <View style={styles.row}>
              <Text style={styles.label}>Formation</Text>
              <Text style={styles.value}>{data.formation.nom}</Text>
            </View>
          )}
        </View>

        {/* Informations de l'établissement */}
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>Campus Numérique</Text>
          <Text style={styles.companyDetail}>Plateforme de formation numérique</Text>
          <Text style={styles.companyDetail}>Document généré le {currentDate}</Text>
        </View>

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ce document constitue une preuve de paiement pour les frais d'inscription.
          </Text>
          <Text style={styles.footerText}>
            Conservez-le précieusement pour vos archives.
          </Text>
          <Text style={styles.footerText}>
            Pour toute question, contactez notre service administratif.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptPDF;
