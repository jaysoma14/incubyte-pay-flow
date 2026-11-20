import * as Yup from "yup";

export const salaryRevisionValidation = Yup.object({
  amount: Yup.number().typeError("Enter a valid salary amount").moreThan(0, "Salary must be greater than zero").required("Salary amount is required"),
  currency: Yup.string().required("Currency is required").matches(/^[A-Z]{3}$/, "Use a 3-letter uppercase currency code"),
  effectiveFrom: Yup.string().required("Effective date is required").matches(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
  reason: Yup.string().trim().required("Reason for change is required").max(1000),
});
