
import React from "react";

const TeamFooter = () => (
  <footer className="mt-12 mb-4 text-center text-xs text-gray-500 flex flex-col items-center">
    <hr className="w-32 h-0.5 my-2 bg-gray-200 border-0 rounded" />
    <p className="mb-1">
      <span className="font-semibold text-primary">Document Scanner App</span> &mdash; Using cutting-edge edge detection.<br />
      <span>
        Project by
        <span className="ml-1 font-semibold text-purple-500">Dhup Thumbadiya (23BIT015)</span>,
        <span className="ml-1 font-semibold text-purple-500">Deep Hirapara (23BIT013)</span>,
        <span className="ml-1 font-semibold text-purple-500">Vishal Aidasani (23BIT017)</span>
      </span>
    </p>
    <p className="mt-1">Both Laplacian and Sobel filters are implemented for optimal document processing.</p>
  </footer>
);

export default TeamFooter;
