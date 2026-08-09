import fs from 'fs/promises';
import path from 'path';
import { Phone } from '@/types/phone';
import AdminPhonesList from '@/components/AdminPhonesList';

export const dynamic = 'force-dynamic';

export default async function AdminPhonesPage() {
  const filePath = path.join(process.cwd(), 'src/data/phones.json');
  let phones: Phone[] = [];

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    phones = JSON.parse(fileContent) as Phone[];
  } catch (error) {
    console.error('Failed to load phones data in Admin page:', error);
  }

  return (
    <div className="py-6">
      <AdminPhonesList initialPhones={phones} />
    </div>
  );
}
