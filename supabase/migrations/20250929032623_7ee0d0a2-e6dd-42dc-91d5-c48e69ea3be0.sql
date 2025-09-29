-- Insert standardized time slots with INSERT ... WHERE NOT EXISTS to avoid conflicts
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '09:00', '9:00 AM', 1, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '09:00');
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '09:30', '9:30 AM', 2, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '09:30');
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '10:00', '10:00 AM', 3, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '10:00');
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '10:30', '10:30 AM', 4, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '10:30');
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '11:00', '11:00 AM', 5, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '11:00');
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '11:30', '11:30 AM', 6, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '11:30');
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '12:00', '12:00 PM', 7, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '12:00');
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '12:30', '12:30 PM', 8, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '12:30');
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '13:00', '1:00 PM', 9, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '13:00');
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '13:30', '1:30 PM', 10, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '13:30');
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '14:00', '2:00 PM', 11, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '14:00');
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '14:30', '2:30 PM', 12, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '14:30');
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '15:00', '3:00 PM', 13, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '15:00');
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '15:30', '3:30 PM', 14, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '15:30');
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '16:00', '4:00 PM', 15, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '16:00');
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '16:30', '4:30 PM', 16, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '16:30');
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '17:00', '5:00 PM', 17, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '17:00');
INSERT INTO standardized_time_slots (slot_time, display_name, sort_order, is_active)
SELECT '17:30', '5:30 PM', 18, true WHERE NOT EXISTS (SELECT 1 FROM standardized_time_slots WHERE slot_time = '17:30');