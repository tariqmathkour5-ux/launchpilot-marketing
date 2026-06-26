import { useEffect } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Star, Check } from "lucide-react";
import { generateToolSchema, generateBreadcrumbSchema, injectSchema } from "@/lib/schema";

export default function ToolDetail() {
  const [match, params] = useRoute("/tool/:slug");
  const slug = params?.slug as string;

  const { data: tool, isLoading: toolLoading } = trpc.tools.bySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const { data: categories } = trpc.categories.list.useQuery();
  const category = categories?.find(c => c.id === tool?.categoryId);

  useEffect(() => {
    if (tool && category) {
      const toolSchema = generateToolSchema(tool, category);
      const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Database", url: "/database/search" },
        { name: category.name, url: `/category/${category.slug}` },
        { name: tool.name, url: `/tool/${tool.slug}` },
      ]);

      const cleanup1 = injectSchema(toolSchema);
      const cleanup2 = injectSchema(breadcrumbSchema);

      return () => {
        cleanup1();
        cleanup2();
      };
    }
  }, [tool, category]);

  if (!match) return null;

  if (toolLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Tool Not Found</h1>
          <p className="text-gray-600 mb-6">The tool you are looking for does not exist.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const pricingBadgeColor: Record<string, string> = {
    free: "bg-green-100 text-green-800",
    freemium: "bg-blue-100 text-blue-800",
    paid: "bg-purple-100 text-purple-800",
    enterprise: "bg-gray-100 text-gray-800",
    open_source: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{tool.name}</h1>
              <p className="text-blue-100 text-lg mb-4">{tool.description}</p>
              <div className="flex gap-2 flex-wrap">
                <Badge 
                  variant="secondary" 
                  className={pricingBadgeColor[tool.pricingModel] || ""}
                >
                  {tool.pricingModel.charAt(0).toUpperCase() + tool.pricingModel.slice(1)}
                </Badge>
                {tool.isVerified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ✓ Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                {tool.longDescription || tool.description}
              </p>
            </Card>

            {/* Rating */}
            {tool.rating && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Rating</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.round(parseFloat(tool.rating?.toString() || "0"))
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {parseFloat(tool.rating?.toString() || "0").toFixed(1)}
                    </p>
                    <p className="text-gray-600">{tool.reviewCount} reviews</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Features */}
            {tool.features && (tool.features as string[]).length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(tool.features as string[]).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Integrations */}
            {tool.integrations && (tool.integrations as string[]).length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Integrations</h2>
                <div className="flex flex-wrap gap-2">
                  {(tool.integrations as string[]).map((integration, idx) => (
                    <Badge key={idx} variant="outline">
                      {integration}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Tags */}
            {tool.tags && (tool.tags as string[]).length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {(tool.tags as string[]).map((tag, idx) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* CTA Button */}
              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg">
                  Visit Website
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>

              {/* Details Card */}
              <Card className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="font-semibold">{category?.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Pricing Model</p>
                  <p className="font-semibold capitalize">{tool.pricingModel}</p>
                </div>



                {tool.apiAvailable && (
                  <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                    <Check className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">API Available</span>
                  </div>
                )}
              </Card>

              {/* Last Updated */}
              {tool.updatedAt && (
                <Card className="p-6">
                  <p className="text-xs text-gray-600">
                    Last Updated: {new Date(tool.updatedAt).toLocaleDateString()}
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
