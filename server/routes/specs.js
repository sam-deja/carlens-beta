const express = require('express');
const { requireAuth, getAuth } = require('@clerk/express');
const supabase = require('../lib/supabase');

const router = express.Router();

router.get('/:id', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const { data, error } = await supabase
    .from('lookups')
    .select('specs')
    .eq('id', req.params.id)
    .eq('user_id', userId)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Not found' });
  res.json({ specs: data.specs });
});

module.exports = router;
