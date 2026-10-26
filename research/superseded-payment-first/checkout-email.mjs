// Keep the payment identity in the form payload while displaying it as saved
// information, not an empty or suggested input. Missing-email visits retain
// the existing editable fallback.
export function showCheckoutEmail(email, root = document) {
  const field = root.getElementById('email');
  field.value = email;
  field.readOnly = true;
  field.hidden = true;
  const label = root.getElementById('email-label');
  label.textContent = 'Email from your payment';
  label.removeAttribute('for');
  const display = root.getElementById('checkout-email-display');
  display.textContent = email;
  display.hidden = false;
  root.getElementById('email-field').classList.add('email-prefilled');
  root.getElementById('email-help').textContent = 'Already filled in. No need to enter it again.';
}
