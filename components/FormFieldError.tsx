/** An inline field error. Give it the id the control points at with aria-describedby. */
const FormFieldError = ({ message, id }: { message: string | undefined; id?: string }) => {
  if (!message) return null;
  return <p id={id} className="fx-error">{message}</p>;
};

export default FormFieldError;
