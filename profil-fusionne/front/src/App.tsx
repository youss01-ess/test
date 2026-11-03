import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AddAnimalPage from './pages/AddAnimalPage';
import DashboardPage from './pages/DashboardPage';
import EditAnimalPage from './pages/EditAnimalPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/animals" element={<Navigate to="/dashboard" replace />} />
            <Route path="/animals/new" element={<AddAnimalPage />} />
            <Route path="/animals/:id/edit" element={<EditAnimalPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}