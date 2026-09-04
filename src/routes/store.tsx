import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Heart, Loader, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import studioImg from "@/assets/studio.jpg";
import dancersImg from "@/assets/dancers.jpg";
import heroImg from "@/assets/hero.jpg";
import tvImg from "@/assets/tv.jpg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section, SectionHeading, PageHero, GlassCard } from "@/components/site/Primitives";
import { AdPostCard } from "@/components/site/AdPostCard";
import { mediaUrl } from "@/lib/api/client";
import { useStoreProducts, useSubmitContact, type StoreProduct } from "@/lib/api/hooks";
import {
  getStoreCart,
  getStoreWishlist,
  saveStoreCart,
  saveStoreWishlist,
  type StoreCartItem,
} from "@/lib/local-store";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Store — X'Touch Merchandise, Music & Tickets" },
      {
        name: "description",
        content:
          "Shop X'Touch merchandise, digital music, event tickets and accessories with wishlist and checkout.",
      },
      { property: "og:title", content: "X'Touch Store" },
      { property: "og:description", content: "Merch, digital music, tickets and accessories." },
    ],
  }),
  component: StorePage,
});

const IMGS = [dancersImg, studioImg, heroImg, tvImg];

const orderSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(40),
  delivery: z.string().trim().min(10, "Please enter your delivery location").max(300),
  note: z.string().trim().max(300).optional(),
});

