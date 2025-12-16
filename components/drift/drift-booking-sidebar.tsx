// "use client";

// import * as React from "react";
// import { ShoppingCart, Trophy } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import type { DriftExperience } from "@/lib/drift-data";
// import { PATTERN_COMPONENTS } from "@/components/drift/patterns";
// import { useCartStore } from "@/lib/stores/cart-store";

// interface DriftBookingSidebarProps {
//     experience: DriftExperience;
// }

// export function DriftBookingSidebar({ experience }: DriftBookingSidebarProps) {
//     // Read selections from Zustand store
//     const { driftSelections, addItem } = useCartStore();
//     const selections = driftSelections[experience.id] || { additionalItems: [], selectedLocation: null };

//     // Calculate total price
//     const basePrice = experience.price;
//     const additionalPrice = experience.additionalItems
//         ?.filter(item => selections.additionalItems.includes(item.id))
//         .reduce((sum, item) => sum + item.price, 0) || 0;
//     const totalPrice = basePrice + additionalPrice;

//     // Get selected location name
//     const selectedLocationName = experience.additionalItems
//         ?.find(item => item.id === selections.selectedLocation)?.name || "Писта Трявна";

//     // Function to add experience to cart
//     const handleAddToCart = () => {
//         // Build whatYouGet array from included items + selected additional items
//         const whatYouGet = [...experience.included];

//         // Add selected additional items names
//         const selectedAdditionalNames = experience.additionalItems
//             ?.filter(item => selections.additionalItems.includes(item.id))
//             .map(item => item.name) || [];
//         whatYouGet.push(...selectedAdditionalNames);

//         // Add location
//         if (selectedLocationName) {
//             whatYouGet.push(`📍 ${selectedLocationName}`);
//         }

//         addItem({
//             id: `${experience.id}-${Date.now()}`, // Unique ID for each cart entry
//             title: experience.title,
//             price: totalPrice,
//             icon: experience.iconName,
//             whatYouGet,
//             additionalItems: selections.additionalItems,
//             selectedLocation: selections.selectedLocation,
//             selectedVoucher: 'voucher-digital', // Default to digital voucher
//             experienceSlug: experience.slug,
//             imageUrl: experience.images[0], // First image
//             themeColor: experience.themeColor, // Theme color for styling
//         });
//     };

//     // Get the pattern component for this experience
//     const PatternComponent = PATTERN_COMPONENTS[experience.pattern];

//     return (
//         <div className="mt-4">
//             <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl overflow-hidden relative">
//                 {/* Render pattern as a small decorative strip at the top */}
//                 {PatternComponent && (
//                     <div className="absolute top-0 left-0 right-0 h-15 overflow-hidden ">
//                         <PatternComponent className="opacity-100 " />
//                     </div>
//                 )}
//                 <CardHeader className="pb-4 mt-4 border-b border-slate-800 bg-slate-950/50 relative">
//                     <div className="pt-2">
//                         <div className="flex justify-between items-start mb-2">
//                             <span className={
//                                 experience.themeColor === 'taxi' ? 'text-xs font-bold text-taxi uppercase tracking-widest' :
//                                     experience.themeColor === 'rent' ? 'text-xs font-bold text-rent uppercase tracking-widest' :
//                                         experience.themeColor === 'mix' ? 'text-xs font-bold text-mix uppercase tracking-widest' :
//                                             'text-xs font-bold text-main uppercase tracking-widest'
//                             }>
//                                 Резервация
//                             </span>
//                             <div className="flex items-center gap-1 text-amber-400">
//                                 <Trophy className="w-4 h-4" />
//                                 <span className="text-xs font-bold">Pro Equipment</span>
//                             </div>
//                         </div>
//                         <CardTitle className="text-2xl font-black text-white italic uppercase tracking-tight">
//                             {experience.title}
//                         </CardTitle>
//                         <p className="text-slate-400 text-sm mt-1">{experience.subtitle}</p>
//                     </div>
//                 </CardHeader>

