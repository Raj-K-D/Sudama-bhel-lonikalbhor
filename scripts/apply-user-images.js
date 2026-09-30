const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../assets/img');
const destDir = path.resolve(__dirname, '../public/images/menu');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Map each asset file to a clean web filename in public/images/menu/
const fileMappings = [
  { src: 'Batata Bhaj.jpg', dest: 'batata-bhaji.jpg' },
  { src: 'Batata Vada Sambar.jpg', dest: 'batata-vada-sambar.jpg' },
  { src: 'Batata Vada Sample.jpg', dest: 'batata-vada-sample.jpg' },
  { src: 'black tea.webp', dest: 'black-tea.webp' },
  { src: 'Butter Pav.jpg', dest: 'butter-pav.jpg' },
  { src: 'Buttermilk - Taak.jpg', dest: 'buttermilk-taak.jpg' },
  { src: 'cheese chocolate piza.jpg', dest: 'cheese-chocolate-pizza.jpg' },
  { src: 'Cheese Cut Dosa.webp', dest: 'cheese-cut-dosa.webp' },
  { src: 'Cheese Garlic Bread.jpg', dest: 'cheese-garlic-bread.jpg' },
  { src: 'Cheese Masala Dosa.jpg', dest: 'cheese-masala-dosa.jpg' },
  { src: 'Cheese Paneer Pizza.jpg', dest: 'cheese-paneer-pizza.jpg' },
  { src: 'cheese Pav Bhaji.jpg', dest: 'cheese-pav-bhaji.jpg' },
  { src: 'Cheese Pizza.jpg', dest: 'cheese-pizza.jpg' },
  { src: 'Cheese Shev Puri.jpg', dest: 'cheese-shev-puri.jpg' },
  { src: 'Cheese Vada Pav.webp', dest: 'cheese-vada-pav.webp' },
  { src: 'Chocolate Milkshake.jpg', dest: 'chocolate-milkshake.jpg' },
  { src: 'corn pizza.jpg', dest: 'cheese-corn-pizza.jpg' },
  { src: 'Cut Dosa.jpg', dest: 'cut-dosa.jpg' },
  { src: 'Idli chutney.jpg', dest: 'idli-chutney.jpg' },
  { src: 'Idli Sambar.webp', dest: 'idli-sambar.webp' },
  { src: 'lemon tea.jpg', dest: 'lemon-tea.jpg' },
  { src: 'Masala Dosa.jpg', dest: 'masala-dosa.jpg' },
  { src: 'masala-puri.jpg', dest: 'masala-puri.jpg' },
  { src: 'mutki bhel.jpg', dest: 'matki-bhel.jpg' },
  { src: 'Oli Bhel.avif', dest: 'oli-bhel.avif' },
  { src: 'Paneer Burger.jpg', dest: 'paneer-burger.jpg' },
  { src: 'Paneer shezwan Burger.jpeg', dest: 'paneer-shezwan-burger.jpeg' },
  { src: 'Paneer Shezwan Cheese Burger.jpg', dest: 'paneer-shezwan-cheese-burger.jpg' },
  { src: 'Pav Bhaji.jpg', dest: 'pav-bhaji.jpg' },
  { src: 'Peri-Peri Masala cheese Fries.jpg', dest: 'peri-peri-masala-cheese-fries.jpg' },
  { src: 'Peri-Peri Masala Fries.jpg', dest: 'peri-peri-masala-fries.jpg' },
  { src: 'Pohe Sambar.jpg', dest: 'pohe-sambar.jpg' },
  { src: 'Pohe Sample.webp', dest: 'pohe-sample.webp' },
  { src: 'Ragda Pattice.jpg', dest: 'ragda-pattice.jpg' },
  { src: 'ragda puri.jpg', dest: 'ragda-puri.jpg' },
  { src: 'Single Pav.jpg', dest: 'single-pav.jpg' },
  { src: 'Special Matki Bhel.avif', dest: 'special-matki-bhel.avif' },
  { src: 'sudama special pizza.jpg', dest: 'sudama-special-pizza.jpg' },
  { src: 'suki bhel.jpg', dest: 'suki-bhel.jpg' },
  { src: 'Tea (Cutting).jpg', dest: 'tea-cutting.jpg' },
  { src: 'Tea (full).webp', dest: 'tea-full.webp' },
  { src: 'Thick Chocolate milkshake with Crush.jpg', dest: 'thick-chocolate-milkshake-crush.jpg' },
  { src: 'Thick Chocolate Milkshake.jpg', dest: 'thick-chocolate-milkshake.jpg' },
  { src: 'Thick Cold Coffee with Crush.jpg', dest: 'thick-cold-coffee-crush.jpg' },
  { src: 'Thick Cold Coffee.jpg', dest: 'thick-cold-coffee.jpg' },
  { src: 'Upma.webp', dest: 'upma.webp' },
  { src: 'Veg Burger.jpg', dest: 'veg-burger.jpg' },
  { src: 'Veg Cheese Burger.jpg', dest: 'veg-cheese-burger.jpg' },
  { src: 'Veg Cheese Grilled Corn Sandwich.avif', dest: 'veg-cheese-grilled-corn-sandwich.avif' },
  { src: 'Veg Cheese Grilled Sandwich.jpg', dest: 'veg-cheese-grilled-sandwich.jpg' },
  { src: 'Veg cheese shezwan Burger.jpg', dest: 'veg-cheese-shezwan-burger.jpg' },
  { src: 'Veg Grilled Sandwich.jpg', dest: 'veg-grilled-sandwich.jpg' },
  { src: 'veg pizza.jpg', dest: 'veg-pizza.jpg' },
  { src: 'Veg Sandwich.jpg', dest: 'veg-sandwich.jpg' },
  { src: 'Veg shezwan Burger.jpg', dest: 'veg-shezwan-burger.jpg' },
  { src: 'Veg Tikki Burger.jpg', dest: 'veg-tikki-burger.jpg' },
];

