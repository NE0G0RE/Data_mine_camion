import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import DashboardTransport from './pages/dashboard-transport';
import DashboardMinimal from './pages/dashboard-minimal';
import Dashboard from './pages/dashboard';
import { dashboardManager } from './lib/dashboard-manager';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  // Déterminer quel dashboard utiliser selon les préférences utilisateur
  const currentDashboard = dashboardManager.getCurrentDashboard();
  
  const getDashboardComponent = () => {
    switch (currentDashboard) {
      case 'minimal':
        return DashboardMinimal;
      case 'standard':
        return Dashboard;
      case 'transport':
        return DashboardTransport;
      default:
        return DashboardTransport;
    }
  };
  
  const DashboardComponent = getDashboardComponent();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<DashboardComponent />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
