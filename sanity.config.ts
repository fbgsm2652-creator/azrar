// 1. TOUS LES IMPORTS SONT EN HAUT
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

// CHANGEMENT ICI : Le chemin pointe maintenant vers schemaTypes/actions/
import { ShipNoestAction } from './schemaTypes/actions/ShipNoestAction'
import { PrintLabelAction } from './schemaTypes/actions/PrintLabelAction'

// 🚀 NOUVEAU : Import de notre outil d'expédition groupée (Le Dashboard)
import { BulkShippingTool } from "./schemaTypes/BulkShippingTool";

// 2. UN SEUL BLOC DE CONFIGURATION
export default defineConfig({
  name: 'default',
  title: 'azrar',

  projectId: 'p6veu0u0',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  // 🚀 NOUVEAU : AJOUT DE L'OUTIL DANS LE MENU PRINCIPAL DE SANITY
  tools: (prev) => {
    return [
      ...prev,
      {
        name: 'bulk-shipping',
        title: '📦 Expédition',
        component: BulkShippingTool,
      },
    ]
  },

  schema: {
    types: schemaTypes,
  },

  // 3. NOS ACTIONS PERSONNALISÉES POUR LES COMMANDES (Boutons individuels)
  document: {
    actions: (prev, context) => {
      // Si on regarde une commande individuelle, on ajoute nos deux petits boutons
      if (context.schemaType === 'order') {
        return [...prev, ShipNoestAction, PrintLabelAction]
      }
      // Sinon, on laisse les boutons normaux de Sanity
      return prev
    }
  }
})