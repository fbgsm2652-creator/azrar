export default {
  name: 'category',
  title: 'Catégorie',
  type: 'document',
  fields: [

    // ── INFOS DE BASE ──────────────────────────────────────────────────────────
    {
      name: 'name',
      title: 'Nom de la catégorie',
      type: 'object',
      fields: [
        { name: 'fr', title: 'Français', type: 'string' },
        { name: 'ar', title: 'Arabe', type: 'string' }
      ]
    },
    {
      name: 'slug',
      title: 'URL (Slug)',
      type: 'slug',
      options: { source: 'name.fr', maxLength: 90 }
    },
    {
      name: 'parent',
      title: 'Catégorie Parente (Optionnel)',
      description: "Ex: Si vous créez 'Pantalon', choisissez 'Vêtements Garçon' comme parent.",
      type: 'reference',
      to: [{ type: 'category' }]
    },

    // ── IMAGE HERO ────────────────────────────────────────────────────────────
    {
      name: 'heroImage',
      title: '🖼️ Image Hero (Bandeau en haut de page)',
      description: 'Format paysage recommandé (ex: 1200x400px). Apparaît en petit bandeau, pas en plein écran.',
      type: 'image',
      options: { hotspot: true }
    },

    // ── SEO ───────────────────────────────────────────────────────────────────
    {
      name: 'seo',
      title: '🔍 SEO & Texte Google',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        {
          name: 'metaTitle',
          title: 'Titre Google (max 60 caractères)',
          type: 'object',
          fields: [
            { name: 'fr', title: 'Français', type: 'string' },
            { name: 'ar', title: 'Arabe', type: 'string' }
          ]
        },
        {
          name: 'metaDescription',
          title: 'Description Google (max 160 caractères)',
          type: 'object',
          fields: [
            { name: 'fr', title: 'Français', type: 'text' },
            { name: 'ar', title: 'Arabe', type: 'text' }
          ]
        },
        {
          name: 'seoText',
          title: 'Texte SEO visible (affiché discrètement en bas de page)',
          description: 'Texte riche en mots-clés pour Google. Le client peut le lire mais il ne gêne pas la navigation.',
          type: 'object',
          fields: [
            { name: 'fr', title: 'Français', type: 'text' },
            { name: 'ar', title: 'Arabe', type: 'text' }
          ]
        }
      ]
    }
  ],

  // ── PREVIEW BACKOFFICE ────────────────────────────────────────────────────
  preview: {
    select: {
      title: 'name.fr',
      media: 'heroImage',
      parent: 'parent.name.fr'
    },
    prepare({ title, media, parent }) {
      return {
        title: title || 'Catégorie sans nom',
        subtitle: parent ? `Sous-catégorie de : ${parent}` : 'Catégorie principale',
        media
      }
    }
  }
}