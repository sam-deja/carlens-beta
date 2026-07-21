const express = require('express');
const { requireAuth, getAuth } = require('@clerk/express');
const supabase = require('../lib/supabase');

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const { data, error } = await supabase
      .from('lookups')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('History fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch history' });
    }

    return res.json(data);
  } catch (err) {
    console.error('History error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const { error } = await supabase
      .from('lookups')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', userId);

    if (error) {
      console.error('Delete error:', error);
      return res.status(500).json({ error: 'Failed to delete lookup' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
