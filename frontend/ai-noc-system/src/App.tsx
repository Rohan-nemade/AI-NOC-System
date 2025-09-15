// AI-based NOC Attendance Compliance & Assignment Verification System
// Version 38 - Corrected auth token handling and added session persistence
import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { MainDashboard } from './components/MainDashboard';
import { AssignmentProvider } from './components/AssignmentContext';

// Define the roles for type safety
type UserRole = 'student' | 'admin' | 'teacher';

export default function App() {
  // --- State Initialization ---
  // Initialize state from localStorage to allow session persistence across reloads.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('accessToken'));
  const [userRole, setUserRole] = useState<UserRole>(() => (localStorage.getItem('userRole') as UserRole) || 'student');
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('accessToken'));

  // --- Event Handlers ---

  /**
   * Handles successful login by storing the user's role and token,
   * then updating the application state to render the dashboard.
   * This function now expects both the role and the token from LoginPage.
   */
  const handleLoginSuccess = (role: UserRole, token: string) => {
    // Store token and role in localStorage for session persistence
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userRole', role);

    // Update React state to trigger a re-render
    setAuthToken(token);
    setUserRole(role);
    setIsLoggedIn(true);
  };

  /**
   * Handles user logout by clearing session data from both
   * localStorage and the component's state.
   */
  const handleLogout = () => {
    // Clear token and role from storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');

    // Reset React state
    setIsLoggedIn(false);
    setUserRole('student');
    setAuthToken(null);
  };

  // --- Effects ---

  /**
   * This effect listens for changes in localStorage. If the token is
   * removed in another browser tab, it logs the user out of this tab
   * to keep the session state synchronized.
   */
  useEffect(() => {
    const syncLogout = (event: StorageEvent) => {
      if (event.key === 'accessToken' && !event.newValue) {
        handleLogout();
      }
    };

    window.addEventListener('storage', syncLogout);

    return () => {
      window.removeEventListener('storage', syncLogout);
    };
  }, []);

  // --- Render Logic ---

  return (
    <AssignmentProvider>
      {isLoggedIn && authToken ? (
        // The authToken is now correctly passed to the MainDashboard
        <MainDashboard
          userRole={userRole}
          onLogout={handleLogout}
          authToken={authToken}
        />
      ) : (
        // The LoginPage is expected to call onLoginSuccess with both the role and token
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </AssignmentProvider>
  );
}
