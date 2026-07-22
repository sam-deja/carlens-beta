const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const sharp = require('sharp');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const client = anthropic; // used by specs/mods/fun_facts

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

async function identifyCar(imageBuffer) {
  const resized = await resizeForClaude(imageBuffer);
  const base64 = resized.toString('base64');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}`, detail: 'high' } },
        { type: 'text', text: 'Identify this car. Return ONLY valid JSON: { "make": string, "model": string, "year": string, "confidence": "high"|"medium"|"low", "notes": string }. Year is 4-digit string or range like "2018-2020".' },
      ],
    }],
  });

  const parsed = parseJSON(response.choices[0].message.content);
  if (!parsed.make || !parsed.model) throw new Error('Could not identify car in image');
  return parsed;
}

async function getSpecs(make, model, year, imageBuffer) {
  const base64 = imageBuffer ? (await resizeForClaude(imageBuffer)).toString('base64') : null;
  const content = base64
    ? [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
        { type: 'text', text: `This is a ${year} ${make} ${model}. Use the image to identify the exact trim/variant and return accurate technical specs. Return ONLY valid JSON:\n{"model_body":s,"model_engine_name":s,"model_engine_cc":s,"model_engine_cyl":s,"model_engine_type":s,"model_engine_power_ps":s,"model_engine_power_rpm":s,"model_engine_torque_nm":s,"model_engine_torque_rpm":s,"model_engine_fuel":s,"model_engine_compression":s,"model_engine_bore_mm":s,"model_engine_stroke_mm":s,"model_engine_valves_per_cyl":s,"model_engine_valvetrain":s,"model_engine_aspiration":s,"model_turbo_type":s,"model_turbo_pressure_bar":s,"model_supercharger":s,"model_drive":s,"model_transmission_type":s,"model_transmission_gears":s,"model_seats":s,"model_doors":s,"model_weight_kg":s,"model_weight_distribution":s,"model_length_mm":s,"model_width_mm":s,"model_height_mm":s,"model_wheelbase_mm":s,"model_track_front_mm":s,"model_track_rear_mm":s,"model_ground_clearance_mm":s,"model_top_speed_kph":s,"model_0_to_100_kph":s,"model_0_to_200_kph":s,"model_fuel_consumption_l100km_city":s,"model_fuel_consumption_l100km_highway":s,"model_fuel_tank_l":s,"model_brake_front":s,"model_brake_rear":s,"model_suspension_front":s,"model_suspension_rear":s,"model_tire_front":s,"model_tire_rear":s,"model_production_years":s,"model_units_produced":s}\nReplace s with string value or null.` },
      ]
    : `Technical specs for ${year} ${make} ${model}. Return ONLY valid JSON:\n{"model_body":s,"model_engine_name":s,"model_engine_cc":s,"model_engine_cyl":s,"model_engine_type":s,"model_engine_power_ps":s,"model_engine_power_rpm":s,"model_engine_torque_nm":s,"model_engine_torque_rpm":s,"model_engine_fuel":s,"model_engine_compression":s,"model_engine_bore_mm":s,"model_engine_stroke_mm":s,"model_engine_valves_per_cyl":s,"model_engine_valvetrain":s,"model_engine_aspiration":s,"model_turbo_type":s,"model_turbo_pressure_bar":s,"model_supercharger":s,"model_drive":s,"model_transmission_type":s,"model_transmission_gears":s,"model_seats":s,"model_doors":s,"model_weight_kg":s,"model_weight_distribution":s,"model_length_mm":s,"model_width_mm":s,"model_height_mm":s,"model_wheelbase_mm":s,"model_track_front_mm":s,"model_track_rear_mm":s,"model_ground_clearance_mm":s,"model_top_speed_kph":s,"model_0_to_100_kph":s,"model_0_to_200_kph":s,"model_fuel_consumption_l100km_city":s,"model_fuel_consumption_l100km_highway":s,"model_fuel_tank_l":s,"model_brake_front":s,"model_brake_rear":s,"model_suspension_front":s,"model_suspension_rear":s,"model_tire_front":s,"model_tire_rear":s,"model_production_years":s,"model_units_produced":s}\nReplace s with string value or null.`;

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content }],
  });
  return parseJSON(response.content[0].text);
}

async function getMods(make, model, year) {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Suggested modifications for ${year} ${make} ${model}. Return ONLY valid JSON:
{"budget":[{"name":s,"cost_usd":s,"performance_gain":s,"description":s},{"name":s,"cost_usd":s,"performance_gain":s,"description":s},{"name":s,"cost_usd":s,"performance_gain":s,"description":s}],"mid_range":[{"name":s,"cost_usd":s,"performance_gain":s,"description":s},{"name":s,"cost_usd":s,"performance_gain":s,"description":s},{"name":s,"cost_usd":s,"performance_gain":s,"description":s}],"high_end":[{"name":s,"cost_usd":s,"performance_gain":s,"description":s},{"name":s,"cost_usd":s,"performance_gain":s,"description":s},{"name":s,"cost_usd":s,"performance_gain":s,"description":s}]}
Replace s with string. budget=under $500, mid_range=$500-$5000, high_end=$5000+. performance_gain must be concrete e.g. "+15 hp".`,
    }],
  });
  return parseJSON(response.content[0].text);
}

async function getFunFacts(make, model, year) {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `3 genuinely interesting fun facts about the ${year} ${make} ${model}. Racing history, records, engineering quirks, cultural impact, celebrity owners etc. Return ONLY valid JSON: {"fun_facts":[string,string,string]}`,
    }],
  });
  return parseJSON(response.content[0].text).fun_facts;
}

module.exports = { identifyCar, getSpecs, getMods, getFunFacts };
