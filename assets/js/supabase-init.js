/* Supabase client init */
window.supabase = supabase.createClient(
  "https://xvhkwyhncuivsfwfmvbg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aGt3eWhuY3VpdnNmd2ZtdmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MzQxNjgsImV4cCI6MjA3NDQxMDE2OH0.oeCz6LHCCzLvHqO7q9cNiiiotrUm8kzmzdJjfzBIA-8",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
