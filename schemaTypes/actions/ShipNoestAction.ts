import { useState } from 'react'
import { useDocumentOperation } from 'sanity'

export function ShipNoestAction(props: any) {
  const { patch, publish } = useDocumentOperation(props.id, props.type)
  const [isShipping, setIsShipping] = useState(false)

  // Si ce n'est pas une commande ou si elle est déjà expédiée, on n'affiche pas le bouton
  if (props.type !== 'order' || props.published?.tracking_noest) {
    return null
  }

  return {
    label: isShipping ? 'Expédition en cours...' : '📦 Expédier avec NOEST',
    disabled: isShipping,
    onHandle: async () => {
      setIsShipping(true)

      try {
        // 1. LA CORRECTION EST ICI : On met l'adresse complète de votre serveur Next.js
        const res = await fetch('http://localhost:3000/api/noest/ship', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: props.published })
        })

        // 2. On vérifie si l'API a répondu correctement avant de lire le JSON
        if (!res.ok) {
          throw new Error(`Le serveur Next.js a répondu avec une erreur ${res.status}`)
        }

        const data = await res.json()

        if (data.success) {
          // Si succès, on enregistre le tracking dans Sanity et on change le statut
          patch.execute([
            { set: { tracking_noest: data.tracking, status: 'dispatched' } }
          ])
          publish.execute()
          alert(`Succès ! Tracking : ${data.tracking}`)
        } else {
          alert(`Erreur NOEST : ${data.message || "Impossible d'expédier"}`)
        }
      } catch (err: any) {
        console.error("Détail de l'erreur d'expédition:", err);
        // 3. On affiche la VRAIE erreur pour pouvoir la corriger facilement
        alert(`Erreur de connexion : ${err.message}. Vérifiez que votre site Next.js (port 3000) est bien allumé !`);
      } finally {
        setIsShipping(false)
      }
    }
  }
}