
export const componentSpacing = {
  section: "space-y-8",
  card: "p-4 sm:p-6",
  header: "mb-4 sm:mb-6",
  content: "space-y-4 sm:space-y-6",
  footer: "pt-4 mt-4 sm:pt-6 sm:mt-6 border-t border-border"
};

export const animationClasses = {
  fadeIn: "animate-fade-in",
  slideIn: "animate-slide-in",
  hover: "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
  active: "active:scale-[0.98] active:duration-200"
};

export const layoutClasses = {
  flexBetween: "flex justify-between items-center",
  flexCenter: "flex items-center justify-center",
  grid: "grid gap-4 sm:gap-6",
  gridCols2: "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
};

export const interactionClasses = {
  button: "rounded-lg px-3 py-2 sm:px-4 sm:py-2 transition-all duration-200 hover:bg-primary hover:text-primary-foreground",
  input: "rounded-lg border border-border bg-background px-3 py-2 sm:px-4 sm:py-2 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
  select: "rounded-lg border border-border bg-background hover:border-primary/50 focus:border-primary/50",
  card: "bg-card rounded-xl border border-border shadow-lg transition-all duration-300 hover:border-primary/30"
};

// New responsive utility classes
export const responsiveClasses = {
  container: "w-full mx-auto px-3 sm:px-4 md:px-6",
  cardGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
  stack: "flex flex-col gap-4 sm:gap-6",
  row: "flex flex-col sm:flex-row gap-4 sm:gap-6",
  column: "flex flex-col gap-2 sm:gap-4",
  mainSection: "py-4 sm:py-6 md:py-8"
};

// New shadow system
export const elevationClasses = {
  low: "shadow-sm",
  medium: "shadow-md",
  high: "shadow-lg",
  card: "shadow-md hover:shadow-lg transition-shadow duration-300"
};

