import React from "react";
import Image from "next/image";




export default function Header() {
  return (
    <div className="fixed top-0 left-0 w-full h-20 bg-white flex items-center">
      <Image src="/LOGO.svg" alt="logo" width={40} height={40} className="ml-10" />
      <h1 className="text-3xl font-bold ml-2">AI sheet</h1>
    </div>
  );
}
