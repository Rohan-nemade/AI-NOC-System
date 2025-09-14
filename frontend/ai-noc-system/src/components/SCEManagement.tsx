import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Users,
  Filter,
  Search,
  Eye,
  Award,
  Presentation,
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface SCEComponent {
  id: string;
  studentName: string;
  studentRollNo: string;
  class: string;
  division: string;
  batch: string;
  year: string;
  subject: string;
  pblStatus: 'completed' | 'pending' | 'late';
  pblScore: number;
  pblTitle: string;
  presentationStatus: 'completed' | 'pending' | 'late';
  presentationScore: number;
  presentationTopic: string;
  certificationStatus: 'completed' | 'pending' | 'late';
  certificationName: string;
  certificationProvider: string;
  overallSCEScore: number;
  lastUpdated: string;
}

interface SCEManagementProps {
  onBack: () => void;
}

const PIE_COLORS = {
  'completed': '#10B981', // green-500
  'late': '#EF4444', // red-500
  'pending': '#F59E0B', // yellow-500
};

export function SCEManagement({ onBack }: SCEManagementProps) {
  const classes = ['TE IT', 'BE IT', 'SE IT', 'FE IT'];
  const subjects = ['Data Structures', 'Computer Networks', 'Database Management', 'Software Engineering', 'Web Technologies', 'Machine Learning', 'Artificial Intelligence', 'Operating Systems'];
  const divisions = ['A', 'B', 'C'];
  const years = ['2024-25', '2023-24', '2022-23', '2021-22'];
  const sceTypes = ['All', 'PBL (Project Based Learning)', 'Presentation', 'Course Certification'];
  const statusTypes = ['completed', 'late', 'pending'];

  const [selectedClass, setSelectedClass] = useState<string>(classes[0]);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]);
  const [selectedDivision, setSelectedDivision] = useState<string>(divisions[0]);
  const [selectedYear, setSelectedYear] = useState<string>(years[0]);
  const [selectedSCEType, setSelectedSCEType] = useState<string>(sceTypes[0]);
  const [selectedStatusType, setSelectedStatusType] = useState<string>(statusTypes[0]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const allSCEComponents: SCEComponent[] = [
    {
      id: '1',
      studentName: 'Aarav Sharma',
      studentRollNo: '21310101',
      class: 'TE IT',
      division: 'A',
      batch: 'Batch 1',
      year: '2024-25',
      subject: 'Data Structures',
      pblStatus: 'completed',
      pblScore: 85,
      pblTitle: 'Binary Search Tree Implementation',
      presentationStatus: 'completed',
      presentationScore: 90,
      presentationTopic: 'Algorithm Complexity Analysis',
      certificationStatus: 'late',
      certificationName: 'Data Structures & Algorithms',
      certificationProvider: 'Coursera',
      overallSCEScore: 87,
      lastUpdated: '2024-11-20'
    },
    {
      id: '2',
      studentName: 'Vivaan Patel',
      studentRollNo: '21310102',
      class: 'TE IT',
      division: 'A',
      batch: 'Batch 1',
      year: '2024-25',
      subject: 'Data Structures',
      pblStatus: 'completed',
      pblScore: 92,
      pblTitle: 'Graph Algorithms Visualization',
      presentationStatus: 'completed',
      presentationScore: 95,
      presentationTopic: 'Dijkstra\'s Algorithm',
      certificationStatus: 'completed',
      certificationName: 'Advanced Data Structures',
      certificationProvider: 'edX',
      overallSCEScore: 94,
      lastUpdated: '2024-11-18'
    },
    {
      id: '3',
      studentName: 'Aditya Kumar',
      studentRollNo: '21310103',
      class: 'TE IT',
      division: 'A',
      batch: 'Batch 1',
      year: '2024-25',
      subject: 'Data Structures',
      pblStatus: 'late',
      pblScore: 0,
      pblTitle: 'Project Management Tool',
      presentationStatus: 'pending',
      presentationScore: 0,
      presentationTopic: 'Hashing Techniques',
      certificationStatus: 'pending',
      certificationName: 'Data Structures Fundamentals',
      certificationProvider: 'Udemy',
      overallSCEScore: 0,
      lastUpdated: '2024-11-15'
    },
    {
      id: '4',
      studentName: 'Priya Sharma',
      studentRollNo: '21310201',
      class: 'TE IT',
      division: 'B',
      batch: 'Batch 1',
      year: '2024-25',
      subject: 'Computer Networks',
      pblStatus: 'completed',
      pblScore: 88,
      pblTitle: 'Network Packet Sniffer',
      presentationStatus: 'completed',
      presentationScore: 85,
      presentationTopic: 'TCP/IP Stack Implementation',
      certificationStatus: 'completed',
      certificationName: 'Network Security',
      certificationProvider: 'Cisco',
      overallSCEScore: 86,
      lastUpdated: '2024-11-19'
    },
    {
      id: '5',
      studentName: 'Aryan Verma',
      studentRollNo: '22310101',
      class: 'BE IT',
      division: 'A',
      batch: 'Batch 1',
      year: '2024-25',
      subject: 'Machine Learning',
      pblStatus: 'completed',
      pblScore: 95,
      presentationStatus: 'completed',
      pblTitle: 'Image Classification Model',
      presentationScore: 92,
      presentationTopic: 'Deep Learning Applications',
      certificationStatus: 'completed',
      certificationName: 'Machine Learning Specialization',
      certificationProvider: 'Stanford Online',
      overallSCEScore: 93,
      lastUpdated: '2024-11-21'
    }
  ];

  const filteredSCEComponents = allSCEComponents.filter(component => {
    const classMatch = component.class === selectedClass;
    const subjectMatch = component.subject === selectedSubject;
    const divisionMatch = component.division === selectedDivision;
    const yearMatch = component.year === selectedYear;
    const sceTypeMatch = selectedSCEType === 'All' ||
      (selectedSCEType === 'PBL (Project Based Learning)' && component.pblStatus) ||
      (selectedSCEType === 'Presentation' && component.presentationStatus) ||
      (selectedSCEType === 'Course Certification' && component.certificationStatus);

    const statusTypeMatch = (selectedSCEType === 'All' && statusTypes.includes(component.pblStatus) && statusTypes.includes(component.presentationStatus) && statusTypes.includes(component.certificationStatus)) ||
      (selectedSCEType === 'PBL (Project Based Learning)' && component.pblStatus === selectedStatusType) ||
      (selectedSCEType === 'Presentation' && component.presentationStatus === selectedStatusType) ||
      (selectedSCEType === 'Course Certification' && component.certificationStatus === selectedStatusType);

    return classMatch && subjectMatch && divisionMatch && yearMatch && sceTypeMatch && statusTypeMatch;
  });

  const searchedSCEComponents = filteredSCEComponents.filter(component => {
    const searchMatch = !searchTerm ||
      component.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.studentRollNo.toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'late':
        return <Badge className="bg-red-100 text-red-800">Late</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getSceStatusData = (components: SCEComponent[], sceType: 'pbl' | 'presentation' | 'certification') => {
    const statusCounts = {
      completed: 0,
      'late': 0,
      pending: 0,
    };
    components.forEach(comp => {
      if (sceType === 'pbl') statusCounts[comp.pblStatus]++;
      if (sceType === 'presentation') statusCounts[comp.presentationStatus]++;
      if (sceType === 'certification') statusCounts[comp.certificationStatus]++;
    });

    return [
      { name: 'Completed', value: statusCounts.completed, color: PIE_COLORS.completed },
      { name: 'Late', value: statusCounts.late, color: PIE_COLORS.late },
      { name: 'Pending', value: statusCounts.pending, color: PIE_COLORS.pending },
    ];
  };

  const pblData = getSceStatusData(filteredSCEComponents, 'pbl');
  const presentationData = getSceStatusData(filteredSCEComponents, 'presentation');
  const certificationData = getSceStatusData(filteredSCEComponents, 'certification');
  const totalCompletedSCE = filteredSCEComponents.filter(s => s.pblStatus === 'completed' && s.presentationStatus === 'completed' && s.certificationStatus === 'completed').length;
  // Fix: The original logic for totalIncompleteSCE was incorrect. It should check for any 'late' or 'pending' status.
  const totalIncompleteSCE = filteredSCEComponents.filter(s => s.pblStatus !== 'completed' || s.presentationStatus !== 'completed' || s.certificationStatus !== 'completed').length;


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-2">
              <Eye className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl mb-2">SCE Components Management</h1>
            <p className="text-gray-600">Monitor Project-Based Learning, Presentations, and Course Certifications</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter SCE Components
            </CardTitle>
            <CardDescription>
              Select filters to view SCE components from specific classes, subjects, and types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <Label htmlFor="filter-class">Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-subject">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-division">Division</Label>
                <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map(div => (
                      <SelectItem key={div} value={div}>{div}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-sce-type">SCE Type</Label>
                <Select value={selectedSCEType} onValueChange={setSelectedSCEType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select SCE type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sceTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-status-type">Status</Label>
                <Select value={selectedStatusType} onValueChange={setSelectedStatusType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusTypes.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards with Hover effect and reordered */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-5 h-5 text-blue-600" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{allSCEComponents.length}</div>
              <p className="text-sm text-gray-600">Total SCE records</p>
            </CardContent>
          </Card>

          {/* SCE Completed Card */}
          <Card className="transition-all duration-300 transform hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle className="w-5 h-5 text-green-600" />
                SCE Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalCompletedSCE}</div>
              <p className="text-sm text-gray-600">Total full completion</p>
            </CardContent>
          </Card>

          {/* SCE Incomplete Card */}
          <Card className="transition-all duration-300 transform hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="w-5 h-5 text-red-600" />
                SCE Incomplete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalIncompleteSCE}</div>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>

          {/* PBL Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="w-5 h-5 text-green-600" />
                PBL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={pblData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => hoveredCard === 'pbl' ? `${value}` : ''}
                    onMouseEnter={() => setHoveredCard('pbl')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {pblData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Presentations Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Presentation className="w-5 h-5 text-purple-600" />
                Presentations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={presentationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => hoveredCard === 'presentations' ? `${value}` : ''}
                    onMouseEnter={() => setHoveredCard('presentations')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {presentationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Certifications Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="w-5 h-5 text-orange-600" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={certificationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => hoveredCard === 'certifications' ? `${value}` : ''}
                    onMouseEnter={() => setHoveredCard('certifications')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {certificationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* SCE Components Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                SCE Components
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {searchedSCEComponents.length} records
                </Badge>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardTitle>
            <CardDescription>
              Student Continuous Evaluation components and scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Added a div with min-height to prevent layout shift */}
            <div className="min-h-[200px]">
              {searchedSCEComponents.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2">No SCE records found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search query to see more records</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Details</TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            PBL
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Presentation className="w-4 h-4" />
                            Presentation
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Award className="w-4 h-4" />
                            Certification
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchedSCEComponents.map((component) => {
                        return (
                          <TableRow key={component.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium">
                                  {component.studentName.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium">{component.studentName}</div>
                                  <div className="text-sm text-gray-500">{component.studentRollNo}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="space-y-1">
                                {getStatusBadge(component.pblStatus)}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="space-y-1">
                                {getStatusBadge(component.presentationStatus)}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="space-y-1">
                                {getStatusBadge(component.certificationStatus)}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}