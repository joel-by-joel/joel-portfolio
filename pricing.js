const pricing = {
  includedRevisions: 2, revisionRate: 15, standaloneDays: 7, extraServiceDays: 3, advance: 50,
  marketing: { min: 2, unit: 1000, discount: 15 },
  website: { min: 1, included: 5, max: 25, extraRate: 5 },
  brand: { days: 21, approvalDay: 7, significant: 20, major: 30 },
  services: {
    instagram: { name: 'Instagram Optimisation', price: 2500, pinned: 3, initial: 2 },
    linkedin: { name: 'LinkedIn Optimisation', price: 2500, initial: 3 },
    x: { name: 'X Optimisation', price: 2000, initial: 3 },
    'marketing-design': { name: 'Marketing Materials & Design' },
    website: { name: 'Website Development', price: 3000 },
    'brand-identity': { name: 'Complete Brand Identity', price: 15000 },
    custom: { name: 'Custom project or unsure' }
  }
};
pricing.services['marketing-design'].price = pricing.marketing.min * pricing.marketing.unit;

const money = value => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2
}).format(value);
const percent = (value, rate) => value * rate / 100;
const revisionFee = value => percent(value, pricing.revisionRate);
const extraPageFee = () => percent(pricing.services.website.price, pricing.website.extraRate);

function estimate(service, raw) {
  const quantity = Number(raw);
  if (!String(raw).trim() || !Number.isSafeInteger(quantity) || quantity < 1) return null;
  if (service === 'marketing-design') {
    const { min, unit, discount } = pricing.marketing;
    if (quantity < min || !Number.isSafeInteger(quantity * unit * 100)) return null;
    const original = quantity * unit;
    const rate = quantity > min ? discount : 0;
    const saved = percent(original, rate);
    return { quantity, original, rate, saved, total: original - saved };
  }
  if (service === 'website') {
    const { included, max } = pricing.website;
    if (quantity > max) return null;
    const original = pricing.services.website.price;
    const extraPages = Math.max(0, quantity - included);
    const extraCharge = extraPages * extraPageFee();
    return { quantity, original, extraPages, extraCharge, total: original + extraCharge };
  }
  return null;
}

if (typeof module !== 'undefined') module.exports = { pricing, money, percent, estimate, revisionFee, extraPageFee };
