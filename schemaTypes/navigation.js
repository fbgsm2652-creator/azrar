export default {
  name: 'navigation',
  title: 'Menu Principal (Navbar)',
  type: 'document',
  fields: [
    {
      name: 'mainLinks',
      title: 'Liens Principaux (ex: Hommes, Femmes)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [

            // ── LABEL DU MENU PRINCIPAL ───────────────────────────────────
            {
              name: 'label',
              title: 'Nom affiché dans le menu',
              type: 'object',
              fields: [
                { name: 'fr', title: 'Français', type: 'string' },
                { name: 'ar', title: 'Arabe', type: 'string' }
              ]
            },

            // ── IMAGE ILLUSTRATIVE ────────────────────────────────────────
            {
              name: 'featuredImage',
              title: 'Image illustrative (Mega Menu PC + Carte Mobile niveau 1)',
              type: 'image'
            },

            // ── SECTIONS = COLONNES DU MEGA MENU ─────────────────────────
            // Chaque section = une colonne dans le mega menu PC
            // et une carte dans le niveau 2 mobile
            {
              name: 'sections',
              title: 'Colonnes du Mega Menu',
              description: 'Chaque colonne peut pointer vers une catégorie existante — les liens sont générés automatiquement.',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [

                    // NOUVEAU : sélection d'une catégorie Sanity existante
                    // → titre et URL générés automatiquement
                    {
                      name: 'categoryRef',
                      title: '📂 Catégorie (sélectionnez depuis vos catégories)',
                      description: 'Sélectionnez une catégorie existante. Le titre et l\'URL seront remplis automatiquement. Vous pouvez ensuite ajouter des sous-liens manuellement si besoin.',
                      type: 'reference',
                      to: [{ type: 'category' }]
                    },

                    // Titre manuel (optionnel — si vous voulez un titre différent)
                    {
                      name: 'title',
                      title: 'Titre personnalisé (optionnel — remplace le titre de la catégorie)',
                      description: 'Laissez vide pour utiliser automatiquement le nom de la catégorie sélectionnée.',
                      type: 'object',
                      fields: [
                        { name: 'fr', title: 'Français', type: 'string' },
                        { name: 'ar', title: 'Arabe', type: 'string' }
                      ]
                    },

                    // Image mobile (niveau 2)
                    {
                      name: 'mobileImage',
                      title: '📱 Image Mobile (Niveau 2 — carte avec image)',
                      description: 'Affichée uniquement sur mobile. Format carré recommandé. Si vide, utilise l\'image hero de la catégorie.',
                      type: 'image',
                      options: { hotspot: true }
                    },

                    // Sous-liens : soit manuels, soit depuis les sous-catégories
                    {
                      name: 'links',
                      title: 'Sous-liens (optionnel)',
                      description: 'Laissez vide pour afficher automatiquement les sous-catégories de la catégorie sélectionnée.',
                      type: 'array',
                      of: [
                        {
                          type: 'object',
                          fields: [
                            {
                              name: 'categoryRef',
                              title: '📂 Sous-catégorie (sélectionnez)',
                              description: 'Sélectionnez une sous-catégorie pour générer le lien automatiquement.',
                              type: 'reference',
                              to: [{ type: 'category' }]
                            },
                            {
                              name: 'label',
                              title: 'Nom personnalisé (optionnel)',
                              description: 'Laissez vide pour utiliser le nom de la sous-catégorie.',
                              type: 'object',
                              fields: [
                                { name: 'fr', type: 'string' },
                                { name: 'ar', type: 'string' }
                              ]
                            },
                            // URL manuelle si pas de catégorie Sanity
                            {
                              name: 'url',
                              title: 'URL manuelle (si pas de catégorie Sanity)',
                              description: 'Ex: /pa/soldes — uniquement si vous ne sélectionnez pas de catégorie.',
                              type: 'string'
                            }
                          ],
                          preview: {
                            select: {
                              catName: 'categoryRef.name.fr',
                              customLabel: 'label.fr',
                              url: 'url'
                            },
                            prepare({ catName, customLabel, url }) {
                              return {
                                title: customLabel || catName || url || 'Lien sans nom'
                              }
                            }
                          }
                        }
                      ]
                    }
                  ],

                  // Preview de la section dans le backoffice
                  preview: {
                    select: {
                      catName: 'categoryRef.name.fr',
                      customTitle: 'title.fr',
                      hasImage: 'mobileImage',
                      linksCount: 'links'
                    },
                    prepare({ catName, customTitle, hasImage, linksCount }) {
                      return {
                        title: customTitle || catName || 'Section sans catégorie',
                        subtitle: `${hasImage ? '🖼️ Image mobile · ' : ''}${linksCount?.length || 0} sous-lien(s)`
                      }
                    }
                  }
                }
              ]
            }
          ],

          // Preview du lien principal
          preview: {
            select: {
              title: 'label.fr',
              media: 'featuredImage',
              sections: 'sections'
            },
            prepare({ title, media, sections }) {
              return {
                title: title || 'Menu sans nom',
                subtitle: `${sections?.length || 0} colonne(s)`,
                media
              }
            }
          }
        }
      ]
    }
  ]
}