import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';

// --- Self-Contained UI Components to resolve import errors ---
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg bg-white text-gray-900 shadow-xl border-0 ${className}`}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 text-center pb-4 ${className}`}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-xl font-semibold leading-none tracking-tight text-gray-900 ${className}`}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 ${className}`} {...props} />
));
CardContent.displayName = "CardContent";

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
    <label ref={ref} className={`text-sm font-medium leading-none ${className}`} {...props} />
));
Label.displayName = "Label"


// Define the possible roles for better type safety
type Role = 'student' | 'teacher' | 'admin';

interface LoginPageProps {
  onLoginSuccess: (role: Role) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student'); // State for selected role
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      // 1. Send the login request to the /token endpoint
      const tokenResponse = await fetch('http://127.0.0.1:8000/token', { // Use full URL in development
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!tokenResponse.ok) {
        if (tokenResponse.status === 401) {
          setError("Incorrect email or password.");
        } else {
          setError(`Login failed: ${tokenResponse.statusText}`);
        }
        setIsLoading(false);
        return;
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // 2. Save the token to local storage
      localStorage.setItem('accessToken', accessToken);

      // 3. Use the token to fetch the user's details and role from the /me endpoint
      const userResponse = await fetch('http://127.0.0.1:8000/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        // This case indicates an issue after a successful token exchange, so we log out.
        localStorage.removeItem('accessToken');
        setError("Failed to fetch user data. Please try logging in again.");
        setIsLoading(false);
        return;
      }
      
      const userData = await userResponse.json();
      const userRole = userData.role as Role;

      // 4. Check if the authenticated user's role matches the selected role
      if (userRole !== role) {
        localStorage.removeItem('accessToken');
        setError(`This user is a '${userRole}', not a '${role}'. Please select the correct role.`);
        setIsLoading(false);
        return;
      }

      // 5. Call the parent handler with the correct role
      onLoginSuccess(userRole);

    } catch (err) {
      console.error('There was a problem with the login request:', err);
      setError('Failed to log in. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl text-gray-900 mb-2">
            AI Attendance System
          </h1>
          <p className="text-gray-600">
            Integrated solution for attendance compliance and assignment verification
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              Sign In to Your Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label>Login As</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={role === 'student'}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Student</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="role"
                      value="teacher"
                      checked={role === 'teacher'}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Teacher</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={role === 'admin'}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Admin</span>
                  </label>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 disabled:bg-blue-400"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
              
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
              {role === 'student' && (
                <>
                  <p className="text-xs text-gray-500">Email: student@university.edu</p>
                  <p className="text-xs text-gray-500">Password: demo123</p>
                </>
              )}
              {role === 'teacher' && (
                <>
                  <p className="text-xs text-gray-500">Email: teacher@university.edu</p>
                  <p className="text-xs text-gray-500">Password: demo123</p>
                </>
              )}
              {role === 'admin' && (
                <>
                  <p className="text-xs text-gray-500">Email: admin@university.edu</p>
                  <p className="text-xs text-gray-500">Password: admin123</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} AI Attendance System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}