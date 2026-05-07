import { cache } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { client } from '@/lib/sanity';
import ProductCard from '@/components/ProductCard';

// ─── FETCH AVEC CACHE REACT ───────────────────────────────────────────────────
// cache() déduplique les appels : generateMetadata() et Home() partagent
// le même résultat — une seule requête Sanity par chargement de page.
const getHomepageData = cache(async () => {
  const query = `*[_type == "homepage"][0]{
    Hero_Title,
    Hero_Subtitle,
    Hero_Button,
    "imageUrl": Hero_Image.asset->url,
    reassurance,

    "featuredProducts": featuredProducts[]->{
      _id, name, slug, price, oldPrice,
      "imageUrl": images[0].asset->url,
      "isAvailable": count(variants[stock > 0]) > 0
    },

    "bestSellers": bestSellers[]->{
      _id, name, slug, price, oldPrice,
      "imageUrl": images[0].asset->url,
      "isAvailable": count(variants[stock > 0]) > 0
    },

    advancedSEO {
      metaTitle,
      metaDescription,
      metaKeywords,
      "shareImage": shareImage.asset->url
    },

    SEO_Block_Title,
    SEO_Block_Text
  }`;

  try {
    // FIX : revalidate 3600 au lieu de 0 — évite un fetch Sanity à chaque visite
    return await client.fetch(query, {}, { next: { revalidate: 3600 } });
  } catch (error) {
    console.error('Erreur Sanity Homepage:', error);
    return null;
  }
});

// ─── SEO DYNAMIQUE ────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { lang } = await params;
  // FIX : cache() garantit qu'on ne refetch pas — même appel que Home()
  const homepage = await getHomepageData();

  if (!homepage?.advancedSEO) {
    return { title: 'Original Look | Algérie' };
  }

  const seo = homepage.advancedSEO;
  const title = seo.metaTitle?.[lang] ?? 'Original Look | Mode & Textile en Algérie';
  const description = seo.metaDescription?.[lang] ?? 'La finesse et la qualité à votre porte en Algérie. Livraison 58 wilayas.';
  const keywords = seo.metaKeywords?.[lang] ?? 'mode, vêtements, original look, algérie, livraison';
  const ogImage = seo.shareImage ?? 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80';

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: [ogImage],
      locale: lang === 'ar' ? 'ar_DZ' : 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

// ─── SKELETON PRODUITS ────────────────────────────────────────────────────────
function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-gray-100 rounded-2xl mb-3" />
          <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

