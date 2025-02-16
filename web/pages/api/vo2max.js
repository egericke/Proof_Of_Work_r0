// web/pages/api/vo2max.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('vo2max_tests')
      .select('*')
      .order('test_date', { ascending: false })
      .limit(1);

    if (error) throw error;
    if (data.length === 0) {
      return res.status(200).json({ vo2max: null });
    }
    res.status(200).json({ vo2max: data[0].vo2max_value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
