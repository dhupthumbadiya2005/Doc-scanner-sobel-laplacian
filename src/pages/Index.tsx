
// Beautiful, modern document scanner landing page (single-page app)
import React from "react";
import ScannerForm from "@/components/ScannerForm";
import TeamFooter from "@/components/TeamFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex flex-col items-center justify-center px-4">
      <div className="flex-1 w-full flex flex-col justify-center items-center">
        <ScannerForm />
      </div>
      <TeamFooter />
    </div>
  );
};

export default Index;
