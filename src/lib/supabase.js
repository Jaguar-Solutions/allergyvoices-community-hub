import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions

/**
 * Add a new restaurant to the database
 * @param {Object} restaurantData - Restaurant information
 * @param {string} restaurantData.name - Restaurant name
 * @param {string} restaurantData.email - Restaurant email
 * @param {string} restaurantData.phone - Restaurant phone
 * @param {string} restaurantData.city - Restaurant city
 * @param {string} restaurantData.state - Restaurant state
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function addRestaurant({ name, email, phone, city, state }) {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .insert([
        {
          name,
          email,
          phone,
          city,
          state,
          status: 'pending'
        }
      ])
      .select()

    if (error) {
      console.error('Error adding restaurant:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Restaurant added successfully:', data)
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error adding restaurant:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Add questionnaire responses for a restaurant
 * @param {Object} questionnaireData - Questionnaire data
 * @param {string} questionnaireData.restaurantId - Restaurant UUID
 * @param {Object} questionnaireData.responses - JSON object with all responses
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function addQuestionnaire({ restaurantId, responses }) {
  try {
    const { data, error } = await supabase
      .from('restaurant_questionnaires')
      .insert([
        {
          restaurant_id: restaurantId,
          responses: responses
        }
      ])
      .select()

    if (error) {
      console.error('Error adding questionnaire:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Questionnaire added successfully:', data)
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error adding questionnaire:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Add a rating for a restaurant
 * @param {Object} ratingData - Rating data
 * @param {string} ratingData.restaurantId - Restaurant UUID
 * @param {number} ratingData.rating - Rating score (0-100)
 * @param {string} ratingData.comments - Rating comments
 * @param {string} ratingData.reviewedBy - Reviewer name/ID
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function addRestaurantRating({ restaurantId, rating, comments, reviewedBy }) {
  try {
    const { data, error } = await supabase
      .from('restaurant_ratings')
      .insert([
        {
          restaurant_id: restaurantId,
          rating,
          comments,
          reviewed_by: reviewedBy
        }
      ])
      .select()

    if (error) {
      console.error('Error adding rating:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Rating added successfully:', data)
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error adding rating:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Publish a restaurant (make it public)
 * @param {Object} publicationData - Publication data
 * @param {string} publicationData.restaurantId - Restaurant UUID
 * @param {Object} publicationData.publishedData - Data to publish publicly
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function publishRestaurant({ restaurantId, publishedData }) {
  try {
    // Update restaurant status to published
    const { error: updateError } = await supabase
      .from('restaurants')
      .update({ status: 'published' })
      .eq('id', restaurantId)

    if (updateError) {
      console.error('Error updating restaurant status:', updateError)
      return { success: false, error: updateError.message }
    }

    // Add to publications table
    const { data, error } = await supabase
      .from('restaurant_publications')
      .insert([
        {
          restaurant_id: restaurantId,
          published_data: publishedData
        }
      ])
      .select()

    if (error) {
      console.error('Error adding publication:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Restaurant published successfully:', data)
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error publishing restaurant:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all restaurants with their questionnaire data
 * @param {string} status - Filter by status ('pending', 'approved', 'published', etc.)
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getRestaurants(status = null) {
  try {
    let query = supabase
      .from('restaurants')
      .select(`
        *,
        restaurant_questionnaires (
          id,
          responses,
          submitted_at
        ),
        restaurant_ratings (
          id,
          rating,
          comments,
          created_at,
          reviewed_by
        )
      `)
      .order('submitted_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching restaurants:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Restaurants fetched successfully:', data?.length || 0, 'restaurants')
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return { success: false, error: error.message }
  }
}


/**
 * Update restaurant status
 * @param {string} restaurantId - Restaurant UUID
 * @param {string} status - New status ('pending', 'approved', 'rejected', 'published')
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateRestaurantStatus(restaurantId, status) {
  try {
    if (import.meta.env.DEV) {
      console.log(`🔄 Supabase: Updating restaurant ${restaurantId} to status: ${status}`);
    }
    const { data, error } = await supabase
      .from('restaurants')
      .update({ status })
      .eq('id', restaurantId)
      .select()

    if (error) {
      console.error('❌ Supabase error updating restaurant status:', error)
      return { success: false, error: error.message }
    }

    if (import.meta.env.DEV) {
      console.log('✅ Supabase: Restaurant status updated successfully:', data)
      console.log('📊 Updated restaurant status in DB:', data[0]?.status);
    }
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('❌ Supabase error updating restaurant status:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete a restaurant and all related data
 * @param {string} restaurantId - Restaurant UUID
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function deleteRestaurant(restaurantId) {
  try {
    // Delete restaurant (cascade will handle related records)
    const { data, error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', restaurantId)
      .select()

    if (error) {
      console.error('Error deleting restaurant:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Restaurant deleted successfully:', data)
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error deleting restaurant:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update restaurant information
 * @param {string} restaurantId - Restaurant UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateRestaurant(restaurantId, updates) {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', restaurantId)
      .select()

    if (error) {
      console.error('Error updating restaurant:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Restaurant updated successfully:', data)
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error updating restaurant:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update questionnaire responses
 * @param {string} restaurantId - Restaurant UUID
 * @param {Object} responses - Updated responses
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateQuestionnaire(restaurantId, responses) {
  try {
    const { data, error } = await supabase
      .from('restaurant_questionnaires')
      .update({ responses })
      .eq('restaurant_id', restaurantId)
      .select()

    if (error) {
      console.error('Error updating questionnaire:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Questionnaire updated successfully:', data)
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error updating questionnaire:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get only published restaurants for public directory
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function getPublishedRestaurants() {
  try {
    if (import.meta.env.DEV) {
      console.log('🔍 Supabase: Fetching published restaurants...');
    }
    
    const { data, error } = await supabase
      .from('restaurants')
      .select(`
        *,
        restaurant_questionnaires ( responses ),
        restaurant_ratings ( rating, comments, reviewed_by, created_at )
      `)
      .eq('status', 'Published')
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error fetching published restaurants:', error)
      return { success: false, error: error.message }
    }

    if (import.meta.env.DEV) {
      console.log('✅ Supabase: Published restaurants fetched successfully:', data.length)
      console.log('📊 Published restaurants data:', data);
    }
    return { success: true, data }
  } catch (error) {
    console.error('❌ Supabase error fetching published restaurants:', error)
    return { success: false, error: error.message }
  }
}
