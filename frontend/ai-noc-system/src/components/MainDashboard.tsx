import { useState } from 'react';
import { Card } from './ui/card';
import { Dashboard } from './Dashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { NOCManagement } from './NOCManagement';
import { AssignmentManagement } from './AssignmentManagement';
import { StudentAssignmentView } from './StudentAssignmentView';
import { StudentOverview } from './StudentOverview';
import { AttendanceDisplay } from './AttendanceDisplay';
import { SCEManagement } from './SCEManagement';
import { FeedbackSystem } from './FeedbackSystem';
import { NotificationCenter } from './NotificationCenter';
import { 
  BookOpen, 
  User, 
  UserCheck, 
  FileText, 
  Award, 
  Calendar,
  ClipboardList,
  MessageSquare,
  Building,
  Clock,
  BarChart3,
  HelpCircle,
  Bell,
  Search,
  LogOut,
  ChevronLeft,
  Users
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface MainDashboardProps {
  userRole: 'student' | 'admin'| 'teacher';
  onLogout: () => void;
}

type ModuleKey = 'overview' | 'attendance' | 'assignment' | 'noc' | 'students' | 'feedback' | 'timetable' | 'sce' | 'notifications';

export function MainDashboard({ userRole, onLogout }: MainDashboardProps) {
  const [activeModule, setActiveModule] = useState<ModuleKey | null>(null);

  const studentModules = [
    { key: 'attendance' as ModuleKey, title: 'Attendance', icon: UserCheck },
    { key: 'assignment' as ModuleKey, title: 'Assignments', icon: FileText },
    { key: 'noc' as ModuleKey, title: 'NOC Status', icon: Award },
    { key: 'notifications' as ModuleKey, title: 'Notifications', icon: Bell },
  ];

  const teacherModules = [
    { key: 'overview' as ModuleKey, title: 'Student Overview', icon: Users },
    { key: 'attendance' as ModuleKey, title: 'Attendance Display', icon: UserCheck },
    { key: 'assignment' as ModuleKey, title: 'Assignment Management', icon: FileText },
    { key: 'sce' as ModuleKey, title: 'SCE Components', icon: BookOpen },
    { key: 'noc' as ModuleKey, title: 'NOC Management', icon: Award },
    { key: 'feedback' as ModuleKey, title: 'Feedback', icon: MessageSquare },
  ];

  const modules = userRole === 'student' ? studentModules : teacherModules;

  const handleModuleClick = (moduleKey: ModuleKey) => {
    setActiveModule(moduleKey);
  };

  const handleBackToDashboard = () => {
    setActiveModule(null);
  };

  if (activeModule) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <Button 
            variant="ghost" 
            onClick={handleBackToDashboard}
            className="mb-2"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        {userRole === 'student' ? (
          activeModule === 'assignment' ? (
            <StudentAssignmentView onBack={handleBackToDashboard} />
          ) : activeModule === 'attendance' ? (
            <AttendanceDisplay onBack={handleBackToDashboard} userRole={userRole} />
          ) : activeModule === 'noc' ? (
            <NOCManagement onBack={handleBackToDashboard} userRole={userRole} />
          ) : activeModule === 'notifications' ? (
            <NotificationCenter onBack={handleBackToDashboard} />
          ) : (
            <Dashboard onLogout={onLogout} />
          )
        ) : activeModule === 'overview' ? (
          <StudentOverview onBack={handleBackToDashboard} />
        ) : activeModule === 'attendance' ? (
          <AttendanceDisplay onBack={handleBackToDashboard} userRole={userRole} />
        ) : activeModule === 'noc' ? (
          <NOCManagement onBack={handleBackToDashboard} userRole={userRole} />
        ) : activeModule === 'assignment' ? (
          <AssignmentManagement onBack={handleBackToDashboard} />
        ) : activeModule === 'sce' ? (
          <SCEManagement onBack={handleBackToDashboard} />
        ) : activeModule === 'feedback' ? (
          <FeedbackSystem onBack={handleBackToDashboard} />
        ) : (
          <TeacherDashboard onLogout={onLogout} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Vishwakarma Institute of Information Technology</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-green-500 flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">4G | 10+ Mbps</span>
            </div>
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-500 hover:text-blue-600 cursor-pointer" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">5</span>
              </div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {userRole === 'student' ? 'GC' : 'TC'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* User Info Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-900">
                  {userRole === 'student' ? 'GAURANG CHAVAN' : 'TEACHER NAME'}
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">Active</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <span className="text-sm text-gray-500">Registration No.</span>
              <div className="font-medium">22310122</div>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-500">Program</span>
              <div className="font-medium">BTech-Information Technology</div>
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="max-w-md mx-auto relative">
          <Input 
            placeholder="Search Module" 
            className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        <div className={`grid gap-6 max-w-7xl mx-auto ${userRole === 'student' ? 'grid-cols-4' : 'grid-cols-6'}`}>
          {modules.map((module) => (
            <Card 
              key={module.key} 
              className="relative overflow-hidden cursor-pointer transform transition-all hover:scale-105 hover:shadow-lg border-0 group"
              onClick={() => handleModuleClick(module.key)}
            >
              <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 p-6 h-32 relative">
                {/* Radial gradient overlay for center highlight */}
                <div className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent opacity-50"></div>
                
                <div className="relative flex flex-col items-center justify-center h-full text-center z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <module.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white font-medium text-sm leading-tight">{module.title}</span>
                </div>
                
                {/* Corner highlight */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full"></div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Support Button */}
      <div className="fixed bottom-4 left-4">
        <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-full shadow-lg">
          Support
        </Button>
      </div>
    </div>
  );
}