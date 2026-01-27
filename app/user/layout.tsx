import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Bank of America - Online Banking",
  description: "Access your Bank of America accounts securely.",
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
