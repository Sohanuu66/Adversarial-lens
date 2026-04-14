import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, X, ImageIcon, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 20, y: -20, opacity: 0.9 },
};

const secondaryVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const FileUpload = ({
  onChange,
  onRandomSample,
}: {
  onChange?: (file: File) => void;
  onRandomSample?: () => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFile(newFiles[0]);
      onChange?.(newFiles[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <motion.div
        whileHover="animate"
        className="p-8 group block rounded-xl border border-dashed border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:bg-accent/50 transition-colors w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
        />
        
        <div className="flex flex-col items-center justify-center p-4" onClick={handleClick}>
             {!file && (
                 <>
                    <Upload className="w-10 h-10 text-muted-foreground mb-4 group-hover:text-primary transition-colors" />
                    <p className="relative z-20 text-base font-bold text-foreground">
                        Upload image
                    </p>
                    <p className="relative z-20 mt-2 text-sm text-muted-foreground text-center">
                        Drag or drop your file here or click to browse. Let us resize it automatically.
                    </p>
                 </>
             )}
             
             {file && (
                  <div className="relative z-20 flex w-full flex-col items-center justify-center space-y-4">
                       <ImageIcon className="w-12 h-12 text-primary" />
                       <div className="flex w-full items-center justify-between rounded-md bg-background px-4 py-3 shadow border border-border">
                            <span className="truncate text-sm font-medium pr-4">{file.name}</span>
                            <Button size="icon" variant="ghost" onClick={handleClear} className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive">
                                 <X className="h-4 w-4" />
                            </Button>
                       </div>
                  </div>
             )}
        </div>
      </motion.div>
      
      {onRandomSample && !file && (
          <div className="flex items-center justify-center mt-4">
              <span className="text-muted-foreground text-sm mr-4">Or try a CIFAR-10 example:</span>
              <Button variant="secondary" size="sm" onClick={onRandomSample}>
                  <Shuffle className="w-4 h-4 mr-2" />
                  Random Sample
              </Button>
          </div>
      )}
    </div>
  );
};
