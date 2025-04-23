
import React from "react";
import ScannerForm from "@/components/ScannerForm";
import TeamFooter from "@/components/TeamFooter";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full text-center mb-8">
        <h1 className="text-4xl font-bold text-purple-800 mb-2">Document Scanner App</h1>
        <p className="text-gray-600">
          Using advanced edge detection algorithms based on Laplacian and Sobel filters
        </p>
      </div>
      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1 md:col-span-2">
            <CardContent className="p-6">
              <ScannerForm />
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">About Edge Detection</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-purple-700">Laplacian Filter</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Detects edges by finding areas with rapid intensity changes using a second-order derivative filter.
                    Creates sharp, defined edges in documents.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-700">Sobel Filter</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Calculates the gradient of image intensity at each pixel, emphasizing edges in both horizontal and
                    vertical directions. Produces softer edges with better noise handling.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <TeamFooter />
    </div>
  );
};

export default Index;
