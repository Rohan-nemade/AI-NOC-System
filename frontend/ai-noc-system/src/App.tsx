// AI-based NOC Attendance Compliance & Assignment Verification System
// Version 37 - SCE Management improvements: Removed batch filter and repositioned filters above dashboard statistics
import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { MainDashboard } from './components/MainDashboard';
import { AssignmentProvider } from './components/AssignmentContext';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'admin' | 'teacher'>('student');

  const handleLogin = (role: 'student' | 'teacher' | 'admin') => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('student');
  };

  return (
    <AssignmentProvider>
      {isLoggedIn ? (
        <MainDashboard userRole={userRole} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </AssignmentProvider>
  );
}