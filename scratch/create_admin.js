import { createClient } from '@supabase/supabase-js';

const url = 'https://kvxcnuckuxoemcfgkhau.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2eGNudWNrdXhvZW1jZmdraGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MTA5NjksImV4cCI6MjA5OTM4Njk2OX0.tFmj4dTF7VaKCbGFtpt6AMMTYVoVDaj8y4emxtgrRhc';

const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase.auth.signUp({
    email: 'cmozunap@gmail.com',
    password: 'c@2094Op##$'
  });
  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('User created:', data.user?.email);
  }
}

main();
