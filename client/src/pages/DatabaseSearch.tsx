import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Checkbox,
} from "@/components/ui/checkbox";
import { Loader2, Search, ExternalLink, Star } from "lucide-react";
import { useLocation } from "wouter";

export default function DatabaseSearch() {
  const [, setLocation] = useLocation();
  
  // Search state
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [pricingModels, setPricingModels] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "popularity" | "alphabetical" | "rating">("newest");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch categories
  const { data: categories } = trpc.categories.list.useQuery();

  // Fetch features
  const { data: features } = trpc.search.features.useQuery();

  // Fetch pricing distribution
  const { data: pricingDistribution } = trpc.search.pricingDistribution.useQuery();

  // Search tools
  const { data: searchResults, isLoading } = trpc.search.tools.useQuery(
    {
      query: query || undefined,
      categoryId,
      pricingModels: pricingModels.length > 0 ? (pricingModels as any) : undefined,
      features: selectedFeatures.length > 0 ? selectedFeatures : undefined,
      sortBy,
      page,
      limit,
    },
    { enabled: true }
  );

  // Handle pricing model toggle
  const togglePricingModel = (model: string) => {
    setPricingModels(prev =>
      prev.includes(model)
        ? prev.filter(m => m !== model)
        : [...prev, model]
    );
    setPage(1);
  };

  // Handle feature toggle
  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
    setPage(1);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  // Reset filters
  const handleReset = () => {
    setQuery("");
    setCategoryId(undefined);
    setPricingModels([]);
    setSelectedFeatures([]);
    setSortBy("newest");
    setPage(1);
  };

  const pricingOptions = [
    { value: "free", label: "Free" },
    { value: "freemium", label: "Freemium" },
    { value: "paid", label: "Paid" },
    { value: "enterprise", label: "Enterprise" },
    { value: "open_source", label: "Open Source" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">AI Tools Database</h1>
          <p className="text-blue-100 text-lg">
            Search and discover the perfect AI tools for your workflow
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Search Input */}
              <div>
                <label className="block text-sm font-semibold mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tool name, features..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <Select
                  value={categoryId?.toString() || ""}
                  onValueChange={(val) => {
                    setCategoryId(val ? parseInt(val) : undefined);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pricing Model Filter */}
              <div>
                <label className="block text-sm font-semibold mb-3">Pricing Model</label>
                <div className="space-y-2">
                  {pricingOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <Checkbox
                        id={`pricing-${option.value}`}
                        checked={pricingModels.includes(option.value)}
                        onCheckedChange={() => togglePricingModel(option.value)}
                      />
                      <label
                        htmlFor={`pricing-${option.value}`}
                        className="ml-2 text-sm cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-semibold mb-2">Sort By</label>
                <Select
                  value={sortBy}
                  onValueChange={(val: any) => {
                    setSortBy(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleReset}
              >
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing {searchResults?.tools.length || 0} of {searchResults?.total || 0} tools
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}

            {/* Tools Grid */}
            {!isLoading && searchResults?.tools && searchResults.tools.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {searchResults.tools.map((tool) => (
                    <Card
                      key={tool.id}
                      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setLocation(`/tool/${tool.slug}`)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{tool.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {categories?.find(c => c.id === tool.categoryId)?.name}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {tool.pricingModel.charAt(0).toUpperCase() + tool.pricingModel.slice(1)}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {tool.description}
                      </p>

                      {/* Rating */}
                      {tool.rating && (
                        <div className="flex items-center gap-1 mb-3">
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
                            {parseFloat(tool.rating?.toString() || "0").toFixed(1)} ({tool.reviewCount} reviews)
                          </span>
                        </div>
                      )}

                      {/* Tags */}
                      {tool.tags && tool.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {tool.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {tool.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{tool.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Visit Button */}
                      <a
                        href={tool.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {searchResults && searchResults.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      disabled={!searchResults.hasPreviousPage}
                      onClick={() => setPage(p => p - 1)}
                    >
                      Previous
                    </Button>

                    {[...Array(searchResults.totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === searchResults.totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1)
                      ) {
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === page ? "default" : "outline"}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      } else if (
                        (pageNum === page - 2 || pageNum === page + 2) &&
                        searchResults.totalPages > 5
                      ) {
                        return (
                          <span key={pageNum} className="px-2 py-2">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    <Button
                      variant="outline"
                      disabled={!searchResults.hasNextPage}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : !isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No tools found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleReset}
                >
                  Clear Filters
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
