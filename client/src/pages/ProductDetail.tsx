import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Package, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { OrderDialog } from "@/components/OrderDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Product } from "@shared/schema";

export default function ProductDetail() {
  const params = useParams();
  const productId = params.id;
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const { t } = useLanguage();
  
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const formatPrice = (price: number, currency: string = "PKR") => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-lg" />
            <div>
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/4 mb-6" />
              <Skeleton className="h-8 w-1/3 mb-6" />
              <Skeleton className="h-24 w-full mb-6" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4 text-center">
          <Package className="w-20 h-20 text-muted-foreground/50 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-4">{t("product.notFound")}</h1>
          <Link href="/shop">
            <Button>{t("product.backToShop")}</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/shop" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("product.backToShop")}
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-24 h-24 text-muted-foreground/50" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-3xl font-serif font-bold text-foreground">
                {product.title}
              </h1>
              {product.category && (
                <Badge variant="secondary">{product.category}</Badge>
              )}
            </div>

            <p className="text-3xl font-bold text-primary mb-6">
              {formatPrice(product.price, product.currency)}
            </p>

            <div className="prose prose-sm max-w-none mb-8">
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {product.inventoryCount !== null && product.inventoryCount > 0 && (
              <p className="text-sm text-muted-foreground mb-4">
                {product.inventoryCount} {t("shop.inStock").toLowerCase()}
              </p>
            )}

            <Button 
              size="lg" 
              className="w-full"
              onClick={() => setShowOrderDialog(true)}
              data-testid="button-order-product"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {t("product.orderNow")}
            </Button>
          </div>
        </div>
      </div>

      <OrderDialog 
        open={showOrderDialog} 
        onOpenChange={setShowOrderDialog}
        product={product}
      />
    </main>
  );
}
