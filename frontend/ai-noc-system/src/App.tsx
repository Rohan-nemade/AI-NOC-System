// AI-based NOC Attendance Compliance & Assignment Verification System
// Version 37 - SCE Management improvements: Removed batch filter and repositioned filters above dashboard statistics
import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { MainDashboard } from './components/MainDashboard';
import { AssignmentProvider } from './components/AssignmentContext';

// Define the roles for type safety
type UserRole = 'student' | 'admin' | 'teacher';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('student');

  const handleLoginSuccess = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('student');
    // Clear the token from storage on logout
    localStorage.removeItem('accessToken'); 
  };

  return (
    <AssignmentProvider>
      {isLoggedIn ? (
        <MainDashboard userRole={userRole} onLogout={handleLogout} />
      ) : (
        // Pass the new login success handler to LoginPage
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </AssignmentProvider>
  );
}