// DebugFooter.tsx - Page de test pour FloatingFooter
import FloatingFooter from '../components/ui/FloatingFooter';

export default function DebugFooter() {
  const FOOTER_H = 88;
  const footerPadBottom = `max(env(safe-area-inset-bottom, 16px), 16px)`;
  const contentPadBottom = `calc(${FOOTER_H}px + ${footerPadBottom} + 16px)`;

  return (
    <div className='w-full min-h-[100svh] bg-myconfort-cream relative overflow-x-hidden'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-myconfort-dark/10 bg-white'>
        <h1 className='text-2xl font-bold text-myconfort-dark'>
          🔧 Test Footer Flottant
        </h1>
        <p className='text-myconfort-dark/70 text-sm'>
          Test de visibilité des boutons sur iPad Safari
        </p>
      </div>

      {/* Content avec padding pour éviter masquage footer */}
      <div
        className='px-6 py-8 space-y-6'
        style={{ paddingBottom: contentPadBottom }}
      >
        <div className='bg-white p-6 rounded-xl border shadow-sm'>
          <h2 className='text-xl font-bold mb-4 text-myconfort-dark'>
            Instructions de test :
          </h2>
          <ol className='list-decimal list-inside space-y-2 text-myconfort-dark/80'>
            <li>
              Vérifiez que vous voyez les boutons "Précédent" et "Suivant" en
              bas
            </li>
            <li>
              Faites défiler jusqu'en bas pour confirmer qu'ils restent visibles
            </li>
            <li>Testez que les boutons réagissent au touch</li>
            <li>Vérifiez qu'il n'y a pas de masquage par le safe-area</li>
          </ol>
        </div>

        <div className='bg-myconfort-green/10 p-6 rounded-xl border border-myconfort-green/30'>
          <h3 className='text-lg font-bold text-myconfort-dark mb-2'>
            Configuration actuelle :
          </h3>
          <ul className='space-y-1 text-sm text-myconfort-dark/70'>
            <li>• Viewport : viewport-fit=cover</li>
            <li>• Wrapper : min-h-[100svh] overflow-x-hidden</li>
            <li>• Footer : z-[9999] fixed + Portal</li>
            <li>• Safe-area : max(env(safe-area-inset-bottom, 16px), 16px)</li>
            <li>• Content padding : calc(88px + safe-area + 16px)</li>
          </ul>
        </div>

        {/* Contenu de remplissage pour tester scroll */}
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className='bg-white p-4 rounded-lg border'>
            <h4 className='font-semibold'>Section {i + 1}</h4>
            <p className='text-gray-600 text-sm'>
              Contenu de test pour vérifier le scroll et l'affichage du footer.
              Les boutons doivent rester visibles en permanence.
            </p>
          </div>
        ))}

        <div className='bg-red-50 border border-red-200 p-6 rounded-xl'>
          <h3 className='text-lg font-bold text-red-700 mb-2'>
            🚨 Si vous ne voyez pas les boutons :
          </h3>
          <ul className='space-y-1 text-sm text-red-600'>
            <li>1. Problème Safari iPad (zoom, orientation, etc.)</li>
            <li>2. Problème CSS safe-area non supporté</li>
            <li>3. Problème z-index ou Portal</li>
            <li>4. Problème viewport fit ou configuration</li>
          </ul>
        </div>
      </div>

      {/* Test FloatingFooter */}
      <FloatingFooter
        leftLabel='← Précédent'
        onLeft={() => alert('Bouton Précédent fonctionne !')}
        rightLabel='Suivant →'
        onRight={() => alert('Bouton Suivant fonctionne !')}
      />
    </div>
  );
}
