export default {
  name: 'customer',
  title: '👥 Clients',
  type: 'document',
  fields: [

    // ── IDENTIFIANT UNIQUE ─────────────────────────────────────────────────────
    {
      name: 'phone',
      title: '📱 Téléphone (identifiant unique)',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'name',
      title: 'Nom complet',
      type: 'string'
    },
    {
      name: 'wilaya',
      title: 'Wilaya (numéro)',
      type: 'number'
    },
    {
      name: 'commune',
      title: 'Commune',
      type: 'string'
    },

    // ── STATISTIQUES (remplies automatiquement) ────────────────────────────────
    {
      name: 'totalOrders',
      title: '🛒 Nombre de commandes',
      type: 'number',
      readOnly: true,
      initialValue: 0
    },
    {
      name: 'totalSpent',
      title: '💰 Total dépensé (DZD)',
      type: 'number',
      readOnly: true,
      initialValue: 0
    },
    {
      name: 'firstOrderDate',
      title: 'Première commande',
      type: 'datetime',
      readOnly: true
    },
    {
      name: 'lastOrderDate',
      title: 'Dernière commande',
      type: 'datetime',
      readOnly: true
    },

    // ── SEGMENTATION POUR CAMPAGNES SMS ───────────────────────────────────────
    {
      name: 'tags',
      title: '🏷️ Tags (pour cibler vos campagnes SMS)',
      description: 'Ajoutez des tags pour segmenter vos clients.',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
        list: [
          { title: '⭐ VIP', value: 'vip' },
          { title: '🆕 Nouveau', value: 'nouveau' },
          { title: '😴 Inactif', value: 'inactif' },
          { title: '🏙️ Alger', value: 'alger' },
          { title: '🌍 Hors Alger', value: 'hors-alger' },
          { title: '👗 Femme', value: 'femme' },
          { title: '👔 Homme', value: 'homme' },
          { title: '🔁 Fidèle', value: 'fidele' },
        ]
      }
    },
    {
      name: 'optOut',
      title: '🚫 Ne plus contacter (opt-out SMS)',
      description: 'Cochez si le client a demandé à ne plus recevoir de SMS.',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'notes',
      title: '📝 Notes internes',
      type: 'text',
      description: 'Notes privées — non envoyées au client.'
    }
  ],

  preview: {
    select: {
      name: 'name',
      phone: 'phone',
      orders: 'totalOrders',
      spent: 'totalSpent',
      optOut: 'optOut'
    },
    prepare({ name, phone, orders, spent, optOut }) {
      return {
        title: `${optOut ? '🚫 ' : ''}${name || 'Client sans nom'}`,
        subtitle: `${phone} · ${orders || 0} commande(s) · ${(spent || 0).toLocaleString()} DZD`
      }
    }
  }
}