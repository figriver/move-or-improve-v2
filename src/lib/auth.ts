import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
        });

        if (!admin || !admin.isActive) {
          throw new Error('Admin not found or inactive');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          admin.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        // Update last login
        await prisma.admin.update({
          where: { id: admin.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 7 * 24 * 60 * 60,
  },

  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },

    async signIn() {
      return true;
    },
  },

  events: {
    async signIn({ user }) {
      console.log(`Admin signed in: ${user.email}`);
    },
    async signOut() {
      console.log(`Admin signed out`);
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

/**
 * Check if user is admin
 */
export function isAdmin(role?: string): boolean {
  return role === 'ADMIN';
}

/**
 * Check if user is editor or admin
 */
export function isEditor(role?: string): boolean {
  return role === 'EDITOR' || role === 'ADMIN';
}
