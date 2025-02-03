export const Card = ({ className, ...props }) => (
  <div className={`bg-[#2E2B5B]/50 backdrop-blur-xl border border-white/10 rounded-lg p-6 ${className}`} {...props} />
)

export const CardHeader = ({ className, ...props }) => <div className={`mb-4 ${className}`} {...props} />

export const CardTitle = ({ className, ...props }) => (
  <h3 className={`text-xl font-bold text-white mb-1 ${className}`} {...props} />
)

export const CardDescription = ({ className, ...props }) => (
  <p className={`text-sm text-white/60 ${className}`} {...props} />
)

export const CardContent = (props) => <div {...props} />

