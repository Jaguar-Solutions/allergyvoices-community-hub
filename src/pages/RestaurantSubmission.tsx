import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Star } from "lucide-react";
import { addRestaurantToMailerLite, sendThankYouEmail, type RestaurantSubmissionData } from '@/lib/mailerlite';
import { addRestaurant, addQuestionnaire } from '@/lib/supabase';
import { calculateScore, getGradeColors, getGradeIcon } from '@/lib/scoring';

interface RestaurantSubmission {
  restaurantName: string;
  state: string;
  otherState?: string;
  city: string;
  cuisineType: string;
  otherCuisine?: string;
  website: string;
  phoneNumber: string;
  email: string;
  contactPerson: string;
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
}

const RestaurantSubmissionPage = () => {
  const [formData, setFormData] = useState<RestaurantSubmission>({
    restaurantName: '',
    state: '',
    city: '',
    cuisineType: '',
    website: '',
    phoneNumber: '',
    email: '',
    contactPerson: '',
    hasAllergenMenu: '',
    staffTraining: '',
    equipmentCleaning: '',
    dedicatedPrepArea: '',
    guestDisclosure: '',
    allergyPointOfContact: '',
    allergenFreeOptions: [],
    dedicatedPrep: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'Other'
  ];
  const cuisineTypes = ['American', 'Italian', 'Chinese', 'Mexican', 'Indian', 'Bakery', 'Other'];
  const allergenFreeOptions = [
    'Peanut-Free', 'Tree-Nut-Free', 'Egg-Free', 'Dairy-Free', 
    'Gluten-Free', 'Sesame-Free', 'Soy-Free', 'Shellfish-Free'
  ];

  const handleInputChange = (field: keyof RestaurantSubmission, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (option: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      allergenFreeOptions: checked 
        ? [...prev.allergenFreeOptions, option]
        : prev.allergenFreeOptions.filter(item => item !== option)
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const { score, grade } = calculateScore(formData);
      const submissionData: RestaurantSubmissionData = {
        ...formData,
        score,
        grade
      };

      console.log('📝 Processing restaurant submission:', submissionData);

      // Add to Supabase database
      const restaurantResult = await addRestaurant({
        name: submissionData.restaurantName,
        email: submissionData.email,
        phone: submissionData.phoneNumber,
        city: submissionData.city,
        state: submissionData.state
      });

      if (!restaurantResult.success) {
        console.error('❌ Supabase error:', restaurantResult.error);
        setSubmitStatus('error');
        setSubmitMessage(`Failed to save submission: ${restaurantResult.error}`);
        return;
      }

      console.log('✅ Successfully added to Supabase:', restaurantResult.data);

      // Add questionnaire responses to Supabase
      const questionnaireResult = await addQuestionnaire({
        restaurantId: restaurantResult.data.id,
        responses: {
          cuisineType: submissionData.cuisineType,
          website: submissionData.website,
          contactPerson: submissionData.contactPerson,
          hasAllergenMenu: submissionData.hasAllergenMenu,
          allergenMenuLink: submissionData.allergenMenuLink,
          staffTraining: submissionData.staffTraining,
          trainingProgram: submissionData.trainingProgram,
          equipmentCleaning: submissionData.equipmentCleaning,
          dedicatedPrepArea: submissionData.dedicatedPrepArea,
          guestDisclosure: submissionData.guestDisclosure,
          allergyPointOfContact: submissionData.allergyPointOfContact,
          allergenFreeOptions: submissionData.allergenFreeOptions,
          dedicatedPrep: submissionData.dedicatedPrep,
          notes: submissionData.notes,
          score: submissionData.score,
          grade: submissionData.grade,
          submittedAt: new Date().toISOString(),
          source: 'restaurant_submission_form'
        }
      });

      if (!questionnaireResult.success) {
        console.warn('⚠️ Questionnaire save failed:', questionnaireResult.error);
        // Don't fail the submission if questionnaire save fails
      } else {
        console.log('✅ Questionnaire saved successfully');
      }

      // Add to MailerLite (for email marketing)
      const mailerLiteResult = await addRestaurantToMailerLite(submissionData);
      
      if (!mailerLiteResult.success) {
        console.warn('⚠️ MailerLite error:', mailerLiteResult.error);
        // Don't fail the submission if MailerLite fails
      } else {
        console.log('✅ Successfully added to MailerLite');
      }

      // Send thank-you email
      const emailResult = await sendThankYouEmail(submissionData);
      
      if (!emailResult.success) {
        console.warn('⚠️ Email sending failed:', emailResult.error);
        // Don't fail the submission if email fails
      } else {
        console.log('✅ Thank-you email sent successfully');
      }

      // Show success confirmation
      setSubmitStatus('success');
      setSubmitMessage('Restaurant information submitted successfully! You will receive a confirmation email shortly.');
      setShowConfirmation(true);

      // Reset form
      setFormData({
        restaurantName: '',
        state: '',
        city: '',
        cuisineType: '',
        website: '',
        phoneNumber: '',
        email: '',
        contactPerson: '',
        hasAllergenMenu: '',
        staffTraining: '',
        equipmentCleaning: '',
        dedicatedPrepArea: '',
        guestDisclosure: '',
        allergyPointOfContact: '',
        allergenFreeOptions: [],
        dedicatedPrep: '',
        notes: ''
      });

    } catch (error) {
      console.error('❌ Submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const { score, grade } = calculateScore(formData);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Confirmation Popup */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className={`text-6xl mb-4 ${
                submitStatus === 'success' ? '' : 'text-red-500'
              }`}>
                {submitStatus === 'success' ? '🎉' : '❌'}
              </div>
              <h2 className={`font-poppins font-bold text-2xl mb-4 ${
                submitStatus === 'success' ? 'text-gray-900' : 'text-red-600'
              }`}>
                {submitStatus === 'success' ? 'Thank you for submitting!' : 'Submission Failed'}
              </h2>
              <div className="text-gray-600 space-y-3 mb-6">
                <p>{submitMessage || (submitStatus === 'success' 
                  ? 'Your information has been received and is under review by AllergyVoices.'
                  : 'There was an error processing your submission.'
                )}</p>
                {submitStatus === 'success' && (
                  <ul className="text-left space-y-2">
                    <li>• Approved restaurants will be listed in our directory.</li>
                    <li>• Gold-certified restaurants will also receive the official AllergyVoices Approved™ badge.</li>
                    <li>• We'll notify you by email once your review is complete.</li>
                  </ul>
                )}
              </div>
              <Button
                onClick={() => setShowConfirmation(false)}
                className={`font-poppins px-6 py-2 rounded-lg ${
                  submitStatus === 'success' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Container */}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          <CardContent className="p-8 md:p-12">
            {/* Hero Section */}
            <div className="text-center space-y-6 mb-12">
              {/* Tagline */}
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                An AllergyVoices Pilot Program — Starting in the Triangle
              </p>
              
              {/* Main Heading */}
              <h1 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl leading-tight text-gray-900">
                Help us build a safer dining experience in the Triangle!
              </h1>
              
              {/* Intro Text */}
              <div className="space-y-4 text-sm md:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
                <p>
                  The Triangle (Raleigh, Durham, Cary, Chapel Hill) has been selected as the pilot region for AllergyVoices' new restaurant grading program. With its vibrant and growing food scene, the area is the perfect place to highlight the need for clear and consistent allergy-friendly dining practices.
                </p>
                <p>
                  Other restaurants nationwide are welcome to submit. Full regional rollouts are planned beginning in Q1 2026, with the Triangle setting the stage for expansion.
                </p>
              </div>

              {/* AllergyVoices Badge */}
              <div className="flex flex-col items-center space-y-4">
                <div className="w-48 h-48 flex items-center justify-center">
                  <img 
                    src={`/badge.png?v=${Date.now()}`}
                    alt="AllergyVoices Approved Badge" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm text-gray-500 max-w-md">
                  Restaurants that meet our review standards will receive this AllergyVoices Approved™ certification.
                </p>
              </div>
            </div>

            {/* Form Section */}
            {submitStatus === 'error' && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Submission Failed</h3>
                  <p className="text-red-700">Please try again or contact us if the problem persists.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📋</span>
                  <h2 className="font-poppins font-bold text-xl text-gray-900">
                    Restaurant Information
                  </h2>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="restaurantName" className="text-sm font-medium">
                      Restaurant Name *
                    </Label>
                    <Input
                      id="restaurantName"
                      value={formData.restaurantName}
                      onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                      placeholder="Enter restaurant name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">
                      State *
                    </Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.state === 'Other' && (
                      <Input
                        placeholder="Please specify"
                        value={formData.otherState || ''}
                        onChange={(e) => handleInputChange('otherState', e.target.value)}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cuisineType" className="text-sm font-medium">
                      Cuisine Type *
                    </Label>
                    <Select value={formData.cuisineType} onValueChange={(value) => handleInputChange('cuisineType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cuisine type" />
                      </SelectTrigger>
                      <SelectContent>
                        {cuisineTypes.map(cuisine => (
                          <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.cuisineType === 'Other' && (
                      <Input
                        placeholder="Please specify"
                        value={formData.otherCuisine || ''}
                        onChange={(e) => handleInputChange('otherCuisine', e.target.value)}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-medium">
                      Website
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium">
                      Phone Number *
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="(919) 123-4567"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contact@restaurant.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson" className="text-sm font-medium">
                      Contact Person *
                    </Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      placeholder="Manager or Owner Name"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Allergen Menu */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🥗</span>
                  <h2 className="font-poppins font-bold text-xl text-gray-900">
                    Allergen Information
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Do you have an allergen menu?</Label>
                    <RadioGroup value={formData.hasAllergenMenu} onValueChange={(value) => handleInputChange('hasAllergenMenu', value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="allergen-yes" />
                        <Label htmlFor="allergen-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="allergen-no" />
                        <Label htmlFor="allergen-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.hasAllergenMenu === 'Yes' && (
                    <div className="space-y-2">
                      <Label htmlFor="allergenMenuLink" className="text-sm font-medium">
                        Allergen Menu Link
                      </Label>
                      <Input
                        id="allergenMenuLink"
                        type="url"
                        value={formData.allergenMenuLink || ''}
                        onChange={(e) => handleInputChange('allergenMenuLink', e.target.value)}
                        placeholder="https://example.com/allergen-menu"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Staff Training */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🧑‍🍳</span>
                  <h2 className="font-poppins font-bold text-xl text-gray-900">
                    Training & Procedures
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Staff Training on Food Allergies</Label>
                    <RadioGroup value={formData.staffTraining} onValueChange={(value) => handleInputChange('staffTraining', value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="training-yes" />
                        <Label htmlFor="training-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Some staff" id="training-some" />
                        <Label htmlFor="training-some">Some staff</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="training-no" />
                        <Label htmlFor="training-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {(formData.staffTraining === 'Yes' || formData.staffTraining === 'Some staff') && (
                    <div className="space-y-2">
                      <Label htmlFor="trainingProgram" className="text-sm font-medium">
                        Training Program Details
                      </Label>
                      <Textarea
                        id="trainingProgram"
                        value={formData.trainingProgram || ''}
                        onChange={(e) => handleInputChange('trainingProgram', e.target.value)}
                        placeholder="Describe your training program..."
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Equipment Cleaning Protocol</Label>
                    <RadioGroup value={formData.equipmentCleaning} onValueChange={(value) => handleInputChange('equipmentCleaning', value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Always" id="cleaning-always" />
                        <Label htmlFor="cleaning-always">Always</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Sometimes" id="cleaning-sometimes" />
                        <Label htmlFor="cleaning-sometimes">Sometimes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Never" id="cleaning-never" />
                        <Label htmlFor="cleaning-never">Never</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Dedicated Prep Area for Allergen-Free Items</Label>
                    <RadioGroup value={formData.dedicatedPrepArea} onValueChange={(value) => handleInputChange('dedicatedPrepArea', value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="prep-yes" />
                        <Label htmlFor="prep-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Sometimes" id="prep-sometimes" />
                        <Label htmlFor="prep-sometimes">Sometimes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="prep-no" />
                        <Label htmlFor="prep-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Guest Disclosure of Allergies</Label>
                    <RadioGroup value={formData.guestDisclosure} onValueChange={(value) => handleInputChange('guestDisclosure', value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Always" id="disclosure-always" />
                        <Label htmlFor="disclosure-always">Always</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Sometimes" id="disclosure-sometimes" />
                        <Label htmlFor="disclosure-sometimes">Sometimes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Never" id="disclosure-never" />
                        <Label htmlFor="disclosure-never">Never</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Allergy Point of Contact</Label>
                    <RadioGroup value={formData.allergyPointOfContact} onValueChange={(value) => handleInputChange('allergyPointOfContact', value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="contact-yes" />
                        <Label htmlFor="contact-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="contact-no" />
                        <Label htmlFor="contact-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              {/* Allergen-Free Options */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">✅</span>
                  <h2 className="font-poppins font-bold text-xl text-gray-900">
                    Allergen-Free Options
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Which allergen-free options do you offer? (Select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {allergenFreeOptions.map(option => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={option}
                          checked={formData.allergenFreeOptions.includes(option)}
                          onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                        />
                        <Label htmlFor={option} className="text-sm">{option}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Dedicated Prep for Allergen-Free Items</Label>
                  <RadioGroup value={formData.dedicatedPrep} onValueChange={(value) => handleInputChange('dedicatedPrep', value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="dedicated-yes" />
                      <Label htmlFor="dedicated-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Some" id="dedicated-some" />
                      <Label htmlFor="dedicated-some">Some</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="dedicated-no" />
                      <Label htmlFor="dedicated-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">✍️</span>
                  <h2 className="font-poppins font-bold text-xl text-gray-900">
                    Additional Information
                  </h2>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional information about your allergy-friendly practices..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Score Preview */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <h3 className="font-poppins font-bold text-lg text-gray-900">Preview Score</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900">Score: {score} points</span>
                  </div>
                  <Badge className={`px-3 py-1 rounded-full border ${getGradeColors(grade)}`}>
                    <span className="mr-1">{getGradeIcon(grade)}</span>
                    {grade}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  This is a preview of your score. Final grade is confirmed after review.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || !formData.restaurantName || !formData.state || !formData.city || !formData.cuisineType || !formData.phoneNumber || !formData.email || !formData.contactPerson}
                    className="bg-green-600 hover:bg-green-700 text-white font-poppins px-8 py-3 rounded-lg"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Restaurant Information'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => window.location.href = '/restaurant-directory'}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 font-poppins px-8 py-3 rounded-lg"
                  >
                    View Restaurant Directory
                  </Button>
                </div>
              </div>
            </form>

            {/* Footer Note */}
            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Pilot Program:</strong> Starting in the Triangle region. 
                Submissions from all states are welcome and will be reviewed for future phases.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AllergyVoices Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            This pilot will expand region by region beginning in Q1 2026. Learn more at AllergyVoices.com.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSubmissionPage;
