
import { ComponentOption } from "@/types/component";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { HelpTooltip } from "@/components/help-tooltip";

interface OSContentProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function OSContent({
  options,
  selectedOption,
  onSelectOption
}: OSContentProps) {
  const windowsOptions = options.filter(opt => opt.subtype === "windows");
  const linuxOptions = options.filter(opt => opt.subtype === "linux");
  const virtualizationOptions = options.filter(opt => opt.subtype === "virtualization");
  const unixOptions = options.filter(opt => opt.subtype === "unix");

  return (
    <div className="space-y-6">
      {/* Windows Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Windows Server</h4>
          <HelpTooltip 
            title="Licenças Windows" 
            description="Licenças Windows são cobradas por core" 
          />
        </div>
        <RadioGroup
          value={selectedOption?.id}
          onValueChange={(value) => {
            const option = options.find(opt => opt.id === value);
            if (option) onSelectOption(option);
          }}
          className="grid gap-3"
        >
          {windowsOptions.map((os) => (
            <div key={os.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={os.id} id={os.id} />
                <Label htmlFor={os.id} className="flex flex-col">
                  <span>{os.name}</span>
                  <span className="text-xs text-muted-foreground">{os.description}</span>
                </Label>
              </div>
              <Badge variant="secondary">
                {formatCurrency(os.price)}
              </Badge>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator className="my-6" />

      {/* Linux Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Linux</h4>
        <RadioGroup
          value={selectedOption?.id}
          onValueChange={(value) => {
            const option = options.find(opt => opt.id === value);
            if (option) onSelectOption(option);
          }}
          className="grid gap-3"
        >
          {linuxOptions.map((os) => (
            <div key={os.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={os.id} id={os.id} />
                <Label htmlFor={os.id}>{os.name}</Label>
              </div>
              <Badge variant="secondary">Grátis</Badge>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator className="my-6" />

      {/* Virtualization Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Plataformas de Virtualização</h4>
        <RadioGroup
          value={selectedOption?.id}
          onValueChange={(value) => {
            const option = options.find(opt => opt.id === value);
            if (option) onSelectOption(option);
          }}
          className="grid gap-3"
        >
          {virtualizationOptions.map((os) => (
            <div key={os.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={os.id} id={os.id} />
                <Label htmlFor={os.id}>{os.name}</Label>
              </div>
              <Badge variant="secondary">Grátis</Badge>
            </div>
          ))}
        </RadioGroup>
      </div>

      {unixOptions.length > 0 && (
        <>
          <Separator className="my-6" />
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Unix e Outros</h4>
            <RadioGroup
              value={selectedOption?.id}
              onValueChange={(value) => {
                const option = options.find(opt => opt.id === value);
                if (option) onSelectOption(option);
              }}
              className="grid gap-3"
            >
              {unixOptions.map((os) => (
                <div key={os.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={os.id} id={os.id} />
                    <Label htmlFor={os.id}>{os.name}</Label>
                  </div>
                  <Badge variant="secondary">Grátis</Badge>
                </div>
              ))}
            </RadioGroup>
          </div>
        </>
      )}
    </div>
  );
}