//                 <CardContent className="pt-6 space-y-6">
//                     {/* Base Price Display */}
//                     <div className="flex items-center justify-between">
//                         <div className="flex flex-col">
//                             <span className="text-sm text-slate-500">Базова цена</span>
//                             <span className="text-2xl font-black text-white tracking-tighter">
//                                 {experience.price}
//                                 <span className={
//                                     experience.themeColor === 'taxi' ? 'text-sm font-bold text-taxi ml-1' :
//                                         experience.themeColor === 'rent' ? 'text-sm font-bold text-rent ml-1' :
//                                             experience.themeColor === 'mix' ? 'text-sm font-bold text-mix ml-1' :
//                                                 'text-sm font-bold text-main ml-1'
//                                 }>
//                                     {experience.currency}
//                                 </span>
//                             </span>
//                         </div>
//                         <div className="bg-slate-800 px-3 py-1 rounded text-xs font-medium text-slate-300">
//                             {experience.duration}
//                         </div>
//                     </div>

//                     {/* Selected Additional Items */}
//                     {(selections.additionalItems.length > 0 || selections.selectedLocation) && (
//                         <>
//                             <Separator className="bg-slate-800" />
//                             <div className="space-y-3">
//                                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Допълнения</h4>

//                                 {/* Location */}
//                                 {selections.selectedLocation && (
//                                     <div className="flex items-center justify-between text-sm">
//                                         <span className="text-slate-300">📍 {selectedLocationName}</span>
//                                         <span className="text-slate-500 text-xs">Включено</span>
//                                     </div>
//                                 )}

//                                 {/* Additional Services */}
//                                 {experience.additionalItems
//                                     ?.filter(item => selections.additionalItems.includes(item.id))
//                                     .map(item => (
//                                         <div key={item.id} className="flex items-center justify-between text-sm">
//                                             <span className="text-slate-300">{item.name}</span>
//                                             <span className={
//                                                 experience.themeColor === 'taxi' ? 'font-bold text-taxi' :
//                                                     experience.themeColor === 'rent' ? 'font-bold text-rent' :
//                                                         experience.themeColor === 'mix' ? 'font-bold text-mix' :
//                                                             'font-bold text-main'
//                                             }>
//                                                 +{item.price} BGN
//                                             </span>
//                                         </div>
//                                     ))}
//                             </div>
//                         </>
//                     )}

//                     {/* Total Price */}
//                     <Separator className="bg-slate-800" />
//                     <div className="flex items-center justify-between">
//                         <span className="text-lg font-bold text-white">Обща цена</span>
//                         <span className="text-3xl font-black text-white tracking-tighter">
//                             {totalPrice}
//                             <span className={
//                                 experience.themeColor === 'taxi' ? 'text-lg font-bold text-taxi ml-1' :
//                                     experience.themeColor === 'rent' ? 'text-lg font-bold text-rent ml-1' :
//                                         experience.themeColor === 'mix' ? 'text-lg font-bold text-mix ml-1' :
//                                             'text-lg font-bold text-main ml-1'
//                             }>
//                                 {experience.currency}
//                             </span>
//                         </span>
//                     </div>

//                     {/* Add to Cart Button */}
//                     <Button
//                         onClick={handleAddToCart}
//                         className={
//                             experience.themeColor === 'taxi' ? 'w-full h-14 text-lg font-black uppercase tracking-wider bg-taxi hover:bg-taxi/90 text-black transition-all hover:scale-[1.02]' :
//                                 experience.themeColor === 'rent' ? 'w-full h-14 text-lg font-black uppercase tracking-wider bg-rent hover:bg-rent/90 text-black transition-all hover:scale-[1.02]' :
//                                     experience.themeColor === 'mix' ? 'w-full h-14 text-lg font-black uppercase tracking-wider bg-mix hover:bg-mix/90 text-black transition-all hover:scale-[1.02]' :
//                                         'w-full h-14 text-lg font-black uppercase tracking-wider bg-main hover:bg-main/90 text-black transition-all hover:scale-[1.02]'
//                         }
//                     >
//                         <span className="flex items-center gap-2">
//                             <ShoppingCart className="w-5 h-5" />
//                             Добави в Количката
//                         </span>
//                     </Button>

//                     <p className="text-[10px] text-center text-slate-500">
//                         * Плащането се извършва на място или по банк път.
//                     </p>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }
