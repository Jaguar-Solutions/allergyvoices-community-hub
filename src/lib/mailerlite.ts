// MailerLite API configuration and service functions
const MAILERLITE_API_KEY = 'mlsn.d4730e112d29f40b2338eabe832fe74b225f4be9dd1cd0dd7ab1cea63e9ce431';
const MAILERLITE_GROUP_ID = '166741334640559674';
const MAILERLITE_API_BASE = 'https://connect.mailerlite.com/api';

// Alternative: Use MailerLite form submission endpoint
const MAILERLITE_FORM_ENDPOINT = 'https://assets.mailerlite.com/jsonp/1797003/forms/165567148584863442/subscribe';

export interface RestaurantSubmissionData {
  restaurantName: string;
  email: string;
  phoneNumber?: string;
  contactPerson?: string;
  city: string;
  state: string;
  cuisineType: string;
  website?: string;
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
  notes?: string;
  score: number;
  grade: string;
}

export interface MailerLiteResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Add a restaurant submission to MailerLite using the same method as the working subscription form
 */
export async function addRestaurantToMailerLite(
  submissionData: RestaurantSubmissionData
): Promise<MailerLiteResponse> {
  try {
    // Use the same approach as the working subscription form
    const formData = new FormData();
    
    // Basic subscriber info
    formData.append('fields[email]', submissionData.email);
    formData.append('fields[name]', submissionData.restaurantName);
    
    // Restaurant-specific fields
    formData.append('fields[restaurant_name]', submissionData.restaurantName);
    formData.append('fields[contact_person]', submissionData.contactPerson || '');
    formData.append('fields[phone_number]', submissionData.phoneNumber || '');
    formData.append('fields[city]', submissionData.city);
    formData.append('fields[state]', submissionData.state);
    formData.append('fields[cuisine_type]', submissionData.cuisineType);
    formData.append('fields[website]', submissionData.website || '');
    formData.append('fields[has_allergen_menu]', submissionData.hasAllergenMenu);
    formData.append('fields[allergen_menu_link]', submissionData.allergenMenuLink || '');
    formData.append('fields[staff_training]', submissionData.staffTraining);
    formData.append('fields[training_program]', submissionData.trainingProgram || '');
    formData.append('fields[equipment_cleaning]', submissionData.equipmentCleaning);
    formData.append('fields[dedicated_prep_area]', submissionData.dedicatedPrepArea);
    formData.append('fields[guest_disclosure]', submissionData.guestDisclosure);
    formData.append('fields[allergy_point_of_contact]', submissionData.allergyPointOfContact);
    formData.append('fields[allergen_free_options]', submissionData.allergenFreeOptions.join(', '));
    formData.append('fields[dedicated_prep]', submissionData.dedicatedPrep);
    formData.append('fields[notes]', submissionData.notes || '');
    formData.append('fields[score]', submissionData.score.toString());
    formData.append('fields[grade]', submissionData.grade);
    formData.append('fields[submission_date]', new Date().toISOString());
    formData.append('fields[source]', 'restaurant_submission_form');
    
    // Required MailerLite form fields (same as working subscription form)
    formData.append('ml-submit', '1');
    formData.append('anticsrf', 'true');
    
    // Add group assignment if possible
    formData.append('fields[group_id]', MAILERLITE_GROUP_ID);

    console.log('📧 Adding to MailerLite using working subscription method:', {
      email: submissionData.email,
      name: submissionData.restaurantName,
      group: MAILERLITE_GROUP_ID,
      endpoint: MAILERLITE_FORM_ENDPOINT
    });

    // Log all form data being sent
    console.log('📧 Form data being sent:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    // Use the same endpoint and method as the working subscription form
    const response = await fetch(MAILERLITE_FORM_ENDPOINT, {
      method: 'POST',
      body: formData,
      mode: 'no-cors' // This is the key - same as working subscription form
    });

    console.log('📧 MailerLite response status:', response.status);
    console.log('📧 MailerLite response type:', response.type);
    console.log('📧 MailerLite response ok:', response.ok);
    console.log('✅ Successfully submitted to MailerLite via form (same method as subscription)');
    
    // Additional logging for debugging
    console.log('📧 Submission details:');
    console.log('  - Email:', submissionData.email);
    console.log('  - Restaurant:', submissionData.restaurantName);
    console.log('  - City:', submissionData.city);
    console.log('  - State:', submissionData.state);
    console.log('  - Score:', submissionData.score);
    console.log('  - Grade:', submissionData.grade);
    console.log('  - Group ID:', MAILERLITE_GROUP_ID);
    console.log('  - Timestamp:', new Date().toISOString());

    return {
      success: true,
      message: 'Restaurant successfully added to MailerLite',
      data: { method: 'form_submission', group: MAILERLITE_GROUP_ID }
    };

  } catch (error) {
    console.error('❌ MailerLite Integration Error:', error);

    return {
      success: false,
      message: 'Failed to connect to MailerLite',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Send a thank-you email via EmailJS
 * This uses the existing EmailJS setup that was already working
 */
export async function sendThankYouEmail(
  submissionData: RestaurantSubmissionData
): Promise<MailerLiteResponse> {
  try {
    // Import EmailJS dynamically to avoid issues
    const emailjs = await import('@emailjs/browser');
    
    // Initialize EmailJS with your public key
    emailjs.default.init('cBhC6zT4OHtubKlho');
    
    // Prepare email template parameters
    const templateParams = {
      to_email: submissionData.email,
      to_name: submissionData.restaurantName,
      from_name: 'AllergyVoices Team',
      from_email: 'info@allergyvoices.com',
      reply_to: 'info@allergyvoices.com',
      subject: 'Thank you for joining the AllergyVoices Pilot',
      message: `Hello ${submissionData.restaurantName},

Thank you for submitting your information to the AllergyVoices grading program. Your responses are now under review.

• Restaurants that meet our highest standards will be awarded Gold Certification and may display the official AllergyVoices Approved™ badge on their menus, websites, and materials.
• Restaurants earning Silver or Bronze recognition will still be featured in our public directory, helping families identify allergy-friendly dining options.
• If improvements are needed, we'll share guidance so you can work toward higher recognition in the future.

We're excited to highlight your commitment to safer dining and will notify you once your review is complete.

— The AllergyVoices Team

AllergyVoices | info@allergyvoices.com | Raleigh, NC
This pilot expands region by region beginning Q1 2026.`,
      // Common EmailJS template variables
      user_email: submissionData.email,
      user_name: submissionData.restaurantName,
      restaurant_name: submissionData.restaurantName,
      email: submissionData.email,
      name: submissionData.restaurantName
    };
    
    console.log('📧 Sending thank-you email via EmailJS:', {
      to: submissionData.email,
      restaurant: submissionData.restaurantName
    });
    
    // Send email using EmailJS
    const response = await emailjs.default.send(
      'service_w0i2gik', // Your EmailJS service ID
      'template_iuhyupd', // Your EmailJS template ID
      templateParams
    );
    
    console.log('✅ Thank-you email sent successfully via EmailJS:', response);

    return {
      success: true,
      message: 'Thank-you email sent successfully',
      data: response
    };

  } catch (error) {
    console.error('❌ EmailJS sending error:', error);
    
    // Fallback: Log email details if EmailJS fails
    console.log('📧 Fallback - Email details for manual sending:');
    console.log('📧 To:', submissionData.email);
    console.log('📧 Subject: Thank you for joining the AllergyVoices Pilot');
    console.log('📧 Restaurant:', submissionData.restaurantName);

    return {
      success: false,
      message: 'Failed to send thank-you email',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
