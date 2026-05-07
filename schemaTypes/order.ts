export default {
  name: 'order',
  title: '🛒 Commandes',
  type: 'document',
  fields: [
    // --- IDENTIFICATION ---
    {
      name: 'reference',
      title: 'Référence Commande',
      type: 'string',
      description: 'Générée automatiquement (ex: REF-1001)',
    },
    {
      name: 'status',
      title: 'Statut de la commande',
      type: 'string',
      options: {
        list: [
          { title: 'Nouvelle', value: 'new' },
          { title: 'Confirmée par téléphone', value: 'confirmed' },
          { title: 'Envoyée à NOEST', value: 'dispatched' },
          { title: 'Livrée', value: 'delivered' },
          { title: 'Annulée / Retour', value: 'cancelled' }
        ],
      },
      initialValue: 'new'
    },

    // --- INFOS CLIENT (REQUISES PAR NOEST) ---
    {
      name: 'client',
      title: 'Nom et Prénom du client',
      type: 'string',
      validation: (Rule: any) => Rule.required().max(255)
    },
    {
      name: 'phone',
      title: 'Téléphone',
      type: 'string',
      validation: (Rule: any) => Rule.required().min(9).max(10)
    },
    { name: 'wilaya', title: 'Wilaya (ID)', type: 'number' },
    { name: 'commune', title: 'Commune', type: 'string' },
    { name: 'adresse', title: 'Adresse exacte', type: 'string' },

    // --- SYSTÈME DE CALCUL DES MARGES (LIAISON PRODUITS) ---
    {
      name: 'items',
      title: 'Détails des produits (Analytique)',
      type: 'array',
      description: 'Ajoutez les produits pour le calcul automatique de votre bénéfice net.',
      of: [
        {
          type: 'object',
          fields: [
            { 
              name: 'product', 
              title: 'Produit', 
              type: 'reference', 
              to: [{ type: 'product' }] 
            },
            { 
              name: 'quantity', 
              title: 'Quantité', 
              type: 'number', 
              initialValue: 1 
            }
          ],
          preview: {
            select: { 
              productNameFr: 'product.name.fr', 
              qty: 'quantity' 
            },
            prepare(selection: { productNameFr?: string; qty?: number }) {
              const { productNameFr, qty } = selection;
              return { 
                title: `${productNameFr || 'Produit non sélectionné'} (x${qty || 1})` 
              }
            }
          }
        }
      ]
    },

    // --- INFOS LOGISTIQUES ---
    {
      name: 'produit',
      title: 'Libellé Colis (Pour l\'étiquette NOEST)',
      type: 'string',
      description: 'Description simplifiée qui apparaîtra sur le bordereau.',
    },
    {
      name: 'montant',
      title: 'Montant Total à encaisser (DZD)',
      type: 'number',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'stop_desk',
      title: 'Mode de livraison',
      type: 'number',
      description: '0 = Domicile, 1 = Stop Desk',
      initialValue: 0
    },
    // --- AJOUT DU STATION CODE ---
    {
      name: 'station_code',
      title: 'Code Station / Bureau NOEST',
      type: 'string',
      description: 'Obligatoire si Stop Desk est activé (ex: B16, S01...)',
      // Le champ ne s'affiche que si le mode Stop Desk (1) est sélectionné
      hidden: ({ document }: any) => document?.stop_desk !== 1
    },
    {
      name: 'tracking_noest',
      title: 'Code de suivi NOEST (Tracking)',
      type: 'string',
      readOnly: true
    },
  ],

  // --- APERÇU DANS LA LISTE SANITY ---
  preview: {
    select: {
      title: 'client',
      subtitle: 'reference',
      status: 'status',
      montant: 'montant'
    },
    prepare(selection: any) {
      const {title, subtitle, status, montant} = selection;
      const statusIcons: Record<string, string> = {
        new: '🟢',
        confirmed: '📞',
        dispatched: '📦',
        delivered: '✅',
        cancelled: '🔴'
      };
      const icon = statusIcons[status] || '⚪';
      
      return {
        title: `${icon} ${title || 'Client inconnu'} - ${montant || 0} DZD`,
        subtitle: subtitle || 'Sans référence'
      }
    }
  }
}