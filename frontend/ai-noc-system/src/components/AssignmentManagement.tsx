import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useAssignments, type Assignment } from './AssignmentContext';
import { 
  Upload, 
  FileText, 
  Users, 
  Search, 
  Plus, 
  Calendar,
  BookOpen,
  GraduationCap,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Star,
  MessageSquare,
  Monitor,
  ClipboardList,
  ArrowLeft
} from 'lucide-react';

interface AssignmentManagementProps {
  onBack: () => void;
}

export function AssignmentManagement({ onBack }: AssignmentManagementProps) {
  const { assignments, addAssignment, updateAssignment, deleteAssignment, studentSubmissions, updateStudentSubmission } = useAssignments();
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [selectedAssignmentType, setSelectedAssignmentType] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [showGradeDialog, setShowGradeDialog] = useState<boolean>(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [selectedAssignmentForDetail, setSelectedAssignmentForDetail] = useState<Assignment | null>(null);
  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [newAssignment, setNewAssignment] = useState<Partial<Assignment & { assignmentType: string }>>({
    title: '',
    description: '',
    subject: '',
    class: '',
    division: '',
    batch: '',
    dueDate: '',
    maxMarks: 100,
    instructions: '',
    status: 'draft',
    assignmentType: ''
  });

  const classes = ['BE IT', 'TE IT', 'SE IT', 'FE IT'];
  const subjects = ['Data Structures', 'Computer Networks', 'Database Management', 'Software Engineering', 'Web Technologies', 'Machine Learning', 'Artificial Intelligence', 'Operating Systems'];
  const divisions = ['A', 'B', 'C'];
  const batches = ['Batch 1', 'Batch 2', 'Batch 3', 'Batch 4'];
  const assignmentTypes = ['Theory Assignment', 'Home Assignment', 'Practical Assignment', 'Tutorial Assignment'];
  const years = ['2024', '2023', '2022', '2021'];

  const filteredSubmissions = studentSubmissions.filter(submission => {
    if (!selectedAssignmentForDetail) return false;
    return submission.assignmentId === selectedAssignmentForDetail.id;
  });

  const filteredAssignments = assignments.filter(assignment => {
    const yearMatch = selectedYear === 'all' || new Date(assignment.createdDate).getFullYear().toString() === selectedYear;
    const assignmentTypeMatch = selectedAssignmentType === 'all' || assignment.assignmentType === selectedAssignmentType;
    const subjectMatch = selectedSubject === 'all' || assignment.subject === selectedSubject;
    const divisionMatch = selectedDivision === 'all' || assignment.division === selectedDivision;
    const batchMatch = selectedBatch === 'all' || assignment.batch === selectedBatch;
    
    return yearMatch && assignmentTypeMatch && subjectMatch && divisionMatch && batchMatch;
  });

  const handleCreateAssignment = () => {
    if (newAssignment.title && newAssignment.subject && newAssignment.class && newAssignment.assignmentType) {
      const assignment: Assignment = {
        id: Date.now().toString(),
        title: newAssignment.title || '',
        description: newAssignment.description || '',
        subject: newAssignment.subject || '',
        class: newAssignment.class || '',
        division: newAssignment.division || '',
        batch: newAssignment.batch || '',
        dueDate: newAssignment.dueDate || '',
        createdDate: new Date().toISOString().split('T')[0],
        maxMarks: newAssignment.maxMarks || 100,
        instructions: newAssignment.instructions || '',
        status: newAssignment.status as 'draft' | 'published' | 'expired' || 'draft',
        teacherName: 'Prof. Teacher',
        createdBy: 'current_teacher_id',
        assignmentType: newAssignment.assignmentType || ''
      };
      
      addAssignment(assignment);
      setNewAssignment({
        title: '',
        description: '',
        subject: '',
        class: '',
        division: '',
        batch: '',
        dueDate: '',
        maxMarks: 100,
        instructions: '',
        status: 'draft',
        assignmentType: ''
      });
      setShowCreateDialog(false);
    }
  };

  const handleFileUpload = (type: 'assignment' | 'solution', file: File | null) => {
    if (type === 'assignment') {
      setNewAssignment(prev => ({ ...prev, assignmentFile: file }));
    } else {
      setNewAssignment(prev => ({ ...prev, solutionFile: file }));
    }
  };

  const handlePublishAssignment = (id: string) => {
    updateAssignment(id, { status: 'published' });
  };

  const handleDeleteAssignment = (id: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      deleteAssignment(id);
    }
  };

  const handleViewAssignmentDetail = (assignment: Assignment) => {
    setSelectedAssignmentForDetail(assignment);
  };

  const handleBackToAssignments = () => {
    setSelectedAssignmentForDetail(null);
  };

  const handleGradeSubmission = () => {
    if (selectedSubmission && grade >= 0) {
      updateStudentSubmission(selectedSubmission.id, {
        grade,
        feedback
      });
      setShowGradeDialog(false);
      setSelectedSubmission(null);
      setGrade(0);
      setFeedback('');
    }
  };

  const openGradeDialog = (submission: any) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade || 0);
    setFeedback(submission.feedback || '');
    setShowGradeDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-green-100 text-green-800">On Time</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getAssignmentById = (id: string) => {
    return assignments.find(a => a.id === id);
  };

  const getAssignmentTypeIcon = (type: string) => {
    switch (type) {
      case 'Theory Assignment':
      case 'Home Assignment':
        return <BookOpen className="w-4 h-4" />;
      case 'Practical Assignment':
        return <Monitor className="w-4 h-4" />;
      case 'Tutorial Assignment':
        return <ClipboardList className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getAssignmentTypeBadge = (type: string) => {
    const colors = {
      'Theory Assignment': 'bg-blue-100 text-blue-800',
      'Home Assignment': 'bg-purple-100 text-purple-800',
      'Practical Assignment': 'bg-green-100 text-green-800',
      'Tutorial Assignment': 'bg-orange-100 text-orange-800'
    };
    return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  // If an assignment is selected for detail view, show that instead
  if (selectedAssignmentForDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={handleBackToAssignments} className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Assignments
              </Button>
              <h1 className="text-2xl mb-2">{selectedAssignmentForDetail.title}</h1>
              <p className="text-gray-600">Assignment details and student submissions</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Assignment Details</TabsTrigger>
              <TabsTrigger value="submissions">Student Submissions</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Assignment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Title</Label>
                        <p className="text-base">{selectedAssignmentForDetail.title}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Subject</Label>
                        <p className="text-base">{selectedAssignmentForDetail.subject}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Assignment Type</Label>
                        <div className="mt-1">
                          {selectedAssignmentForDetail.assignmentType && getAssignmentTypeBadge(selectedAssignmentForDetail.assignmentType)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Status</Label>
                        <div className="mt-1">
                          {getStatusBadge(selectedAssignmentForDetail.status)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Class & Division</Label>
                        <p className="text-base">{selectedAssignmentForDetail.class} {selectedAssignmentForDetail.division}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Batch</Label>
                        <p className="text-base">{selectedAssignmentForDetail.batch}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Due Date</Label>
                        <p className="text-base">{new Date(selectedAssignmentForDetail.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Maximum Marks</Label>
                        <p className="text-base">{selectedAssignmentForDetail.maxMarks}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                    <p className="text-base mt-2">{selectedAssignmentForDetail.description}</p>
                  </div>
                  
                  {selectedAssignmentForDetail.instructions && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Instructions</Label>
                      <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                        <p className="text-blue-800">{selectedAssignmentForDetail.instructions}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submissions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Student Submissions
                  </CardTitle>
                  <CardDescription>
                    Review and grade student submissions for this assignment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredSubmissions.length === 0 ? (
                    <div className="text-center py-12">
                      <Send className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="mb-2">No submissions yet</h3>
                      <p className="text-gray-600">Students haven't submitted this assignment yet</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubmissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{submission.studentName}</div>
                                <div className="text-sm text-gray-500">{submission.studentRollNo}</div>
                              </div>
                            </TableCell>
                            <TableCell>{new Date(submission.submissionDate).toLocaleDateString()}</TableCell>
                            <TableCell>{getSubmissionStatusBadge(submission.status)}</TableCell>
                            <TableCell>
                              {submission.grade !== undefined ? (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span>{submission.grade}/{selectedAssignmentForDetail?.maxMarks}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Not graded</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Grade Submission Dialog */}
        <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Grade Submission</DialogTitle>
              <DialogDescription>
                Grade the submission by {selectedSubmission?.studentName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm">
                  <p><span className="font-medium">Student:</span> {selectedSubmission?.studentName}</p>
                  <p><span className="font-medium">Roll No:</span> {selectedSubmission?.studentRollNo}</p>
                  <p><span className="font-medium">Assignment:</span> {selectedAssignmentForDetail?.title}</p>
                  <p><span className="font-medium">Max Marks:</span> {selectedAssignmentForDetail?.maxMarks}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="grade">Grade (out of {selectedAssignmentForDetail?.maxMarks})</Label>
                <Input
                  id="grade"
                  type="number"
                  value={grade}
                  onChange={(e) => setGrade(parseInt(e.target.value) || 0)}
                  max={selectedAssignmentForDetail?.maxMarks}
                  min={0}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback for the student..."
                  className="min-h-[100px] mt-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowGradeDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleGradeSubmission}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Save Grade
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Default view - show assignments list
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-2">
              <Eye className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl mb-2">Assignment Management</h1>
            <p className="text-gray-600">Create and manage assignments for your classes</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new assignment for your students
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Assignment Title</Label>
                    <Input
                      id="title"
                      value={newAssignment.title || ''}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter assignment title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignmentType">Assignment Type</Label>
                    <Select value={newAssignment.assignmentType || 'none'} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, assignmentType: value === 'none' ? '' : value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select a type</SelectItem>
                        {assignmentTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={newAssignment.subject || 'none'} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, subject: value === 'none' ? '' : value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select a subject</SelectItem>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="class">Class</Label>
                    <Select value={newAssignment.class || 'none'} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, class: value === 'none' ? '' : value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select a class</SelectItem>
                        {classes.map(cls => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="division">Division</Label>
                    <Select value={newAssignment.division || 'none'} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, division: value === 'none' ? '' : value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select a division</SelectItem>
                        {divisions.map(div => (
                          <SelectItem key={div} value={div}>{div}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="batch">Batch</Label>
                    <Select value={newAssignment.batch || 'none'} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, batch: value === 'none' ? '' : value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select a batch</SelectItem>
                        {batches.map(batch => (
                          <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newAssignment.description || ''}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter assignment description"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newAssignment.dueDate || ''}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxMarks">Maximum Marks</Label>
                    <Input
                      id="maxMarks"
                      type="number"
                      value={newAssignment.maxMarks || 100}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, maxMarks: parseInt(e.target.value) || 100 }))}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={newAssignment.instructions || ''}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Enter detailed instructions for students"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Assignment File</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload('assignment', e.target.files?.[0] || null)}
                        className="hidden"
                        id="assignment-file"
                      />
                      <label htmlFor="assignment-file" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">Click to upload assignment file (PDF, DOC, DOCX)</p>
                        {newAssignment.assignmentFile && (
                          <p className="text-blue-600 mt-2">Selected: {newAssignment.assignmentFile.name}</p>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label>Solution File (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload('solution', e.target.files?.[0] || null)}
                        className="hidden"
                        id="solution-file"
                      />
                      <label htmlFor="solution-file" className="cursor-pointer">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">Click to upload solution file (PDF, DOC, DOCX)</p>
                        {newAssignment.solutionFile && (
                          <p className="text-blue-600 mt-2">Selected: {newAssignment.solutionFile.name}</p>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    setNewAssignment(prev => ({ ...prev, status: 'draft' }));
                    handleCreateAssignment();
                  }}>
                    Save as Draft
                  </Button>
                  <Button 
                    onClick={() => {
                      setNewAssignment(prev => ({ ...prev, status: 'published' }));
                      handleCreateAssignment();
                    }}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    Publish Assignment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Created Assignments
            </CardTitle>
            <CardDescription>
              View and manage all your created assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-4">
              <h4 className="text-base font-medium">Filter Assignments</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="year-filter">Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject-filter">Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="division-filter">Division</Label>
                  <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Divisions</SelectItem>
                      {divisions.map(div => (
                        <SelectItem key={div} value={div}>{div}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="batch-filter">Batch</Label>
                  <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batches</SelectItem>
                      {batches.map(batch => (
                        <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assignment-type-filter">Assignment Type</Label>
                  <Select value={selectedAssignmentType} onValueChange={setSelectedAssignmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {assignmentTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2">No assignments found</h3>
                <p className="text-gray-600 mb-4">No assignments match your current filters or you haven't created any assignments yet</p>
                <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assignment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAssignments.map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{assignment.title}</h3>
                          {getStatusBadge(assignment.status)}
                          {assignment.assignmentType && getAssignmentTypeBadge(assignment.assignmentType)}
                          <Badge variant="secondary">
                            {studentSubmissions.filter(s => s.assignmentId === assignment.id).length} submissions
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{assignment.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            {assignment.assignmentType && getAssignmentTypeIcon(assignment.assignmentType)}
                            {assignment.assignmentType || 'Unspecified'}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {assignment.subject}
                          </span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-4 h-4" />
                            {assignment.class} {assignment.division}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due: {assignment.dueDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Max Marks: {assignment.maxMarks}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewAssignmentDetail(assignment)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {assignment.status === 'draft' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePublishAssignment(assignment.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Publish
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}