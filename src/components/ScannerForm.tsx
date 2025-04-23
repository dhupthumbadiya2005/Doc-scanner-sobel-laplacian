
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
  const [edgeMode, setEdgeMode] = useState<string>("laplacian");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
    setBlobUrl(null); // Reset output when new file is chosen
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlobUrl(null);

    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to scan.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedFile.name.endsWith(".pdf")) {
      toast({
        title: "Invalid file type",
        description: "Only PDF files are supported.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("edgemode", edgeMode);

      // Make request to the Flask backend
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      
      toast({
        title: "Success!",
        description: "Your document was processed successfully.",
      });
    } catch (err) {
      toast({
        title: "Processing failed",
        description: err instanceof Error ? err.message : "An error occurred while processing your document.",
        variant: "destructive",
      });
      console.error("Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (blobUrl) {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "scanned_document.pdf";
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
        Upload a PDF. We'll scan and enhance your documents with crisp, clean edge detection!
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
          Choose PDF File
        </label>
        <Input
          id="file-upload"
          type="file"
          accept=".pdf"
          onChange={handleSelectFile}
          disabled={isProcessing}
          ref={fileInputRef}
          className="file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 
            file:text-sm file:font-semibold file:bg-purple-50 file:text-primary"
        />
      </div>

      <Button
        disabled={isProcessing || !selectedFile}
        type="submit"
        className="w-full flex items-center gap-2 justify-center py-2 bg-primary hover:bg-purple-600 transition"
      >
        {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <Upload className="w-5 h-5" />}
        {isProcessing ? "Processing..." : "Upload & Scan"}
      </Button>

      {blobUrl && (
        <div className="flex flex-col items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            className="w-full flex items-center gap-2 justify-center border-primary text-primary font-semibold"
          >
            <Download className="w-5 h-5" /> Download Scanned PDF
          </Button>
          <span className="text-green-700 text-sm">Your scanned file is ready!</span>
        </div>
      )}
      {isProcessing && (
        <div className="flex items-center justify-center mt-2 gap-2">
          <Loader2 className="animate-spin w-5 h-5 text-primary" />
          <span className="text-primary font-medium">Processing your document...</span>
        </div>
      )}
    </form>
  );
};

export default ScannerForm;
