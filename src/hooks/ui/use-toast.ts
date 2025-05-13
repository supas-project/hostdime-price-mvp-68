
import { useToast as useToastOriginal, toast as originalToast } from "@/hooks/use-toast";

export const useToast = useToastOriginal;
export const toast = originalToast;

export default useToast;
