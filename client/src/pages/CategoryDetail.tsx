import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Star } from "lucide-react";
import { generateCategorySchema, generateBreadcrumbSchema, injectSchema } from "@/lib/schema";

export default function CategoryDetail() {
  const [match, params] = useRoute("/category/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug as string;

  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: categories } = trpc.categories.list.useQuery();
  const category = categories?.find(c => c.slug === slug);

  const { data: tools, isLoading } = trpc.search.tools.useQuery(
    { categoryId: category?.id || 0, page, limit },
    { enabled: !!category?.id }
  );

  useEffect(() => {
    if (category && tools?.tools) {
      const categorySchema = generateCategorySchema(category, tools.tools.length, window.location.origin);
      const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Database", url: "/database/search" },
        { name: category.name, url: `/category/${category.slug}` },
      ]);

      const cleanup1 = injectSchema(categorySchema);
      const cleanup2 = injectSchema(breadcrumbSchema);

      return () => {
        cleanup1();
        cleanup2();
      };
    }
  }, [category, tools?.tools]);

  if (!match) return null;

  if (!category && categories) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-6">The category you are looking for does not exist.</p>
          <Button onClick={() => setLocation("/database/search")}>Back to Search</Button>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-blue-100 text-lg">{category.description}</p>
          )}
          <p className="text-blue-100 text-sm mt-4">
            {tools?.total || 0} tools in this category
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : tools?.tools && tools.tools.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {tools.tools.map((tool) => (
                <Card
                  key={tool.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setLocation(`/tool/${tool.slug}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{tool.name}</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {tool.pricingModel.charAt(0).toUpperCase() + tool.pricingModel.slice(1)}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {tool.description}
                  </p>

                  {tool.rating && (
                    <div className="flex items-center gap-1 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.round(parseFloat(tool.rating?.toString() || "0"))
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {parseFloat(tool.rating?.toString() || "0").toFixed(1)}
                      </span>
                    </div>
                  )}

                  {tool.tags && (tool.tags as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {(tool.tags as string[]).slice(0, 2).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {(tool.tags as string[]).length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{(tool.tags as string[]).length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  <a
                    href={tool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visit
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {tools.hasNextPage && (
              <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={!tools.hasPreviousPage}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {tools.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={!tools.hasNextPage}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tools found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
