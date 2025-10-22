// API calls now handled securely through Edge Functions
import { supabase } from '@/integrations/supabase/client';

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
  message?: string;
  data?: any;
  error?: string;
}

/**
 * Add a restaurant's email to MailerLite group via secure Edge Function
 * 
 * @param email - Restaurant owner's email address
 * @param restaurantName - Name of the restaurant
 * @returns Promise<MailerLiteResponse> - Response with success status and data/error
 */
export async function addRestaurantToMailerLite(
  email: string, 
  restaurantName: string
): Promise<MailerLiteResponse> {
  try {
    console.log('📧 Adding restaurant to MailerLite:', restaurantName);
    
    const { data, error } = await supabase.functions.invoke('mailerlite-subscribe', {
      body: { email, restaurantName }
    });

    if (error) {
      console.error('❌ MailerLite Edge Function error:', error);
      return {
        success: false,
        error: error.message || 'Failed to add to MailerLite'
      };
    }

    console.log('✅ Successfully added to MailerLite');
    return {
      success: true,
      message: 'Restaurant successfully added to MailerLite',
      data
    };
  } catch (error) {
    console.error('❌ Error adding to MailerLite:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Send a thank you email to the restaurant after submission via secure Edge Function
 * 
 * @param email - Restaurant owner's email address
 * @param restaurantName - Name of the restaurant
 * @returns Promise<MailerLiteResponse> - Response with success status
 */
export async function sendThankYouEmail(
  email: string, 
  restaurantName: string
): Promise<MailerLiteResponse> {
  try {
    console.log('📧 Sending thank you email to:', restaurantName);
    
    const { data, error } = await supabase.functions.invoke('send-thank-you-email', {
      body: { email, restaurantName }
    });

    if (error) {
      console.error('⚠️ Email Edge Function error (non-critical):', error);
      return {
        success: true,
        data: null,
        error: 'Email service temporarily unavailable, but submission was recorded'
      };
    }

    console.log('✅ Email sent successfully');
    return {
      success: true,
      message: 'Thank-you email sent successfully',
      data
    };
  } catch (error) {
    console.error('❌ Error in sendThankYouEmail:', error);
    return {
      success: true,
      data: null,
      error: error instanceof Error ? error.message : 'Email service error'
    };
  }
}
