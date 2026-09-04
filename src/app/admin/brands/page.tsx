import fs from 'fs/promises';
import path from 'path';
import AdminBrandLogosManager from '@/components/AdminBrandLogosManager';
import { BrandEntry } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

export default async function AdminBrandsPage() {
  const filePath = path.join(process.cwd(), 'src/data/brands.json');
  let brands: Record<string, BrandEntry> = {};

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    brands = JSON.parse(fileContent);
  } catch (error) {
    console.error('Failed to load brands data in Admin page:', error);
  }

  return (
    <div className="py-6">
      <AdminBrandLogosManager initialBrands={brands} />
    </div>
  );
}
