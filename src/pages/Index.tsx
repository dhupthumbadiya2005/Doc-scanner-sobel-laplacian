
import React from "react";
import ScannerForm from "@/components/ScannerForm";
import TeamFooter from "@/components/TeamFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full text-center mb-8">
        <h1 className="text-4xl font-bold text-purple-800 mb-2">Document Scanner App</h1>
        <p className="text-gray-600">
          Using advanced edge detection algorithms based on Laplacian and Sobel filters
        </p>
      </div>
      <div className="flex-1 w-full flex flex-col justify-center items-center">
        <ScannerForm />
      </div>
      <TeamFooter />
    </div>
  );
};

export default Index;
