import { createClient } from '@supabase/supabase-js';
import { products, brands, reviews } from './src/data/products.js'; // Can't easily import TS, so I'll just copy the data here

const supabase = createClient(
  'https://qehzoazkmgneeunqjsgc.supabase.co',
  'sb_publishable_24rr-ZzDUAV1dGAIKrWPlg_-QbsaYDI' // Needs service role key to bypass RLS, or connection string
);
