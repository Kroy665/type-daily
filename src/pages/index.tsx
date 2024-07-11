import Image from "next/image";
import { Inter } from "next/font/google";
import TypingSpeed from "../components/TypingSpeed";
import texts from "@/static/texts";
import Header from "@/components/Header";
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import { sessionType } from "@/types/sessionType";
import Layout from "@/components/Layout";

const inter = Inter({ subsets: ["latin"] });

export default function Home({
  session,
}: {
  session: sessionType;
}) {
  return (
    <Layout session={session}>
        <TypingSpeed />
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  return {
    props: { session },
  };
}

