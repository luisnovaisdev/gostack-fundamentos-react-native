import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      // await AsyncStorage.removeItem('cart-items');
      const cartItems = await AsyncStorage.getItem('cart-items');

      if (cartItems) {
        setProducts(JSON.parse(cartItems));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExist = products.findIndex(cartProduct => {
        return cartProduct.id === product.id;
      });

      if (productExist !== -1) {
        const increasedProduct = { ...products[productExist] };
        increasedProduct.quantity += 1;
        products[productExist] = increasedProduct;
        setProducts([...products]);
        await AsyncStorage.setItem('cart-items', JSON.stringify(products));
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
        await AsyncStorage.setItem(
          'cart-items',
          JSON.stringify([...products, { ...product, quantity: 1 }]),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productExist = products.findIndex(cartProduct => {
        return cartProduct.id === id;
      });

      if (productExist !== -1) {
        const increasedProduct = { ...products[productExist] };
        increasedProduct.quantity += 1;
        products[productExist] = increasedProduct;
        setProducts([...products]);
      }
      await AsyncStorage.setItem('cart-items', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productExists = products.find(cartProduct => cartProduct.id === id);
      if (productExists) {
        productExists.quantity -= 1;
        if (productExists.quantity <= 0) {
          const productIndex = products.findIndex(
            cartProduct => cartProduct.id === id,
          );
          products.splice(productIndex, 1);
        }
      }
      setProducts([...products]);
      await AsyncStorage.setItem('cart-items', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
