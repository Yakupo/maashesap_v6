import { useEffect } from 'react';

// AdSense onaylandığında buraya kendi değerlerini gir:
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX';
const ADSENSE_SLOT = 'XXXXXXXXXX';

export default function AdBanner() {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {}
  }, []);

  const isPlaceholder = ADSENSE_CLIENT === 'ca-pub-XXXXXXXXXXXXXXXX';

  return (
    <div className="w-full max-w-sm mx-auto my-2">
      {isPlaceholder ? (
        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl h-14 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600">
          <span className="text-xs text-gray-400">Reklam Alanı</span>
        </div>
      ) : (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minHeight: '50px' }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={ADSENSE_SLOT}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
}
