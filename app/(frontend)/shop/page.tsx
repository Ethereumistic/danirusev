import { getProducts } from '@/lib/api/products'
import { resolveImage } from '@/lib/utils/resolve-image'
import Link from 'next/link'
import Image from 'next/image'

export default async function ShopPage() {
    // Fetch physical products only (exclude experiences)
    const products = await getProducts('physical')

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">Shop</h1>
                    <p className="text-muted-foreground text-lg">
                        Rally merchandise and gear
                    </p>
                </div>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground text-lg">
                            No products available yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product: any) => {
                            // Priority: main gallery → first color gallery → first variant gallery → null
                            const firstImage =
                                product.gallery?.[0] ||
                                product.colorGalleries?.[0]?.images?.[0] ||
                                product.variants?.[0]?.variantGallery?.[0]
                            const imageUrl = firstImage ? resolveImage(firstImage) : null

                            return (
                                <Link
                                    key={product.id}
                                    href={`/shop/${product.slug}`}
                                    className="group"
                                >
                                    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                        {/* Product Image */}
                                        <div className="aspect-square bg-muted relative overflow-hidden">
                                            {imageUrl ? (
                                                <Image
                                                    src={imageUrl}
                                                    alt={product.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4">
                                            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                                                {product.title}
                                            </h3>

                                            {/* Price */}
                                            <div className="flex items-center gap-2">
                                                {product.compareAtPrice && (
                                                    <span className="text-muted-foreground line-through text-sm">
                                                        {product.compareAtPrice} BGN
                                                    </span>
                                                )}
                                                <span className="text-xl font-bold">
                                                    {product.price} BGN
                                                </span>
                                            </div>

                                            {/* Stock indicator */}
                                            {product.variants && product.variants.length > 0 ? (
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    Multiple options available
                                                </p>
                                            ) : product.stock === 0 ? (
                                                <p className="text-sm text-destructive mt-2">
                                                    Out of Stock
                                                </p>
                                            ) : product.stock <= (product.lowStockThreshold || 5) ? (
                                                <p className="text-sm text-amber-600 mt-2">
                                                    Only {product.stock} left!
                                                </p>
                                            ) : (
                                                <p className="text-sm text-green-600 mt-2">In Stock</p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
