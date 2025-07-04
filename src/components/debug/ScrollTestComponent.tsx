// src/components/debug/ScrollTestComponent.tsx
import React from 'react';

export const ScrollTestComponent: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Test de défilement - Barre de navigation</h2>
      <p className="mb-4 text-gray-600">
        Faites défiler cette page pour vérifier que la barre de navigation reste fixe en haut sur mobile.
      </p>
      
      {/* Contenu long pour forcer le défilement */}
      {Array.from({ length: 50 }, (_, i) => (
        <div key={i} className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Section {i + 1}</h3>
          <p className="text-gray-700">
            Ceci est du contenu de test pour créer une page longue qui nécessite un défilement.
            La barre de navigation mobile devrait rester fixe en haut de l'écran même quand vous
            faites défiler cette page. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          {i % 10 === 0 && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800">
              <strong>Point de contrôle {Math.floor(i / 10) + 1}</strong> - 
              La barre de navigation est-elle toujours visible ?
            </div>
          )}
        </div>
      ))}
      
      <div className="mt-8 p-6 bg-green-50 rounded-lg border-2 border-green-200">
        <h3 className="text-xl font-bold text-green-800 mb-2">✅ Test terminé !</h3>
        <p className="text-green-700">
          Si vous pouvez voir la barre de navigation en haut pendant tout le défilement,
          la correction a bien fonctionné !
        </p>
      </div>
    </div>
  );
};

export default ScrollTestComponent;
