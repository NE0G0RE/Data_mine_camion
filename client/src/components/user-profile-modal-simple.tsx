// @ts-nocheck
import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User, Lock, Settings, Monitor, X, Upload as UploadIcon, Camera } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { dashboardManager, dashboards, type DashboardType } from '../lib/dashboard-manager';
import { themeManager, type Theme } from '../lib/theme-manager';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModalSimple({ isOpen, onClose }: UserProfileModalProps) {
  const { toast } = useToast();
  const [currentDashboard, setCurrentDashboard] = useState<DashboardType>(dashboardManager.getCurrentDashboard());
  const [currentTheme, setCurrentTheme] = useState<Theme>(themeManager.getCurrentTheme());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mock user data
  const [userData, setUserData] = useState({
    id: 'user-123',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@charlesandre.com',
    phone: '+33 1 23 45 67 89',
    address: '123 Rue de la Paix, 75001 Paris',
    role: 'Gestionnaire',
    avatarUrl: '/placeholder-avatar.jpg'
  });

  const handleUserDataChange = (field: keyof typeof userData, value: string) => {
    setUserData((prev: typeof userData) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner une image (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale autorisée est de 5MB",
        variant: "destructive"
      });
      return;
    }

    // Aperçu de l'image
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadAvatar = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', userData.id);

      const response = await fetch('/api/users/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Échec du téléchargement');
      }

      const data = await response.json();
      
      // Mettre à jour l'URL de l'avatar dans l'état utilisateur
      setUserData(prev => ({
        ...prev,
        avatarUrl: data.avatarUrl
      }));

      toast({
        title: "Photo de profil mise à jour",
        description: "Votre photo de profil a été mise à jour avec succès.",
      });

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement de la photo.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Si une nouvelle image a été sélectionnée mais pas encore téléchargée
      if (avatarPreview && fileInputRef.current?.files?.[0]) {
        await uploadAvatar();
      }
      
      // Mettre à jour les autres informations du profil
      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Échec de la mise à jour du profil');
      }

      toast({
        title: "Profil sauvegardé",
        description: "Vos informations ont été mises à jour avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil.",
        variant: "destructive"
      });
    }
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

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    themeManager.setTheme(theme);
    toast({
      title: "Thème modifié",
      description: `Le thème a été changé avec succès.`,
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
                <div className="space-y-4">
                  <div className="flex items-center space-x-6">
                    <div className="relative group">
                      <Avatar className="w-24 h-24 border-2 border-gray-200">
                        <AvatarImage 
                          src={avatarPreview || userData.avatarUrl} 
                          alt={`${userData.firstName} ${userData.lastName}`} 
                          className="object-cover"
                        />
                        <AvatarFallback className="text-3xl bg-blue-50 text-blue-600">
                          {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-white hover:bg-white/20"
                          onClick={triggerFileInput}
                        >
                          <Camera className="w-6 h-6" />
                        </Button>
                      </div>
                      {avatarPreview && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute -top-2 -right-2 rounded-full bg-white shadow-md hover:bg-red-50 text-red-500"
                          onClick={removeAvatar}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{userData.firstName} {userData.lastName}</h3>
                      <p className="text-sm text-gray-500">{userData.role}</p>
                      <div className="mt-2 space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={triggerFileInput}
                        >
                          <UploadIcon className="w-3 h-3 mr-1" />
                          Changer de photo
                        </Button>
                        {avatarPreview && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={uploadAvatar}
                            disabled={isUploading}
                          >
                            {isUploading ? 'Téléchargement...' : 'Enregistrer la photo'}
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG (max. 5MB)</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
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

            {/* Sélection du Thème */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Thème de l'Application</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {Object.entries({
                    charlesandre: {
                      name: 'Charles André',
                      description: 'Thème professionnel aux couleurs du groupe',
                      icon: '🏢',
                      colors: ['#1e40af', '#dc2626', '#059669', '#64748b']
                    },
                    classique: {
                      name: 'Classique',
                      description: 'Thème clair standard avec des couleurs neutres',
                      icon: '☀️',
                      colors: ['#2563eb', '#4f46e5', '#0ea5e9', '#6b7280']
                    },
                    sombre: {
                      name: 'Sombre',
                      description: 'Thème sombre pour un confort visuel optimal',
                      icon: '🌙',
                      colors: ['#3b82f6', '#8b5cf6', '#10b981', '#6b7280']
                    }
                  }).map(([key, theme]) => (
                    <div
                      key={key}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        currentTheme === key 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => handleThemeChange(key as Theme)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{theme.icon}</div>
                          <div>
                            <h3 className="font-semibold">{theme.name}</h3>
                            <p className="text-sm text-muted-foreground">{theme.description}</p>
                          </div>
                        </div>
                        {currentTheme === key && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                            Actif
                          </span>
                        )}
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground mb-2">Couleurs :</div>
                        <div className="flex gap-2">
                          {theme.colors.map((color, i) => (
                            <div 
                              key={i}
                              className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700" 
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
