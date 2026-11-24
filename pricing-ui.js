function rows(entries) {
  return entries.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
}

function estimateRows(service, quote) {
  const breakdown = service === 'website'
    ? [['Base price', money(quote.original)], ['Included page allowance', pricing.website.included],
       ['Additional pages', quote.extraPages], ['Additional page charges', money(quote.extraCharge)]]
    : [['Original price', money(quote.original)], ['Discount', quote.rate + '%'],
       ['Amount saved', money(quote.saved)], ['Effective price per design', money(quote.total / quote.quantity)]];
  return [...breakdown, ['Estimated total', '<strong>' + money(quote.total) + '</strong>'],
    ['Revision fee per additional round', money(revisionFee(quote.total))]];
}

document.querySelectorAll('[data-calculator]').forEach(calculator => {
  const service = calculator.dataset.calculator;
  const input = calculator.querySelector('input');
  const output = calculator.querySelector('dl');
  const note = calculator.querySelector('[data-note]');
  const action = calculator.querySelector('[data-enquire]');
  const minus = calculator.querySelector('[data-step="-1"]');
  const plus = calculator.querySelector('[data-step="1"]');
  function update() {
    const quote = estimate(service, input.value);
    input.setAttribute('aria-invalid', String(!quote));
    output.innerHTML = quote ? rows(estimateRows(service, quote)) : '';
    note.textContent = quote ? (quote.rate ? quote.rate + '% quantity discount applied.' : '')
      : input.max ? 'Enter a whole number from ' + input.min + ' to ' + input.max + '.' : 'Enter a whole number of at least ' + input.min + '.';
    action.hidden = !quote;
    if (quote) action.href = 'contact.html?' + new URLSearchParams({ service, quantity: quote.quantity });
    minus.disabled = Number(input.value) <= Number(input.min);
    plus.disabled = Boolean(input.max && Number(input.value) >= Number(input.max));
  }
  [minus, plus].forEach(button => button.addEventListener('click', () => {
    if (!Number.isInteger(input.valueAsNumber)) input.value = input.min;
    else {
      const next = Math.max(Number(input.min), input.valueAsNumber + Number(button.dataset.step));
      input.value = input.max ? Math.min(Number(input.max), next) : next;
    }
    update();
  }));
  input.addEventListener('input', update);
  update();
});

const quoteFields = document.querySelector('#quote-fields');
if (quoteFields) {
  const form = quoteFields.closest('form');
  const select = form.elements.service;
  const quantity = form.elements.quantity;
  const summary = form.elements.estimate_summary;
  const query = new URLSearchParams(location.search);
  let activeService;
  function updateQuote() {
    const key = select.value;
    const service = pricing.services[key];
    const rules = key === 'website' ? pricing.website : key === 'marketing-design' ? pricing.marketing : null;
    quoteFields.hidden = !service || (key === 'custom' && query.get('project') !== 'website');
    quantity.closest('label').hidden = !rules;
    quantity.disabled = !rules;
    quantity.required = Boolean(rules);
    if (rules && activeService !== key) {
      quantity.min = rules.min;
      quantity.max = rules.max || '';
      quantity.value = key === query.get('service') && query.has('quantity') ? query.get('quantity') : rules.included || rules.min;
      quoteFields.querySelector('[data-quantity-label]').textContent = key === 'website' ? 'Number of website pages' : 'Number of marketing designs';
    }
    activeService = key;
    const quote = rules ? estimate(key, quantity.value) : null;
    quantity.setCustomValidity(rules && !quote ? 'Enter a valid whole-number quantity.' : '');
    const entries = quote ? estimateRows(key, quote) : rules ? [] : service?.price
      ? [['Estimated total', money(service.price)]] : key === 'custom' && query.get('project') === 'website'
      ? [['Request', 'Website custom quote (over ' + pricing.website.max + ' pages)']] : [];
    quoteFields.querySelector('dl').innerHTML = rows(entries);
    summary.value = entries.map(([label, value]) => label + ': ' + String(value).replace(/<[^>]+>/g, '')).join(' | ');
  }
  select.addEventListener('change', updateQuote);
  quantity.addEventListener('input', updateQuote);
  updateQuote();
}
