# QuickMart - Q-Commerce Price Comparison Website

A Next.js application that allows users to compare prices of products across different dark stores/grocers and choose the best deal.

## Features

- Browse products by category
- Search for specific products
- Compare prices across multiple stores
- See best prices highlighted
- Calculate potential savings
- Shopping cart functionality (coming soon)

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- PostgreSQL database

### Installation

1. Clone this repository

```bash
git clone <repository-url>
cd quickmart
```

2. Install dependencies

```bash
npm install
```

3. Configure your database

Update the `.env` file with your PostgreSQL connection details:

```
DATABASE_URL="postgresql://username:password@localhost:5432/quickmart?schema=public"
```

4. Run database migrations

```bash
npx prisma migrate dev
```

5. Seed the database with initial data

```bash
npm run db:seed
```

6. Start the development server

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Adding Product Images

To add product images:

1. Place images in the `public/products/` directory
2. Name the images to match the products (e.g., `bananas.jpg`, `milk.jpg`)
3. Images should be in JPG or PNG format
4. Recommended size: 500x500 pixels

See `public/products/README.txt` for more details.

## Adding Store Logos

To add store logos:

1. Place logo images in the `public/stores/` directory
2. Name the logos to match the stores (e.g., `freshmart.png`, `quickstop.png`)
3. Logos should be in PNG format with transparent backgrounds
4. Recommended size: 200x200 pixels

See `public/stores/README.txt` for more details.

## Database Schema

- **Products**: Items available for purchase
- **Categories**: Product classifications
- **Stores**: Different retailers/dark stores
- **Prices**: Product prices specific to each store
- **Users**: User accounts (for auth)
- **Orders**: User purchases (future feature)
- **OrderItems**: Items in each order (future feature)

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Coming soon

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. 