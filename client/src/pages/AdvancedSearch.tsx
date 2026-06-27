import { useState, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink, Filter, X } from "lucide-react";
import { useLocation } from "wouter";

export default function AdvancedSearch() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedPricing, setSelectedPricing] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(true);
  const [sortBy, setSortBy] = useState<"newest" | "popularity" | "alphabetical" | "rating" | "trending">("newest");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);

  // Fetch categories
  const { data: categoriesData } = trpc.categories.list.useQuery();

  // Fetch features for filter
  const { data: featuresData } = trpc.search.features.useQuery();

  // Fetch search results
  const { data: searchResults, isLoading } = trpc.search.tools.useQuery(
    {
      query: query || undefined,
      categoryId: selectedCategory,
      pricingModels: selectedPricing.length > 0 ? (selectedPricing as any) : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      isVerified: isVerifiedOnly,
      sortBy,
      page,
      limit: 20,
    },
    { enabled: true }
  );

  const handlePricingChange = (pricing: string) => {
    setSelectedPricing((prev) =>
      prev.includes(pricing) ? prev.filter((p) => p !== pricing) : [...prev, pricing]
    );
    setPage(1);
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPage(1);
  };

  const handleReset = () => {
    setQuery("");
    setSelectedCategory(undefined);
    setSelectedPricing([]);
    setSelectedTags([]);
    setIsVerifiedOnly(true);
    setSortBy("newest");
    setPage(1);
  };

  const hasActiveFilters = query || selectedCategory || selectedPricing.length > 0 || selectedTags.length > 0 || !isVerifiedOnly;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Advanced Search</h1>
          <p className="text-gray-600">Find the perfect AI tool for your workflow</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>

              {showFilters && (
                <CardContent className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Category</Label>
                    <Select
                      value={selectedCategory?.toString() || "all"}
                      onValueChange={(value) => {
                        setSelectedCategory(value === "all" ? undefined : parseInt(value));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categoriesData?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pricing Filter */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Pricing Model</Label>
                    <div className="space-y-2">
                      {["free", "freemium", "paid", "enterprise", "open_source"].map((pricing) => (
                        <div key={pricing} className="flex items-center">
                          <Checkbox
                            id={`pricing-${pricing}`}
                            checked={selectedPricing.includes(pricing)}
                            onCheckedChange={() => handlePricingChange(pricing)}
                          />
                          <Label htmlFor={`pricing-${pricing}`} className="ml-2 text-sm cursor-pointer">
                            {pricing.charAt(0).toUpperCase() + pricing.slice(1).replace("_", " ")}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verified Filter */}
                  <div>
                    <div className="flex items-center">
                      <Checkbox
                        id="verified"
                        checked={isVerifiedOnly}
                        onCheckedChange={(checked) => {
                          setIsVerifiedOnly(checked as boolean);
                          setPage(1);
                        }}
                      />
                      <Label htmlFor="verified" className="ml-2 text-sm cursor-pointer font-medium">
                        Verified Tools Only
                      </Label>
                    </div>
                  </div>

                  {/* Tags Filter */}
                  {featuresData && featuresData.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Tags</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {featuresData.slice(0, 10).map((tag) => (
                          <div key={tag} className="flex items-center">
                            <Checkbox
                              id={`tag-${tag}`}
                              checked={selectedTags.includes(tag)}
                              onCheckedChange={() => handleTagChange(tag)}
                            />
                            <Label htmlFor={`tag-${tag}`} className="ml-2 text-sm cursor-pointer">
                              {tag}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reset Button */}
                  {hasActiveFilters && (
                    <Button variant="outline" className="w-full" onClick={handleReset}>
                      Reset Filters
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6 space-y-4">
              <Input
                placeholder="Search tools by name, description..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="text-base h-12"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                      <SelectItem value="trending">Trending</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="alphabetical">A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-gray-600">
                  {searchResults?.total || 0} results
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && searchResults && searchResults.tools.length > 0 && (
              <div className="space-y-4">
                {searchResults.tools.map((tool: any) => (
                  <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
                            {tool.isVerified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>

                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {tool.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="outline" className="text-xs">
                              {tool.pricingModel}
                            </Badge>
                            {tool.tags && Array.isArray(tool.tags) && tool.tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {tool.rating && typeof tool.rating === 'number' && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{Number(tool.rating).toFixed(1)}</span>
                              </div>
                            )}
                            {tool.website && (
                              <a
                                href={tool.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                Visit <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <p className="text-sm text-gray-600">
                    Page {searchResults.page} of {searchResults.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={!searchResults.hasPreviousPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage(page + 1)}
                      disabled={!searchResults.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && searchResults && searchResults.tools.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No tools found matching your criteria.</p>
                <Button variant="outline" onClick={handleReset}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
