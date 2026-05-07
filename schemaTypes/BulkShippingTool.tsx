import React, { useState, useEffect } from 'react';
import { useClient } from 'sanity';
import { PDFDocument, PageSizes } from 'pdf-lib';

export function BulkShippingTool() {
  const client = useClient({ apiVersion: '2023-01-01' });
  
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ ca: 0, marge: 0, count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [readyToPrintCount, setReadyToPrintCount] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [printFormat, setPrintFormat] = useState<'A4' | 'THERMAL'>('A4');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const queryNew = '*[_type == "order" && status == "new"] | order(_createdAt desc) { ..., "station_code": station_code }';
      const resultNew = await client.fetch(queryNew);
      setOrders(resultNew);

      const queryPrint = 'count(*[_type == "order" && status == "dispatched" && defined(tracking_noest) && !(tracking_noest match "WAIT-*")])';
      const resultPrintCount = await client.fetch(queryPrint);
      setReadyToPrintCount(resultPrintCount);

      const queryStats = `*[_type == "order" && status in ["dispatched", "delivered"]] {
        montant,
        "prixAchats": items[].product->pricing.purchasePrice
      }`;
      const statsData = await client.fetch(queryStats);

      let totalCA = 0;
      let totalCout = 0;

      statsData.forEach((cmd: any) => {
        totalCA += (cmd.montant || 0);
        const coutCommande = (cmd.prixAchats || []).reduce(
          (acc: number, curr: number) => acc + (curr || 0), 0
        );
        totalCout += coutCommande;
      });

      setStats({ ca: totalCA, marge: totalCA - totalCout, count: statsData.length });
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
    setIsLoading(false);
  };

  const addLog = (msg: string) => setLog(prev => [msg, ...prev]);

  // ── EXPÉDITION GROUPÉE ────────────────────────────────────────────────────
  const handleBulkShip = async () => {
    if (!confirm(`Confirmer l'expédition de ${orders.length} commandes ?`)) return;
    setIsProcessing(true);
    setProgress(0);
    setLog([]);
    let successCount = 0;

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      setProgress(i + 1);

      try {
        addLog(`⏳ Envoi : ${order.reference}...`);

        const orderPayload = {
          ...order,
          stop_desk: order.stop_desk === 1 || order.stop_desk === true ? 1 : 0,
          station_code: order.stop_desk === 1 ? (order.station_code || '') : ''
        };

        const res = await fetch('http://localhost:3000/api/noest/ship', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: orderPayload })
        });

        const data = await res.json();

        if (data.success) {
          await client.patch(order._id)
            .set({ tracking_noest: data.tracking, status: 'dispatched' })
            .commit();
          successCount++;
          addLog(`✅ OK : ${order.reference} -> ${data.tracking}`);
        } else {
          addLog(`❌ Erreur ${order.reference} : ${data.message}`);
        }
      } catch (err: any) {
        addLog(`🚨 Erreur réseau ${order.reference}`);
      }

      await new Promise(r => setTimeout(r, 200));
    }

    addLog(`🎉 Terminé ! ${successCount} expédiées.`);
    setIsProcessing(false);
    fetchDashboardData();
  };

  // ── IMPRESSION GROUPÉE ────────────────────────────────────────────────────
  const handleBulkPrint = async () => {
    setIsPrinting(true);
    addLog('🖨️ Préparation de l\'impression...');

    try {
      const query = '*[_type == "order" && status == "dispatched" && defined(tracking_noest)]';
      const ordersToPrint = await client.fetch(query);

      const trackings = ordersToPrint
        .map((o: any) => o.tracking_noest)
        .filter((t: string) => t && !t.startsWith('WAIT-'));

      if (trackings.length === 0) {
        addLog('⚠️ Aucun bordereau réel à imprimer.');
        setIsPrinting(false);
        return;
      }

      const res = await fetch('http://localhost:3000/api/noest/print-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackings })
      });
      const data = await res.json();

      if (data.success && data.pdfBase64) {
        addLog('✅ Données reçues. Structuration du document...');

        // Conversion Base64 → ArrayBuffer propre
        const byteCharacters = atob(data.pdfBase64);
        const buffer = new ArrayBuffer(byteCharacters.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < byteCharacters.length; i++) {
          view[i] = byteCharacters.charCodeAt(i);
        }

        // FIX : on travaille avec ArrayBuffer directement — plus de Uint8Array<ArrayBufferLike>
        let finalBuffer: ArrayBuffer = buffer;

        // ── FORMAT A4 : 4 étiquettes par page ─────────────────────────────
        if (printFormat === 'A4') {
          addLog('📐 Reformatage en 4 étiquettes par page A4...');
          try {
            // FIX : cast explicite en ArrayBuffer pour pdf-lib
            const originalPdf = await PDFDocument.load(buffer as ArrayBuffer);
            const finalPdf = await PDFDocument.create();
            const pages = originalPdf.getPages();
            const [A4_WIDTH, A4_HEIGHT] = PageSizes.A4;

            for (let i = 0; i < pages.length; i += 4) {
              const newPage = finalPdf.addPage([A4_WIDTH, A4_HEIGHT]);

              for (let j = 0; j < 4; j++) {
                if (i + j < pages.length) {
                  const embeddedPage = await finalPdf.embedPage(pages[i + j]);

                  const margin = 10;
                  const quadW = A4_WIDTH / 2;
                  const quadH = A4_HEIGHT / 2;

                  const scale = Math.min(
                    (quadW - margin * 2) / embeddedPage.width,
                    (quadH - margin * 2) / embeddedPage.height
                  );

                  const xPos = (j % 2 === 0) ? 0 : quadW;
                  const yPos = (j < 2) ? quadH : 0;

                  const scaledW = embeddedPage.width * scale;
                  const scaledH = embeddedPage.height * scale;

                  newPage.drawPage(embeddedPage, {
                    x: xPos + (quadW - scaledW) / 2,
                    y: yPos + (quadH - scaledH) / 2,
                    xScale: scale,
                    yScale: scale
                  });
                }
              }
            }

            // FIX : save() retourne Uint8Array — on extrait son ArrayBuffer proprement
            const saved = await finalPdf.save();
            finalBuffer = saved.buffer.slice(
              saved.byteOffset,
              saved.byteOffset + saved.byteLength
            ) as ArrayBuffer;

          } catch (e) {
            addLog('❌ Erreur lors du formatage A4. Impression standard...');
            finalBuffer = buffer;
          }
        }

        // ── IMPRESSION VIA IFRAME INVISIBLE ───────────────────────────────
        const blob = new Blob([finalBuffer], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        let iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
        if (!iframe) {
          iframe = document.createElement('iframe');
          iframe.id = 'print-iframe';
          iframe.style.display = 'none';
          document.body.appendChild(iframe);
        }

        iframe.src = blobUrl;

        iframe.onload = () => {
          setTimeout(() => {
            try {
              if (iframe.contentWindow) {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                addLog(`🖨️ Impression lancée ! (${trackings.length} étiquettes)`);
              }
            } catch (e) {
              addLog('❌ Erreur navigateur, ouverture dans un nouvel onglet...');
              window.open(blobUrl, '_blank');
            }
            setTimeout(() => URL.revokeObjectURL(blobUrl), 120000);
          }, 500);
        };

      } else {
        addLog(`❌ Erreur d'impression : ${data.message}`);
      }
    } catch (err: any) {
      addLog('🚨 Erreur réseau lors de l\'impression.');
    }

    setIsPrinting(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <h1 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '30px' }}>📊 Business Intelligence & Logistique</h1>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <StatCard title="Chiffre d'Affaires" value={`${stats.ca.toLocaleString()} DZD`} color="#0f172a" />
        <StatCard
          title="Bénéfice Net (Marge)"
          value={`${stats.marge.toLocaleString()} DZD`}
          color="#2563eb"
          subtitle={`${stats.ca > 0 ? Math.round((stats.marge / stats.ca) * 100) : 0}% de marge brute`}
        />
        <StatCard title="Total Commandes" value={stats.count.toString()} color="#64748b" />
      </div>

      <div style={{ display: 'flex', gap: '25px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginTop: 0 }}>📦 Opérations de masse</h3>

            <div style={{ marginBottom: '25px' }}>
              <p><strong>{orders.length}</strong> commandes à traiter.</p>
              <button
                onClick={handleBulkShip}
                disabled={isProcessing || orders.length === 0}
                style={{
                  width: '100%', padding: '15px',
                  backgroundColor: isProcessing ? '#94a3b8' : '#22c55e',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s'
                }}
              >
                {isProcessing ? `Expédition ${progress}/${orders.length}...` : '🚀 Expédier vers NOEST'}
              </button>
            </div>

            {/* Sélecteur format impression */}
            <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '10px', color: '#475569' }}>
                Format du papier (Gaspillage 0%) :
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {(['A4', 'THERMAL'] as const).map(fmt => (
                  <div
                    key={fmt}
                    onClick={() => setPrintFormat(fmt)}
                    style={{
                      flex: 1, padding: '10px', textAlign: 'center', borderRadius: '8px',
                      border: printFormat === fmt ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                      backgroundColor: printFormat === fmt ? '#eff6ff' : '#fff',
                      cursor: 'pointer', fontSize: '13px', fontWeight: 'bold',
                      color: printFormat === fmt ? '#1d4ed8' : '#64748b',
                      transition: 'all 0.2s'
                    }}
                  >
                    {fmt === 'A4' ? '📄 A4 (4 par page)' : '🏷️ Thermique (1/page)'}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p><strong>{readyToPrintCount}</strong> étiquettes prêtes.</p>
              <button
                onClick={handleBulkPrint}
                disabled={isPrinting || readyToPrintCount === 0 || isProcessing}
                style={{
                  width: '100%', padding: '15px',
                  backgroundColor: (isPrinting || readyToPrintCount === 0) ? '#94a3b8' : '#3b82f6',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s'
                }}
              >
                {isPrinting ? 'Création du PDF...' : '🖨️ Imprimer les bordereaux'}
              </button>
            </div>
          </div>
        </div>

        {/* Console logistique */}
        <div style={{ flex: 1 }}>
          <div style={{ backgroundColor: '#1e293b', color: '#10b981', padding: '20px', borderRadius: '15px', height: '460px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '13px' }}>
            <h4 style={{ marginTop: 0, color: '#94a3b8', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>&gt;_ Console Logistique</h4>
            {log.length === 0 && <div style={{ color: '#475569' }}>En attente d'instructions...</div>}
            {log.map((entry, i) => <div key={i} style={{ marginBottom: '6px' }}>{entry}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, subtitle }: { title: string; value: string; color: string; subtitle?: string }) {
  return (
    <div style={{ flex: 1, padding: '25px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: `5px solid ${color}` }}>
      <h4 style={{ margin: 0, color: '#64748b', fontSize: '13px', textTransform: 'uppercase', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
        {title}
      </h4>
      <p style={{ fontSize: '32px', fontWeight: '800', margin: '10px 0', color, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
        {value}
      </p>
      {subtitle && (
        <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 'bold', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}