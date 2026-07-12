const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');


const supabase = createClient('https://kvxcnuckuxoemcfgkhau.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2eGNudWNrdXhvZW1jZmdraGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MTA5NjksImV4cCI6MjA5OTM4Njk2OX0.tFmj4dTF7VaKCbGFtpt6AMMTYVoVDaj8y4emxtgrRhc');

async function uploadImages() {
  const dir = path.join(__dirname, 'public/assets/images/projects');
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    if (!file.endsWith('.webp') && !file.endsWith('.jpg') && !file.endsWith('.png')) continue;
    const filePath = path.join(dir, file);
    const fileBuffer = fs.readFileSync(filePath);
    let contentType = 'image/webp';
    if (file.endsWith('.jpg')) contentType = 'image/jpeg';
    if (file.endsWith('.png')) contentType = 'image/png';

    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(`projects/${file}`, fileBuffer, {
        contentType,
        upsert: true
      });
      
    if (error) {
      console.error(`Failed to upload ${file}:`, error.message);
    } else {
      console.log(`Uploaded ${file}`);
    }
  }
}

uploadImages();
