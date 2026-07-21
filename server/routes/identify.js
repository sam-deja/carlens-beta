const express = require('express');
const multer = require('multer');
const { requireAuth, getAuth } = require('@clerk/express');
const { identifyCar, getCarSpecs } = require('../lib/claude');
const supabase = require('../lib/supabase');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function getExtension(mimeType) {
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  return map[mimeType] || 'jpg';
}

router.post('/', requireAuth(), upload.single('image'), async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const ext = getExtension(req.file.mimetype);
    const storagePath = `${userId}/${Date.now()}.${ext}`;

    // Run Claude and storage upload in parallel
    const [identificationResult, uploadResult] = await Promise.allSettled([
      identifyCar(req.file.buffer, req.file.mimetype),
      supabase.storage
        .from('car-images')
        .upload(storagePath, req.file.buffer, { contentType: req.file.mimetype }),
    ]);

    if (identificationResult.status === 'rejected') {
      return res.status(422).json({ error: identificationResult.reason.message });
    }

    const { make, model, year, confidence, notes } = identificationResult.value;

    const uploadData = uploadResult.status === 'fulfilled' ? uploadResult.value.data : null;
    if (uploadResult.status === 'rejected') {
      console.error('Storage upload error:', uploadResult.reason);
    }

    const imageUrl = uploadData
      ? supabase.storage.from('car-images').getPublicUrl(uploadData.path).data.publicUrl
      : null;

    const { data: lookup, error: dbError } = await supabase
      .from('lookups')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        car_make: make,
        car_model: model,
        car_year: year,
        car_confidence: confidence,
        car_notes: notes,
        specs: null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB insert error:', dbError);
    }

    // Fetch specs in background — client polls /api/specs/:id
    if (lookup?.id) {
      getCarSpecs(make, model, year)
        .then((specs) => {
          console.log('Specs fetched:', specs ? 'ok' : 'null');
          if (specs) {
            return supabase.from('lookups').update({ specs }).eq('id', lookup.id);
          }
        })
        .then((res) => { if (res?.error) console.error('Specs DB update error:', res.error); })
        .catch((err) => console.error('Specs background error:', err.message));
    }

    return res.json({
      id: lookup?.id,
      make,
      model,
      year,
      confidence,
      notes,
      specs: null,
      imageUrl,
    });
  } catch (err) {
    console.error('Identify error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
