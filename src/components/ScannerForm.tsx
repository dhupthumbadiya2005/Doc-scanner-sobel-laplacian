
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ScannerFormProps = {};

const ScannerForm: React.FC<ScannerFormProps> = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [edgeMode, setEdgeMode] = useState<string>("laplacian");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setBlobUrl(null);
    
    // Create preview for image files
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const processImage = (imageData: ImageData, mode: string): ImageData => {
    const { width, height, data } = imageData;
    const result = new Uint8ClampedArray(data.length);
    
    // Convert to grayscale first
    const grayscale = new Uint8ClampedArray(width * height);
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const idx = (i * width + j) * 4;
        const gray = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
        grayscale[i * width + j] = gray;
      }
    }
    
    // Apply edge detection
    for (let i = 1; i < height - 1; i++) {
      for (let j = 1; j < width - 1; j++) {
        const idx = (i * width + j);
        let edgeValue = 0;
        
        if (mode === "laplacian") {
          // Laplacian filter
          edgeValue = 
            -grayscale[(i-1) * width + j] - 
            grayscale[i * width + (j-1)] + 
            4 * grayscale[i * width + j] - 
            grayscale[i * width + (j+1)] - 
            grayscale[(i+1) * width + j];
        } else {
          // Sobel filter
          const gx = 
            -grayscale[(i-1) * width + (j-1)] - 
            2 * grayscale[(i-1) * width + j] - 
            grayscale[(i-1) * width + (j+1)] + 
            grayscale[(i+1) * width + (j-1)] + 
            2 * grayscale[(i+1) * width + j] + 
            grayscale[(i+1) * width + (j+1)];
            
          const gy = 
            -grayscale[(i-1) * width + (j-1)] - 
            2 * grayscale[i * width + (j-1)] - 
            grayscale[(i+1) * width + (j-1)] + 
            grayscale[(i-1) * width + (j+1)] + 
            2 * grayscale[i * width + (j+1)] + 
            grayscale[(i+1) * width + (j+1)];
            
          edgeValue = Math.sqrt(gx * gx + gy * gy);
        }
        
        // Normalize and invert
        edgeValue = Math.min(255, Math.max(0, Math.abs(edgeValue)));
        edgeValue = 255 - edgeValue; // Invert for white background
        
        const outIdx = (i * width + j) * 4;
        result[outIdx] = edgeValue;
        result[outIdx + 1] = edgeValue;
        result[outIdx + 2] = edgeValue;
        result[outIdx + 3] = 255;
      }
    }
    
    // Fill the border pixels
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (i === 0 || i === height - 1 || j === 0 || j === width - 1) {
          const idx = (i * width + j) * 4;
          result[idx] = 255;
          result[idx + 1] = 255;
          result[idx + 2] = 255;
          result[idx + 3] = 255;
        }
      }
    }
    
    return new ImageData(result, width, height);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlobUrl(null);

    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image file to scan.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if file is an image (PDF processing would require a backend)
    if (!selectedFile.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "This demo only supports image files (JPEG, PNG).",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create an image element from the file
      const imageUrl = URL.createObjectURL(selectedFile);
      const img = new Image();
      
      img.onload = () => {
        // Create canvas to process the image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error("Could not create canvas context");
        }
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Process the image
        const processedImageData = processImage(imageData, edgeMode);
        
        // Put processed data back
        ctx.putImageData(processedImageData, 0, 0);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setBlobUrl(url);
            
            toast({
              title: "Success!",
              description: "Your image was processed successfully.",
            });
          }
          setIsProcessing(false);
          
          // Clean up the temporary image URL
          URL.revokeObjectURL(imageUrl);
        }, 'image/png');
      };
      
      img.onerror = () => {
        throw new Error("Failed to load image");
      };
      
      img.src = imageUrl;
      
    } catch (err) {
      toast({
        title: "Processing failed",
        description: err instanceof Error ? err.message : "An error occurred while processing your image.",
        variant: "destructive",
      });
      console.error("Error:", err);
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (blobUrl) {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "scanned_document.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white py-8 px-6 rounded-2xl shadow-md border mx-auto flex flex-col gap-6"
    >
      <h1 className="text-3xl font-bold text-primary mb-2 tracking-tight">Document Scanner</h1>
      <p className="text-gray-500 mb-2">
        Upload an image file. We'll scan and enhance it with crisp, clean edge detection!
      </p>
      <div className="flex flex-col gap-2">
        <label htmlFor="edge-mode" className="font-medium text-gray-700 mb-1">
          Edge Detection Method
        </label>
        <ToggleGroup
          type="single"
          value={edgeMode}
          onValueChange={(value) => value && setEdgeMode(value)}
          className="justify-start"
        >
          <ToggleGroupItem value="laplacian" aria-label="Laplacian filter">
            Laplacian
          </ToggleGroupItem>
          <ToggleGroupItem value="sobel" aria-label="Sobel filter">
            Sobel
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="file-upload" className="font-medium text-gray-700 mb-1">
          Choose Image File
        </label>
        <Input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleSelectFile}
          disabled={isProcessing}
          ref={fileInputRef}
          className="file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 
            file:text-sm file:font-semibold file:bg-purple-50 file:text-primary"
        />
      </div>
      
      {previewUrl && (
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-auto border rounded-md" 
            style={{ maxHeight: '200px', objectFit: 'contain' }}
          />
        </div>
      )}

      <Button
        disabled={isProcessing || !selectedFile}
        type="submit"
        className="w-full flex items-center gap-2 justify-center py-2 bg-primary hover:bg-purple-600 transition"
      >
        {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <Upload className="w-5 h-5" />}
        {isProcessing ? "Processing..." : "Process Image"}
      </Button>

      {blobUrl && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-full border rounded-md overflow-hidden mb-2">
            <img src={blobUrl} alt="Processed" className="w-full h-auto" />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            className="w-full flex items-center gap-2 justify-center border-primary text-primary font-semibold"
          >
            <Download className="w-5 h-5" /> Download Scanned Image
          </Button>
          <span className="text-green-700 text-sm">Your processed image is ready!</span>
        </div>
      )}
      {isProcessing && (
        <div className="flex items-center justify-center mt-2 gap-2">
          <Loader2 className="animate-spin w-5 h-5 text-primary" />
          <span className="text-primary font-medium">Processing your image...</span>
        </div>
      )}
    </form>
  );
};

export default ScannerForm;
