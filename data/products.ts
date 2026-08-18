export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  rating: number;
  image: string;
  description: string;
  badge?: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: 'Aurora Headphones',
    price: 249,
    category: 'Audio',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1516707570261-664f2c65000f?auto=format&fit=crop&w=900&q=80',
    description: 'Immersive sound with noise cancellation and a luxurious fit.',
    badge: 'Popular',
  },
  {
    id: 2,
    name: 'Nova Smartwatch',
    price: 189,
    category: 'Wearables',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=900&q=80',
    description: 'Track health, receive notifications, and stay connected on the go.',
  },
  {
    id: 3,
    name: 'Luma Laptop',
    price: 1299,
    category: 'Computers',
    rating: 5.0,
    image:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    description: 'A slim powerhouse for creators, designers, and professionals.',
    badge: 'Best seller',
  },
  {
    id: 4,
    name: 'Crest Backpack',
    price: 89,
    category: 'Travel',
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
    description: 'Everyday carry with premium durability and smart organization.',
  },
  {
    id: 5,
    name: 'Halo Wireless Speaker',
    price: 179,
    category: 'Audio',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1516382781516-7b64d2df1d41?auto=format&fit=crop&w=900&q=80',
    description: 'Room-filling sound with a minimalist design and deep bass.',
  },
  {
    id: 6,
    name: 'Pulse Fitness Band',
    price: 99,
    category: 'Wearables',
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1585452030367-74a5df2483dc?auto=format&fit=crop&w=900&q=80',
    description: 'Lightweight workout companion with a long-lasting battery.',
  },
  {
    id: 7,
    name: 'Atlas Monitor',
    price: 449,
    category: 'Computers',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80',
    description: 'Crystal-clear display with sharp colors and fast refresh.',
  },
  {
    id: 8,
    name: 'Voyage Luggage',
    price: 219,
    category: 'Travel',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1527430253228-e93688616381?auto=format&fit=crop&w=900&q=80',
    description: 'Lightweight luggage built for smart packing and easy travel.',
    badge: 'New arrival',
  },
];
