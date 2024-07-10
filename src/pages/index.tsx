import Image from "next/image";
import { Inter } from "next/font/google";
import TypingSpeed from "../components/TypingSpeed";
import texts from "@/static/texts";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {



  return (
    <>
      <Header />
      <div
        className="w-full mt-20"
      >
        <TypingSpeed />
      </div>
    </>
  );
}
