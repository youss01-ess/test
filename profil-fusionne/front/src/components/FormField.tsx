import type { InputHTMLAttributes } from 'react';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
};

export default function FormField({
  id,
  label,
  required,
  ...props
}: FormFieldProps) {
  return (
    <div>
      <label
        className="block text-sm font-semibold text-slate-800"
        htmlFor={id}
      >
        {label} {required && <span className="text-emerald-700">*</span>}
      </label>
      <input
        className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        id={id}
        required={required}
        {...props}
      />
    </div>
  );
}