console.log('Copying user images to public/images/menu/ ...');
fileMappings.forEach(({ src, dest }) => {
  const srcPath = path.join(srcDir, src);
  const destPath = path.join(destDir, dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ Copied: ${src} -> ${dest}`);
  } else {
    console.warn(`✗ Not found: ${src}`);
  }
});

// Item ID to new Image URL mapping
const itemImageMap = {
  // 1. Bhel & Chaat
  'bhel_1': '/images/menu/pani-puri.jpg',
  'bhel_2': '/images/menu/masala-puri.jpg',
  'bhel_3': '/images/menu/sev-puri.jpg',
  'bhel_4': '/images/menu/dahi-puri.jpg',
  'bhel_5': '/images/menu/ragda-puri.jpg',
  'bhel_6': '/images/menu/cheese-shev-puri.jpg',
  'bhel_7': '/images/menu/oli-bhel.avif',
  'bhel_8': '/images/menu/suki-bhel.jpg',
  'bhel_9': '/images/menu/matki-bhel.jpg',
  'bhel_10': '/images/menu/dahi-puri.jpg',
  'bhel_11': '/images/menu/cheese-shev-puri.jpg',
  'bhel_12': '/images/menu/ragda-pattice.jpg',
  'bhel_13': '/images/menu/special-matki-bhel.avif',

  // 2. Breakfast & Snacks
  'snk_1': '/images/menu/pohe.jpg',
  'snk_2': '/images/menu/pohe-sambar.jpg',
  'snk_3': '/images/menu/pohe-sample.webp',
  'snk_4': '/images/menu/upma.webp',
  'snk_5': '/images/menu/sheera.jpg',
  'snk_6': '/images/menu/vada-pav.jpg',
  'snk_7': '/images/menu/cheese-vada-pav.webp',
  'snk_8': '/images/menu/bread-pattice.jpg',
  'snk_9': '/images/menu/kanda-bhaji.jpg',
  'snk_10': '/images/menu/batata-bhaji.jpg',
  'snk_11': '/images/menu/misal-pav.jpg',
  'snk_12': '/images/menu/pav-bhaji.jpg',
  'snk_13': '/images/menu/cheese-pav-bhaji.jpg',
  'snk_14': '/images/menu/batata-vada-sambar.jpg',
  'snk_15': '/images/menu/batata-vada-sample.jpg',
  'snk_16': '/images/menu/idli-sambar.webp',
  'snk_17': '/images/menu/idli-chutney.jpg',
  'snk_18': '/images/menu/medu-vada.jpg',
  'snk_19': '/images/menu/medu-vada.jpg',
  'snk_20': '/images/menu/butter-pav.jpg',
  'snk_21': '/images/menu/single-pav.jpg',
  'snk_22': '/images/menu/sabudana-vada.jpg',

  // 3. South Indian
  'sth_1': '/images/menu/plain-dosa.jpg',
  'sth_2': '/images/menu/masala-dosa.jpg',
  'sth_3': '/images/menu/uttapam.jpg',
  'sth_4': '/images/menu/dosa-plate.jpg',
  'sth_5': '/images/menu/cut-dosa.jpg',
  'sth_6': '/images/menu/plain-dosa.jpg',
  'sth_7': '/images/menu/cheese-masala-dosa.jpg',
  'sth_8': '/images/menu/uttapam.jpg',
  'sth_9': '/images/menu/dosa-plate.jpg',
  'sth_10': '/images/menu/cheese-cut-dosa.webp',

  // 4. Pizza
  'piz_1': '/images/menu/cheese-pizza.jpg',
  'piz_2': '/images/menu/veg-pizza.jpg',
  'piz_3': '/images/menu/cheese-corn-pizza.jpg',
  'piz_4': '/images/menu/cheese-paneer-pizza.jpg',
  'piz_5': '/images/menu/sudama-special-pizza.jpg',
  'piz_6': '/images/menu/cheese-garlic-bread.jpg',
  'piz_7': '/images/menu/cheese-chocolate-pizza.jpg',

  // 5. Sandwich
  'sw_1': '/images/menu/veg-sandwich.jpg',
  'sw_2': '/images/menu/veg-cheese-grilled-sandwich.jpg',
  'sw_3': '/images/menu/veg-grilled-sandwich.jpg',
  'sw_4': '/images/menu/veg-cheese-grilled-sandwich.jpg',
  'sw_5': '/images/menu/veg-cheese-grilled-corn-sandwich.avif',
  'sw_6': '/images/menu/chocolate-sandwich.jpg',
  'sw_7': '/images/menu/cheese-chocolate-pizza.jpg',

  // 6. Burger
  'bg_1': '/images/menu/veg-tikki-burger.jpg',
  'bg_2': '/images/menu/veg-burger.jpg',
  'bg_3': '/images/menu/veg-cheese-burger.jpg',
  'bg_4': '/images/menu/veg-shezwan-burger.jpg',
  'bg_5': '/images/menu/veg-cheese-shezwan-burger.jpg',
  'bg_6': '/images/menu/paneer-burger.jpg',
  'bg_7': '/images/menu/paneer-shezwan-cheese-burger.jpg',
  'bg_8': '/images/menu/paneer-shezwan-burger.jpeg',
  'bg_9': '/images/menu/paneer-shezwan-cheese-burger.jpg',

  // 7. Maggi & Fries
  'mg_1': '/images/menu/maggi.jpg',
  'mg_2': '/images/menu/maggi.jpg',
  'mg_3': '/images/menu/maggi.jpg',
  'fr_1': '/images/menu/french-fries.jpg',
  'fr_2': '/images/menu/peri-peri-masala-fries.jpg',
  'fr_3': '/images/menu/peri-peri-masala-cheese-fries.jpg',

  // 8. Hot & Cold Drinks
  'drk_1': '/images/menu/tea-cutting.jpg',
  'drk_2': '/images/menu/tea-full.webp',
  'drk_3': '/images/menu/tea-full.webp',
  'drk_4': '/images/menu/filter-coffee.jpg',
  'drk_5': '/images/menu/black-tea.webp',
  'drk_6': '/images/menu/lemon-tea.jpg',
  'drk_7': '/images/menu/thick-cold-coffee.jpg',
  'drk_8': '/images/menu/chocolate-milkshake.jpg',
  'drk_9': '/images/menu/thick-cold-coffee.jpg',
  'drk_10': '/images/menu/thick-chocolate-milkshake.jpg',
  'drk_11': '/images/menu/thick-cold-coffee-crush.jpg',
  'drk_12': '/images/menu/thick-chocolate-milkshake-crush.jpg',
  'drk_13': '/images/menu/buttermilk-taak.jpg',
  'drk_14': '/images/menu/water-bottle.jpg',

  // 9. Meals
  'meal_1': '/images/menu/veg-thali.jpg',
  'meal_2': '/images/menu/chapati-bhaji.jpg',
  'meal_3': '/images/menu/puri-bhaji.jpg',
};

// Now update lib/menu-data.ts
const menuDataPath = path.resolve(__dirname, '../lib/menu-data.ts');
let content = fs.readFileSync(menuDataPath, 'utf8');

let updatedCount = 0;
for (const [id, newImg] of Object.entries(itemImageMap)) {
  // Find item block by id
  const regex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?imageUrl:\\s*')([^']+)(')`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `$1${newImg}$3`);
    updatedCount++;
  } else {
    console.warn(`Could not find id: ${id} in menu-data.ts`);
  }
}

fs.writeFileSync(menuDataPath, content, 'utf8');
console.log(`\nUpdated ${updatedCount} items in lib/menu-data.ts with new images!`);

// Verify all target images exist in public/images/menu/
console.log('\nVerifying disk files in public/images/menu/:');
let missing = 0;
for (const [id, imgUrl] of Object.entries(itemImageMap)) {
  const localFile = path.join(__dirname, '../public', imgUrl);
  if (!fs.existsSync(localFile)) {
    console.error(`❌ Missing file for ${id}: ${imgUrl}`);
    missing++;
  }
}
if (missing === 0) {
  console.log('✅ All 91 menu item images verified to exist on disk!');
} else {
  console.error(`⚠️ ${missing} image files missing!`);
}
