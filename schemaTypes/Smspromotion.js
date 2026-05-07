export default {
  name: 'smsPromotion',
  title: '📨 Campagnes SMS',
  type: 'document',
  fields: [

    // ── INFOS DE LA CAMPAGNE ───────────────────────────────────────────────────
    {
      name: 'title',
      title: 'Nom de la campagne',
      description: 'Usage interne uniquement. Ex: Promo Aïd 2025',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'message',
      title: '✉️ Message SMS',
      description: 'Max 160 caractères pour un SMS simple. Variables disponibles : {nom}, {prenom}',
      type: 'text',
      validation: Rule => Rule.required().max(160)
    },
    {
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          { title: '📝 Brouillon', value: 'draft' },
          { title: '✅ Prêt à envoyer', value: 'ready' },
          { title: '📤 Envoyé', value: 'sent' },
        ]
      },
      initialValue: 'draft'
    },

    // ── CIBLAGE ────────────────────────────────────────────────────────────────
    {
      name: 'targetMode',
      title: '🎯 Mode de ciblage',
      type: 'string',
      options: {
        list: [
          { title: '👥 Tous les clients', value: 'all' },
          { title: '🏷️ Par tags', value: 'tags' },
          { title: '🔢 Nb commandes minimum', value: 'minOrders' },
          { title: '💰 Dépense minimum (DZD)', value: 'minSpent' },
        ],
        layout: 'radio'
      },
      initialValue: 'all'
    },
    {
      name: 'targetTags',
      title: 'Tags à cibler',
      description: 'Uniquement si "Par tags" est sélectionné.',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
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
      },
      hidden: ({ document }) => document?.targetMode !== 'tags'
    },
    {
      name: 'minOrders',
      title: 'Nombre de commandes minimum',
      type: 'number',
      initialValue: 2,
      hidden: ({ document }) => document?.targetMode !== 'minOrders'
    },
    {
      name: 'minSpent',
      title: 'Montant dépensé minimum (DZD)',
      type: 'number',
      initialValue: 5000,
      hidden: ({ document }) => document?.targetMode !== 'minSpent'
    },

    // ── RÉSULTATS ──────────────────────────────────────────────────────────────
    {
      name: 'sentAt',
      title: 'Date d\'envoi',
      type: 'datetime',
      readOnly: true
    },
    {
      name: 'recipientCount',
      title: 'Nombre de destinataires',
      type: 'number',
      readOnly: true
    },
    {
      name: 'sentBy',
      title: 'Envoyé par',
      type: 'string',
      readOnly: true
    }
  ],

  preview: {
    select: {
      title: 'title',
      status: 'status',
      count: 'recipientCount',
      sentAt: 'sentAt'
    },
    prepare({ title, status, count, sentAt }) {
      const icons = { draft: '📝', ready: '✅', sent: '📤' }
      return {
        title: `${icons[status] || '📝'} ${title}`,
        subtitle: status === 'sent'
          ? `Envoyé à ${count || 0} clients · ${sentAt ? new Date(sentAt).toLocaleDateString('fr-FR') : ''}`
          : `${count ? count + ' destinataires estimés' : 'Non calculé'}`
      }
    }
  }
}