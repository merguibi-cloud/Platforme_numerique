import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Webhook Airtable reçu:', JSON.stringify(body, null, 2));

    // Vérifier que c'est bien un webhook d'Airtable
    if (!body.webhook || !body.webhook.id) {
      return NextResponse.json({ error: 'Webhook invalide' }, { status: 400 });
    }

    // Extraire les informations du webhook
    const { webhook, eventType, timestamp, base, record } = body;
    
    // Identifier le type de formulaire basé sur l'ID du webhook ou de la base
    let formType: 'etudiant' | 'entreprise' | null = null;
    
    // Vous pouvez identifier le formulaire par:
    // 1. L'ID de la base Airtable
    // 2. L'ID du webhook
    // 3. Un champ spécifique dans le formulaire
    
    if (base?.id === process.env.AIRTABLE_BASE_ETUDIANT_ID) {
      formType = 'etudiant';
    } else if (base?.id === process.env.AIRTABLE_BASE_ENTREPRISE_ID) {
      formType = 'entreprise';
    }
    
    // Alternative: identifier par webhook ID
    if (!formType) {
      if (webhook.id === process.env.AIRTABLE_WEBHOOK_ETUDIANT_ID) {
        formType = 'etudiant';
      } else if (webhook.id === process.env.AIRTABLE_WEBHOOK_ENTREPRISE_ID) {
        formType = 'entreprise';
      }
    }

    if (!formType) {
      console.log('Type de formulaire non identifié');
      return NextResponse.json({ error: 'Type de formulaire non identifié' }, { status: 400 });
    }

    // Extraire l'email de l'utilisateur depuis les données du formulaire
    let userEmail: string | null = null;
    
    if (record?.fields) {
      // Chercher l'email dans les champs du formulaire
      // Les noms de champs peuvent varier selon votre configuration Airtable
      userEmail = record.fields.email || 
                  record.fields.Email || 
                  record.fields['E-mail'] || 
                  record.fields['Adresse email'] ||
                  record.fields['Email de l\'étudiant'] ||
                  record.fields['Email de l\'entreprise'];
    }

    if (!userEmail) {
      console.log('Email non trouvé dans les données du formulaire');
      return NextResponse.json({ error: 'Email non trouvé' }, { status: 400 });
    }

    console.log(`Formulaire ${formType} soumis par: ${userEmail}`);

    // Trouver la candidature correspondante
    const { data: candidature, error: candidatureError } = await supabase
      .from('candidatures')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (candidatureError || !candidature) {
      console.log('Candidature non trouvée pour:', userEmail);
      return NextResponse.json({ error: 'Candidature non trouvée' }, { status: 404 });
    }

    // Mettre à jour la candidature
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (formType === 'etudiant') {
      updateData.airtable_form_etudiant_completed = true;
    } else if (formType === 'entreprise') {
      updateData.airtable_form_entreprise_completed = true;
    }

    // Si les deux formulaires sont maintenant complétés, mettre à jour la date de soumission
    const bothFormsCompleted = 
      (formType === 'etudiant' && candidature.airtable_form_entreprise_completed) ||
      (formType === 'entreprise' && candidature.airtable_form_etudiant_completed) ||
      (candidature.airtable_form_etudiant_completed && candidature.airtable_form_entreprise_completed);

    if (bothFormsCompleted) {
      updateData.airtable_forms_submitted_at = new Date().toISOString();
      updateData.status = 'submitted'; // Optionnel: changer le statut
    }

    const { error: updateError } = await supabase
      .from('candidatures')
      .update(updateData)
      .eq('id', candidature.id);

    if (updateError) {
      console.error('Erreur lors de la mise à jour:', updateError);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    console.log(`Candidature mise à jour avec succès pour ${formType}:`, candidature.id);

    return NextResponse.json({ 
      success: true, 
      message: `Formulaire ${formType} marqué comme complété`,
      candidatureId: candidature.id,
      bothFormsCompleted 
    });

  } catch (error) {
    console.error('Erreur dans le webhook Airtable:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// Gérer les requêtes OPTIONS pour CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
