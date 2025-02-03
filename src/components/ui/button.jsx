export const Button = ({ className, ...props }) => (
    <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${className}`} {...props} />
  );
  