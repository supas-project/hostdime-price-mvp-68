
import { useToast as useToastOriginal } from "@/components/ui/use-toast";
import { toast as originalToast } from "@/components/ui/use-toast";

export const useToast = useToastOriginal;
export const toast = originalToast;

export default useToast;
