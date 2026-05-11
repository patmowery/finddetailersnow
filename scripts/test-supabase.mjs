import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ouigivoyigaouhsozahj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aWdpdm95aWdhb3Voc296YWhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUwOTY5NSwiZXhwIjoyMDk0MDg1Njk1fQ.tKO0Jjmb28qZfWcLDsFbaPLCjkDJ7qdTcohctbRxTzw'
);

const { data, error } = await supabase.from('listings').select('id').limit(1);
if (error && error.code === '42P01') {
  console.log("Connection works! Table does not exist yet.");
} else if (error) {
  console.log("Error:", error.message, error.code);
} else {
  console.log("Table exists! Rows:", data?.length);
}
