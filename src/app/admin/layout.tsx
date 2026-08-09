import { cookies } from 'next/headers';
import AdminLogin from '@/components/AdminLogin';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('admin_session')?.value === 'true';

  if (!isAdmin) {
    return <AdminLogin />;
  }

  return (
    <div className="w-full min-h-[80vh] flex flex-col gap-6 animate-slide-up">
      {children}
    </div>
  );
}
