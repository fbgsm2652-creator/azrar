export default {
  name: 'product',
  title: 'Produits',
  type: 'document',
  fields: [

    // ── INFOS DE BASE ──────────────────────────────────────────────────────────
    {
      name: 'name',
      title: 'Nom du produit',
      type: 'object',
      fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }]
    },
    {
      name: 'slug',
      title: 'Lien (URL)',
      type: 'slug',
      options: { source: 'name.fr', maxLength: 90 }
    },
    {
      name: 'category',
      title: 'Catégorie',
      type: 'reference',
      to: [{ type: 'category' }]
    },
    {
      name: 'isActive',
      title: '✅ Produit actif (visible sur le site)',
      description: 'Décochez pour masquer temporairement ce produit sans le supprimer.',
      type: 'boolean',
      initialValue: true
    },

    // ── TARIFICATION & RENTABILITÉ ─────────────────────────────────────────────
    // IMPORTANT : price et oldPrice sont à la RACINE (pas dans un objet imbriqué)
    // pour rester compatibles avec les queries GROQ existantes.
    {
      name: 'purchasePrice',
      title: "💰 Prix d'Achat / Coût de revient (DZD)",
      description: 'Confidentiel — utilisé uniquement pour calculer vos marges. Non affiché sur le site.',
      type: 'number'
    },
    {
      name: 'price',
      title: '🏷️ Prix de Vente (DZD)',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    },
    {
      name: 'oldPrice',
      title: '🔴 Ancien Prix barré (DZD)',
      description: 'Optionnel — affiche un prix rayé rouge à côté du prix actuel.',
      type: 'number'
    },

    // ── IMAGES (AVEC LIAISON DE COULEUR) ──────────────────────────────────────
    {
      name: 'images',
      title: 'Images du produit',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'color',
              title: '🎨 Couleur associée (Optionnel)',
              description: "Tapez la couleur EXACTE (ex: Bleu) pour que cette image s'affiche quand le client clique sur Bleu.",
              type: 'string'
            }
          ]
        }
      ]
    },

    // ── DESCRIPTION ────────────────────────────────────────────────────────────
    {
      name: 'description',
      title: 'Description du produit',
      type: 'object',
      fields: [
        { name: 'fr', title: 'Français', type: 'text' },
        { name: 'ar', title: 'Arabe', type: 'text' }
      ]
    },

    // ── STOCK & VARIANTES ──────────────────────────────────────────────────────
    {
      name: 'variants',
      title: '📦 Stock & Variantes (Tailles / Couleurs)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'size', title: 'Taille / Pointure', type: 'string' },
            { name: 'color', title: 'Couleur', type: 'string' },
            {
              name: 'stock',
              title: 'Quantité en stock',
              type: 'number',
              validation: Rule => Rule.min(0)
            }
          ],
          preview: {
            select: { title: 'size', subtitle: 'color', stock: 'stock' },
            prepare({ title, subtitle, stock }) {
              const stockLabel = stock > 0 ? `✅ En stock : ${stock}` : '❌ Rupture de stock'
              return {
                title: `${title || 'Taille unique'} — ${subtitle || 'Couleur unique'}`,
                subtitle: stockLabel
              }
            }
          }
        }
      ]
    },

    // ── GUIDE DES TAILLES ──────────────────────────────────────────────────────
    {
      name: 'sizeGuideType',
      title: '📏 Type de Guide des Tailles',
      type: 'string',
      options: {
        list: [
          { title: '❌ Aucun guide', value: 'none' },
          { title: '1 — Veste (A, B)', value: 'veste' },
          { title: '2 — T-shirt manche longue (A, B)', value: 'tshirt_ml' },
          { title: '3 — T-shirt manche courte (A, B)', value: 'tshirt_mc' },
          { title: '4 — Pantalon (A, B)', value: 'pantalon' },
          { title: '5 — Short (A, B)', value: 'short' },
          { title: '6 — Jupe (A, B)', value: 'jupe' },
          { title: '7 — Robe (A, B)', value: 'robe' },
          { title: '8 — Ensemble manche courte (A, B, C, D)', value: 'ensemble_mc' },
          { title: '9 — Ensemble manche longue (A, B, C, D)', value: 'ensemble_ml' },
          { title: '10 — Chaussure (A)', value: 'shoes' }
        ]
      },
      initialValue: 'none'
    },
    {
      name: 'measurements',
      title: '📐 Tableau des mesures (en centimètres)',
      type: 'array',
      hidden: ({ document }) => !document?.sizeGuideType || document.sizeGuideType === 'none',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'sizeName', title: 'Taille (ex: M, 42)', type: 'string' },
            { name: 'measureA', title: 'Mesure A (cm)', type: 'number' },
            {
              name: 'measureB',
              title: 'Mesure B (cm)',
              type: 'number',
              hidden: ({ document }) => document?.sizeGuideType === 'shoes'
            },
            {
              name: 'measureC',
              title: 'Mesure C (cm — Bas)',
              type: 'number',
              hidden: ({ document }) => !['ensemble_mc', 'ensemble_ml'].includes(document?.sizeGuideType)
            },
            {
              name: 'measureD',
              title: 'Mesure D (cm — Bas)',
              type: 'number',
              hidden: ({ document }) => !['ensemble_mc', 'ensemble_ml'].includes(document?.sizeGuideType)
            }
          ]
        }
      ]
    },

    // ── SEO PAR PRODUIT ────────────────────────────────────────────────────────
    // Si vide, Next.js utilisera automatiquement le nom + description du produit.
    {
      name: 'seo',
      title: '🔍 SEO — Référencement Google (optionnel)',
      description: 'Laissez vide pour utiliser le nom et la description du produit par défaut.',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        {
          name: 'metaTitle',
          title: 'Titre Google (max 60 caractères)',
          description: 'Le grand titre bleu affiché sur Google. Ex: "Veste Homme Slim | Original Look Algérie"',
          type: 'object',
          fields: [
            { name: 'fr', title: 'Français', type: 'string' },
            { name: 'ar', title: 'Arabe', type: 'string' }
          ]
        },
        {
          name: 'metaDescription',
          title: 'Description Google (max 160 caractères)',
          description: 'Le texte sous le lien Google. Décrivez le produit avec les mots-clés importants.',
          type: 'object',
          fields: [
            { name: 'fr', title: 'Français', type: 'text' },
            { name: 'ar', title: 'Arabe', type: 'text' }
          ]
        },
        {
          name: 'shareImage',
          title: 'Image de partage (WhatsApp, Facebook)',
          description: "Si vide, la première image du produit est utilisée automatiquement.",
          type: 'image'
        }
      ]
    }
  ],

  // ── PREVIEW DANS LE BACKOFFICE ─────────────────────────────────────────────
  preview: {
    select: {
      title: 'name.fr',
      subtitle: 'price',
      media: 'images.0',
      active: 'isActive'
    },
    prepare({ title, subtitle, media, active }) {
      return {
        title: `${active === false ? '🔴 ' : ''}${title || 'Produit sans nom'}`,
        subtitle: subtitle ? `${subtitle} DZD` : 'Prix non défini',
        media
      }
    }
  }
}