
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function LoadingAccordion() {
  // Create a loading skeleton UI for the accordion components
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
          <div className="mt-4">
            <Skeleton className="h-[100px] w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
