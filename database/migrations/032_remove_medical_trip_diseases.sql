-- Migration 032: Remove medical_trip_diseases table
-- Per user request: Entire "Diseases Screened" concept removed from medical trips.

DROP TABLE IF EXISTS `medical_trip_diseases`;

