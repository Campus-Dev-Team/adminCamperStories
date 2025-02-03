export const Badge = ({ className, ...props }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`} {...props} />
  );
  