import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User, Lock, Settings, Monitor, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { dashboardManager, dashboards, type DashboardType } from '../lib/dashboard-manager';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModalSimple({ isOpen, onClose }: UserProfileModalProps) {
  const { toast } = useToast();
  const [currentDashboard, setCurrentDashboard] = useState<DashboardType>(dashboardManager.getCurrentDashboard());

  // Mock user data
  const [userData, setUserData] = useState({
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@charlesandre.com',
    phone: '+33 1 23 45 67 89',
    address: '123 Rue de la Paix, 75001 Paris',
    role: 'Gestionnaire'
  });

  const handleUserDataChange = (field: string, value: string) => {
    setUserData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profil sauvegardé",
      description: "Vos informations ont été mises à jour avec succès.",
    });
  };

  const handlePasswordChange = (e: any) => {
    e.preventDefault();
    toast({
      title: "Mot de passe modifié",
      description: "Votre mot de passe a été modifié avec succès.",
    });
  };

  const handleDashboardChange = (dashboard: DashboardType) => {
    setCurrentDashboard(dashboard);
    dashboardManager.setDashboard(dashboard);
    toast({
      title: "Dashboard modifié",
      description: `Le dashboard ${dashboards[dashboard].name} a été appliqué. La page va se recharger.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-6 w-6" />
            <span>Profil Utilisateur</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profil</span>
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Mot de passe</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Préférences</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet Profil */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Informations personnelles</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                      {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{userData.firstName} {userData.lastName}</h3>
                    <p className="text-muted-foreground">{userData.role}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Changer la photo
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={userData.firstName}
                      onChange={(e: any) => handleUserDataChange('firstName', e.target.value)}
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={userData.lastName}
                      onChange={(e: any) => handleUserDataChange('lastName', e.target.value)}
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      onChange={(e: any) => handleUserDataChange('email', e.target.value)}
                      placeholder="votre.email@exemple.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={userData.phone}
                      onChange={(e: any) => handleUserDataChange('phone', e.target.value)}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={userData.address}
                      onChange={(e: any) => handleUserDataChange('address', e.target.value)}
                      placeholder="Votre adresse complète"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveProfile} className="w-full">
                    Sauvegarder les modifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Mot de passe */}
          <TabsContent value="password" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Changer le mot de passe</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mot de passe actuel</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Entrez votre mot de passe actuel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nouveau mot de passe</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Entrez votre nouveau mot de passe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirmez votre nouveau mot de passe"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Modifier le mot de passe
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Préférences */}
          <TabsContent value="preferences" className="space-y-6">
            {/* Sélection du Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>Sélection du dashboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {Object.entries(dashboards).map(([key, dashboard]) => (
                    <div
                      key={key}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        currentDashboard === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => handleDashboardChange(key as DashboardType)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{dashboard.name}</h3>
                          <p className="text-sm text-muted-foreground">{dashboard.description}</p>
                        </div>
                        {currentDashboard === key && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Actuel
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Informations sur le Thème Charles André */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Thème de l'Application</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🏢</div>
                      <div>
                        <h3 className="font-semibold text-blue-900">Charles André</h3>
                        <p className="text-sm text-blue-700">Thème professionnel aux couleurs du groupe</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Appliqué
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-blue-600 font-medium mb-2">Couleurs :</div>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-700" title="Bleu professionnel"></div>
                      <div className="w-6 h-6 rounded-full bg-red-600" title="Rouge Charles André"></div>
                      <div className="w-6 h-6 rounded-full bg-green-600" title="Vert transport"></div>
                      <div className="w-6 h-6 rounded-full bg-slate-500" title="Gris moderne"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
