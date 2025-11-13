-- Migration: Cleanup and maintenance functions
-- Description: Add database functions for cleanup operations

-- Function to find orphaned shuffled_questions
CREATE OR REPLACE FUNCTION find_orphaned_shuffled_questions()
RETURNS TABLE (id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT sq.id
  FROM shuffled_questions sq
  LEFT JOIN quiz_attempts qa ON sq.attempt_id = qa.id
  WHERE qa.id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to delete orphaned shuffled_questions
CREATE OR REPLACE FUNCTION delete_orphaned_shuffled_questions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM shuffled_questions
    WHERE attempt_id IN (
      SELECT sq.attempt_id
      FROM shuffled_questions sq
      LEFT JOIN quiz_attempts qa ON sq.attempt_id = qa.id
      WHERE qa.id IS NULL
    )
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to find orphaned student_answers
CREATE OR REPLACE FUNCTION find_orphaned_student_answers()
RETURNS TABLE (id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT sa.id
  FROM student_answers sa
  LEFT JOIN quiz_attempts qa ON sa.attempt_id = qa.id
  WHERE qa.id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to delete orphaned student_answers
CREATE OR REPLACE FUNCTION delete_orphaned_student_answers()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM student_answers
    WHERE attempt_id IN (
      SELECT sa.attempt_id
      FROM student_answers sa
      LEFT JOIN quiz_attempts qa ON sa.attempt_id = qa.id
      WHERE qa.id IS NULL
    )
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create security_violations_archive table if it doesn't exist
CREATE TABLE IF NOT EXISTS security_violations_archive (
  id UUID PRIMARY KEY,
  attempt_id UUID,
  violation_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  metadata JSONB,
  severity VARCHAR(20) DEFAULT 'medium',
  archived_at TIMESTAMP DEFAULT NOW()
);

-- Create index on archived violations timestamp
CREATE INDEX IF NOT EXISTS idx_violations_archive_timestamp 
ON security_violations_archive(timestamp DESC);

-- Function to archive old violations
CREATE OR REPLACE FUNCTION archive_old_violations(cutoff_date TIMESTAMP)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  WITH archived AS (
    INSERT INTO security_violations_archive 
    (id, attempt_id, violation_type, timestamp, metadata, severity)
    SELECT id, attempt_id, violation_type, timestamp, metadata, severity
    FROM security_violations
    WHERE timestamp < cutoff_date
    RETURNING *
  )
  SELECT COUNT(*) INTO archived_count FROM archived;
  
  -- Delete the archived violations from the main table
  DELETE FROM security_violations
  WHERE timestamp < cutoff_date;
  
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get cleanup statistics
CREATE OR REPLACE FUNCTION get_cleanup_statistics(grace_period_hours INTEGER DEFAULT 24)
RETURNS TABLE (
  abandoned_attempts BIGINT,
  orphaned_shuffled_questions BIGINT,
  orphaned_student_answers BIGINT,
  old_violations BIGINT
) AS $$
DECLARE
  cutoff_time TIMESTAMP;
BEGIN
  cutoff_time := NOW() - (grace_period_hours || ' hours')::INTERVAL;
  
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM quiz_attempts 
     WHERE "completedAt" IS NULL AND "startedAt" < cutoff_time) AS abandoned_attempts,
    (SELECT COUNT(*) FROM shuffled_questions sq
     LEFT JOIN quiz_attempts qa ON sq.attempt_id = qa.id
     WHERE qa.id IS NULL) AS orphaned_shuffled_questions,
    (SELECT COUNT(*) FROM student_answers sa
     LEFT JOIN quiz_attempts qa ON sa.attempt_id = qa.id
     WHERE qa.id IS NULL) AS orphaned_student_answers,
    (SELECT COUNT(*) FROM security_violations
     WHERE timestamp < NOW() - INTERVAL '90 days') AS old_violations;
END;
$$ LANGUAGE plpgsql;

-- Create cleanup_history table to track cleanup operations
CREATE TABLE IF NOT EXISTS cleanup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  performed_at TIMESTAMP DEFAULT NOW(),
  performed_by UUID REFERENCES auth.users(id),
  operation_type VARCHAR(50) NOT NULL,
  records_affected INTEGER NOT NULL,
  config JSONB,
  result JSONB
);

-- Create index on cleanup history
CREATE INDEX IF NOT EXISTS idx_cleanup_history_performed_at 
ON cleanup_history(performed_at DESC);

-- Function to log cleanup operation
CREATE OR REPLACE FUNCTION log_cleanup_operation(
  p_performed_by UUID,
  p_operation_type VARCHAR,
  p_records_affected INTEGER,
  p_config JSONB DEFAULT NULL,
  p_result JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO cleanup_history 
  (performed_by, operation_type, records_affected, config, result)
  VALUES 
  (p_performed_by, p_operation_type, p_records_affected, p_config, p_result)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Add comment to tables
COMMENT ON TABLE security_violations_archive IS 'Archive table for old security violations';
COMMENT ON TABLE cleanup_history IS 'Tracks all cleanup operations performed on the database';
COMMENT ON FUNCTION find_orphaned_shuffled_questions IS 'Finds shuffled_questions records without valid quiz_attempts';
COMMENT ON FUNCTION delete_orphaned_shuffled_questions IS 'Deletes orphaned shuffled_questions records';
COMMENT ON FUNCTION find_orphaned_student_answers IS 'Finds student_answers records without valid quiz_attempts';
COMMENT ON FUNCTION delete_orphaned_student_answers IS 'Deletes orphaned student_answers records';
COMMENT ON FUNCTION archive_old_violations IS 'Archives security violations older than cutoff date';
COMMENT ON FUNCTION get_cleanup_statistics IS 'Returns statistics about records that need cleanup';
COMMENT ON FUNCTION log_cleanup_operation IS 'Logs a cleanup operation to cleanup_history table';
