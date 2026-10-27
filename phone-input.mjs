import * as phoneModule from './vendor/libphonenumber-min.js';
import examples from './vendor/phone-examples.mjs';

const phone = phoneModule.default ?? globalThis.libphonenumber;
const countries = phone.getCountries();
const supported = new Set(countries);

export function normalizeWhatsApp(value, country = '') {
  let input = String(value ?? '').trim();
  country = String(country).toUpperCase();
  // Accept pasted international numbers as well as local numbers. Let the
  // library handle national prefixes, including significant Italian zeroes.
  if (input.startsWith('00')) input = '+' + input.slice(2);
  if (['US', 'CA'].includes(country) && input.startsWith('011')) input = '+' + input.slice(3);
  if (!input || input.length > 40 || !/^[+\p{Nd}\s().-]+$/u.test(input)) {
    return { error: 'Enter your WhatsApp phone number.' };
  }
  if (!input.startsWith('+') && !supported.has(country)) {
    return { countryError: 'Choose the country for your phone number.' };
  }
  let parsed = phone.parsePhoneNumberFromString(input, { defaultCountry: supported.has(country) ? country : undefined, extract: false });
  // Some buyers paste the country code without the plus sign. Only recover
  // that form when it matches their selected country and the first parse fails.
  if ((!parsed || !parsed.isPossible()) && supported.has(country) && !input.startsWith('+')) {
    const digits = input.replace(/[\s().-]/g, '');
    if (digits.startsWith(phone.getCountryCallingCode(country))) parsed = phone.parsePhoneNumberFromString('+' + digits, { extract: false });
  }
  // Possible lengths avoid rejecting newly issued mobile number ranges.
  // This checks the number format, not whether it has a WhatsApp account.
  if (!parsed || !parsed.isPossible() || parsed.ext) {
    return { error: 'Check the country and enter the complete phone number.' };
  }
  const matches = countries.filter(code => phone.getCountryCallingCode(code) === parsed.countryCallingCode);
  const resolvedCountry = parsed.country || (matches.includes(country) ? country : matches.length === 1 ? matches[0] : {1:'US',44:'GB',7:'RU'}[parsed.countryCallingCode]);
  if (!resolvedCountry) return { countryError: 'Choose the country for your phone number.' };
  return { number: parsed.number, country: resolvedCountry, national: parsed.formatNational(), display: parsed.formatInternational() };
}

export function setupPhoneInput(root = document) {
  const select = root.getElementById('phone-country');
  const input = root.getElementById('whatsapp');
  const readback = root.getElementById('phone-readback');
  const dialLabel = root.getElementById('dial-code-label');
  const names = new Intl.DisplayNames(['en'], { type: 'region' });
  const options = countries.map(code => ({ code, name: names.of(code) })).sort((a, b) => a.name.localeCompare(b.name, 'en'));
  for (const { code, name } of options) {
    const option = root.createElement('option');
    option.value = code;
    option.textContent = `${name} (+${phone.getCountryCallingCode(code)})`;
    select.append(option);
  }
  select.value = 'US';
  const refresh = (format = false) => {
    const result = normalizeWhatsApp(input.value, select.value);
    if (result.number) {
      select.value = result.country;
      if (format) input.value = result.national;
      readback.textContent = `We’ll use: ${result.display}`;
    } else readback.textContent = '';
    input.placeholder = select.value ? phone.getExampleNumber(select.value, examples)?.formatNational() ?? 'Phone number' : 'Phone number';
    if (dialLabel) dialLabel.textContent = select.value ? `+${phone.getCountryCallingCode(select.value)}` : '+ Code';
  };
  select.addEventListener('change', () => refresh());
  input.addEventListener('input', () => refresh());
  input.addEventListener('blur', () => refresh(true));
  refresh();
  return { refresh };
}
