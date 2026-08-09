import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';
import { Phone } from '@/types/phone';
import PhoneForm from '@/components/PhoneForm';

export const dynamic = 'force-dynamic';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPhonePage({ params }: EditPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const filePath = path.join(process.cwd(), 'src/data/phones.json');
  let allPhones: Phone[] = [];

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    allPhones = JSON.parse(fileContent) as Phone[];
  } catch (error) {
    console.error('Failed to load phones data in Edit Phone page:', error);
  }

  // Find the specific phone being edited
  const phone = allPhones.find((p) => p.id === id);

  if (!phone) {
    notFound();
  }

  return (
    <div className="py-6">
      <PhoneForm initialPhone={phone} allPhones={allPhones} />
    </div>
  );
}
