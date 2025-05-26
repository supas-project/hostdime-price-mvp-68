
export const componentSpacing = {
  section: "space-y-6 md:space-y-8",
  card: "p-4 sm:p-6 md:p-8",
  header: "mb-6 md:mb-8",
  content: "space-y-6 md:space-y-8",
  footer: "pt-6 mt-6 md:pt-8 md:mt-8 border-t border-border"
};

export const animationClasses = {
  fadeIn: "animate-fade-in",
  slideIn: "animate-slide-in",
  hover: "transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-[#f58220]/20",
  active: "active:scale-[0.97] active:duration-200",
  pulse: "animate-pulse",
  bounce: "hover:animate-bounce"
};

export const layoutClasses = {
  flexBetween: "flex justify-between items-center",
  flexCenter: "flex items-center justify-center",
  grid: "grid gap-6 md:gap-8",
  gridCols2: "grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
};

export const interactionClasses = {
  button: "rounded-lg px-4 py-3 transition-all duration-300 hover:bg-[#f58220] hover:text-white hover:shadow-lg hover:shadow-[#f58220]/30",
  input: "rounded-lg border-2 border-border bg-background px-4 py-3 focus:border-[#f58220] focus:ring-2 focus:ring-[#f58220]/30 transition-all duration-200",
  select: "rounded-lg border-2 border-border bg-background hover:border-[#f58220]/50 focus:border-[#f58220] transition-all duration-200",
  card: "bg-card rounded-xl border-2 border-border shadow-lg transition-all duration-300 hover:border-[#f58220]/30 hover:shadow-xl hover:shadow-[#f58220]/10"
};

// Novos utilitários para identidade visual HostDime
export const hostdimeClasses = {
  primaryButton: "bg-[#f58220] hover:bg-[#e55a00] text-white shadow-lg hover:shadow-[#f58220]/30 transition-all duration-300",
  secondaryButton: "border-2 border-[#f58220] text-[#f58220] hover:bg-[#f58220] hover:text-white transition-all duration-300",
  accent: "text-[#f58220] font-semibold",
  highlight: "bg-[#f58220]/10 border-l-4 border-[#f58220] p-4 rounded-r-lg",
  glow: "shadow-lg shadow-[#f58220]/20",
  cardHover: "hover:border-[#f58220]/30 hover:shadow-lg hover:shadow-[#f58220]/10 transition-all duration-300"
};

// Responsive utility classes aprimorados
export const responsiveClasses = {
  container: "w-full mx-auto px-4 sm:px-6 md:px-8",
  cardGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8",
  stack: "flex flex-col gap-6 md:gap-8",
  row: "flex flex-col sm:flex-row gap-6 md:gap-8",
  column: "flex flex-col gap-4 md:gap-6",
  mainSection: "py-6 sm:py-8 md:py-12"
};

// Sistema de elevação com cores HostDime
export const elevationClasses = {
  low: "shadow-sm",
  medium: "shadow-md shadow-black/10",
  high: "shadow-lg shadow-black/20",
  card: "shadow-md hover:shadow-lg hover:shadow-[#f58220]/10 transition-all duration-300",
  float: "shadow-xl shadow-black/25 hover:shadow-2xl hover:shadow-[#f58220]/20 transition-all duration-300"
};
