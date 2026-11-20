import * as Yup from "yup";

export const employeeValidation = Yup.object({
  employeeCode: Yup.string().trim().required("Employee ID is required").max(40),
  firstName: Yup.string().trim().required("First name is required").max(80),
  lastName: Yup.string().trim().required("Last name is required").max(80),
  email: Yup.string().trim().email("Enter a valid email address").required("Email is required").max(254),
  departmentId: Yup.string().required("Choose a department"),
  designation: Yup.string().trim().required("Designation is required").max(120),
  country: Yup.string().trim().required("Country is required").max(100),
  employmentStatus: Yup.string().oneOf(["ACTIVE", "INACTIVE", "TERMINATED"]).required(),
  joiningDate: Yup.string().required("Joining date is required").matches(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
});
