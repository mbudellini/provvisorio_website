require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mongoose = require('mongoose')
const Category = require('../models/Category')

const categories = [
  { name: 'Jackets', slug: 'jackets', description: 'Lightweight and heavy jackets for every season', order: 1 },
  { name: 'Shirts', slug: 'shirts', description: 'Button-up and casual shirts', order: 2 },
  { name: 'T-Shirts', slug: 't-shirts', description: 'Short and long sleeve t-shirts', order: 3 },
  { name: 'Trousers', slug: 'trousers', description: 'Formal and casual trousers', order: 4 },
  { name: 'Jeans', slug: 'jeans', description: 'Denim jeans in various fits', order: 5 },
  { name: 'Shorts', slug: 'shorts', description: 'Casual and sport shorts', order: 6 },
  { name: 'Hoodies & Sweatshirts', slug: 'hoodies-sweatshirts', description: 'Hoodies, pullovers and crewneck sweatshirts', order: 7 },
  { name: 'Knitwear', slug: 'knitwear', description: 'Sweaters, cardigans and knit pieces', order: 8 },
  { name: 'Coats & Outerwear', slug: 'coats-outerwear', description: 'Heavy coats, parkas and winter outerwear', order: 9 },
  { name: 'Suits & Blazers', slug: 'suits-blazers', description: 'Tailored suits, blazers and waistcoats', order: 10 },
  { name: 'Shoes', slug: 'shoes', description: 'Sneakers, boots, loafers and formal shoes', order: 11 },
  { name: 'Bags', slug: 'bags', description: 'Backpacks, crossbody bags and accessories', order: 12 },
  { name: 'Accessories', slug: 'accessories', description: 'Belts, scarves, hats and more', order: 13 },
  { name: 'Swimwear', slug: 'swimwear', description: 'Swimming trunks and beachwear', order: 14 },
  { name: 'Underwear', slug: 'underwear', description: 'Briefs, boxers and undershirts', order: 15 },
]

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGO)
    console.log('Connected to the DB')

    let created = 0
    let skipped = 0

    for (const cat of categories) {
      const existing = await Category.findOne({ slug: cat.slug })
      if (existing) {
        console.log(`⚠️  Skipped "${cat.name}" — already exists`)
        skipped++
        continue
      }

      await new Category(cat).save()
      console.log(`✅ Created "${cat.name}"`)
      created++
    }

    console.log(`\nDone! ${created} created, ${skipped} skipped.`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding categories:', error.message)
    process.exit(1)
  }
}

seedCategories()