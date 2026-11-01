"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { COLORWAYS, MODELS, type Product } from "@/lib/products";

// The bag stores a snapshot of each product, because the watches now come from the database
// and are not in any local catalogue. Prices here are for display only: checkout must look
// the real prices up again on the server.
const STORAGE_KEY = "hourwright-cart-v3";

export interface CartItem extends Product {
  qty: number;
}

type Action =
  | { type: "load"; items: CartItem[] }
  | { type: "add"; product: Product }
  | { type: "setQty"; id: string; qty: number }
  | { type: "remove"; id: string }
  | { type: "clear" };

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (product: Product) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "load":
      return action.items;
    case "clear":
      return [];
    case "add": {
      const found = state.some((i) => i.id === action.product.id);
      return found
        ? state.map((i) => (i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i))
        : [...state, { ...action.product, qty: 1 }];
    }
    case "setQty":
      return state
        .map((i) => (i.id === action.id ? { ...i, qty: action.qty } : i))
        .filter((i) => i.qty > 0);
    case "remove":
      return state.filter((i) => i.id !== action.id);
    default:
      return state;
  }
}

// localStorage can hold anything, so check the shape before trusting a saved item.
function isCartItem(x: unknown): x is CartItem {
  if (!x || typeof x !== "object") return false;
  const i = x as Partial<CartItem>;
  return (
    typeof i.id === "string" &&
    typeof i.name === "string" &&
    typeof i.spec === "string" &&
    typeof i.currency === "string" &&
    typeof i.price === "number" &&
    Number.isFinite(i.price) &&
    (i.imageUrl === null || typeof i.imageUrl === "string") &&
    !!i.art &&
    i.art.model in MODELS &&
    i.art.cw in COLORWAYS &&
    Number.isInteger(i.qty) &&
    (i.qty as number) > 0
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  // Restore the saved bag after hydration so server and client markup match.
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const valid = Array.isArray(saved) ? saved.filter(isCartItem) : [];
      if (valid.length) dispatch({ type: "load", items: valid });
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  const open = useCallback(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    const el = openerRef.current;
    if (el && typeof el.focus === "function") el.focus();
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.qty * i.price, 0),
      add: (product) => dispatch({ type: "add", product }),
      setQty: (id, qty) => dispatch({ type: "setQty", id, qty }),
      remove: (id) => dispatch({ type: "remove", id }),
      clear: () => dispatch({ type: "clear" }),
      isOpen,
      open,
      close,
    }),
    [items, isOpen, open, close],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
