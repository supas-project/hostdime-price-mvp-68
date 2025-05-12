
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Tag, Plus, Check } from "lucide-react";

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  defaultTags?: string[]; // Common tags to suggest
}

export function TagSelector({ value = [], onChange, defaultTags = ["Hardware"] }: TagSelectorProps) {
  const [newTag, setNewTag] = useState("");
  const [showInput, setShowInput] = useState(false);
  
  // Combine selected tags and default tags for display
  const availableTags = Array.from(new Set([...defaultTags, ...value]));
  
  // Add a tag
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    
    if (!value.includes(trimmedTag)) {
      const updatedTags = [...value, trimmedTag];
      onChange(updatedTags);
    }
    
    setNewTag("");
    setShowInput(false);
  };
  
  // Remove a tag
  const removeTag = (tag: string) => {
    const updatedTags = value.filter(t => t !== tag);
    onChange(updatedTags);
  };
  
  // Toggle a tag selection
  const toggleTag = (tag: string, isChecked: boolean) => {
    if (isChecked && !value.includes(tag)) {
      onChange([...value, tag]);
    } else if (!isChecked && value.includes(tag)) {
      onChange(value.filter(t => t !== tag));
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {/* Selected Tags */}
        {value.map(tag => (
          <Badge 
            key={tag} 
            variant={tag === "Hardware" ? "outline" : "default"}
            className={tag === "Hardware" ? "bg-blue-500/10 text-blue-500 border-blue-200" : ""}
          >
            <Tag className="w-3 h-3 mr-1" />
            {tag}
            <button 
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        
        {/* Add new tag button/input */}
        {showInput ? (
          <div className="flex items-center gap-1">
            <Input
              type="text"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              placeholder="Nova tag..."
              className="h-7 text-xs w-24"
              onKeyPress={e => {
                if (e.key === 'Enter') addTag(newTag);
              }}
            />
            <Button 
              type="button" 
              size="sm" 
              variant="ghost" 
              className="h-7 w-7 p-0"
              onClick={() => addTag(newTag)}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button 
              type="button" 
              size="sm" 
              variant="ghost" 
              className="h-7 w-7 p-0"
              onClick={() => {
                setNewTag("");
                setShowInput(false);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button 
            type="button"
            size="sm"
            variant="outline"
            className="h-7 flex items-center text-xs"
            onClick={() => setShowInput(true)}
          >
            <Plus className="h-3 w-3 mr-1" /> Adicionar
          </Button>
        )}
      </div>
      
      {/* Available Tags */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {availableTags.map(tag => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox 
                id={`tag-${tag}`}
                checked={value.includes(tag)}
                onCheckedChange={(checked) => toggleTag(tag, checked === true)}
              />
              <label 
                htmlFor={`tag-${tag}`}
                className="text-sm cursor-pointer select-none"
              >
                {tag}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
