import fs from 'fs/promises';
import path from 'path';
import { Phone } from '@/types/phone';
import PhoneForm from '@/components/PhoneForm';

export const dynamic = 'force-dynamic';

export default async function NewPhonePage() {
  const filePath = path.join(process.cwd(), 'src/data/phones.json');
  let allPhones: Phone[] = [];

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    allPhones = JSON.parse(fileContent) as Phone[];
  } catch (error) {
    console.error('Failed to load phones data in New Phone page:', error);
  }

  return (
    <div className="py-6">
      <PhoneForm allPhones={allPhones} />
    </div>
  );
}
