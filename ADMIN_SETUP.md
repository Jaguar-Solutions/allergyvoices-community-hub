# Admin Setup Guide

## Creating Your First Admin Account

1. Navigate to `/auth` in your application
2. Sign up with your email and password
3. After signing up, you need to grant yourself admin privileges

## Granting Admin Access

You need to add a record to the `user_roles` table. You can do this through the Lovable Cloud backend:

1. Click "View Backend" in the Lovable interface
2. Go to the Table Editor
3. Find the `user_roles` table
4. Click "Insert" and add a new row:
   - `user_id`: Your user ID (found in the `profiles` table)
   - `role`: Select "admin" from the dropdown

## Security Features

- **Contact Information**: Email and phone numbers are only visible to admins
- **Questionnaires**: Only admins can view restaurant questionnaire responses
- **Ratings**: Public can view, authenticated users can add, only admins can modify/delete
- **Restaurant Management**: Only admins can update, delete, or publish restaurants

## Testing Authentication

The auth system is configured with auto-confirm email, so you can sign up and immediately sign in without email verification (perfect for development/testing).
