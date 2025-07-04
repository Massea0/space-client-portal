// Test simple pour les paramètres
import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SettingsTest = () => {
  const { currencySettings, businessContext, formatCurrency, loading } = useSettings();

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Test du système de paramètres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Devise</h3>
            <p>Symbole: {currencySettings.symbol}</p>
            <p>Position: {currencySettings.position}</p>
            <p>Test formatage: {formatCurrency(123456.78)}</p>
          </div>
          
          <div>
            <h3 className="font-semibold">Contexte métier</h3>
            <p>Secteur: {businessContext.context}</p>
            <p>Description: {businessContext.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTest;
