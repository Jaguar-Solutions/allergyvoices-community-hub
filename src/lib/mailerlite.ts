// MailerLite API configuration and service functions
const MAILERLITE_API_KEY = 'mlsn.d4730e112d29f40b2338eabe832fe74b225f4be9dd1cd0dd7ab1cea63e9ce431';
const MAILERLITE_GROUP_ID = '166741334640559674';
const MAILERLITE_API_BASE = 'https://connect.mailerlite.com/api';

// Alternative: Use MailerLite form submission endpoint
const MAILERLITE_FORM_ENDPOINT = 'https://assets.mailerlite.com/jsonp/1797003/forms/166816265764078710/subscribe';

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
 * Add a restaurant submission to MailerLite using the restaurant form endpoint
 */
export async function addRestaurantToMailerLite(
  email: string,
  restaurantName: string
): Promise<MailerLiteResponse> {
  try {
    // Use the restaurant form structure (simplified - just email)
    const formData = new FormData();
    
    // Basic subscriber info (matching the restaurant form structure)
    formData.append('fields[email]', email);
    
    // Required MailerLite form fields
    formData.append('ml-submit', '1');
    formData.append('anticsrf', 'true');

    console.log('📧 Adding restaurant to MailerLite:', {
      email: email,
      restaurant: restaurantName,
      endpoint: MAILERLITE_FORM_ENDPOINT
    });

    // Use the restaurant form endpoint
    const response = await fetch(MAILERLITE_FORM_ENDPOINT, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    });

    console.log('📧 MailerLite response status:', response.status);
    console.log('📧 MailerLite response type:', response.type);
    console.log('📧 MailerLite response ok:', response.ok);
    console.log('✅ Successfully submitted restaurant to MailerLite');

    return {
      success: true,
      message: 'Restaurant successfully added to MailerLite',
      data: { method: 'form_submission', email: email }
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
  email: string,
  restaurantName: string
): Promise<MailerLiteResponse> {
  try {
    // Import EmailJS dynamically to avoid issues
    const emailjs = await import('@emailjs/browser');
    
    // Initialize EmailJS with your public key
    emailjs.default.init('cBhC6zT4OHtubKlho');
    
    // Prepare email template parameters
    const templateParams = {
      to_email: email,
      to_name: restaurantName,
      from_name: 'AllergyVoices Team',
      from_email: 'info@allergyvoices.com',
      reply_to: 'info@allergyvoices.com',
      subject: 'Thank you for joining the AllergyVoices Pilot',
      message: `Hello ${restaurantName},

Thank you for submitting your information to the AllergyVoices grading program. Your responses are now under review.

• Restaurants that meet our highest standards will be awarded Gold Certification and may display the official AllergyVoices Approved™ badge on their menus, websites, and materials.
• Restaurants earning Silver or Bronze recognition will still be featured in our public directory, helping families identify allergy-friendly dining options.
• If improvements are needed, we'll share guidance so you can work toward higher recognition in the future.

We're excited to highlight your commitment to safer dining and will notify you once your review is complete.

— The AllergyVoices Team

AllergyVoices | info@allergyvoices.com | Raleigh, NC
This pilot expands region by region beginning Q1 2026.`,
      // Common EmailJS template variables
      user_email: email,
      user_name: restaurantName,
      restaurant_name: restaurantName,
      email: email,
      name: restaurantName
    };
    
    console.log('📧 Sending thank-you email via EmailJS:', {
      to: email,
      restaurant: restaurantName
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
    console.log('📧 To:', email);
    console.log('📧 Subject: Thank you for joining the AllergyVoices Pilot');
    console.log('📧 Restaurant:', restaurantName);

    return {
      success: false,
      message: 'Failed to send thank-you email',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
