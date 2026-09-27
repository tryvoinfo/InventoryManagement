import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dmbraclurnycljdqxgvo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtYnJhY2x1cm55Y2xqZHF4Z3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2Mjk0ODUsImV4cCI6MjEwNDIwNTQ4NX0.c0oYHQrvhWT3rdH8lHgrNuUPa466YibwLHfYwvZZPF4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)