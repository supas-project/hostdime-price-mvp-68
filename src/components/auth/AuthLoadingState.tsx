
interface AuthLoadingStateProps {
  message: string;
}

export function AuthLoadingState({ message }: AuthLoadingStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-foreground">{message}</p>
      </div>
    </div>
  );
}
