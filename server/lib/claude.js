const Anthropic = require('@anthropic-ai/sdk');
const sharp = require('sharp');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function resizeForClaude(buffer) {
  return sharp(buffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
}

function parseJSON(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  return JSON.parse(cleaned);
}

async function identifyCar(imageBuffer, mimeType) {
  const resized = await resizeForClaude(imageBuffer);
  const base64 = resized.toString('base64');

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
          },
          {
            type: 'text',
            text: 'Identify this car. Return ONLY valid JSON: { "make": string, "model": string, "year": string, "confidence": "high"|"medium"|"low", "notes": string }. Year is a 4-digit string or range like "2018-2020".',
          },
        ],
      },
    ],
  });

  let parsed;
  try {
    parsed = parseJSON(response.content[0].text);
  } catch {
    throw new Error('Could not identify car in image');
  }

  if (!parsed.make || !parsed.model) {
    throw new Error('Could not identify car in image');
  }

  return parsed;
}

async function getCarSpecs(make, model, year) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Give me the full technical breakdown for a ${year} ${make} ${model}. Return ONLY valid JSON with this exact structure:
{
  "model_body": string,
  "model_engine_name": string,
  "model_engine_cc": string,
  "model_engine_cyl": string,
  "model_engine_type": string,
  "model_engine_power_ps": string,
  "model_engine_power_rpm": string,
  "model_engine_torque_nm": string,
  "model_engine_torque_rpm": string,
  "model_engine_fuel": string,
  "model_engine_compression": string,
  "model_engine_bore_mm": string,
  "model_engine_stroke_mm": string,
  "model_engine_valves_per_cyl": string,
  "model_engine_valvetrain": string,
  "model_engine_aspiration": string,
  "model_turbo_type": string,
  "model_turbo_pressure_bar": string,
  "model_supercharger": string,
  "model_drive": string,
  "model_transmission_type": string,
  "model_transmission_gears": string,
  "model_seats": string,
  "model_doors": string,
  "model_weight_kg": string,
  "model_weight_distribution": string,
  "model_length_mm": string,
  "model_width_mm": string,
  "model_height_mm": string,
  "model_wheelbase_mm": string,
  "model_track_front_mm": string,
  "model_track_rear_mm": string,
  "model_ground_clearance_mm": string,
  "model_top_speed_kph": string,
  "model_0_to_100_kph": string,
  "model_0_to_200_kph": string,
  "model_fuel_consumption_l100km_city": string,
  "model_fuel_consumption_l100km_highway": string,
  "model_fuel_tank_l": string,
  "model_brake_front": string,
  "model_brake_rear": string,
  "model_suspension_front": string,
  "model_suspension_rear": string,
  "model_tire_front": string,
  "model_tire_rear": string,
  "model_production_years": string,
  "model_units_produced": string,
  "fun_facts": [string, string, string],
  "modifications": {
    "budget": [
      { "name": string, "cost_usd": string, "performance_gain": string, "description": string }
    ],
    "mid_range": [
      { "name": string, "cost_usd": string, "performance_gain": string, "description": string }
    ],
    "high_end": [
      { "name": string, "cost_usd": string, "performance_gain": string, "description": string }
    ]
  }
}
Use null for values you are not confident about. fun_facts should be 3 genuinely interesting facts about this specific car — racing history, engineering innovations, records broken, celebrity owners, cultural impact, quirks, etc.
For modifications: budget = under $500, mid_range = $500–$5000, high_end = $5000+. Include 3 mods per tier, specific to this car's platform. performance_gain should be concrete (e.g. "+15 hp", "+20% throttle response", "-0.3s 0-100").`,
      },
    ],
  });

  const text = response.content[0].text;
  try {
    return parseJSON(text);
  } catch (err) {
    console.error('Specs parse error:', err.message);
    console.error('Raw response:', text.substring(0, 300));
    return null;
  }
}

module.exports = { identifyCar, getCarSpecs };
