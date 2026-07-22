const express = require('express');
const { requireAuth, getAuth } = require('@clerk/express');
const { getSpecs, getMods, getFunFacts } = require('../lib/claude');
const supabase = require('../lib/supabase');

const router = express.Router();

async function fetchImageBuffer(imageUrl) {
  try {
    const res = await fetch(imageUrl);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

router.get('/:id', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);

  const { data: lookup } = await supabase
    .from('lookups')
    .select('car_make, car_model, car_year, image_url')
    .eq('id', req.params.id)
    .eq('user_id', userId)
    .single();

  if (!lookup) return res.status(404).json({ error: 'Not found' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (type, data) => res.write(`data: ${JSON.stringify({ type, data })}\n\n`);

  const { car_make: make, car_model: model, car_year: year, image_url: imageUrl } = lookup;

  // Fetch image buffer once, reuse for specs call
  const imageBuffer = imageUrl ? await fetchImageBuffer(imageUrl) : null;

  const combined = {};

  await Promise.allSettled([
    getSpecs(make, model, year, imageBuffer)
      .then((data) => { send('specs', data); combined.specs = data; })
      .catch((err) => { console.error('specs error:', err.message); send('specs', null); }),
    getMods(make, model, year)
      .then((data) => { send('mods', data); combined.mods = data; })
      .catch((err) => { console.error('mods error:', err.message); send('mods', null); }),
    getFunFacts(make, model, year)
      .then((data) => { send('fun_facts', data); combined.fun_facts = data; })
      .catch((err) => { console.error('fun_facts error:', err.message); send('fun_facts', null); }),
  ]);

  supabase.from('lookups').update({ specs: combined }).eq('id', req.params.id).then(() => {});

  send('done', null);
  res.end();
});

module.exports = router;
