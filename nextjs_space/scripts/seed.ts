import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeamento de imagens de produtos
const productImages = {
  'Whey Protein Chocolate': 'https://s7d2.scene7.com/is/image/VitaminShoppe/1629500_01?$OP_PDPSKU$&wid=450&hei=450',
  'Whey Protein Vanilla': 'https://i5.walmartimages.com/asr/723bea11-9cdd-4bd3-b4d7-d05a95d86b1d.df3919ef895fde5337ad18342f8009cc.jpeg',
  'Whey Protein Strawberry': 'https://vitaminwhey.com/cdn/shop/files/VitWhey-Strawberry-Front.png?v=1722025105&width=1200',
  'Whey Protein Cookies & Cream': 'https://www.gnc.com/dw/image/v2/BBLB_PRD/on/demandware.static/-/Sites-master-catalog-gnc/default/dwd43858a6/hi-res/350253_ON_100_WGS_GF_COOKIES_&_CREAM_1.85LB_Front.jpg?sw=89&sh=89&sm=fit',
  'Creatine Monohydrate': 'https://www.kroger.com/product/images/xlarge/front/0081001467573',
  'Creatine Creapure': 'https://m.media-amazon.com/images/I/71jIy2l-lwL._AC_UF350,350_QL80_.jpg',
  'Pre-Workout C4': 'https://m.media-amazon.com/images/I/81eBhpRg30L._AC_UF1000,1000_QL80_.jpg',
  'Pre-Workout Fruit Punch': 'https://www.gnc.com/dw/image/v2/BBLB_PRD/on/demandware.static/-/Sites-master-catalog-gnc/default/dw17024ab1/hi-res/369923_Beyond_Raw_LIT_Fruit_Punch_Tub_Front.jpg?sw=89&sh=89&sm=fit',
  'BCAA Powder': 'https://nutricost.com/cdn/shop/files/NTCP_BCAA_Watermelon_30SERV_20OZ_Front1_Square_1200x1200.jpg?v=1760719437',
  'BCAA Capsules': 'https://www.gnc.com/dw/image/v2/BBLB_PRD/on/demandware.static/-/Sites-master-catalog-gnc/default/dw54a0c5c3/hi-res/352330_1.jpg?sw=89&sh=89&sm=fit',
  'Protein Bar Chocolate': 'https://theanabar.com/cdn/shop/files/Triple_Chocolate_Wrapper_659a80d1-880a-40e1-8415-e839048094ba.png?v=1738378003&width=2000',
  'Protein Bar Peanut Butter': 'https://www.questnutrition.com/cdn/shop/files/400094_QN_USA_Pkg_Crispy_ProteinBar_CPB_Wrapper_3D_Front_Force.png?v=1760475393&width=1080',
  'Protein Bar Cookie Dough': 'https://s7d1.scene7.com/is/image/hersheyprodcloud/7_88434_10881_2_776_10883_004_Item_Front?fmt=webp-alpha&hei=908&qlt=75',
  'Glutamine Powder': 'https://m.media-amazon.com/images/I/61gkyc9Iw6L._AC_UF1000,1000_QL80_.jpg',
  'Mass Gainer Chocolate': 'https://www.gnc.com/dw/image/v2/BBLB_PRD/on/demandware.static/-/Sites-master-catalog-gnc/default/dwe69ed363/hi-res/2000px%20wide%20JPG/549011_RedCon1_Mass_Gainer_Chocolate_Tub_Front.jpg?sw=480&sh=480&sm=fit',
};

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.discountCode.deleteMany();

  console.log('✅ Dados anteriores removidos');

  // Criar produtos com variantes
  const products = [
    {
      name: 'Whey Protein Gold Standard',
      description: 'O Whey Protein mais premiado do mundo. 24g de proteína por dose, rico em aminoácidos essenciais e BCAAs naturais. Ideal para recuperação muscular e ganho de massa magra. Fácil dissolução e sabor excepcional.',
      category: 'Whey Protein',
      brand: 'Optimum Nutrition',
      price: 189.90,
      imageUrl: productImages['Whey Protein Chocolate'],
      stockType: 'pronta_entrega',
      variants: [
        { name: 'Chocolate 900g', sku: 'WP-GS-CHO-900', additionalPrice: 0, stockQuantity: 50 },
        { name: 'Chocolate 2.2kg', sku: 'WP-GS-CHO-2200', additionalPrice: 110, stockQuantity: 30 },
        { name: 'Baunilha 900g', sku: 'WP-GS-VAN-900', additionalPrice: 0, stockQuantity: 45 },
        { name: 'Baunilha 2.2kg', sku: 'WP-GS-VAN-2200', additionalPrice: 110, stockQuantity: 25 },
      ],
    },
    {
      name: 'Whey Protein Isolado Premium',
      description: 'Whey Protein Isolado com 90% de proteína pura. Zero lactose, zero gordura, zero açúcar. Absorção ultra-rápida, perfeito para pós-treino imediato. Máxima pureza e biodisponibilidade.',
      category: 'Whey Protein',
      brand: 'Dymatize',
      price: 219.90,
      imageUrl: productImages['Whey Protein Vanilla'],
      stockType: 'pronta_entrega',
      variants: [
        { name: 'Baunilha 900g', sku: 'WPI-DY-VAN-900', additionalPrice: 0, stockQuantity: 35 },
        { name: 'Chocolate 900g', sku: 'WPI-DY-CHO-900', additionalPrice: 0, stockQuantity: 40 },
      ],
    },
    {
      name: 'Whey Protein Morango',
      description: 'Whey Protein concentrado com delicioso sabor de morango. 23g de proteína por dose, excelente custo-benefício. Perfeito para quem busca qualidade e economia na suplementação diária.',
      category: 'Whey Protein',
      brand: 'VitWhey',
      price: 149.90,
      imageUrl: productImages['Whey Protein Strawberry'],
      stockType: 'sob_encomenda',
      variants: [
        { name: 'Morango 1kg', sku: 'WP-VW-STR-1000', additionalPrice: 0, stockQuantity: 20 },
        { name: 'Morango 2kg', sku: 'WP-VW-STR-2000', additionalPrice: 80, stockQuantity: 15 },
      ],
    },
    {
      name: 'Whey Protein Cookies & Cream',
      description: 'Sabor incrível de cookies com creme! 24g de proteína, baixo carboidrato e gordura. Dissolução instantânea e textura cremosa. O sabor favorito dos atletas de elite.',
      category: 'Whey Protein',
      brand: 'Optimum Nutrition',
      price: 199.90,
      imageUrl: productImages['Whey Protein Cookies & Cream'],
      stockType: 'pronta_entrega',
      variants: [
        { name: 'Cookies 900g', sku: 'WP-ON-COO-900', additionalPrice: 0, stockQuantity: 42 },
        { name: 'Cookies 2.2kg', sku: 'WP-ON-COO-2200', additionalPrice: 120, stockQuantity: 28 },
      ],
    },
    {
      name: 'Creatina Monohidratada Pura',
      description: 'Creatina 100% pura, micronizada para melhor absorção. Aumenta força, potência e volume muscular. Sem sabor, pode ser misturada com qualquer bebida. Certificada e testada em laboratório.',
      category: 'Creatina',
      brand: 'Universal',
      price: 79.90,
      imageUrl: productImages['Creatine Monohydrate'],
      stockType: 'pronta_entrega',
      variants: [
        { name: 'Sem Sabor 150g', sku: 'CRE-UN-MONO-150', additionalPrice: 0, stockQuantity: 80 },
        { name: 'Sem Sabor 300g', sku: 'CRE-UN-MONO-300', additionalPrice: 40, stockQuantity: 60 },
      ],
    },
    {
      name: 'Creatina Creapure® Premium',
      description: 'A creatina alemã mais pura do mundo! Creapure® certificada, sem impurezas. Máxima eficácia comprovada cientificamente. A escolha dos profissionais que buscam resultados superiores.',
      category: 'Creatina',
      brand: 'AlzChem',
      price: 119.90,
      imageUrl: productImages['Creatine Creapure'],
      stockType: 'sob_encomenda',
      variants: [
        { name: 'Creapure 200g', sku: 'CRE-CP-200', additionalPrice: 0, stockQuantity: 25 },
        { name: 'Creapure 400g', sku: 'CRE-CP-400', additionalPrice: 60, stockQuantity: 18 },
      ],
    },
    {
      name: 'Pré-Treino C4 Original',
      description: 'O pré-treino mais vendido do mundo! Energia explosiva, foco mental intenso e pump muscular. Com beta-alanina, cafeína e arginina. Sinta a diferença desde a primeira dose.',
      category: 'Pré-Treino',
      brand: 'Cellucor',
      price: 139.90,
      imageUrl: productImages['Pre-Workout C4'],
      stockType: 'pronta_entrega',
      variants: [
        { name: 'Icy Blue Razz 30 doses', sku: 'PRE-C4-IBR-30', additionalPrice: 0, stockQuantity: 45 },
        { name: 'Icy Blue Razz 60 doses', sku: 'PRE-C4-IBR-60', additionalPrice: 80, stockQuantity: 30 },
      ],
    },
    {
      name: 'Pré-Treino Fruit Punch',
      description: 'Explosão de energia com sabor tropical! Fórmula avançada com cafeína, beta-alanina e citrulina. Aumenta resistência, força e vascularização. Prepare-se para treinos intensos!',
      category: 'Pré-Treino',
      brand: 'Beyond Raw',
      price: 129.90,
      imageUrl: productImages['Pre-Workout Fruit Punch'],
      stockType: 'pronta_entrega',
      variants: [
        { name: 'Fruit Punch 30 doses', sku: 'PRE-BR-FP-30', additionalPrice: 0, stockQuantity: 38 },
        { name: 'Fruit Punch 60 doses', sku: 'PRE-BR-FP-60', additionalPrice: 75, stockQuantity: 22 },
      ],
    },
    {
      name: 'BCAA Powder 2:1:1',
      description: 'Aminoácidos essenciais na proporção ideal 2:1:1. Reduz fadiga muscular, acelera recuperação e previne catabolismo. Sabor melancia refrescante, dissolução perfeita.',
      category: 'BCAA',
      brand: 'Nutricost',
      price: 89.90,
      imageUrl: productImages['BCAA Powder'],
      stockType: 'sob_encomenda',
      variants: [
        { name: 'Melancia 200g (30 doses)', sku: 'BCAA-NC-WM-200', additionalPrice: 0, stockQuantity: 35 },
        { name: 'Melancia 400g (60 doses)', sku: 'BCAA-NC-WM-400', additionalPrice: 50, stockQuantity: 25 },
      ],
    },
    {
      name: 'BCAA Cápsulas Ultra',
      description: 'Praticidade máxima em cápsulas! BCAA 2:1:1 concentrado, sem sabor, sem mistura. Ideal para levar na academia, trabalho ou viagem. Absorção rápida e eficaz.',
      category: 'BCAA',
      brand: 'GNC',
      price: 79.90,
      imageUrl: productImages['BCAA Capsules'],
      stockType: 'pronta_entrega',
      variants: [
        { name: '90 Cápsulas', sku: 'BCAA-GNC-CAP-90', additionalPrice: 0, stockQuantity: 50 },
        { name: '180 Cápsulas', sku: 'BCAA-GNC-CAP-180', additionalPrice: 45, stockQuantity: 35 },
      ],
    },
    {
      name: 'Barra de Proteína Triple Chocolate',
      description: 'Explosão de chocolate em cada mordida! 20g de proteína, baixo açúcar, textura macia. Snack perfeito pré ou pós-treino. Sabor de sobremesa com benefícios de suplemento.',
      category: 'Barras de Proteína',
      brand: 'Ana Bar',
      price: 8.90,
      imageUrl: productImages['Protein Bar Chocolate'],
      stockType: 'pronta_entrega',
      variants: [
        { name: 'Unidade', sku: 'BAR-ANA-TCHOC-1', additionalPrice: 0, stockQuantity: 200 },
        { name: 'Caixa 12un', sku: 'BAR-ANA-TCHOC-12', additionalPrice: 90, stockQuantity: 40 },
      ],
    },
    {
      name: 'Barra de Proteína Peanut Butter',
      description: 'Cremoso sabor de pasta de amendoim! 21g de proteína, rica em fibras. Crocante por fora, macia por dentro. Energia sustentada para o dia todo. Sem glúten.',
      category: 'Barras de Proteína',
      brand: 'Quest',
      price: 9.90,
      imageUrl: productImages['Protein Bar Peanut Butter'],
      stockType: 'pronta_entrega',
      variants: [
        { name: 'Unidade', sku: 'BAR-QST-PB-1', additionalPrice: 0, stockQuantity: 180 },
        { name: 'Caixa 12un', sku: 'BAR-QST-PB-12', additionalPrice: 100, stockQuantity: 35 },
      ],
    },
    {
      name: 'Barra de Proteína Cookie Dough',
      description: 'Sabor irresistível de massa de cookie! 15g de proteína, zero culpa. Textura única com pedaços de chocolate. Perfeita para saciar a vontade de doce com nutrição.',
      category: 'Barras de Proteína',
      brand: "Reese's",
      price: 7.90,
      imageUrl: productImages['Protein Bar Cookie Dough'],
      stockType: 'sob_encomenda',
      variants: [
        { name: 'Unidade', sku: 'BAR-REE-CD-1', additionalPrice: 0, stockQuantity: 150 },
        { name: 'Caixa 12un', sku: 'BAR-REE-CD-12', additionalPrice: 85, stockQuantity: 30 },
      ],
    },
    {
      name: 'Glutamina Ultra Pure',
      description: 'L-Glutamina 100% pura para recuperação muscular e imunidade. Favorece síntese proteica e saúde intestinal. Sem sabor, fácil mistura. Essencial para treinos intensos.',
      category: 'Aminoácidos',
      brand: 'Optimum Nutrition',
      price: 99.90,
      imageUrl: productImages['Glutamine Powder'],
      stockType: 'pronta_entrega',
      variants: [
        { name: 'Sem Sabor 300g', sku: 'GLU-ON-300', additionalPrice: 0, stockQuantity: 45 },
        { name: 'Sem Sabor 600g', sku: 'GLU-ON-600', additionalPrice: 60, stockQuantity: 30 },
      ],
    },
    {
      name: 'Mass Gainer Serious Mass',
      description: 'Hipercalórico para ganho de peso! 1250 calorias e 50g de proteína por dose. Rico em carboidratos complexos e MCTs. Para quem tem dificuldade em ganhar massa muscular.',
      category: 'Hipercalóricos',
      brand: 'RedCon1',
      price: 159.90,
      imageUrl: productImages['Mass Gainer Chocolate'],
      stockType: 'sob_encomenda',
      variants: [
        { name: 'Chocolate 3kg', sku: 'MG-RC1-CHO-3000', additionalPrice: 0, stockQuantity: 20 },
        { name: 'Chocolate 6kg', sku: 'MG-RC1-CHO-6000', additionalPrice: 90, stockQuantity: 12 },
      ],
    },
  ];

  console.log('🔨 Criando produtos e variantes...');

  for (const product of products) {
      const variants = product.variants || [];
      const sku = variants[0]?.sku || null;
      const stockAvailable = variants.reduce(
        (sum: number, v: any) => sum + (v?.stockQuantity || 0),
        0
      );
      const { variants: _variants, ...productData } = product;
      const createdProduct = await prisma.product.create({
        data: {
          ...productData,
          stockType: productData.stockType as any,
          sku,
          stockAvailable,
        },
      });
    console.log(`✅ Produto criado: ${createdProduct.name}`);
  }

  // Criar cupons de desconto
  const now = new Date();
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3); // Válido por 3 meses

  const discountCodes = [
    {
      code: 'PRIMEIRA10',
      discountType: 'percentage' as const,
      discountValue: 10,
      minPurchase: 100,
      maxUses: 100,
      validFrom: now,
      validUntil: futureDate,
      active: true,
    },
    {
      code: 'PERSONAL15',
      discountType: 'percentage' as const,
      discountValue: 15,
      minPurchase: 200,
      maxUses: 50,
      validFrom: now,
      validUntil: futureDate,
      active: true,
    },
    {
      code: 'PROMO20',
      discountType: 'fixed' as const,
      discountValue: 20,
      minPurchase: 150,
      maxUses: 200,
      validFrom: now,
      validUntil: futureDate,
      active: true,
    },
    {
      code: 'FITNESS50',
      discountType: 'fixed' as const,
      discountValue: 50,
      minPurchase: 300,
      maxUses: 30,
      validFrom: now,
      validUntil: futureDate,
      active: true,
    },
  ];

  console.log('\n🎟️  Criando cupons de desconto...');

  for (const discount of discountCodes) {
    const createdDiscount = await prisma.discountCode.create({
      data: discount,
    });
    console.log(`✅ Cupom criado: ${createdDiscount.code} - ${createdDiscount.discountType === 'percentage' ? createdDiscount.discountValue + '%' : 'R$ ' + createdDiscount.discountValue}`);
  }

  console.log('\n✨ Seed concluído com sucesso!');
  console.log(`📦 Total de produtos: ${products.length}`);
  console.log(`🎟️  Total de cupons: ${discountCodes.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
