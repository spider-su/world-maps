export type DemoForm = { name: string; email: string; amount: string };
export type FormErrors = Partial<Record<keyof DemoForm, string>>;
export function validateDemoForm(form: DemoForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  else if (form.name.trim().length < 2) errors.name = 'Enter at least 2 characters';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email';
  const amount = Number(form.amount);
  if (!form.amount.trim() || !Number.isFinite(amount) || amount <= 0) errors.amount = 'Enter a positive number';
  else if (amount > 1000000) errors.amount = 'Maximum is 1,000,000';
  return errors;
}
