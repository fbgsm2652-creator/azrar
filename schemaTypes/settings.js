export default {
  name: 'settings',
  title: 'Réglages Globaux (Footer & Formulaire)',
  type: 'document',
  fields: [
    { name: 'logo', title: 'Logo du Footer', type: 'image' },
    { 
      name: 'description', 
      title: 'Texte sous le logo', 
      type: 'object', 
      fields: [{ name: 'fr', type: 'text' }, { name: 'ar', type: 'text' }] 
    },
    { name: 'whatsapp', title: 'Numéro WhatsApp (ex: +213...)', type: 'string' },
    {
      name: 'columns',
      title: 'Colonnes de liens',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Titre de la colonne', type: 'object', fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }] },
            {
              name: 'links',
              title: 'Liens',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'label', title: 'Nom du lien', type: 'object', fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }] },
                    { name: 'url', title: 'URL du lien', type: 'string' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    { 
      name: 'copyright', 
      title: 'Texte du Copyright (Année gérée auto)', 
      type: 'object', 
      fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }] 
    },
    {
      name: 'orderForm',
      title: 'Textes du Formulaire de Commande',
      type: 'object',
      fields: [
        { name: 'title', title: 'Titre (ex: Commander Maintenant)', type: 'object', fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }] },
        { name: 'subtitle', title: 'Sous-titre (ex: Paiement à la livraison)', type: 'object', fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }] },
        { name: 'nameLabel', title: 'Label Nom Complet', type: 'object', fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }] },
        { name: 'phoneLabel', title: 'Label Téléphone', type: 'object', fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }] },
        { name: 'wilayaLabel', title: 'Label Wilaya', type: 'object', fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }] },
        { name: 'buttonText', title: 'Texte du Bouton', type: 'object', fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }] },
        { name: 'securityText', title: 'Texte de Sécurité (ex: Infos sécurisées)', type: 'object', fields: [{ name: 'fr', type: 'string' }, { name: 'ar', type: 'string' }] }
      ]
    }
  ]
}