function formatPrice(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-ZM", { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function StorePage() {
  const { data: raw, isLoading } = useStoreProducts();
  const submitOrder = useSubmitContact();
  const [cart, setCart] = useState<StoreCartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    setCart(getStoreCart());
    setWishlist(getStoreWishlist());
  }, []);

  const products = (raw?.data ?? []).map((product: StoreProduct, index: number) => ({
    ...product,
    priceNumber: Number(product.price) || 0,
    image: mediaUrl(product.image_url) ?? IMGS[index % IMGS.length],
  }));

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );
  const cartCurrency = cart[0]?.currency ?? "ZMW";

  const updateCart = (update: (items: StoreCartItem[]) => StoreCartItem[]) => {
    setCart((current) => {
      const next = update(current);
      saveStoreCart(next);
      return next;
    });
  };

  const addToCart = (product: (typeof products)[number]) => {
    if (product.stock <= 0) {
      toast.error("This item is currently out of stock.");
      return;
    }
    updateCart((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (!existing) {
        return [
          ...items,
          {
            id: product.id,
            name: product.name,
            price: product.priceNumber,
            currency: product.currency || "ZMW",
            imageUrl: product.image,
            quantity: 1,
            stock: product.stock,
          },
        ];
      }
      if (existing.stock !== null && existing.quantity >= existing.stock) {
        toast.error(`Only ${existing.stock} available.`);
        return items;
      }
      return items.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
      );
    });
    toast.success(`${product.name} added to your cart.`);
  };

  const changeQuantity = (id: number, amount: number) => {
    updateCart((items) =>
      items
        .map((item) => {
          if (item.id !== id) return item;
          const quantity = Math.max(
            0,
            Math.min(item.quantity + amount, item.stock ?? Number.MAX_SAFE_INTEGER),
          );
          return { ...item, quantity };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const toggleWishlist = (id: number) => {
    setWishlist((current) => {
      const saved = current.includes(id);
      const next = saved ? current.filter((itemId) => itemId !== id) : [...current, id];
      saveStoreWishlist(next);
      toast.success(saved ? "Removed from wishlist." : "Saved to wishlist.");
      return next;
    });
  };

  return (
    <>
      <PageHero
        eyebrow="Store"
        title="Wear it, stream it, get in the room"
        description="Merchandise, digital music, tickets and accessories — saved in one cart."
        image={studioImg}
      />
      <Section>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Shop" title="Featured products" className="mb-0" />
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-gold/40"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="mr-2 h-4 w-4" /> Cart ({cartCount})
          </Button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gold">
            <Loader className="mr-2 h-5 w-5 animate-spin" /> Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
            No products are live yet.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const saved = wishlist.includes(product.id);
              return (
                <GlassCard key={product.id} className="overflow-hidden p-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="h-56 w-full object-cover"
                  />
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.25em] text-gold">
                      {product.category ?? "General"}
                    </p>
                    <h3 className="mt-2 font-bold">{product.name}</h3>
                    {product.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {product.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </p>
                    <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      <span className="text-lg font-black">
                        {formatPrice(product.priceNumber, product.currency || "ZMW")}
                      </span>
                      <span className="flex shrink-0 gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                          aria-pressed={saved}
                          onClick={() => toggleWishlist(product.id)}
                          className="rounded-full border-border"
                        >
                          <Heart className={`h-4 w-4 ${saved ? "fill-current text-gold" : ""}`} />
                        </Button>
                        <Button
                          disabled={product.stock <= 0}
                          onClick={() => addToCart(product)}
                          className="rounded-full bg-gradient-gold text-primary-foreground hover:opacity-90"
                        >
                          <ShoppingBag className="mr-1 h-4 w-4" /> Add
                        </Button>
                      </span>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
            <AdPostCard />
          </div>
        )}
      </Section>

      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Your cart</DialogTitle>
            <DialogDescription>
              Review your items and send an order request. The team will email payment and delivery
              instructions; you are not charged on this page.
            </DialogDescription>
          </DialogHeader>
          {cart.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Your cart is empty.
            </div>
          ) : (
            <>
              <div className="grid gap-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-border p-3 sm:grid-cols-[56px_minmax(0,1fr)_auto]"
                  >
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-12 w-12 rounded-xl object-cover sm:h-14 sm:w-14"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price * item.quantity, item.currency)}
                      </p>
                    </div>
                    <div className="col-start-2 flex flex-wrap items-center gap-1 sm:col-start-auto sm:flex-nowrap">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Decrease ${item.name} quantity`}
                        onClick={() => changeQuantity(item.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Increase ${item.name} quantity`}
                        disabled={item.stock !== null && item.quantity >= item.stock}
                        onClick={() => changeQuantity(item.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Remove ${item.name}`}
                        onClick={() =>
                          updateCart((items) => items.filter((entry) => entry.id !== item.id))
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4 text-lg font-black">
                <span>Estimated total</span>
                <span>{formatPrice(cartTotal, cartCurrency)}</span>
              </div>
              <form
                className="grid gap-4 rounded-2xl bg-muted/30 p-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const parsed = orderSchema.safeParse(Object.fromEntries(new FormData(form)));
                  if (!parsed.success) {
                    toast.error(parsed.error.issues[0].message);
                    return;
                  }
                  const { name, email, phone, delivery, note } = parsed.data;
                  const items = cart
                    .map(
                      (item) =>
                        `${item.quantity} × ${item.name} — ${formatPrice(item.price * item.quantity, item.currency)}`,
                    )
                    .join("\n");
                  submitOrder.mutate(
                    {
                      name,
                      email,
                      phone,
                      subject: "X'Touch store order request",
                      message:
                        `Order request:\n${items}\n\nEstimated total: ${formatPrice(cartTotal, cartCurrency)}\nDelivery: ${delivery}${note ? `\nNote: ${note}` : ""}`.slice(
                          0,
                          1000,
                        ),
                    },
                    {
                      onSuccess: () => {
                        updateCart(() => []);
                        form.reset();
                        setCartOpen(false);
                        toast.success("Order request sent. Check your email for the next steps.");
                      },
                      onError: () =>
                        toast.error("Could not send the order request. Please try again."),
                    },
                  );
                }}
              >
                <p className="font-semibold">Order details</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="store-name">Full name</Label>
                    <Input id="store-name" name="name" autoComplete="name" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="store-email">Email</Label>
                    <Input
                      id="store-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="store-phone">Phone</Label>
                  <Input id="store-phone" name="phone" type="tel" autoComplete="tel" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="store-delivery">Delivery location</Label>
                  <Textarea id="store-delivery" name="delivery" rows={2} maxLength={300} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="store-note">Order note (optional)</Label>
                  <Textarea id="store-note" name="note" rows={2} maxLength={300} />
                </div>
                <Button
                  type="submit"
                  disabled={submitOrder.isPending}
                  className="rounded-full bg-gradient-gold font-semibold text-primary-foreground"
                >
                  {submitOrder.isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  {submitOrder.isPending ? "Sending request…" : "Request this order"}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
