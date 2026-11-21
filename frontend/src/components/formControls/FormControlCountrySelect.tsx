import { getData } from "country-list";
import { useMemo, type FocusEventHandler, type ReactNode } from "react";
import { FormControlSelect } from "./FormControlSelect";

const countryNameOverrides: Record<string, string> = {
  AE: "United Arab Emirates",
  GB: "United Kingdom",
  US: "United States",
};

const countryOptions = getData()
  .map(({ code, name }) => {
    const countryName = countryNameOverrides[code] ?? name;
    return { label: countryName, value: countryName };
  })
  .sort((left, right) => left.label.localeCompare(right.label));

type CountrySelectProps = {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: boolean;
  helperText?: ReactNode;
  required?: boolean;
  size?: "small" | "medium";
  emptyOption?: string;
};

export function FormControlCountrySelect({
  label,
  value,
  onChange,
  name,
  onBlur,
  error,
  helperText,
  required,
  size = "medium",
  emptyOption,
}: CountrySelectProps) {
  const hasCurrentValue = countryOptions.some(
    (country) => country.value === value,
  );

  const availableOptions = useMemo(
    () =>
      value && !hasCurrentValue
        ? [{ label: value, value }, ...countryOptions]
        : countryOptions,
    [value, hasCurrentValue],
  );

  return (
    <FormControlSelect
      size={size}
      name={name}
      label={label}
      value={value}
      options={availableOptions}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      required={required}
      emptyOption={emptyOption}
    />
  );
}
