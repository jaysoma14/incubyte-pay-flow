import { data as currencyData } from "currency-codes";
import { useMemo, type FocusEventHandler, type ReactNode } from "react";
import { FormControlSelect } from "./FormControlSelect";

const currencyOptions = currencyData
  .map(({ code, currency }) => ({
    label: `${code} - ${currency}`,
    value: code,
  }))
  .sort((left, right) => left.label.localeCompare(right.label));

type CurrencySelectProps = {
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

export function FormControlCurrencySelect({
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
}: CurrencySelectProps) {
  const hasCurrentValue = currencyOptions.some(
    (currency) => currency.value === value,
  );
  const availableOptions = useMemo(
    () =>
      value && !hasCurrentValue
        ? [{ label: value, value }, ...currencyOptions]
        : currencyOptions,
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