// ─── PAGE D'ACCUEIL ───────────────────────────────────────────────────────────
export default async function Home({ params }) {
  const { lang } = await params;
  const isAr = lang === 'ar';

  // FIX : cache() — même résultat que generateMetadata(), pas de double fetch
  const homepage = await getHomepageData();

  const t = {
    phares: isAr ? 'المنتجات المميزة' : 'Produits Phares',
    bestSellers: isAr ? 'الأكثر مبيعاً' : 'Meilleures Ventes',
    voirTout: isAr ? '← عرض الكل' : 'Voir tout →',
  };

  if (!homepage) {
    return (
      <div className="p-20 text-center font-bold text-[#00AEEF]">
        Chargement d'Original Look...
      </div>
    );
  }

  const title       = homepage.Hero_Title?.[lang]    ?? '';
  const subtitle    = homepage.Hero_Subtitle?.[lang] ?? '';
  const buttonText  = homepage.Hero_Button?.[lang]   ?? '';
  const seoTitle    = homepage.SEO_Block_Title?.[lang] ?? '';
  const seoText     = homepage.SEO_Block_Text?.[lang]  ?? '';
  const imageUrl    = homepage.imageUrl ?? 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80';

  const assuranceBlocks  = homepage.reassurance     ?? [];
  const featuredProducts = homepage.featuredProducts ?? [];
  const bestSellers      = homepage.bestSellers      ?? [];

  return (
    // FIX : dir explicite + suppression du style fontFamily (géré par layout.tsx)
    <div dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── HERO MOBILE-FIRST ─────────────────────────────────────────────────
           Sur mobile : image plein écran avec texte superposé en bas
           Sur PC     : layout côte à côte classique                          */}
      <section className="relative bg-white overflow-hidden">

        {/* ── VERSION MOBILE : image full-bleed + overlay texte ── */}
        <div className="relative lg:hidden">
          {/* Image pleine largeur, ratio portrait serré */}
          <div className="relative w-full aspect-[4/5] overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover object-top"
              priority
              sizes="100vw"
            />
            {/* Dégradé du bas vers le haut pour lisibilité du texte */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>

          {/* Texte superposé en bas de l'image */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-16">
            <h1 className={`text-3xl font-black text-white mb-3 leading-tight ${isAr ? 'text-right' : 'text-left'}`}>
              {title}
            </h1>
            <p className={`text-white/80 text-[15px] mb-5 leading-relaxed ${isAr ? 'text-right' : 'text-left'}`}>
              {subtitle}
            </p>
            <Link
              href={`/${lang}/category`}
              className="inline-flex items-center gap-2 bg-[#FF8C00] text-white font-bold px-6 py-3.5 rounded-xl text-[15px] hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 active:scale-95"
            >
              {buttonText}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={isAr ? 'rotate-180' : ''}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* ── VERSION PC : Hero plein écran éditorial ── */}
        <div className="hidden lg:block relative w-full" style={{height: '92vh', minHeight: '600px', maxHeight: '860px'}}>

          {/* Image plein écran */}
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />

          {/* Overlay dégradé gauche → droite (ou droite → gauche en arabe) */}
          <div
            className={`absolute inset-0 ${isAr
              ? 'bg-gradient-to-l from-black/85 via-black/40 to-transparent'
              : 'bg-gradient-to-r from-black/85 via-black/40 to-transparent'
            }`}
          />

          {/* Contenu texte — ancré à gauche (ou droite en arabe) */}
          <div className={`absolute inset-0 flex items-center ${isAr ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl px-16 ${isAr ? 'text-right' : 'text-left'}`}>

              {/* Pill label — depuis le 1er bloc réassurance Sanity si disponible */}
              {assuranceBlocks.length > 0 && (
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-[13px] font-medium px-4 py-2 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C00] animate-pulse" />
                  {assuranceBlocks[0].icon} {assuranceBlocks[0].title?.[lang]}
                </div>
              )}

              {/* Titre grand format */}
              <h1 className="text-5xl xl:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
                {title}
              </h1>

              {/* Ligne décorative */}
              <div className={`w-16 h-1 bg-[#FF8C00] rounded-full mb-6 ${isAr ? 'mr-auto' : 'ml-0'}`} />

              {/* Sous-titre */}
              <p className="text-white/75 text-[17px] leading-relaxed mb-10 max-w-md">
                {subtitle}
              </p>

              {/* Boutons CTA */}
              <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                <Link
                  href={`/${lang}/category`}
                  className="inline-flex items-center gap-2.5 bg-[#FF8C00] hover:bg-[#e67e00] text-white font-bold px-8 py-4 rounded-xl text-[16px] transition-all duration-200 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {buttonText}
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={isAr ? 'rotate-180' : ''}>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>

                {/* Bouton secondaire ghost */}
                <Link
                  href={`/${lang}/category`}
                  className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white font-medium px-6 py-4 rounded-xl text-[15px] transition-all duration-200 backdrop-blur-sm hover:bg-white/10"
                >
                  {isAr ? 'اكتشف المجموعة' : 'Découvrir'}
                </Link>
              </div>

              {/* Badges réassurance — depuis Sanity (champ reassurance) */}
              {assuranceBlocks.length > 0 && (
                <div className={`flex items-center gap-6 mt-10 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
                  {assuranceBlocks.slice(0, 3).map((block, i) => (
                    <div key={i} className={`flex items-center gap-2 text-white/70 text-[13px] ${isAr ? 'flex-row-reverse' : ''}`}>
                      <span>{block.icon}</span>
                      <span>{block.title?.[lang]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Indicateur scroll discret en bas au centre */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
            <span className="text-[11px] font-medium tracking-widest uppercase">
              {isAr ? 'اكتشف' : 'Découvrir'}
            </span>
            <div className="w-px h-8 bg-white/20 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ── RÉASSURANCE ───────────────────────────────────────────────────── */}
      {assuranceBlocks.length > 0 && (
        <section className="bg-white border-y border-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {assuranceBlocks.map((block, index) => (
              <div key={index} className="text-center p-4 bg-blue-50 rounded-xl">
                <span className="text-3xl block mb-2">{block.icon}</span>
                <h4 className="font-bold text-gray-900 text-sm">
                  {block.title?.[lang]}
                </h4>
                <p className="text-xs text-[#00AEEF] font-semibold mt-1">
                  {block.subtitle?.[lang]}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── PRODUITS PHARES ───────────────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900">{t.phares}</h2>
                <div className="h-1 w-20 bg-[#FF8C00] mt-2 rounded-full" />
              </div>
              <Link
                href={`/${lang}/category`}
                className="text-[#00AEEF] font-bold hover:underline text-sm"
              >
                {t.voirTout}
              </Link>
            </div>
            {/* Suspense pour afficher le Hero pendant que les produits chargent */}
            <Suspense fallback={<ProductsSkeleton />}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {featuredProducts.map(product => (
                  <ProductCard key={product._id} product={product} lang={lang} />
                ))}
              </div>
            </Suspense>
          </div>
        </section>
      )}

      {/* ── MEILLEURES VENTES ─────────────────────────────────────────────── */}
      {bestSellers.length > 0 && (
        <section className="bg-gray-50 pt-4 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900">{t.bestSellers} 🔥</h2>
                <div className="h-1 w-20 bg-black mt-2 rounded-full" />
              </div>
            </div>
            <Suspense fallback={<ProductsSkeleton />}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {bestSellers.map(product => (
                  <ProductCard key={product._id} product={product} lang={lang} />
                ))}
              </div>
            </Suspense>
          </div>
        </section>
      )}

      {/* ── BLOC SEO ──────────────────────────────────────────────────────── */}
      {(seoTitle || seoText) && (
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          {seoTitle && (
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{seoTitle}</h3>
          )}
          {seoText && (
            <p className="text-gray-600 leading-relaxed bg-blue-50 p-8 rounded-2xl">
              {seoText}
            </p>
          )}
        </section>
      )}

    </div>
  );
}