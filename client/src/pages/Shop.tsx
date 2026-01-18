import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ShoppingBag, Package } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Product } from "@shared/schema";

export default function Shop() {
  const { t } = useLanguage();
  
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const formatPrice = (price: number, currency: string = "PKR") => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <main className="flex-1 bg-background">
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <ShoppingBag className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              {t("shop.title")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("shop.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover-elevate transition-all">
                  <div className="relative h-48 bg-muted">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-muted-foreground/50" />
                      </div>
                    )}
                    {product.category && (
                      <Badge className="absolute top-2 left-2" variant="secondary">
                        {product.category}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                      {product.description}
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(product.price, product.currency)}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Link href={`/shop/${product.id}`} className="w-full">
                      <Button className="w-full" data-testid={`button-view-product-${product.id}`}>
                        {t("shop.viewDetails")}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="w-20 h-20 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">{t("shop.noProducts")}</h2>
              <p className="text-muted-foreground">
                {t("shop.subtitle")}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
