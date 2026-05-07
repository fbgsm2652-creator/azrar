export function PrintLabelAction(props: any) {
  // On n'affiche le bouton QUE si c'est une commande ET qu'elle a un tracking
  const trackingCode = props.published?.tracking_noest

  if (props.type !== 'order' || !trackingCode) {
    return null
  }

  return {
    label: '🖨️ Imprimer Bordereau NOEST',
    onHandle: () => {
      // 🪄 LA MAGIE EST ICI : Plus de fetch, plus de CORS ! 
      // On ouvre directement le lien de votre API "label" dans un nouvel onglet.
      // Le navigateur va charger le PDF tout seul !
      const pdfUrl = `http://localhost:3000/api/noest/label?tracking=${trackingCode}`
      
      const printWindow = window.open(pdfUrl, '_blank')
      
      if (!printWindow) {
        alert("Veuillez autoriser les pop-ups pour voir le bordereau.")
      }
    }
  }
}