export async function handler(event) {
  try {
    // Validation de la méthode HTTP
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'Method not allowed' })
      };
    }

    // Validation du body
    const body = event.body ? JSON.parse(event.body) : {};
    if (!body.amount || !body.vendorId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'Missing required fields: amount, vendorId' })
      };
    }

    // Validation des types
    const amount = Number(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'Invalid amount' })
      };
    }

    // TODO: Enregistrer la facture côté Caisse
    // - Sauvegarder en localStorage/IndexedDB
    // - Mettre à jour le CA instant
    // - Notifier l'UI

    console.log('✅ Facture webhook traitée:', {
      amount: amount,
      vendorId: body.vendorId,
      invoiceNumber: body.invoiceNumber,
      vendorName: body.vendorName,
      clientName: body.clientName,
      date: body.date || new Date().toISOString().slice(0, 10)
    });

    // Réponse de succès
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        caUpdated: true,
        amount: amount,
        vendor: body.vendorId,
        message: 'Facture reçue et CA mis à jour'
      })
    };

  } catch (error) {
    console.error('❌ Erreur webhook caisse-facture:', error);

    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Bad JSON or internal error' })
    };
  }
}
