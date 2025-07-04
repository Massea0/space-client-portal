// src/pages/AnimationShowcase.tsx
import React from 'react';
import { AnimatedButton, MotionButton } from '@/components/ui/animated-button';
import { HoverCardExample } from '@/components/ui/hover-card-example';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { useVisualEffect } from '@/components/ui/visual-effect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

const AnimationShowcase = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalType, setModalType] = React.useState<'zoom' | 'slide' | 'fade' | 'bounce' | 'flip'>('zoom');
  const { playEffect, EffectComponent } = useVisualEffect();

  return (
    <div className="container py-12 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Showcase des animations</h1>
        <p className="text-muted-foreground">
          Démonstration des composants animés et effets visuels disponibles dans l'application
        </p>
      </div>

      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="buttons">Boutons</TabsTrigger>
          <TabsTrigger value="cards">Cartes</TabsTrigger>
          <TabsTrigger value="modals">Modaux</TabsTrigger>
          <TabsTrigger value="effects">Effets visuels</TabsTrigger>
          <TabsTrigger value="forms">Formulaires</TabsTrigger>
        </TabsList>
        
        {/* Section Boutons */}
        <TabsContent value="buttons" className="py-6 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Boutons animés</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6 space-y-4">
                <h3 className="text-xl font-medium">Animation CSS</h3>
                <div className="flex flex-wrap gap-4">
                  <AnimatedButton animationType="hover">Hover Effect</AnimatedButton>
                  <AnimatedButton animationType="pulse" variant="default">Pulse Effect</AnimatedButton>
                  <AnimatedButton animationType="grow" variant="outline">Grow Effect</AnimatedButton>
                  <AnimatedButton animationType="shine" variant="secondary">Shine Effect</AnimatedButton>
                </div>
              </Card>
              
              <Card className="p-6 space-y-4">
                <h3 className="text-xl font-medium">Animation Framer Motion</h3>
                <div className="flex flex-wrap gap-4">
                  <MotionButton>Spring Effect</MotionButton>
                </div>
              </Card>
            </div>
          </section>
        </TabsContent>
        
        {/* Section Cartes */}
        <TabsContent value="cards" className="py-6 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Cartes animées</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <HoverCardExample 
                title="Carte avec hover" 
                description="Cette carte utilise l'animation au survol"
              >
                <p>Passez votre souris sur cette carte pour voir l'effet d'élévation.</p>
              </HoverCardExample>
              
              <HoverCardExample 
                title="Carte interactive" 
                description="Avec bouton animé"
                footer={<AnimatedButton animationType="pulse" className="w-full">Voir plus</AnimatedButton>}
              >
                <p>Cette carte comprend un bouton animé avec un effet de pulsation.</p>
              </HoverCardExample>
              
              <HoverCardExample 
                title="Carte avec ombre" 
                description="Effet de profondeur"
              >
                <p>Cette carte utilise un effet d'ombre renforcé au survol.</p>
              </HoverCardExample>
            </div>
          </section>
        </TabsContent>
        
        {/* Section Modaux */}
        <TabsContent value="modals" className="py-6 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Modaux animés</h2>
            
            <Card className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Types d'animations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <Button variant={modalType === 'zoom' ? 'default' : 'outline'} onClick={() => setModalType('zoom')}>Zoom</Button>
                  <Button variant={modalType === 'slide' ? 'default' : 'outline'} onClick={() => setModalType('slide')}>Slide</Button>
                  <Button variant={modalType === 'fade' ? 'default' : 'outline'} onClick={() => setModalType('fade')}>Fade</Button>
                  <Button variant={modalType === 'bounce' ? 'default' : 'outline'} onClick={() => setModalType('bounce')}>Bounce</Button>
                  <Button variant={modalType === 'flip' ? 'default' : 'outline'} onClick={() => setModalType('flip')}>Flip</Button>
                </div>
                
                <div className="flex justify-center pt-4">
                  <AnimatedButton animationType="hover" onClick={() => setIsModalOpen(true)}>
                    Ouvrir le modal ({modalType})
                  </AnimatedButton>
                </div>
              </div>
            </Card>
            
            <AnimatedModal
              isOpen={isModalOpen}
              onOpenChange={setIsModalOpen}
              title="Modal animé"
              description="Ce modal utilise différentes animations selon votre sélection"
              animationType={modalType}
              size="md"
              footer={
                <Button onClick={() => setIsModalOpen(false)}>Fermer</Button>
              }
            >
              <div className="space-y-4 py-2">
                <p>Ce modal utilise l'animation de type <strong>{modalType}</strong>.</p>
                <p>Essayez différentes animations pour voir les effets.</p>
              </div>
            </AnimatedModal>
          </section>
        </TabsContent>
        
        {/* Section Effets visuels */}
        <TabsContent value="effects" className="py-6 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Effets visuels</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6 space-y-4">
                <h3 className="text-xl font-medium">Effets de célébration</h3>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => playEffect('confetti')}>Confetti</Button>
                  <Button onClick={() => playEffect('celebration')}>Célébration</Button>
                  <Button onClick={() => playEffect('stars')}>Étoiles</Button>
                </div>
              </Card>
              
              <Card className="p-6 space-y-4">
                <h3 className="text-xl font-medium">Effets de notification</h3>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => playEffect('success')}>Succès</Button>
                  <Button onClick={() => playEffect('fire')}>Erreur</Button>
                </div>
              </Card>
            </div>
          </section>
        </TabsContent>
        
        {/* Section Formulaires */}
        <TabsContent value="forms" className="py-6 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Formulaires animés</h2>
            
            <Card className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom</Label>
                    <Input id="name" className="animated-input" placeholder="Entrez votre nom" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" className="animated-input" placeholder="Entrez votre email" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select>
                      <SelectTrigger className="animated-input">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="type1">Type 1</SelectItem>
                        <SelectItem value="type2">Type 2</SelectItem>
                        <SelectItem value="type3">Type 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <AnimatedButton animationType="hover" className="mt-2">Envoyer</AnimatedButton>
                </div>
                
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Les formulaires utilisent des animations subtiles pour améliorer l'expérience utilisateur.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li>Effet de focus sur les champs</li>
                    <li>Transitions fluides</li>
                    <li>Feedback visuel</li>
                    <li>Boutons animés</li>
                  </ul>
                </div>
              </div>
            </Card>
          </section>
        </TabsContent>
      </Tabs>
      
      {/* Composant des effets visuels */}
      {EffectComponent}
    </div>
  );
};

export default AnimationShowcase;
