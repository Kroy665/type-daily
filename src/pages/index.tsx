import Image from "next/image";
import { Inter } from "next/font/google";
import TypingSpeed from "../components/TypingSpeed";
import texts from "@/static/texts";
import Header from "@/components/Header";
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import { sessionType } from "@/types/sessionType";

const inter = Inter({ subsets: ["latin"] });

export default function Home({
  session,
}: {
  session: sessionType;
}) {
  return (
    <>
      <Header 
        session={session}
      />
      <div
        className="w-full mt-20"
      >
        <TypingSpeed />
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  return {
    props: { session },
  };
}

