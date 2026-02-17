import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext.jsx';
import App from './App.jsx';
import './index.css';
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router-dom'

import LoginForm from './components/Auth/LoginForm.jsx';
import SignupForm from './components/Auth/SignupForm.jsx';
import AdminDashboard from './components/Dashboard/AdminDashboard.jsx';
import DeveloperDashboard from './components/Dashboard/DeveloperDashboard.jsx';
import TesterDashboard from './components/Dashboard/TesterDashboard.jsx';
import RoleRedirect from './components/RoleRedirect/RoleRedirect.jsx';
import AuthPage from './components/Auth/AuthPage.jsx';
import BugDetailPage from './components/BugDetail/BugDetailPage.jsx';
import VerifyPage from './components/Auth/VerifyPage.jsx';
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='login' element={<AuthPage/>} />
      <Route path='signup' element={<AuthPage/>} />
      <Route path='verify/:token' element={<VerifyPage/>} />
      <Route path="/"
        element={
          
            <App />
          
        }>
        <Route index element={<RoleRedirect />} />
        <Route path='admindashboard' element={<AdminDashboard />} />
        <Route path='developerdashboard' element={<DeveloperDashboard />} />
        <Route path='testerdashboard' element={<TesterDashboard />} />
        <Route path="bug/:id" element={<BugDetailPage/>} />
      </Route>

    </>





  )
)
createRoot(document.getElementById('root')).render(
  <StrictMode>

    <AuthProvider>   {/* 👈 Yaha shift karo */}
      <RouterProvider router={router} />
    </AuthProvider>

  </StrictMode>
);