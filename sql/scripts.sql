--Following scripts need to be run to add two new columns to the cart_table in baleeed5_live database
ALTER TABLE cart_table ADD COLUMN Edition VARCHAR(128); --Create a new column for Edition in cart_table
ALTER TABLE cart_table ADD COLUMN Package VARCHAR(128); --Create a new column for Package in cart_table
ALTER TABLE cart_table ADD COLUMN ValidityDate DATE;--Create a new column for ValidityDate in cart_table