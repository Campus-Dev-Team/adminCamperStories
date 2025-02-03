export const Input = ({ className, ...props }) => (
    <input
      className={`w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-white/40 ${className}`}
      {...props}
    />
  );
  