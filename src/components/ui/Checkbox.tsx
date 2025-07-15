interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  id?: string;
}

export default function Checkbox({
  label,
  checked = false,
  onChange,
  id,
}: CheckboxProps) {
  const checkboxId =
    id || `checkbox-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="flex items-center gap-2">
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="w-4 h-4 rounded border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-0 focus:outline-none"
        style={{ borderColor: "#D5D7DA" }}
      />
      <label
        htmlFor={checkboxId}
        className="text-gray-700 font-manrope text-sm font-medium leading-5 cursor-pointer"
        style={{ color: "#414651" }}
      >
        {label}
      </label>
    </div>
  );
}
