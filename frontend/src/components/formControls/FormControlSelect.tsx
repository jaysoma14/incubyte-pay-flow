import {
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  type InputBaseComponentProps,
} from "@mui/material";
import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import Select, { type SelectInstance } from "react-select";
import type { FocusEventHandler } from "react";
import type { CSSObjectWithLabel, StylesConfig } from "react-select";

export type SelectOption = {
  label: string;
  value: string;
  size?: "small" | "medium";
};

type SelectFieldProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  error?: boolean;
  helperText?: React.ReactNode;
  required?: boolean;
  placeholder?: string;
  isSearchable?: boolean;
  size?: "small" | "medium";
  emptyOption?: string;
};

type SelectInputProps = InputBaseComponentProps & {
  options?: SelectOption[];
  selectedOption?: SelectOption | null;
  onValueChange?: (value: string) => void;
  selectPlaceholder?: string;
  isInvalid?: boolean;
  onSelectBlur?: FocusEventHandler<HTMLInputElement>;
  isSearchable?: boolean;
  size?: "small" | "medium";
};

const selectStyles = (
  size?: "small" | "medium",
): StylesConfig<SelectOption, false> => ({
  container: (base: CSSObjectWithLabel) => ({
    ...base,
    width: "100%",
  }),
  control: (base) => ({
    ...base,
    minHeight: size === "small" ? 40 : 54,
    width: "100%",
    border: 0,
    borderRadius: 0,
    boxShadow: "none",
    backgroundColor: "transparent",
    "&:hover": { border: 0 },
  }),
  input: (base: CSSObjectWithLabel) => ({
    ...base,
    display: "flex",
  }),
  valueContainer: (base: CSSObjectWithLabel) => ({
    ...base,
    padding: "0 14px",
  }),
  indicatorsContainer: (base: CSSObjectWithLabel) => ({
    ...base,
    paddingRight: 4,
  }),
  menu: (base: CSSObjectWithLabel) => ({
    ...base,
    zIndex: 5,
  }),
  option: (
    base: CSSObjectWithLabel,
    state: { isSelected: boolean; isFocused: boolean },
  ) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#425be8"
      : state.isFocused
        ? "#eef0ff"
        : "white",
    color: state.isSelected ? "white" : "#20253b",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
});

const ReactSelectInput = forwardRef<HTMLInputElement, SelectInputProps>(
  function ReactSelectInput(
    {
      options = [],
      selectedOption = null,
      onValueChange,
      selectPlaceholder,
      id,
      name,
      disabled,
      onFocus,
      onBlur,
      isSearchable,
      size,
    },
    ref,
  ) {
    const setInputRef = (
      instance: SelectInstance<SelectOption, false> | null,
    ) => {
      const input = instance?.inputRef ?? null;

      if (typeof ref === "function") {
        ref(input);
      } else if (ref) {
        ref.current = input;
      }
    };

    return (
      <Select<SelectOption, false>
        ref={setInputRef}
        inputId={id}
        instanceId={id}
        name={name}
        options={options}
        value={selectedOption}
        onChange={(option) => onValueChange?.(option?.value ?? "")}
        onFocus={onFocus}
        onBlur={onBlur}
        isDisabled={disabled}
        isClearable={false}
        placeholder={selectPlaceholder || ""}
        classNamePrefix="app-select"
        isSearchable={isSearchable}
        styles={selectStyles(size)}
        menuPortalTarget={document.body}
        menuPosition="fixed"
      />
    );
  },
);

export function FormControlSelect({
  label,
  value,
  options,
  onChange,
  name,
  onBlur,
  error = false,
  helperText,
  required,
  placeholder,
  isSearchable = true,
  size,
  emptyOption
}: SelectFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const optionsWithEmpty = useMemo(() => {
    if (emptyOption) {
      return [{ label: emptyOption, value: "" }, ...options];
    }
    return options;
  }, [emptyOption, options]);

  const selectedOption = useMemo(
    () => optionsWithEmpty.find((option) => option.value === value) ?? null,
    [optionsWithEmpty, value],
  );

  const controlId = name ?? label.toLowerCase().replace(/\s+/g, "-");

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  const handleChange = useCallback(
    (newValue: string) => {
      onChange({
        target: { name, value: newValue },
      } as React.ChangeEvent<HTMLInputElement>);
      setIsFocused(false);
    },
    [onChange, name],
  );

  return (
    <FormControl required={required} fullWidth error={error}>
      <InputLabel
        shrink={!!placeholder || !!selectedOption || isFocused}
        htmlFor={controlId}
        size={size}
      >
        {label}
      </InputLabel>
      <OutlinedInput
        id={controlId}
        name={name}
        label={label}
        fullWidth
        error={error}
        inputRef={inputRef}
        onFocus={handleFocus}
        onBlur={handleBlur}
        notched={!!placeholder || !!selectedOption || isFocused}
        inputComponent={ReactSelectInput}
        inputProps={{
          options: optionsWithEmpty,
          selectedOption,
          onValueChange: handleChange,
          isInvalid: error,
          onBlur: handleBlur,
          selectPlaceholder: placeholder,
          isSearchable: isSearchable,
          size: size,
        }}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
