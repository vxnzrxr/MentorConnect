-- Insert sample notifications for testing
INSERT INTO notifications (user_id, session_id, type, title, message, data, read_status, dismissed) VALUES
  (3, 18, 'session_approved', 'Session Approved', 'Your session "test" has been approved by Karina', '{"schedule": "2025-08-08 12:21", "mentorName": "Karina"}', 0, 0),
  (3, 17, 'session_rescheduled', 'Session Rescheduled', 'Your session "Test Session Request 2" has been approved with a new schedule', '{"originalSchedule": "2025-08-06 14:30:00", "newSchedule": "2025-08-07 10:00:00", "mentorName": "Karina"}', 0, 0),
  (3, 19, 'session_rejected', 'Session Request Rejected', 'Your session request "Fresh Session Request" has been declined', '{"rejectReason": "Jadwal tidak sesuai", "originalSchedule": "2025-08-10 15:00:00", "mentorName": "Karina"}', 0, 0);
