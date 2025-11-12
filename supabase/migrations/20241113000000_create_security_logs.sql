-- Create security_logs table
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent TEXT,
  url TEXT,
  session_id TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX idx_security_logs_timestamp ON security_logs(timestamp);
CREATE INDEX idx_security_logs_violation_type ON security_logs(violation_type);

-- Enable Row Level Security
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own security logs"
  ON security_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert security logs"
  ON security_logs
  FOR INSERT
  WITH CHECK (true);

-- Create function to clean old logs (optional - keeps last 90 days)
CREATE OR REPLACE FUNCTION clean_old_security_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM security_logs
  WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on table
COMMENT ON TABLE security_logs IS 'Logs security violations like screenshot attempts, tab switching, and automation detection';
