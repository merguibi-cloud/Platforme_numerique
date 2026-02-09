import { getSupabaseServerClient } from '@/lib/supabase';

interface PaymentEmailData {
  to: string;
  candidateName: string;
  amount: number;
  currency: string;
  paidAt: string;
  paymentMethod: string;
  formationName?: string;
  receiptUrl?: string;
  paiementId: string;
}

/**
 * Génère le HTML de l'email de confirmation de paiement
 */
function generatePaymentConfirmationHTML(data: PaymentEmailData): string {
  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: data.currency,
  }).format(data.amount);

  const formattedDate = new Date(data.paidAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const paymentMethodLabel = data.paymentMethod === 'card' ? 'Carte bancaire' : 'Virement bancaire';

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de paiement</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8F5E4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F5E4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #032622; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">
                CAMPUS NUMÉRIQUE
              </h1>
            </td>
          </tr>
          
          <!-- Success Icon -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: #D4EDDA; border-radius: 50%; display: inline-block; line-height: 80px;">
                <span style="color: #28A745; font-size: 40px;">✓</span>
              </div>
            </td>
          </tr>
          
          <!-- Title -->
          <tr>
            <td style="padding: 0 30px 10px; text-align: center;">
              <h2 style="color: #032622; margin: 0; font-size: 28px; font-weight: bold;">
                Paiement confirmé !
              </h2>
            </td>
          </tr>
          
          <!-- Subtitle -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="color: #666666; margin: 0; font-size: 16px;">
                Bonjour ${data.candidateName},<br>
                Votre paiement a été traité avec succès.
              </p>
            </td>
          </tr>
          
          <!-- Amount Box -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F5E4; border-radius: 8px;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <p style="color: #666666; margin: 0 0 5px; font-size: 14px; text-transform: uppercase;">
                      Montant payé
                    </p>
                    <p style="color: #032622; margin: 0; font-size: 36px; font-weight: bold;">
                      ${formattedAmount}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Payment Details -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #EEEEEE; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #EEEEEE;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #666666; font-size: 14px;">Date du paiement</td>
                        <td style="color: #032622; font-size: 14px; font-weight: bold; text-align: right;">${formattedDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #EEEEEE;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #666666; font-size: 14px;">Moyen de paiement</td>
                        <td style="color: #032622; font-size: 14px; font-weight: bold; text-align: right;">${paymentMethodLabel}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #EEEEEE;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #666666; font-size: 14px;">Référence</td>
                        <td style="color: #032622; font-size: 14px; font-weight: bold; text-align: right; font-family: monospace;">REC-${data.paiementId.slice(0, 8).toUpperCase()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${data.formationName ? `
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #666666; font-size: 14px;">Formation</td>
                        <td style="color: #032622; font-size: 14px; font-weight: bold; text-align: right;">${data.formationName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/paiement/succes?paiement_id=${data.paiementId}" 
                 style="display: inline-block; background-color: #032622; color: #ffffff; padding: 15px 40px; text-decoration: none; font-weight: bold; border-radius: 4px; font-size: 14px;">
                VOIR MON REÇU
              </a>
            </td>
          </tr>
          
          <!-- Info Box -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #E3F2FD; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #1565C0; margin: 0; font-size: 14px;">
                      <strong>Prochaine étape :</strong> Continuez votre candidature en complétant les informations restantes sur votre espace personnel.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F8F5E4; padding: 30px; text-align: center;">
              <p style="color: #666666; margin: 0 0 10px; font-size: 12px;">
                Ce message a été envoyé automatiquement suite à votre paiement.
              </p>
              <p style="color: #666666; margin: 0; font-size: 12px;">
                Pour toute question, contactez notre service administratif.
              </p>
              <p style="color: #999999; margin: 20px 0 0; font-size: 11px;">
                © ${new Date().getFullYear()} Campus Numérique. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}


/**
 * Version alternative avec Resend (si vous préférez utiliser Resend directement)
 * Nécessite: npm install resend et RESEND_API_KEY dans .env
 */
export async function sendPaymentConfirmationEmailWithResend(data: PaymentEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY non configuré - email non envoyé');
      return { success: false, error: 'Service email non configuré' };
    }

    const html = generatePaymentConfirmationHTML(data);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Campus Numérique <noreply@campus-numerique.fr>',
        to: data.to,
        subject: `Confirmation de paiement - ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: data.currency }).format(data.amount)}`,
        html: html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur Resend:', errorData);
      return { success: false, error: errorData.message || 'Erreur lors de l\'envoi' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return { success: false, error: error.message || 'Erreur inconnue' };
  }
}
