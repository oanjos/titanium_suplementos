import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FLAVOR_PATTERNS: RegExp[] = [
  /\bDOCE\s+DE\s+LEITE\b/g,
  /\bCHOCOLATE\s+BRANCO\b/g,
  /\bCHOCOLATE\b/g,
  /\bCAPPUCCINO\b/g,
  /\bBUTTER\s+COOKIES\b/g,
  /\bCOOKIES\b/g,
  /\bBANOFFEE\b/g,
  /\bBAUNILHA\b/g,
  /\bMORANGO\b/g,
  /\bCOCO\b/g,
  /\bBANANA\b/g,
  /\bNEUTRO\b/g,
  /\bSEM\s+SABOR\b/g,
  /\bSABOR\b/g,
  /\bMILKSHAKE\b/g,
];

const SIZE_PATTERN = /\b\d+(?:[\.,]\d+)?\s*(KG|G|ML|L)\b/g;

function normalizeGroupCode(name: string): string | null {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

  let base = normalized.replace(SIZE_PATTERN, ' ');
  for (const pattern of FLAVOR_PATTERNS) {
    base = base.replace(pattern, ' ');
  }

  base = base.replace(/[^A-Z0-9]+/g, ' ').trim();
  let group = base.replace(/\s+/g, '_');

  // Fallback: if we stripped too much, keep only size removal.
  if (group.length < 4) {
    const fallbackBase = normalized
      .replace(SIZE_PATTERN, ' ')
      .replace(/[^A-Z0-9]+/g, ' ')
      .trim();
    const fallback = fallbackBase.replace(/\s+/g, '_');
    group = fallback;
  }

  if (!group) {
    return null;
  }
  return group;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const force = args.has('--force');
  const dryRun = args.has('--dry-run');

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      groupCode: true,
    },
  });

  const updates: { id: number; groupCode: string }[] = [];
  for (const product of products) {
    if (product.groupCode && !force) {
      continue;
    }
    const groupCode = normalizeGroupCode(product.name);
    if (!groupCode) {
      continue;
    }
    if (dryRun) {
      console.log(`${product.id} ${product.name} -> ${groupCode}`);
      continue;
    }
    updates.push({ id: product.id, groupCode });
  }

  if (!dryRun) {
    const batchSize = 300;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const values = batch
        .map((_, idx) => `($${idx * 2 + 1}::int, $${idx * 2 + 2}::text)`)
        .join(', ');
      const params: (number | string)[] = [];
      for (const item of batch) {
        params.push(item.id, item.groupCode);
      }
      const sql = `
        UPDATE products p
        SET group_code = v.group_code
        FROM (VALUES ${values}) AS v(id, group_code)
        WHERE p.id = v.id
      `;
      await prisma.$executeRawUnsafe(sql, ...params);
    }
    console.log(`Updated ${updates.length} products`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
