import { getData } from "country-list";
import { MenuItem, TextField } from "@mui/material";
import type { FocusEventHandler, ReactNode } from "react";

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
  onChange: (value: string) => void;
  name?: string;
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: boolean;
  helperText?: ReactNode;
  required?: boolean;
  size?: "small" | "medium";
  emptyOption?: string;
};

export function CountrySelect({
  label,
  value,
  onChange,
  name,
  onBlur,
  error,
  helperText,
  required,
  size = "small",
  emptyOption,
}: CountrySelectProps) {
  const hasCurrentValue = countryOptions.some(
    (country) => country.value === value,
  );

  return (
    <TextField
      select
      fullWidth
      size={size}
      name={name}
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      required={required}
    >
      {emptyOption && <MenuItem value="">{emptyOption}</MenuItem>}
      {value && !hasCurrentValue && <MenuItem value={value}>{value}</MenuItem>}
      {countryOptions.map((country) => (
        <MenuItem key={country.value} value={country.value}>
          {country.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
