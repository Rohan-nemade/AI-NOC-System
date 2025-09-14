import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { useAssignments, type StudentSubmission } from './AssignmentContext';
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  Upload, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Filter,
  BookOpen,
  Monitor,
  ClipboardList
} from 'lucide-react';

interface StudentAssignmentViewProps {
  onBack: () => void;
}

export function StudentAssignmentView({ onBack }: StudentAssignmentViewProps) {
  const { assignments, addStudentSubmission, studentSubmissions, getAssignmentsForStudent, getStudentSubmission } = useAssignments();
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedAssignmentType, setSelectedAssignmentType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSubmissionDialog, setShowSubmissionDialog] = useState<boolean>(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionComments, setSubmissionComments] = useState<string>('');

  // Mock student data - in real app this would come from context
  const currentStudent = {
    id: 'student1',
    name: 'Gaurang Chavan',
    rollNo: '21310104',
    class: 'TE IT',
    division: 'A',
    batch: 'Batch 1'
  };

  const subjects = [...new Set(assignments.map(a => a.subject))];
  const classes = [...new Set(assignments.map(a => a.class))];
  const assignmentTypes = ['Theory Assignment', 'Home Assignment', 'Practical Assignment', 'Tutorial Assignment'];

  // Filter assignments for current student - only show published assignments
  const studentAssignments = assignments.filter(assignment => 
    assignment.status === 'published' && 
    (assignment.class === currentStudent.class || assignment.class === 'all') &&
    (assignment.division === currentStudent.division || assignment.division === 'all')
  );

  const filteredAssignments = studentAssignments.filter(assignment => {
    const subjectMatch = selectedSubject === 'all' || assignment.subject === selectedSubject;
    const classMatch = selectedClass === 'all' || assignment.class === selectedClass;
    const assignmentTypeMatch = selectedAssignmentType === 'all' || assignment.assignmentType === selectedAssignmentType;
    const statusMatch = selectedStatus === 'all' || 
      (selectedStatus === 'pending' && !isSubmitted(assignment.id)) ||
      (selectedStatus === 'submitted' && isSubmitted(assignment.id)) ||
      (selectedStatus === 'overdue' && isOverdue(assignment.dueDate) && !isSubmitted(assignment.id));
    const searchMatch = !searchTerm || 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());

    return subjectMatch && classMatch && assignmentTypeMatch && statusMatch && searchMatch;
  });

  // Check if assignment is submitted by current student
  const isSubmitted = (assignmentId: string) => {
    return studentSubmissions.some(submission => 
      submission.assignmentId === assignmentId && 
      submission.studentRollNo === currentStudent.rollNo
    );
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const handleSubmit = (assignment: any) => {
    setSelectedAssignment(assignment);
    setShowSubmissionDialog(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSubmissionFile(file);
  };

  const handleSubmission = () => {
    if (selectedAssignment && submissionFile) {
      const isLate = isOverdue(selectedAssignment.dueDate);
      
      const submissionData: StudentSubmission = {
        id: Date.now().toString(),
        assignmentId: selectedAssignment.id,
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        studentRollNo: currentStudent.rollNo,
        submissionFile,
        submissionDate: new Date().toISOString(),
        status: isLate ? 'late' : 'submitted'  
      };

      addStudentSubmission(submissionData);

      // Reset form
      setSubmissionFile(null);
      setSubmissionComments('');
      setShowSubmissionDialog(false);
      setSelectedAssignment(null);

      // Show success message
      alert(`Assignment submitted successfully! ${isLate ? 'Note: This is a late submission.' : ''}`);
    }
  };

  const getStatusBadge = (assignment: any) => {
    if (isSubmitted(assignment.id)) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Submitted</Badge>;
    }
    if (isOverdue(assignment.dueDate)) {
      return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Overdue</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
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

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate summary statistics
  const totalAssignments = filteredAssignments.length;
  const submittedCount = filteredAssignments.filter(a => isSubmitted(a.id)).length;
  const pendingCount = filteredAssignments.filter(a => !isSubmitted(a.id) && !isOverdue(a.dueDate)).length;
  const overdueCount = filteredAssignments.filter(a => !isSubmitted(a.id) && isOverdue(a.dueDate)).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-2">
              <Eye className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl mb-2">My Assignments</h1>
            <p className="text-gray-600">View and submit your assignments</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-5 h-5 text-blue-600" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalAssignments}</div>
              <p className="text-sm text-gray-600">Assignments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Submitted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{submittedCount}</div>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-5 h-5 text-blue-600" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
              <p className="text-sm text-gray-600">To submit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
              <p className="text-sm text-gray-600">Late submissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Assignments
            </CardTitle>
            <CardDescription>
              Filter assignments by subject, type, and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="filter-subject">Subject</Label>
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
                <Label htmlFor="filter-type">Assignment Type</Label>
                <Select value={selectedAssignmentType} onValueChange={setSelectedAssignmentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {assignmentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2">No assignments found</h3>
                <p className="text-gray-600">Try adjusting your filters to see more assignments</p>
              </CardContent>
            </Card>
          ) : (
            filteredAssignments.map((assignment) => {
              const daysUntilDue = getDaysUntilDue(assignment.dueDate);
              const submitted = isSubmitted(assignment.id);
              const overdue = isOverdue(assignment.dueDate);

              return (
                <Card key={assignment.id} className={`hover:shadow-md transition-shadow ${overdue && !submitted ? 'border-red-200 bg-red-50' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{assignment.title}</h3>
                          {getStatusBadge(assignment)}
                          {assignment.assignmentType && getAssignmentTypeBadge(assignment.assignmentType)}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{assignment.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4 text-gray-500" />
                            <span>{assignment.subject}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className={daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 2 ? 'text-orange-600' : 'text-gray-600'}>
                              {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : 
                               daysUntilDue === 0 ? 'Due today' : 
                               `${daysUntilDue} days left`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {assignment.assignmentType && getAssignmentTypeIcon(assignment.assignmentType)}
                            <span>{assignment.assignmentType || 'Assignment'}</span>
                          </div>
                        </div>

                        {assignment.instructions && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-1">Instructions:</h4>
                            <p className="text-blue-800 text-sm">{assignment.instructions}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        
                        {!submitted && (
                          <Button 
                            onClick={() => handleSubmit(assignment)}
                            className={`${overdue ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'}`}
                            size="sm"
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            {overdue ? 'Submit Late' : 'Submit'}
                          </Button>
                        )}
                        
                        {submitted && (
                          <Button variant="outline" size="sm" className="text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Submitted
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Submission Dialog */}
      <Dialog open={showSubmissionDialog} onOpenChange={setShowSubmissionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              Submit your assignment for {selectedAssignment?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedAssignment && isOverdue(selectedAssignment.dueDate) && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium text-sm">Late Submission Warning</span>
                </div>
                <p className="text-orange-700 text-sm mt-1">
                  This assignment is overdue. Late submissions may receive reduced marks.
                </p>
              </div>
            )}

            <div>
              <Label>Upload Assignment File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mt-2">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.zip,.rar"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="submission-file"
                />
                <label htmlFor="submission-file" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Click to upload your assignment</p>
                  <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, DOC, DOCX, ZIP, RAR</p>
                  {submissionFile && (
                    <p className="text-blue-600 mt-2 font-medium">Selected: {submissionFile.name}</p>
                  )}
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                value={submissionComments}
                onChange={(e) => setSubmissionComments(e.target.value)}
                placeholder="Add any comments about your submission..."
                className="w-full mt-1"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowSubmissionDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmission}
                disabled={!submissionFile}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Submit Assignment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}