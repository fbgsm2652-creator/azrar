export default {
  name: 'homepage',
  title: 'Page Accueil',
  type: 'document',
  fields: [
    // --- 1. LE HAUT DE LA PAGE (HERO) ---
    { name: 'Hero_Title', title: 'Titre Principal', type: 'object', fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }] },
    { name: 'Hero_Subtitle', title: 'Sous-titre', type: 'object', fields: [{ name: 'fr', type: 'text' }, { name: 'ar', type: 'text' }] },
    { name: 'Hero_Button', title: 'Texte du Bouton', type: 'object', fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }] },
    { name: 'Hero_Image', title: 'Image de couverture', type: 'image', options: { hotspot: true } },

    // --- 2. RÉASSURANCE ---
    {
      name: 'reassurance',
      title: 'Blocs Avantages (Réassurance)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'icon', title: 'Icône (Emoji, ex: 🚚, ⭐, 💵)', type: 'string' },
            { name: 'title', title: 'Titre principal', type: 'object', fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }] },
            { name: 'subtitle', title: 'Sous-titre', type: 'object', fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }] }
          ]
        }
      ]
    },

    // --- 3. GESTION DES PRODUITS DE L'ACCUEIL ---
    {
      name: 'featuredProducts',
      title: '🌟 Section : Produits Phares',
      description: 'Sélectionnez manuellement les produits que vous voulez mettre en avant (idéalement 4 ou 8).',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }]
    },
    {
      name: 'bestSellers',
      title: '🔥 Section : Meilleures Ventes',
      description: 'Sélectionnez manuellement les produits qui se vendent le plus.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }]
    },

    // --- 4. SEO DU HAUT VOL (GOOGLE & RÉSEAUX SOCIAUX) ---
    {
      name: 'advancedSEO',
      title: '🚀 Réglages SEO Avancés (Le nerf de la guerre)',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Titre (Le grand titre bleu sur Google - Max 60 caractères)',
          type: 'object',
          fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }]
        },
        {
          name: 'metaDescription',
          title: 'Meta Description (Le texte sous le lien Google - Max 160 caractères)',
          type: 'object',
          fields: [{ name: 'fr', type: 'text' }, { name: 'ar', type: 'text' }]
        },
        {
          name: 'metaKeywords',
          title: 'Mots-clés SEO (Séparés par des virgules, ex: mode, livraison alger, textile)',
          type: 'object',
          fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }]
        },
        {
          name: 'shareImage',
          title: "Image de partage (Ce qui s'affiche quand vous envoyez le lien du site sur WhatsApp ou Facebook)",
          type: 'image'
        }
      ]
    },

    // --- 5. TEXTE SEO SUR LA PAGE ---
    { name: 'SEO_Block_Title', title: "Titre du bloc de texte SEO (Visible en bas de page d'accueil)", type: 'object', fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }] },
    { name: 'SEO_Block_Text', title: "Texte SEO (Visible en bas de page d'accueil)", type: 'object', fields: [{ name: 'fr', type: 'text' }, { name: 'ar', type: 'text' }] },

    // --- 6. PIXELS DE TRACKING & ANALYTICS ---
    // Gérez tous vos codes de suivi ici sans toucher au code.
    // Ces codes sont injectés automatiquement dans le <head> de chaque page.
    {
      name: 'tracking',
      title: '📊 Pixels de Tracking & Analytics',
      description: 'Collez ici vos identifiants de suivi. Ils seront injectés automatiquement sur tout le site sans toucher au code.',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [

        // ── FACEBOOK / META ──────────────────────────────────────────────
        {
          name: 'facebookPixelId',
          title: '📘 Facebook / Meta Pixel ID',
          description: "Trouvez-le dans : Meta Business Suite → Gestionnaire d'événements → votre Pixel → Détails. Exemple : 1234567890123456",
          type: 'string',
          validation: (Rule) => Rule.regex(/^\d+$/, { name: 'chiffres uniquement', invert: false })
            .warning('Le Pixel ID Facebook ne contient que des chiffres.')
        },

        // ── TIKTOK ───────────────────────────────────────────────────────
        {
          name: 'tiktokPixelId',
          title: '🎵 TikTok Pixel ID',
          description: "Trouvez-le dans : TikTok Ads Manager → Actifs → Événements → votre Pixel → Détails. Exemple : CXXXXXXXXXXXXXXX",
          type: 'string',
        },

        // ── GOOGLE ANALYTICS ─────────────────────────────────────────────
        {
          name: 'googleAnalyticsId',
          title: '📈 Google Analytics Measurement ID (GA4)',
          description: "Trouvez-le dans : Google Analytics → Admin → Flux de données → votre flux → ID de mesure. Format : G-XXXXXXXXXX",
          type: 'string',
          validation: (Rule) => Rule.regex(/^G-[A-Z0-9]+$/, { name: 'format GA4', invert: false })
            .warning('Le Measurement ID GA4 doit commencer par G- (ex: G-ABC123XYZ).')
        },

        // ── GOOGLE TAG MANAGER ───────────────────────────────────────────
        {
          name: 'googleTagManagerId',
          title: '🏷️ Google Tag Manager ID (optionnel)',
          description: "Si vous utilisez GTM pour centraliser tous vos tags. Trouvez-le dans : tagmanager.google.com → votre compte. Format : GTM-XXXXXXX. Si vous remplissez ce champ, il remplace GA4 et les autres pixels (GTM les gère lui-même).",
          type: 'string',
          validation: (Rule) => Rule.regex(/^GTM-[A-Z0-9]+$/, { name: 'format GTM', invert: false })
            .warning('Le GTM ID doit commencer par GTM- (ex: GTM-ABC1234).')
        },

        // ── SNAPCHAT ─────────────────────────────────────────────────────
        {
          name: 'snapchatPixelId',
          title: '👻 Snapchat Pixel ID (optionnel)',
          description: "Trouvez-le dans : Snapchat Ads Manager → Actifs → Snap Pixel. Format UUID : xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
          type: 'string',
        },
      ]
    }
  ]
}