import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle, Eye, Edit, Star, Filter, Search } from "lucide-react";
import { getRestaurants, updateRestaurantStatus, addRestaurantRating, publishRestaurant, deleteRestaurant, updateRestaurant, updateQuestionnaire } from '@/lib/supabase';
import { calculateScore, getGradeColors, getGradeIcon } from '@/lib/scoring';

interface RestaurantSubmission {
  id: string;
  restaurantName: string;
  email?: string;
  phoneNumber?: string;
  city: string;
  state?: string;
  otherCity?: string;
  cuisineType: string;
  otherCuisine?: string;
  website: string;
  hasAllergenMenu: string;
  allergenMenuLink?: string;
  staffTraining: string;
  trainingProgram?: string;
  equipmentCleaning: string;
  dedicatedPrepArea: string;
  guestDisclosure: string;
  allergyPointOfContact: string;
  allergenFreeOptions: string[];
  dedicatedPrep: string;
  notes: string;
  score: number;
  grade: string;
  status: 'Pending' | 'Approved' | 'Published';
  submittedAt: string;
}

const AdminPanel = () => {
  const [submissions, setSubmissions] = useState<RestaurantSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<RestaurantSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<RestaurantSubmission | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<RestaurantSubmission>>({});

  // Mock authentication - in production, use proper auth
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple password for demo
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  // Load real data from Supabase
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const result = await getRestaurants();
        if (import.meta.env.DEV) {
          console.log('🔍 Admin getRestaurants result:', result);
        }
        
        if (result.success && result.data) {
          if (import.meta.env.DEV) {
            console.log('📊 Admin raw restaurant data:', result.data);
          }
          // Transform Supabase data to match our interface
          const transformedSubmissions: RestaurantSubmission[] = result.data.map((restaurant: any) => {
            const questionnaire = restaurant.restaurant_questionnaires?.[0];
            const responses = questionnaire?.responses || {};
            
            return {
              id: restaurant.id,
              restaurantName: restaurant.name,
              city: restaurant.city,
              cuisineType: responses.cuisineType || 'Unknown',
              website: responses.website || '',
              hasAllergenMenu: responses.hasAllergenMenu || 'No',
              allergenMenuLink: responses.allergenMenuLink || '',
              staffTraining: responses.staffTraining || 'No',
              trainingProgram: responses.trainingProgram || '',
              equipmentCleaning: responses.equipmentCleaning || 'Never',
              dedicatedPrepArea: responses.dedicatedPrepArea || 'No',
              guestDisclosure: responses.guestDisclosure || 'Never',
              allergyPointOfContact: responses.allergyPointOfContact || 'No',
              allergenFreeOptions: responses.allergenFreeOptions || [],
              dedicatedPrep: responses.dedicatedPrep || 'No',
              notes: responses.notes || '',
              score: responses.score || 0,
              grade: responses.grade || 'Needs Improvement',
              status: restaurant.status,
              submittedAt: restaurant.submitted_at
            };
          });
          
          setSubmissions(transformedSubmissions);
          setFilteredSubmissions(transformedSubmissions);
          console.log('✅ Loaded restaurants from Supabase:', transformedSubmissions.length);
        } else {
          console.error('❌ Failed to load restaurants:', result.error);
          // Fallback to empty array
          setSubmissions([]);
          setFilteredSubmissions([]);
        }
      } catch (error) {
        console.error('❌ Error loading restaurants:', error);
        setSubmissions([]);
        setFilteredSubmissions([]);
      }
    };

    if (isAuthenticated) {
      loadRestaurants();
    }
  }, [isAuthenticated]);

  // Filter submissions
  useEffect(() => {
    let filtered = submissions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.cuisineType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }

    // Grade filter
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(submission => submission.grade === gradeFilter);
    }

    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, statusFilter, gradeFilter]);

  const updateSubmissionStatus = async (id: string, newStatus: RestaurantSubmission['status']) => {
    try {
      if (import.meta.env.DEV) {
        console.log(`🔄 Updating restaurant ${id} to status: ${newStatus}`);
      }
      const result = await updateRestaurantStatus(id, newStatus);
      if (result.success) {
        // Update local state
        setSubmissions(prev => prev.map(submission =>
          submission.id === id ? { ...submission, status: newStatus } : submission
        ));
        setFilteredSubmissions(prev => prev.map(submission =>
          submission.id === id ? { ...submission, status: newStatus } : submission
        ));
        if (import.meta.env.DEV) {
          console.log(`✅ Restaurant status updated successfully to: ${newStatus}`);
          console.log('📊 Updated restaurant data:', result.data);
        }
      } else {
        console.error('❌ Failed to update status:', result.error);
        alert('Failed to update restaurant status. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('Error updating restaurant status. Please try again.');
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deleteRestaurant(id);
      if (result.success) {
        // Remove from local state
        setSubmissions(prev => prev.filter(submission => submission.id !== id));
        setFilteredSubmissions(prev => prev.filter(submission => submission.id !== id));
        setSelectedSubmission(null);
        console.log('✅ Restaurant deleted successfully');
        alert('Restaurant deleted successfully');
      } else {
        console.error('❌ Failed to delete restaurant:', result.error);
        alert('Failed to delete restaurant. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error deleting restaurant:', error);
      alert('Error deleting restaurant. Please try again.');
    }
  };

  const handleEditRestaurant = (submission: RestaurantSubmission) => {
    setEditData(submission);
    setIsEditing(true);
  };

  // Calculate score based on current edit data
  const calculateEditScore = () => {
    if (!editData) return { score: 0, grade: 'Needs Improvement' };
    
    return calculateScore({
      hasAllergenMenu: editData.hasAllergenMenu || 'No',
      staffTraining: editData.staffTraining || 'No',
      equipmentCleaning: editData.equipmentCleaning || 'Never',
      dedicatedPrepArea: editData.dedicatedPrepArea || 'No',
      guestDisclosure: editData.guestDisclosure || 'Never',
      allergyPointOfContact: editData.allergyPointOfContact || 'No',
      dedicatedPrep: editData.dedicatedPrep || 'No',
      allergenMenuLink: editData.allergenMenuLink,
      allergenFreeOptions: editData.allergenFreeOptions || []
    });
  };

  const currentScore = calculateEditScore();

  const handleSaveEdit = async () => {
    if (!selectedSubmission) return;

    try {
      // Calculate updated score and grade
      const { score, grade } = currentScore;

      // Update restaurant basic info
      const restaurantResult = await updateRestaurant(selectedSubmission.id, {
        name: editData.restaurantName,
        email: editData.email,
        phone: editData.phoneNumber,
        city: editData.city,
        state: editData.state
      });

      if (!restaurantResult.success) {
        alert('Failed to update restaurant information');
        return;
      }

      // Update questionnaire responses with calculated score
      const questionnaireResult = await updateQuestionnaire(selectedSubmission.id, {
        cuisineType: editData.cuisineType,
        website: editData.website,
        hasAllergenMenu: editData.hasAllergenMenu,
        allergenMenuLink: editData.allergenMenuLink,
        staffTraining: editData.staffTraining,
        trainingProgram: editData.trainingProgram,
        equipmentCleaning: editData.equipmentCleaning,
        dedicatedPrepArea: editData.dedicatedPrepArea,
        guestDisclosure: editData.guestDisclosure,
        allergyPointOfContact: editData.allergyPointOfContact,
        allergenFreeOptions: editData.allergenFreeOptions,
        dedicatedPrep: editData.dedicatedPrep,
        notes: editData.notes,
        score: score,
        grade: grade
      });

      if (!questionnaireResult.success) {
        alert('Failed to update questionnaire responses');
        return;
      }

      // Update local state with calculated score
      setSubmissions(prev => prev.map(submission =>
        submission.id === selectedSubmission.id ? { 
          ...submission, 
          ...editData, 
          score: score, 
          grade: grade 
        } : submission
      ));
      setFilteredSubmissions(prev => prev.map(submission =>
        submission.id === selectedSubmission.id ? { ...submission, ...editData } : submission
      ));
      setSelectedSubmission({ ...selectedSubmission, ...editData });

      setIsEditing(false);
      setEditData({});
      console.log('✅ Restaurant updated successfully');
      alert('Restaurant updated successfully');
    } catch (error) {
      console.error('❌ Error updating restaurant:', error);
      alert('Error updating restaurant. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Published': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Bronze': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Needs Improvement': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h1 className="font-poppins font-bold text-2xl text-foreground">Admin Login</h1>
                <p className="text-muted-foreground">Enter password to access the admin panel</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                  />
                </div>
                <Button type="submit" variant="hero" className="w-full">
                  Login
                </Button>
              </form>
              <p className="text-xs text-muted-foreground">
                Demo password: admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-poppins font-bold text-3xl text-foreground">Restaurant Submissions</h1>
              <p className="text-muted-foreground">Manage and review restaurant allergy submissions</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsAuthenticated(false)}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Submissions List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="search"
                        placeholder="Search restaurants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Grade</Label>
                    <Select value={gradeFilter} onValueChange={setGradeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All grades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="Silver">Silver</SelectItem>
                        <SelectItem value="Bronze">Bronze</SelectItem>
                        <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setGradeFilter('all');
                      }}
                      className="w-full"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submissions List */}
            <div className="space-y-4">
              {filteredSubmissions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No submissions found matching your criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredSubmissions.map((submission) => (
                  <Card key={submission.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-poppins font-bold text-xl text-foreground">
                              {submission.restaurantName}
                            </h3>
                            <Badge className={`px-2 py-1 text-xs ${getStatusColor(submission.status)}`}>
                              {submission.status}
                            </Badge>
                            <Badge className={`px-2 py-1 text-xs ${getGradeColor(submission.grade)}`}>
                              {submission.grade}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{submission.city}</span>
                            <span>•</span>
                            <span>{submission.cuisineType}</span>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-primary" />
                              <span>{submission.score} points</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {submission.allergenFreeOptions.slice(0, 3).map(option => (
                              <Badge key={option} variant="secondary" className="text-xs">
                                {option}
                              </Badge>
                            ))}
                            {submission.allergenFreeOptions.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{submission.allergenFreeOptions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Select
                            value={submission.status}
                            onValueChange={(value) => updateSubmissionStatus(submission.id, value as RestaurantSubmission['status'])}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                              <SelectItem value="Published">Published</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Submission Details */}
          <div className="lg:col-span-1">
            {selectedSubmission ? (
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-poppins font-bold text-xl text-foreground">
                        {selectedSubmission.restaurantName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={`px-2 py-1 text-xs ${getStatusColor(selectedSubmission.status)}`}>
                          {selectedSubmission.status}
                        </Badge>
                        <Badge className={`px-2 py-1 text-xs ${getGradeColor(selectedSubmission.grade)}`}>
                          {selectedSubmission.grade}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4 text-sm">
                      <div>
                        <Label className="font-semibold">Location</Label>
                        <p>{selectedSubmission.city}{selectedSubmission.otherCity && ` (${selectedSubmission.otherCity})`}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Cuisine</Label>
                        <p>{selectedSubmission.cuisineType}{selectedSubmission.otherCuisine && ` (${selectedSubmission.otherCuisine})`}</p>
                      </div>
                      {selectedSubmission.website && (
                        <div>
                          <Label className="font-semibold">Website</Label>
                          <p>
                            <a href={selectedSubmission.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {selectedSubmission.website}
                            </a>
                          </p>
                        </div>
                      )}
                      <div>
                        <Label className="font-semibold">Score</Label>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-primary" />
                          <span>{selectedSubmission.score} points</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="font-semibold">Allergen-Free Options</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedSubmission.allergenFreeOptions.map(option => (
                            <Badge key={option} variant="secondary" className="text-xs">
                              {option}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {selectedSubmission.notes && (
                      <div>
                        <Label className="font-semibold">Notes</Label>
                        <p className="text-sm text-muted-foreground mt-1">{selectedSubmission.notes}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-border">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSubmission(null)}
                          className="flex-1"
                        >
                          Close
                        </Button>
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={() => {
                            const newStatus = selectedSubmission.status === 'Pending' ? 'Approved' : 
                                            selectedSubmission.status === 'Approved' ? 'Published' : 'Pending';
                            updateSubmissionStatus(selectedSubmission.id, newStatus);
                          }}
                        >
                          {selectedSubmission.status === 'Pending' ? 'Approve' : 
                           selectedSubmission.status === 'Approved' ? 'Publish' : 'Reset'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRestaurant(selectedSubmission)}
                          className="flex items-center space-x-1"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRestaurant(selectedSubmission.id)}
                          className="flex items-center space-x-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a submission to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Edit Restaurant</h3>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>

                {/* Restaurant Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-primary border-b pb-2">Restaurant Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-restaurantName">Restaurant Name</Label>
                      <Input
                        id="edit-restaurantName"
                        value={editData.restaurantName || ''}
                        onChange={(e) => setEditData({...editData, restaurantName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-phoneNumber">Phone</Label>
                      <Input
                        id="edit-phoneNumber"
                        value={editData.phoneNumber || ''}
                        onChange={(e) => setEditData({...editData, phoneNumber: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-city">City</Label>
                      <Input
                        id="edit-city"
                        value={editData.city || ''}
                        onChange={(e) => setEditData({...editData, city: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-state">State</Label>
                      <Input
                        id="edit-state"
                        value={editData.state || ''}
                        onChange={(e) => setEditData({...editData, state: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-cuisineType">Cuisine Type</Label>
                      <Select value={editData.cuisineType || ''} onValueChange={(value) => setEditData({...editData, cuisineType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cuisine type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="American">American</SelectItem>
                          <SelectItem value="Italian">Italian</SelectItem>
                          <SelectItem value="Chinese">Chinese</SelectItem>
                          <SelectItem value="Mexican">Mexican</SelectItem>
                          <SelectItem value="Indian">Indian</SelectItem>
                          <SelectItem value="Bakery">Bakery</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-website">Website</Label>
                      <Input
                        id="edit-website"
                        placeholder="https://example.com"
                        value={editData.website || ''}
                        onChange={(e) => setEditData({...editData, website: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Allergen Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-primary border-b pb-2">Allergen Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-hasAllergenMenu">Allergen Menu Available</Label>
                      <Select value={editData.hasAllergenMenu || 'No'} onValueChange={(value) => setEditData({...editData, hasAllergenMenu: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-allergenMenuLink">Allergen Menu Link</Label>
                      <Input
                        id="edit-allergenMenuLink"
                        placeholder="https://example.com/allergen-menu"
                        value={editData.allergenMenuLink || ''}
                        onChange={(e) => setEditData({...editData, allergenMenuLink: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Training & Procedures */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-primary border-b pb-2">Training & Procedures</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-staffTraining">Staff Training</Label>
                      <Select value={editData.staffTraining || 'No'} onValueChange={(value) => setEditData({...editData, staffTraining: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="Some staff">Some staff</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-trainingProgram">Training Program</Label>
                      <Input
                        id="edit-trainingProgram"
                        placeholder="Describe training program"
                        value={editData.trainingProgram || ''}
                        onChange={(e) => setEditData({...editData, trainingProgram: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-equipmentCleaning">Equipment Cleaning</Label>
                      <Select value={editData.equipmentCleaning || 'Never'} onValueChange={(value) => setEditData({...editData, equipmentCleaning: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Always">Always</SelectItem>
                          <SelectItem value="Sometimes">Sometimes</SelectItem>
                          <SelectItem value="Never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-dedicatedPrepArea">Dedicated Prep Area</Label>
                      <Select value={editData.dedicatedPrepArea || 'No'} onValueChange={(value) => setEditData({...editData, dedicatedPrepArea: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="Sometimes">Sometimes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-guestDisclosure">Guest Disclosure</Label>
                      <Select value={editData.guestDisclosure || 'Never'} onValueChange={(value) => setEditData({...editData, guestDisclosure: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Always">Always</SelectItem>
                          <SelectItem value="Sometimes">Sometimes</SelectItem>
                          <SelectItem value="Never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-allergyPointOfContact">Allergy Point of Contact</Label>
                      <Select value={editData.allergyPointOfContact || 'No'} onValueChange={(value) => setEditData({...editData, allergyPointOfContact: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-dedicatedPrep">Dedicated Prep</Label>
                      <Select value={editData.dedicatedPrep || 'No'} onValueChange={(value) => setEditData({...editData, dedicatedPrep: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="Some">Some</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>


                {/* Allergen-Free Options */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-primary border-b pb-2">Allergen-Free Options</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg bg-gray-50">
                    {[
                      'Peanut-Free',
                      'Tree-Nut-Free', 
                      'Egg-Free',
                      'Dairy-Free',
                      'Gluten-Free',
                      'Sesame-Free',
                      'Soy-Free',
                      'Shellfish-Free'
                    ].map((allergen) => (
                      <div key={allergen} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-allergen-${allergen}`}
                          checked={editData.allergenFreeOptions?.includes(allergen) || false}
                          onCheckedChange={(checked) => {
                            const currentOptions = editData.allergenFreeOptions || [];
                            if (checked) {
                              setEditData({
                                ...editData,
                                allergenFreeOptions: [...currentOptions, allergen]
                              });
                            } else {
                              setEditData({
                                ...editData,
                                allergenFreeOptions: currentOptions.filter(option => option !== allergen)
                              });
                            }
                          }}
                        />
                        <Label 
                          htmlFor={`edit-allergen-${allergen}`} 
                          className="text-sm cursor-pointer"
                        >
                          {allergen}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Select all allergen-free options that this restaurant offers
                  </p>
                </div>

                {/* Live Scoring & Rating */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-primary border-b pb-2">Live Scoring & Rating</h4>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-semibold text-gray-900">Current Score</h5>
                        <p className="text-sm text-gray-600">Score updates automatically as you edit</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{currentScore.score}/25</div>
                        <div className="text-sm text-gray-600">points</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Grade:</span>
                        <Badge className={`px-3 py-1 ${getGradeColors(currentScore.grade)}`}>
                          <span className="mr-1">{getGradeIcon(currentScore.grade)}</span>
                          {currentScore.grade}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {currentScore.score >= 16 && 'Gold: 16+ points'}
                        {currentScore.score >= 10 && currentScore.score < 16 && 'Silver: 10-15 points'}
                        {currentScore.score >= 5 && currentScore.score < 10 && 'Bronze: 5-9 points'}
                        {currentScore.score < 5 && 'Needs Improvement: <5 points'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-primary border-b pb-2">Additional Information</h4>
                  <div>
                    <Label htmlFor="edit-notes">Notes</Label>
                    <Textarea
                      id="edit-notes"
                      placeholder="Add any additional notes about this restaurant..."
                      value={editData.notes || ''}
                      onChange={(e) => setEditData({...editData, notes: e.target.value})}
                      rows={4}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
