import { useState, useEffect } from 'react';
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
  AlertCircle,
  Edit,
  XCircle,
  Save,
  Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

// ===================================================================
// Type Definitions to match Backend Schemas
// ===================================================================
type SCEStatus = 'completed' | 'pending' | 'late';

interface SCEComponent {
  id: number;
  studentName: string;
  studentRollNo?: string;
  class: string; // Mapped from class_name
  division: string;
  batch?: string;
  year: string;
  subject: string;
  pblStatus: SCEStatus;
  pblScore?: number;
  pblTitle?: string;
  presentationStatus: SCEStatus;
  presentationScore?: number;
  presentationTopic?: string;
  certificationStatus: SCEStatus;
  certificationName?: string;
  certificationProvider?: string;
  overallSCEScore?: number;
  lastUpdated: string;
  // Raw data from backend needed for updates
  student_id: number;
  subject_id: number;
}

interface SCEManagementProps {
  onBack: () => void;
  authToken: string;
}

const PIE_COLORS = {
  'completed': '#10B981', // green-500
  'late': '#EF4444', // red-500
  'pending': '#F59E0B', // yellow-500
};

// ===================================================================
// Main Component
// ===================================================================
export function SCEManagement({ onBack, authToken }: SCEManagementProps) {
  // --- State for Data, Loading, and Errors ---
  const [allSCEComponents, setAllSCEComponents] = useState<SCEComponent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- State for Filters and Search (restored from old code) ---
  const [selectedClass, setSelectedClass] = useState<string>('TE IT');
  const [selectedSubject, setSelectedSubject] = useState<string>('Data Structures');
  const [selectedDivision, setSelectedDivision] = useState<string>('A');
  const [selectedYear, setSelectedYear] = useState<string>('2024-25');
  const [selectedSCEType, setSelectedSCEType] = useState<string>('All');
  const [selectedStatusType, setSelectedStatusType] = useState<SCEStatus>('completed');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // --- State for UI interactions (Editing & Hover) ---
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [editedStatuses, setEditedStatuses] = useState<{ pbl_status?: SCEStatus, presentation_status?: SCEStatus, certification_status?: SCEStatus }>({});
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // --- Static Data for Filters ---
  const classes = ['TE IT', 'BE IT', 'SE IT', 'FE IT'];
  const subjects = ['Data Structures', 'Computer Networks', 'Database Management', 'Software Engineering', 'Web Technologies', 'Machine Learning', 'Artificial Intelligence', 'Operating Systems'];
  const divisions = ['A', 'B', 'C'];
  const years = ['2024-25', '2023-24', '2022-23', '2021-22'];
  const sceTypes = ['All', 'PBL (Project Based Learning)', 'Presentation', 'Course Certification'];
  const statusTypes: SCEStatus[] = ['completed', 'late', 'pending'];

  // --- Data Fetching ---
  const fetchSCEData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/sce/teacher', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to fetch SCE data.");
      }
      const data = await response.json();
      const formattedData = data.map((item: any) => ({
        ...item,
        class: item.class_name,
        student_id: item.student_id,
        subject_id: item.subject_id,
      }));
      setAllSCEComponents(formattedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchSCEData();
    } else {
      setError("Authentication Token not found.");
      setIsLoading(false);
    }
  }, [authToken]);

  // --- Filtering and Data Calculation (Restored from old code) ---
  const filteredSCEComponents = allSCEComponents.filter(component => {
    const classMatch = component.class === selectedClass;
    const subjectMatch = component.subject === selectedSubject;
    const divisionMatch = component.division === selectedDivision;
    const yearMatch = component.year === selectedYear;

    const sceTypeMatch = selectedSCEType === 'All' ||
      (selectedSCEType === 'PBL (Project Based Learning)' && component.pblStatus) ||
      (selectedSCEType === 'Presentation' && component.presentationStatus) ||
      (selectedSCEType === 'Course Certification' && component.certificationStatus);

    const statusTypeMatch = selectedSCEType === 'All' || // if 'All' types, don't filter by individual status
      (selectedSCEType === 'PBL (Project Based Learning)' && component.pblStatus === selectedStatusType) ||
      (selectedSCEType === 'Presentation' && component.presentationStatus === selectedStatusType) ||
      (selectedSCEType === 'Course Certification' && component.certificationStatus === selectedStatusType);

    return classMatch && subjectMatch && divisionMatch && yearMatch && sceTypeMatch && statusTypeMatch;
  });

  const searchedSCEComponents = filteredSCEComponents.filter(component =>
    !searchTerm ||
    component.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.studentRollNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSceStatusData = (components: SCEComponent[], sceType: 'pbl' | 'presentation' | 'certification') => {
    const statusCounts: Record<SCEStatus, number> = { completed: 0, late: 0, pending: 0 };
    components.forEach(comp => {
      if (sceType === 'pbl') statusCounts[comp.pblStatus]++;
      if (sceType === 'presentation') statusCounts[comp.presentationStatus]++;
      if (sceType === 'certification') statusCounts[comp.certificationStatus]++;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: PIE_COLORS[name as SCEStatus] }));
  };

  const pblData = getSceStatusData(filteredSCEComponents, 'pbl');
  const presentationData = getSceStatusData(filteredSCEComponents, 'presentation');
  const certificationData = getSceStatusData(filteredSCEComponents, 'certification');
  const totalCompletedSCE = filteredSCEComponents.filter(s => s.pblStatus === 'completed' && s.presentationStatus === 'completed' && s.certificationStatus === 'completed').length;
  const totalIncompleteSCE = filteredSCEComponents.length - totalCompletedSCE;

  // --- Event Handlers for Editing ---
  const handleEditClick = (component: SCEComponent) => {
    setEditingRowId(component.id);
    setEditedStatuses({
      pbl_status: component.pblStatus,
      presentation_status: component.presentationStatus,
      certification_status: component.certificationStatus,
    });
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditedStatuses({});
  };

  const handleStatusChange = (field: keyof typeof editedStatuses, value: SCEStatus) => {
    setEditedStatuses(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirmUpdate = async (component: SCEComponent) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/sce/teacher/sce-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          student_id: component.student_id,
          subject_id: component.subject_id,
          ...editedStatuses,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to update status.");
      }

      setEditingRowId(null);
      setEditedStatuses({});
      await fetchSCEData(); // Refresh data to show changes
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };


  // --- UI Helper Functions ---
  const getStatusBadge = (status: SCEStatus) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'late': return <Badge className="bg-red-100 text-red-800">Late</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;
  }

  if (error) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-red-600"><AlertCircle className="w-12 h-12 mb-4" /><h2 className="text-xl mb-2">Error</h2><p>{error}</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <Button variant="ghost" onClick={onBack} className="mb-2"><Eye className="w-4 h-4 mr-2" />Back to Dashboard</Button>
        <h1 className="text-2xl mb-2">SCE Components Management</h1>
        <p className="text-gray-600">Monitor Project-Based Learning, Presentations, and Course Certifications</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Filters (Restored 5-filter layout) */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Filter className="w-5 h-5" />Filter SCE Components</CardTitle><CardDescription>Select filters to view specific records</CardDescription></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div><Label>Class</Label><Select value={selectedClass} onValueChange={setSelectedClass}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Subject</Label><Select value={selectedSubject} onValueChange={setSelectedSubject}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Division</Label><Select value={selectedDivision} onValueChange={setSelectedDivision}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{divisions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>SCE Type</Label><Select value={selectedSCEType} onValueChange={setSelectedSCEType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{sceTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Status</Label><Select value={selectedStatusType} onValueChange={(value) => setSelectedStatusType(value as SCEStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statusTypes.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent></Select></div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards (Restored 6-card layout with hover) */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <Card className="lg:col-span-2"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Users className="w-5 h-5 text-blue-600" />Total Students</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{filteredSCEComponents.length}</div><p className="text-sm text-gray-500">Matching filters</p></CardContent></Card>
          <Card className="transition-transform hover:scale-105"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><CheckCircle className="w-5 h-5 text-green-600" />SCE Completed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{totalCompletedSCE}</div><p className="text-sm text-gray-600">Full completion</p></CardContent></Card>
          <Card className="transition-transform hover:scale-105"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><AlertCircle className="w-5 h-5 text-red-600" />SCE Incomplete</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{totalIncompleteSCE}</div><p className="text-sm text-gray-600">Any part pending</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Briefcase className="w-5 h-5 text-indigo-600" />PBL</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={100}><PieChart><Pie data={pblData} dataKey="value" innerRadius={25} outerRadius={40}>{pblData.map(e => <Cell key={e.name} fill={e.color} />)}</Pie><Legend iconSize={10} /></PieChart></ResponsiveContainer></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Presentation className="w-5 h-5 text-purple-600" />Presentations</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={100}><PieChart><Pie data={presentationData} dataKey="value" innerRadius={25} outerRadius={40}>{presentationData.map(e => <Cell key={e.name} fill={e.color} />)}</Pie><Legend iconSize={10} /></PieChart></ResponsiveContainer></CardContent></Card>
        </div>

        {/* SCE Components Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center"><span>SCE Records</span><div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search by name or roll no..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div></CardTitle>
            <CardDescription>Student Continuous Evaluation components and their status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Details</TableHead>
                    <TableHead className="text-center">PBL</TableHead>
                    <TableHead className="text-center">Presentation</TableHead>
                    <TableHead className="text-center">Certification</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchedSCEComponents.length > 0 ? searchedSCEComponents.map((component) => (
                    <TableRow key={component.id}>
                      <TableCell>
                        <div className="font-medium">{component.studentName}</div>
                        <div className="text-sm text-gray-500">{component.studentRollNo}</div>
                      </TableCell>
                      {/* PBL Cell */}
                      <TableCell className="text-center">
                        {editingRowId === component.id ? (
                          <Select value={editedStatuses.pbl_status} onValueChange={(value: SCEStatus) => handleStatusChange('pbl_status', value)}>
                            <SelectTrigger className="w-32 mx-auto"><SelectValue /></SelectTrigger>
                            <SelectContent>{statusTypes.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                          </Select>
                        ) : getStatusBadge(component.pblStatus)}
                      </TableCell>
                      {/* Presentation Cell */}
                      <TableCell className="text-center">
                        {editingRowId === component.id ? (
                          <Select value={editedStatuses.presentation_status} onValueChange={(value: SCEStatus) => handleStatusChange('presentation_status', value)}>
                            <SelectTrigger className="w-32 mx-auto"><SelectValue /></SelectTrigger>
                            <SelectContent>{statusTypes.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                          </Select>
                        ) : getStatusBadge(component.presentationStatus)}
                      </TableCell>
                      {/* Certification Cell */}
                      <TableCell className="text-center">
                        {editingRowId === component.id ? (
                          <Select value={editedStatuses.certification_status} onValueChange={(value: SCEStatus) => handleStatusChange('certification_status', value)}>
                            <SelectTrigger className="w-32 mx-auto"><SelectValue /></SelectTrigger>
                            <SelectContent>{statusTypes.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                          </Select>
                        ) : getStatusBadge(component.certificationStatus)}
                      </TableCell>
                      {/* Actions Cell */}
                      <TableCell className="text-center">
                        {editingRowId === component.id ? (
                          <div className="flex gap-2 justify-center">
                            <Button size="sm" variant="outline" onClick={() => handleConfirmUpdate(component)} disabled={isUpdating}>
                              {isUpdating && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                              <Save className="w-4 h-4 mr-1" />
                              Confirm
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit}><XCircle className="w-4 h-4 mr-1" />Cancel</Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleEditClick(component)}><Edit className="w-4 h-4 mr-1" />Edit</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={5} className="text-center h-24">No records found for the selected filters.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

