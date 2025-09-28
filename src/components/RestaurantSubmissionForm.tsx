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

const RestaurantSubmissionForm = () => {
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
  const [submitMessage, setSubmitMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleInputChange = (field: keyof RestaurantSubmission, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAllergenToggle = (option: string) => {
    setFormData(prev => ({
      ...prev,
      allergenFreeOptions: prev.allergenFreeOptions.includes(option)
        ? prev.allergenFreeOptions.filter(item => item !== option)
        : [...prev.allergenFreeOptions, option]
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
        name: formData.restaurantName,
        email: formData.email,
        phone: formData.phoneNumber,
        city: formData.city,
        state: formData.state
      });

      if (!restaurantResult.success) {
        throw new Error(`Database error: ${restaurantResult.error}`);
      }

      console.log('✅ Restaurant added to database:', restaurantResult.data);

      // Add questionnaire responses
      const questionnaireResult = await addQuestionnaire({
        restaurantId: restaurantResult.data.id,
        responses: {
          cuisineType: formData.cuisineType,
          otherCuisine: formData.otherCuisine,
          website: formData.website,
          contactPerson: formData.contactPerson,
          hasAllergenMenu: formData.hasAllergenMenu,
          allergenMenuLink: formData.allergenMenuLink,
          staffTraining: formData.staffTraining,
          trainingProgram: formData.trainingProgram,
          equipmentCleaning: formData.equipmentCleaning,
          dedicatedPrepArea: formData.dedicatedPrepArea,
          guestDisclosure: formData.guestDisclosure,
          allergyPointOfContact: formData.allergyPointOfContact,
          allergenFreeOptions: formData.allergenFreeOptions,
          dedicatedPrep: formData.dedicatedPrep,
          notes: formData.notes,
          score: score,
          grade: grade
        }
      });

      if (!questionnaireResult.success) {
        throw new Error(`Questionnaire error: ${questionnaireResult.error}`);
      }

      console.log('✅ Questionnaire added to database');

      // Add to MailerLite
      try {
        await addRestaurantToMailerLite(formData.email, formData.restaurantName);
        console.log('✅ Added to MailerLite');
      } catch (error) {
        console.warn('⚠️ MailerLite error (non-critical):', error);
      }

      // Send thank you email
      try {
        await sendThankYouEmail(formData.email, formData.restaurantName);
        console.log('✅ Thank you email sent');
      } catch (error) {
        console.warn('⚠️ Email sending error (non-critical):', error);
      }

      setSubmitStatus('success');
      setSubmitMessage('Your restaurant information has been submitted successfully!');
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
      setSubmitMessage(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { score, grade } = calculateScore(formData);

  return (
    <div className="w-full">
      {/* Confirmation Popup */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-poppins font-bold text-xl mb-2 text-gray-900">
                🎉 Thank you for submitting!
              </h3>
              <p className="font-inter text-gray-600 mb-6">
                Your information has been received and is under review by AllergyVoices.<br/><br/>
                • Approved restaurants will be listed in our directory.<br/>
                • Gold-certified restaurants will also receive the official AllergyVoices Approved™ badge.<br/><br/>
                We'll notify you by email once your review is complete.
              </p>
              <Button 
                onClick={() => setShowConfirmation(false)}
                className="font-poppins px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Form Container */}
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        <CardContent className="p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Restaurant Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">📋</span>
                <h3 className="font-poppins font-bold text-xl text-gray-900">Restaurant Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="restaurantName" className="font-inter font-medium text-gray-700">
                    Restaurant Name *
                  </Label>
                  <Input
                    id="restaurantName"
                    value={formData.restaurantName}
                    onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                    required
                    className="mt-1"
                    placeholder="Enter restaurant name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="font-inter font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="mt-1"
                    placeholder="contact@restaurant.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phoneNumber" className="font-inter font-medium text-gray-700">
                    Phone Number *
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    required
                    className="mt-1"
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contactPerson" className="font-inter font-medium text-gray-700">
                    Contact Person
                  </Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    className="mt-1"
                    placeholder="Manager or owner name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="state" className="font-inter font-medium text-gray-700">
                    State *
                  </Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AL">Alabama</SelectItem>
                      <SelectItem value="AK">Alaska</SelectItem>
                      <SelectItem value="AZ">Arizona</SelectItem>
                      <SelectItem value="AR">Arkansas</SelectItem>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="CO">Colorado</SelectItem>
                      <SelectItem value="CT">Connecticut</SelectItem>
                      <SelectItem value="DE">Delaware</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="GA">Georgia</SelectItem>
                      <SelectItem value="HI">Hawaii</SelectItem>
                      <SelectItem value="ID">Idaho</SelectItem>
                      <SelectItem value="IL">Illinois</SelectItem>
                      <SelectItem value="IN">Indiana</SelectItem>
                      <SelectItem value="IA">Iowa</SelectItem>
                      <SelectItem value="KS">Kansas</SelectItem>
                      <SelectItem value="KY">Kentucky</SelectItem>
                      <SelectItem value="LA">Louisiana</SelectItem>
                      <SelectItem value="ME">Maine</SelectItem>
                      <SelectItem value="MD">Maryland</SelectItem>
                      <SelectItem value="MA">Massachusetts</SelectItem>
                      <SelectItem value="MI">Michigan</SelectItem>
                      <SelectItem value="MN">Minnesota</SelectItem>
                      <SelectItem value="MS">Mississippi</SelectItem>
                      <SelectItem value="MO">Missouri</SelectItem>
                      <SelectItem value="MT">Montana</SelectItem>
                      <SelectItem value="NE">Nebraska</SelectItem>
                      <SelectItem value="NV">Nevada</SelectItem>
                      <SelectItem value="NH">New Hampshire</SelectItem>
                      <SelectItem value="NJ">New Jersey</SelectItem>
                      <SelectItem value="NM">New Mexico</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="NC">North Carolina</SelectItem>
                      <SelectItem value="ND">North Dakota</SelectItem>
                      <SelectItem value="OH">Ohio</SelectItem>
                      <SelectItem value="OK">Oklahoma</SelectItem>
                      <SelectItem value="OR">Oregon</SelectItem>
                      <SelectItem value="PA">Pennsylvania</SelectItem>
                      <SelectItem value="RI">Rhode Island</SelectItem>
                      <SelectItem value="SC">South Carolina</SelectItem>
                      <SelectItem value="SD">South Dakota</SelectItem>
                      <SelectItem value="TN">Tennessee</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="UT">Utah</SelectItem>
                      <SelectItem value="VT">Vermont</SelectItem>
                      <SelectItem value="VA">Virginia</SelectItem>
                      <SelectItem value="WA">Washington</SelectItem>
                      <SelectItem value="WV">West Virginia</SelectItem>
                      <SelectItem value="WI">Wisconsin</SelectItem>
                      <SelectItem value="WY">Wyoming</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="city" className="font-inter font-medium text-gray-700">
                    City *
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                    className="mt-1"
                    placeholder="Enter city name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cuisineType" className="font-inter font-medium text-gray-700">
                    Cuisine Type *
                  </Label>
                  <Select value={formData.cuisineType} onValueChange={(value) => handleInputChange('cuisineType', value)}>
                    <SelectTrigger className="mt-1">
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
                  <Label htmlFor="website" className="font-inter font-medium text-gray-700">
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="mt-1"
                    placeholder="https://restaurant.com"
                  />
                </div>
              </div>
            </div>

            {/* Allergen Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🥗</span>
                <h3 className="font-poppins font-bold text-xl text-gray-900">Allergen Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="font-inter font-medium text-gray-700">
                    Do you have an allergen menu available? *
                  </Label>
                  <RadioGroup 
                    value={formData.hasAllergenMenu} 
                    onValueChange={(value) => handleInputChange('hasAllergenMenu', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="allergen-yes" />
                      <Label htmlFor="allergen-yes" className="font-inter">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="allergen-no" />
                      <Label htmlFor="allergen-no" className="font-inter">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {formData.hasAllergenMenu === 'Yes' && (
                  <div>
                    <Label htmlFor="allergenMenuLink" className="font-inter font-medium text-gray-700">
                      Allergen Menu Link
                    </Label>
                    <Input
                      id="allergenMenuLink"
                      value={formData.allergenMenuLink || ''}
                      onChange={(e) => handleInputChange('allergenMenuLink', e.target.value)}
                      className="mt-1"
                      placeholder="https://restaurant.com/allergen-menu"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Training & Procedures */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🧑‍🍳</span>
                <h3 className="font-poppins font-bold text-xl text-gray-900">Training & Procedures</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label className="font-inter font-medium text-gray-700">
                    Do you provide staff training on food allergies? *
                  </Label>
                  <RadioGroup 
                    value={formData.staffTraining} 
                    onValueChange={(value) => handleInputChange('staffTraining', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="training-yes" />
                      <Label htmlFor="training-yes" className="font-inter">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Some staff" id="training-some" />
                      <Label htmlFor="training-some" className="font-inter">Some staff</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="training-no" />
                      <Label htmlFor="training-no" className="font-inter">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {formData.staffTraining === 'Yes' && (
                  <div>
                    <Label htmlFor="trainingProgram" className="font-inter font-medium text-gray-700">
                      Describe your training program
                    </Label>
                    <Textarea
                      id="trainingProgram"
                      value={formData.trainingProgram || ''}
                      onChange={(e) => handleInputChange('trainingProgram', e.target.value)}
                      className="mt-1"
                      placeholder="Describe your staff training program..."
                      rows={3}
                    />
                  </div>
                )}
                
                <div>
                  <Label className="font-inter font-medium text-gray-700">
                    How often do you clean equipment between allergen-free and regular food preparation? *
                  </Label>
                  <RadioGroup 
                    value={formData.equipmentCleaning} 
                    onValueChange={(value) => handleInputChange('equipmentCleaning', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Always" id="cleaning-always" />
                      <Label htmlFor="cleaning-always" className="font-inter">Always</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Sometimes" id="cleaning-sometimes" />
                      <Label htmlFor="cleaning-sometimes" className="font-inter">Sometimes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Never" id="cleaning-never" />
                      <Label htmlFor="cleaning-never" className="font-inter">Never</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label className="font-inter font-medium text-gray-700">
                    Do you have a dedicated prep area for allergen-free food? *
                  </Label>
                  <RadioGroup 
                    value={formData.dedicatedPrepArea} 
                    onValueChange={(value) => handleInputChange('dedicatedPrepArea', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="prep-yes" />
                      <Label htmlFor="prep-yes" className="font-inter">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Sometimes" id="prep-sometimes" />
                      <Label htmlFor="prep-sometimes" className="font-inter">Sometimes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="prep-no" />
                      <Label htmlFor="prep-no" className="font-inter">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label className="font-inter font-medium text-gray-700">
                    How often do you disclose potential allergens to guests? *
                  </Label>
                  <RadioGroup 
                    value={formData.guestDisclosure} 
                    onValueChange={(value) => handleInputChange('guestDisclosure', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Always" id="disclosure-always" />
                      <Label htmlFor="disclosure-always" className="font-inter">Always</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Sometimes" id="disclosure-sometimes" />
                      <Label htmlFor="disclosure-sometimes" className="font-inter">Sometimes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Never" id="disclosure-never" />
                      <Label htmlFor="disclosure-never" className="font-inter">Never</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label className="font-inter font-medium text-gray-700">
                    Do you have a designated allergy point of contact? *
                  </Label>
                  <RadioGroup 
                    value={formData.allergyPointOfContact} 
                    onValueChange={(value) => handleInputChange('allergyPointOfContact', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="contact-yes" />
                      <Label htmlFor="contact-yes" className="font-inter">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="contact-no" />
                      <Label htmlFor="contact-no" className="font-inter">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label className="font-inter font-medium text-gray-700">
                    Do you have dedicated prep for allergen-free options? *
                  </Label>
                  <RadioGroup 
                    value={formData.dedicatedPrep} 
                    onValueChange={(value) => handleInputChange('dedicatedPrep', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="dedicated-yes" />
                      <Label htmlFor="dedicated-yes" className="font-inter">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Some" id="dedicated-some" />
                      <Label htmlFor="dedicated-some" className="font-inter">Some</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="dedicated-no" />
                      <Label htmlFor="dedicated-no" className="font-inter">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Allergen-Free Options */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">✅</span>
                <h3 className="font-poppins font-bold text-xl text-gray-900">Allergen-Free Options</h3>
              </div>
              
              <div>
                <Label className="font-inter font-medium text-gray-700 mb-4 block">
                  Which allergen-free options do you offer? (Select all that apply)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    'Peanut-Free',
                    'Tree-Nut-Free',
                    'Egg-Free',
                    'Dairy-Free',
                    'Gluten-Free',
                    'Sesame-Free',
                    'Soy-Free',
                    'Shellfish-Free'
                  ].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={formData.allergenFreeOptions.includes(option)}
                        onCheckedChange={() => handleAllergenToggle(option)}
                      />
                      <Label htmlFor={option} className="font-inter text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">✍️</span>
                <h3 className="font-poppins font-bold text-xl text-gray-900">Additional Information</h3>
              </div>
              
              <div>
                <Label htmlFor="notes" className="font-inter font-medium text-gray-700">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="mt-1"
                  placeholder="Any additional information about your restaurant's allergy-friendly practices..."
                  rows={4}
                />
              </div>
            </div>

            {/* Score Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-poppins font-semibold text-lg text-gray-900">Your Current Score</h4>
                  <p className="font-inter text-sm text-gray-600">This is a preview of your score. Final grade is confirmed after review.</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{score}/25</div>
                  <div className="text-sm text-gray-600">points</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-inter font-medium text-gray-700">Grade:</span>
                  <Badge className={`px-3 py-1 rounded-full border ${getGradeColors(grade)}`}>
                    <span className="mr-1">{getGradeIcon(grade)}</span>
                    {grade}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {score >= 16 && 'Gold: 16+ points'}
                  {score >= 10 && score < 16 && 'Silver: 10-15 points'}
                  {score >= 5 && score < 10 && 'Bronze: 5-9 points'}
                  {score < 5 && 'Needs Improvement: <5 points'}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="font-poppins px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Restaurant Information'
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="font-poppins px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => window.location.href = '/restaurant-directory'}
              >
                View Restaurant Directory
              </Button>
            </div>

            {/* Status Message */}
            {submitStatus !== 'idle' && (
              <div className={`p-4 rounded-lg ${
                submitStatus === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {submitStatus === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span className="font-inter font-medium">{submitMessage}</span>
                </div>
              </div>
            )}

            {/* Footer Note */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="font-inter text-sm text-gray-500">
                This pilot will expand region by region beginning in Q1 2026. Learn more at AllergyVoices.com.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantSubmissionForm;
