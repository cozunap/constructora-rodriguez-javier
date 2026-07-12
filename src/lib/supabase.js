import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kvxcnuckuxoemcfgkhau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2eGNudWNrdXhvZW1jZmdraGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MTA5NjksImV4cCI6MjA5OTM4Njk2OX0.tFmj4dTF7VaKCbGFtpt6AMMTYVoVDaj8y4emxtgrRhc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
