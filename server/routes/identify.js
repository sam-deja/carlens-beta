const express = require('express');
const multer = require('multer');
const { requireAuth, getAuth } = require('@clerk/express');
const { identifyCar } = require('../lib/claude');
const supabase = require('../lib/supabase');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function getExtension(mimeType) {
  return { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[mimeType] || 'jpg';
}

router.post('/', requireAuth(), upload.single('image'), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!req.file) return res.status(400).json({ error: 'No image provided' });

    const storagePath = `${userId}/${Date.now()}.${getExtension(req.file.mimetype)}`;

    const [analysisResult, uploadResult] = await Promise.allSettled([
      identifyCar(req.file.buffer),
      supabase.storage.from('car-images').upload(storagePath, req.file.buffer, { contentType: req.file.mimetype }),
    ]);

    if (analysisResult.status === 'rejected') {
      return res.status(422).json({ error: analysisResult.reason.message });
    }

    const { make, model, year, confidence, notes } = analysisResult.value;
    const uploadData = uploadResult.status === 'fulfilled' ? uploadResult.value.data : null;
    const imageUrl = uploadData
      ? supabase.storage.from('car-images').getPublicUrl(uploadData.path).data.publicUrl
      : null;

    const { data: lookup, error: dbError } = await supabase
      .from('lookups')
      .insert({ user_id: userId, image_url: imageUrl, car_make: make, car_model: model, car_year: year, car_confidence: confidence, car_notes: notes, specs: null })
      .select()
      .single();

    if (dbError) console.error('DB insert error:', dbError);

    return res.json({ id: lookup?.id, make, model, year, confidence, notes, imageUrl });
  } catch (err) {
    console.error('Identify error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
