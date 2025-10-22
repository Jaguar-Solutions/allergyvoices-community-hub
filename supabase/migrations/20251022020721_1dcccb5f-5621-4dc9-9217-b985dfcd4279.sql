-- Add database constraints for input validation
ALTER TABLE restaurants 
  ADD CONSTRAINT name_length CHECK (length(name) <= 200),
  ADD CONSTRAINT email_length CHECK (length(email) <= 255),
  ADD CONSTRAINT phone_length CHECK (phone IS NULL OR length(phone) <= 20),
  ADD CONSTRAINT city_length CHECK (length(city) <= 100);