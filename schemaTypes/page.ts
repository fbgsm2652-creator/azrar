// azrar/schemaTypes/page.ts

export default {
  name: 'page',
  title: '📄 Pages Libres',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titre de la page',
      type: 'object',
      fields: [
        { name: 'fr', title: 'Titre (Français)', type: 'string', validation: (Rule: any) => Rule.required() },
        { name: 'ar', title: 'Titre (Arabe)', type: 'string', validation: (Rule: any) => Rule.required() }
      ]
    },
    {
      name: 'slug',
      title: 'Lien de la page (URL)',
      type: 'slug',
      description: 'Cliquez sur "Generate" pour créer le lien automatiquement à partir du titre français.',
      options: {
        source: 'title.fr',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'content',
      title: 'Contenu de la page',
      type: 'object',
      fields: [
        { 
          name: 'fr', 
          title: 'Contenu (Français)', 
          type: 'array', 
          of: [{ type: 'block' }] // "block" permet d'avoir un éditeur de texte riche type Word
        },
        { 
          name: 'ar', 
          title: 'Contenu (Arabe)', 
          type: 'array', 
          of: [{ type: 'block' }] 
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title.fr',
      subtitle: 'slug.current'
    },
    prepare(selection: any) {
      const { title, subtitle } = selection;
      return {
        title: title || 'Nouvelle page',
        subtitle: `URL: /pa/${subtitle}`
      }
    }
  }
}