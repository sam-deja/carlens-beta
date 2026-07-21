const fetch = require('node-fetch');

async function getCarSpecs(make, model, year) {
  const baseUrl = 'https://www.carqueryapi.com/api/0.3/';
  const encodedMake = encodeURIComponent(make.toLowerCase());
  const encodedModel = encodeURIComponent(model.toLowerCase());

  async function fetchTrims(includeYear) {
    let url = `${baseUrl}?cmd=getTrims&make=${encodedMake}&model=${encodedModel}&full_results=1`;
    if (includeYear) {
      const cleanYear = String(year).split('-')[0];
      url += `&year=${cleanYear}`;
    }
    const res = await fetch(url);
    const text = await res.text();
    const json = text.replace(/^\?\s*\(/, '').replace(/\s*\);\s*$/, '');
    const data = JSON.parse(json);
    return data.Trims || [];
  }

  let trims = await fetchTrims(true);
  if (trims.length === 0) {
    trims = await fetchTrims(false);
  }

  return trims.length > 0 ? trims[0] : null;
}

module.exports = { getCarSpecs };
