import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { NOCComplianceWorkflow } from './NOCComplianceWorkflow';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Award,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  attendance: number;
  assignments: Assignment[];
  sceComponents: SCEComponent[];
  nocStatus: 'pending' | 'approved' | 'rejected';
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  submittedDate: string | null;
  status: 'submitted' | 'late' | 'missing';
  plagiarismScore: number;
  maxPlagiarismAllowed: number;
  fileUrl?: string;
}

interface SCEComponent {
  id: string;
  type: 'PBL' | 'Project' | 'Presentation' | 'Tutorial';
  title: string;
  status: 'completed' | 'in-progress' | 'not-started';
  submissionDate: string | null;
  grade?: number;
  feedback?: string;
}

interface NOCTeacherDashboardProps {
  onBack: () => void;
}

export function NOCTeacherDashboard({ onBack }: NOCTeacherDashboardProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Mock data - in real app, this would come from an API
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'Gaurang Chavan',
      rollNo: '22310122',
      email: 'gaurang@viit.edu.in',
      attendance: 72.5,
      assignments: [
        {
          id: 'a1',
          title: 'Data Structures Assignment 1',
          dueDate: '2024-01-15',
          submittedDate: '2024-01-14',
          status: 'submitted',
          plagiarismScore: 15,
          maxPlagiarismAllowed: 25
        },
        {
          id: 'a2',
          title: 'Algorithm Analysis',
          dueDate: '2024-01-20',
          submittedDate: null,
          status: 'missing',
          plagiarismScore: 0,
          maxPlagiarismAllowed: 25
        }
      ],
      sceComponents: [
        {
          id: 's1',
          type: 'PBL',
          title: 'Smart City IoT Project',
          status: 'completed',
          submissionDate: '2024-01-10',
          grade: 85,
          feedback: 'Good implementation'
        },
        {
          id: 's2',
          type: 'Project',
          title: 'Web Application Development',
          status: 'in-progress',
          submissionDate: null
        }
      ],
      nocStatus: 'pending'
    },
    {
      id: '2',
      name: 'Rahul Sharma',
      rollNo: '22310123',
      email: 'rahul@viit.edu.in',
      attendance: 85.2,
      assignments: [
        {
          id: 'a3',
          title: 'Data Structures Assignment 1',
          dueDate: '2024-01-15',
          submittedDate: '2024-01-13',
          status: 'submitted',
          plagiarismScore: 20,
          maxPlagiarismAllowed: 25
        },
        {
          id: 'a4',
          title: 'Algorithm Analysis',
          dueDate: '2024-01-20',
          submittedDate: '2024-01-19',
          status: 'submitted',
          plagiarismScore: 10,
          maxPlagiarismAllowed: 25
        }
      ],
      sceComponents: [
        {
          id: 's3',
          type: 'PBL',
          title: 'Smart City IoT Project',
          status: 'completed',
          submissionDate: '2024-01-08',
          grade: 92,
          feedback: 'Excellent work'
        },
        {
          id: 's4',
          type: 'Project',
          title: 'Web Application Development',
          status: 'completed',
          submissionDate: '2024-01-25',
          grade: 88
        }
      ],
      nocStatus: 'approved'
    },
    {
      id: '3',
      name: 'Priya Patel',
      rollNo: '22310124',
      email: 'priya@viit.edu.in',
      attendance: 68.4,
      assignments: [
        {
          id: 'a5',
          title: 'Data Structures Assignment 1',
          dueDate: '2024-01-15',
          submittedDate: '2024-01-16',
          status: 'late',
          plagiarismScore: 35,
          maxPlagiarismAllowed: 25
        }
      ],
      sceComponents: [
        {
          id: 's5',
          type: 'PBL',
          title: 'Smart City IoT Project',
          status: 'not-started',
          submissionDate: null
        }
      ],
      nocStatus: 'rejected'
    }
  ]);

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || student.nocStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: students.length,
    eligible: students.filter(s => s.attendance >= 75).length,
    approved: students.filter(s => s.nocStatus === 'approved').length,
    pending: students.filter(s => s.nocStatus === 'pending').length,
    rejected: students.filter(s => s.nocStatus === 'rejected').length
  };

  if (selectedStudent) {
    return (
      <NOCComplianceWorkflow 
        student={selectedStudent}
        onUpdateStudent={handleUpdateStudent}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">NOC Management Dashboard</h1>
            <p className="text-gray-600">Manage student NOC compliance and approvals</p>
          </div>
          <Button variant="outline" onClick={onBack}>
            <Eye className="w-4 h-4 mr-2" />
            Back to Main Dashboard
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">{stats.eligible}</div>
              <div className="text-sm text-gray-600">≥75% Attendance</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">NOC Approved</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">NOC Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name or roll number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="border rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Students Overview</CardTitle>
            <CardDescription>
              Click on a student to view their NOC compliance workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Assignments</TableHead>
                  <TableHead>SCE Components</TableHead>
                  <TableHead>NOC Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const completedAssignments = student.assignments.filter(
                    a => a.status === 'submitted' && a.plagiarismScore <= a.maxPlagiarismAllowed
                  ).length;
                  const completedSCE = student.sceComponents.filter(
                    c => c.status === 'completed'
                  ).length;

                  return (
                    <TableRow key={student.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-600">{student.rollNo}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            student.attendance >= 75 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {student.attendance}%
                          </span>
                          {student.attendance >= 75 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            completedAssignments === student.assignments.length 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {completedAssignments}/{student.assignments.length}
                          </span>
                          {completedAssignments === student.assignments.length ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            completedSCE === student.sceComponents.length 
                              ? 'text-green-600' 
                              : 'text-yellow-600'
                          }`}>
                            {completedSCE}/{student.sceComponents.length}
                          </span>
                          {completedSCE === student.sceComponents.length ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          className={
                            student.nocStatus === 'approved' ? 'bg-green-100 text-green-800' :
                            student.nocStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {student.nocStatus.charAt(0).toUpperCase() + student.nocStatus.slice(1)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Button 
                          size="sm"
                          onClick={() => setSelectedStudent(student)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {filteredStudents.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No students found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}