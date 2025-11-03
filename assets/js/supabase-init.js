const SUPABASE_URL = "https://xvhkwyhncuivsfwfmvbg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aGt3eWhuY3VpdnNmd2ZtdmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MzQxNjgsImV4cCI6MjA3NDQxMDE2OH0.oeCz6LHCCzLvHqO7q9cNiiiotrUm8kzmzdJjfzBIA-8";
window.supabase = window.supabase || {};
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
