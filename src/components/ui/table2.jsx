export const Table = ({ className, ...props }) => (
    <table className={`w-full ${className}`} {...props} />
  );
  
  export const TableHeader = (props) => <thead {...props} />;
  
  export const TableBody = (props) => <tbody {...props} />;
  
  export const TableRow = ({ className, ...props }) => (
    <tr className={`border-b border-white/10 ${className}`} {...props} />
  );
  
  export const TableHead = ({ className, ...props }) => (
    <th className={`py-3 text-left text-sm font-medium text-white/60 ${className}`} {...props} />
  );
  
  export const TableCell = ({ className, ...props }) => (
    <td className={`py-3 text-sm text-white ${className}`} {...props} />
  );
  