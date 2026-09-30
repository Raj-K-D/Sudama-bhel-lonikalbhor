const fs = require('fs');
const path = require('path');

const itemImageMap = {
  // Bhel & Chaat
  'bhel_1': '/images/menu/pani-puri.jpg',
  'bhel_2': '/images/menu/ragda-pattice.jpg',
  'bhel_3': '/images/menu/sev-puri.jpg',
  'bhel_4': '/images/menu/dahi-puri.jpg',
  'bhel_5': '/images/menu/ragda-pattice.jpg',
  'bhel_6': '/images/menu/sev-puri.jpg',
  'bhel_7': '/images/menu/bhel-puri.jpg',
  'bhel_8': '/images/menu/bhel-puri.jpg',
  'bhel_9': '/images/menu/bhel-puri.jpg',
  'bhel_10': '/images/menu/dahi-puri.jpg',
  'bhel_11': '/images/menu/bhel-puri.jpg',
  'bhel_12': '/images/menu/ragda-pattice.jpg',
  'bhel_13': '/images/menu/bhel-puri.jpg',

  // Breakfast & Snacks
  'snk_1': '/images/menu/pohe.jpg',
  'snk_2': '/images/menu/pohe.jpg',
  'snk_3': '/images/menu/pohe.jpg',
  'snk_4': '/images/menu/upma.jpg',
  'snk_5': '/images/menu/sheera.jpg',
  'snk_6': '/images/menu/vada-pav.jpg',
  'snk_7': '/images/menu/vada-pav.jpg',
  'snk_8': '/images/menu/bread-pattice.jpg',
  'snk_9': '/images/menu/kanda-bhaji.jpg',
  'snk_10': '/images/menu/kanda-bhaji.jpg',
  'snk_11': '/images/menu/misal-pav.jpg',
  'snk_12': '/images/menu/pav-bhaji.jpg',
  'snk_13': '/images/menu/pav-bhaji.jpg',
  'snk_14': '/images/menu/vada-pav.jpg',
  'snk_15': '/images/menu/vada-pav.jpg',
  'snk_16': '/images/menu/idli-sambar.jpg',
  'snk_17': '/images/menu/idli-sambar.jpg',
  'snk_18': '/images/menu/medu-vada.jpg',
  'snk_19': '/images/menu/medu-vada.jpg',
  'snk_20': '/images/menu/pav-bhaji.jpg',
  'snk_21': '/images/menu/pav-bhaji.jpg',
  'snk_22': '/images/menu/sabudana-vada.jpg',

  // South Indian
  'sth_1': '/images/menu/plain-dosa.jpg',
  'sth_2': '/images/menu/masala-dosa.jpg',
  'sth_3': '/images/menu/uttapam.jpg',
  'sth_4': '/images/menu/plain-dosa.jpg',
  'sth_5': '/images/menu/masala-dosa.jpg',
  'sth_6': '/images/menu/plain-dosa.jpg',
  'sth_7': '/images/menu/masala-dosa.jpg',
  'sth_8': '/images/menu/uttapam.jpg',
  'sth_9': '/images/menu/plain-dosa.jpg',
  'sth_10': '/images/menu/masala-dosa.jpg',

  // Pizza
  'piz_1': '/images/menu/cheese-pizza.jpg',
  'piz_2': '/images/menu/veg-pizza.jpg',
  'piz_3': '/images/menu/cheese-pizza.jpg',
  'piz_4': '/images/menu/paneer-pizza.jpg',
  'piz_5': '/images/menu/veg-pizza.jpg',
  'piz_6': '/images/menu/garlic-bread.jpg',
  'piz_7': '/images/menu/chocolate-sandwich.jpg',

  // Sandwich
  'sw_1': '/images/menu/veg-sandwich.jpg',
  'sw_2': '/images/menu/cheese-sandwich.jpg',
  'sw_3': '/images/menu/veg-sandwich.jpg',
  'sw_4': '/images/menu/cheese-sandwich.jpg',
  'sw_5': '/images/menu/cheese-sandwich.jpg',
  'sw_6': '/images/menu/chocolate-sandwich.jpg',
  'sw_7': '/images/menu/chocolate-sandwich.jpg',

  // Burger
  'bg_1': '/images/menu/veg-burger.jpg',
  'bg_2': '/images/menu/veg-burger.jpg',
  'bg_3': '/images/menu/veg-burger.jpg',
  'bg_4': '/images/menu/veg-burger.jpg',
  'bg_5': '/images/menu/veg-burger.jpg',
  'bg_6': '/images/menu/veg-burger.jpg',
  'bg_7': '/images/menu/veg-burger.jpg',
  'bg_8': '/images/menu/veg-burger.jpg',
  'bg_9': '/images/menu/veg-burger.jpg',

  // Maggi & Fries
  'mg_1': '/images/menu/maggi.jpg',
  'mg_2': '/images/menu/maggi.jpg',
  'mg_3': '/images/menu/maggi.jpg',
  'fr_1': '/images/menu/french-fries.jpg',
  'fr_2': '/images/menu/french-fries.jpg',
  'fr_3': '/images/menu/french-fries.jpg',

  // Hot & Cold Drinks
  'drk_1': '/images/menu/masala-chai.jpg',
  'drk_2': '/images/menu/masala-chai.jpg',
  'drk_3': '/images/menu/masala-chai.jpg',
  'drk_4': '/images/menu/filter-coffee.jpg',
  'drk_5': '/images/menu/masala-chai.jpg',
  'drk_6': '/images/menu/lemon-soda.jpg',
  'drk_7': '/images/menu/cold-coffee.jpg',
  'drk_8': '/images/menu/cold-coffee.jpg',
  'drk_9': '/images/menu/cold-coffee.jpg',
  'drk_10': '/images/menu/cold-coffee.jpg',
  'drk_11': '/images/menu/cold-coffee.jpg',
  'drk_12': '/images/menu/cold-coffee.jpg',
  'drk_13': '/images/menu/taak.jpg',
  'drk_14': '/images/menu/water-bottle.jpg',

  // Meals
  'meal_1': '/images/menu/veg-thali.jpg',
  'meal_2': '/images/menu/chapati-bhaji.jpg',
  'meal_3': '/images/menu/puri-bhaji.jpg'
};

const menuFilePath = path.resolve('lib/menu-data.ts');
let fileContent = fs.readFileSync(menuFilePath, 'utf8');

let count = 0;
for (const [id, imgUrl] of Object.entries(itemImageMap)) {
  const regex = new RegExp(`(id:\\s*'${id}',[\\s\\S]*?imageUrl:\\s*)'[^']*'`, 'g');
  if (regex.test(fileContent)) {
    fileContent = fileContent.replace(regex, `$1'${imgUrl}'`);
    count++;
  } else {
    console.warn(`Item ID not matched: ${id}`);
  }
}

fs.writeFileSync(menuFilePath, fileContent, 'utf8');
console.log(`Successfully updated ${count} of ${Object.keys(itemImageMap).length} items in lib/menu-data.ts`);
