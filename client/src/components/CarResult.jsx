import React from 'react';

function SpecRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex justify-between text-sm py-1.5 border-b border-slate-700 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-100 font-medium text-right ml-4">{value}</span>
    </div>
  );
}

function SpecSection({ title, children }) {
  const hasContent = React.Children.toArray(children).some(
    (c) => c && c.props && c.props.value !== null && c.props.value !== undefined && c.props.value !== ''
  );
  if (!hasContent) return null;
  return (
    <div className="mb-4">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</h4>
      <div className="bg-slate-800/60 rounded-lg px-3 py-1">{children}</div>
    </div>
  );
}

function LoadingSection({ label }) {
  return (
    <div className="mb-4">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</h4>
      <div className="bg-slate-800/60 rounded-lg px-3 py-3 flex items-center gap-2 text-slate-500 text-sm">
        <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin shrink-0" />
        Loading...
      </div>
    </div>
  );
}

const confidenceConfig = {
  high: 'bg-green-900/50 text-green-300 border-green-700',
  medium: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  low: 'bg-red-900/50 text-red-300 border-red-700',
};

export default function CarResult({ make, model, year, confidence, notes, imageUrl, specs, mods, funFacts, loadingDetails }) {
  const badgeClass = confidenceConfig[confidence] || confidenceConfig.low;
  const ps = specs?.model_engine_power_ps;
  const nm = specs?.model_engine_torque_nm;

  return (
    <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
      {imageUrl && (
        <img src={imageUrl} alt={`${year} ${make} ${model}`} className="w-full object-cover max-h-64" />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-2xl font-bold text-white">{year} {make} {model}</h2>
          <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full border capitalize ${badgeClass}`}>
            {confidence}
          </span>
        </div>

        {notes && <p className="text-slate-400 text-sm italic mb-4">{notes}</p>}

        <div className="mt-4">
          {specs ? (
            <>
              <SpecSection title="Engine">
                <SpecRow label="Engine name" value={specs.model_engine_name} />
                <SpecRow label="Displacement" value={specs.model_engine_cc ? `${specs.model_engine_cc} cc` : null} />
                <SpecRow label="Configuration" value={specs.model_engine_type} />
                <SpecRow label="Cylinders" value={specs.model_engine_cyl} />
                <SpecRow label="Valvetrain" value={specs.model_engine_valvetrain} />
                <SpecRow label="Valves / cyl" value={specs.model_engine_valves_per_cyl} />
                <SpecRow label="Bore × Stroke" value={specs.model_engine_bore_mm && specs.model_engine_stroke_mm ? `${specs.model_engine_bore_mm} × ${specs.model_engine_stroke_mm} mm` : null} />
                <SpecRow label="Compression" value={specs.model_engine_compression} />
                <SpecRow label="Fuel" value={specs.model_engine_fuel} />
                <SpecRow label="Aspiration" value={specs.model_engine_aspiration} />
              </SpecSection>
              <SpecSection title="Forced Induction">
                <SpecRow label="Turbo type" value={specs.model_turbo_type} />
                <SpecRow label="Boost pressure" value={specs.model_turbo_pressure_bar ? `${specs.model_turbo_pressure_bar} bar` : null} />
                <SpecRow label="Supercharger" value={specs.model_supercharger} />
              </SpecSection>
              <SpecSection title="Power">
                <SpecRow label="Max power" value={ps ? `${ps} ps (${Math.round(ps * 0.9863)} hp)${specs.model_engine_power_rpm ? ` @ ${specs.model_engine_power_rpm} rpm` : ''}` : null} />
                <SpecRow label="Max torque" value={nm ? `${nm} Nm (${Math.round(nm * 0.7376)} lb-ft)${specs.model_engine_torque_rpm ? ` @ ${specs.model_engine_torque_rpm} rpm` : ''}` : null} />
              </SpecSection>
              <SpecSection title="Performance">
                <SpecRow label="0–100 kph" value={specs.model_0_to_100_kph ? `${specs.model_0_to_100_kph} s` : null} />
                <SpecRow label="0–200 kph" value={specs.model_0_to_200_kph ? `${specs.model_0_to_200_kph} s` : null} />
                <SpecRow label="Top speed" value={specs.model_top_speed_kph ? `${specs.model_top_speed_kph} kph (${Math.round(specs.model_top_speed_kph * 0.621)} mph)` : null} />
              </SpecSection>
              <SpecSection title="Drivetrain">
                <SpecRow label="Drive" value={specs.model_drive} />
                <SpecRow label="Transmission" value={specs.model_transmission_type} />
                <SpecRow label="Gears" value={specs.model_transmission_gears} />
              </SpecSection>
              <SpecSection title="Chassis">
                <SpecRow label="Suspension front" value={specs.model_suspension_front} />
                <SpecRow label="Suspension rear" value={specs.model_suspension_rear} />
                <SpecRow label="Brakes front" value={specs.model_brake_front} />
                <SpecRow label="Brakes rear" value={specs.model_brake_rear} />
                <SpecRow label="Tyres front" value={specs.model_tire_front} />
                <SpecRow label="Tyres rear" value={specs.model_tire_rear} />
              </SpecSection>
              <SpecSection title="Body">
                <SpecRow label="Style" value={specs.model_body} />
                <SpecRow label="Doors" value={specs.model_doors} />
                <SpecRow label="Seats" value={specs.model_seats} />
                <SpecRow label="Kerb weight" value={specs.model_weight_kg ? `${specs.model_weight_kg} kg` : null} />
                <SpecRow label="Weight dist." value={specs.model_weight_distribution} />
                <SpecRow label="Ground clearance" value={specs.model_ground_clearance_mm ? `${specs.model_ground_clearance_mm} mm` : null} />
              </SpecSection>
              <SpecSection title="Dimensions">
                <SpecRow label="Length" value={specs.model_length_mm ? `${specs.model_length_mm} mm` : null} />
                <SpecRow label="Width" value={specs.model_width_mm ? `${specs.model_width_mm} mm` : null} />
                <SpecRow label="Height" value={specs.model_height_mm ? `${specs.model_height_mm} mm` : null} />
                <SpecRow label="Wheelbase" value={specs.model_wheelbase_mm ? `${specs.model_wheelbase_mm} mm` : null} />
                <SpecRow label="Track front" value={specs.model_track_front_mm ? `${specs.model_track_front_mm} mm` : null} />
                <SpecRow label="Track rear" value={specs.model_track_rear_mm ? `${specs.model_track_rear_mm} mm` : null} />
              </SpecSection>
              <SpecSection title="Fuel Economy">
                <SpecRow label="City" value={specs.model_fuel_consumption_l100km_city ? `${specs.model_fuel_consumption_l100km_city} L/100km` : null} />
                <SpecRow label="Highway" value={specs.model_fuel_consumption_l100km_highway ? `${specs.model_fuel_consumption_l100km_highway} L/100km` : null} />
                <SpecRow label="Tank" value={specs.model_fuel_tank_l ? `${specs.model_fuel_tank_l} L` : null} />
              </SpecSection>
              <SpecSection title="Production">
                <SpecRow label="Years" value={specs.model_production_years} />
                <SpecRow label="Units produced" value={specs.model_units_produced} />
              </SpecSection>
            </>
          ) : loadingDetails ? (
            <LoadingSection label="Specifications" />
          ) : null}

          {mods ? (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Suggested Modifications</h4>
              <div className="space-y-3">
                {[
                  { key: 'budget', label: 'Budget', color: 'text-green-400 border-green-800 bg-green-900/20', badge: 'Under $500' },
                  { key: 'mid_range', label: 'Mid Range', color: 'text-yellow-400 border-yellow-800 bg-yellow-900/20', badge: '$500–$5,000' },
                  { key: 'high_end', label: 'High End', color: 'text-red-400 border-red-800 bg-red-900/20', badge: '$5,000+' },
                ].map(({ key, label, color, badge }) =>
                  mods[key]?.length > 0 && (
                    <div key={key} className={`rounded-xl border p-3 ${color}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
                        <span className="text-xs opacity-70">{badge}</span>
                      </div>
                      <div className="space-y-2">
                        {mods[key].map((mod, i) => (
                          <div key={i} className="bg-slate-900/50 rounded-lg p-2.5">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className="text-sm font-semibold text-white">{mod.name}</span>
                              <div className="shrink-0 text-right">
                                <div className="text-xs font-bold">{mod.cost_usd}</div>
                                <div className="text-xs opacity-80">{mod.performance_gain}</div>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400">{mod.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : loadingDetails ? (
            <LoadingSection label="Suggested Modifications" />
          ) : null}

          {funFacts?.length > 0 ? (
            <div className="mt-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Fun Facts</h4>
              <ul className="space-y-2">
                {funFacts.map((fact, i) => (
                  <li key={i} className="bg-slate-800/60 rounded-lg px-3 py-2 text-sm text-slate-300 flex gap-2">
                    <span className="text-yellow-400 shrink-0">★</span>
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          ) : loadingDetails ? (
            <LoadingSection label="Fun Facts" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
