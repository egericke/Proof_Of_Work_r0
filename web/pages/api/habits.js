// web/pages/api/habits.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000)
      .toISOString()
      .slice(0, 10);

    const { data, error } = await supabase
      .from('habit_tracking')
      .select('*')
      .gte('habit_date', fourteenDaysAgo)
      .order('habit_date', { ascending: true });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
