import type { GetServerSidePropsContext } from "next";
import Layout from "@/components/Layout";
import TypingTest from "@/components/typing/TypingTest";
import { getPageSession } from "@/lib/server/auth";

export default function Home() {
  return (
    <Layout>
      <TypingTest />
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return { props: { session: await getPageSession(context) } };
}
