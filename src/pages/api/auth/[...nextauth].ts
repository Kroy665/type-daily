import NextAuth from "next-auth";
import authOptions from "@/lib/authOptions";
import { NextApiRequest, NextApiResponse } from 'next'

export default (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, authOptions)

