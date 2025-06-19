interface InputFieldProps {
  label: string;
  placeholder: string;
  hintText?: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
}

export default function InputField({
  label,
  placeholder,
  hintText,
  type = "text",
  value,
  onChange,
  id,
}: InputFieldProps) {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={inputId}
        className="text-gray-700 font-manrope text-sm font-medium leading-5"
        style={{ color: "#414651" }}
      >
        {label}
      </label>

      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="login-input flex px-3.5 py-2.5 items-center gap-2 w-full rounded-lg border bg-white font-manrope text-base leading-6 shadow-button focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
        style={{
          color: "#181D27",
          borderColor: "#D5D7DA",
          backgroundColor: "#FFF",
        }}
      />

      {hintText && (
        <p
          className="text-gray-600 font-manrope text-sm leading-5"
          style={{ color: "#535862" }}
        >
          {hintText}
        </p>
      )}
    </div>
  );
}
