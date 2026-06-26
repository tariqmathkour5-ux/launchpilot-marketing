import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, ExternalLink, Star } from "lucide-react";

function parseQueryParams(search: string) {
  const params = new URLSearchParams(search);
  return {
    query: params.get("q") || "",
    categoryId: params.get("category") ? parseInt(params.get("category")!) : undefined,
    pricingModels: params.getAll("pricing") as any,
    features: params.getAll("feature"),
    sortBy: (params.get("sort") || "newest") as any,
    page: params.get("page") ? parseInt(params.get("page")!) : 1,
  };
}

function buildSearchUrl(params: {
  query?: string;
  categoryId?: number;
  pricingModels?: string[];
  features?: string[];
  sortBy?: string;
  page?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.query) searchParams.set("q", params.query);
  if (params.categoryId) searchParams.set("category", params.categoryId.toString());
  if (params.pricingModels?.length) {
    (params.pricingModels as string[]).forEach((m: string) => searchParams.append("pricing", m));
  }
  if (params.features?.length) {
    (params.features as string[]).forEach((f: string) => searchParams.append("feature", f));
  }
  if (params.sortBy && params.sortBy !== "newest") {
    searchParams.set("sort", params.sortBy);
  }
  if (params.page && params.page > 1) {
    searchParams.set("page", params.page.toString());
  }

  const queryString = searchParams.toString();
  return `/database/search${queryString ? "?" + queryString : ""}`;
}

export default function DatabaseSearchSEO() {
  const [location, setLocation] = useLocation();
  const [mounted, setMounted] = useState(false);

  const params = parseQueryParams(location.split("?")[1] || "");

  const [query, setQuery] = useState(params.query);
  const [categoryId, setCategoryId] = useState(params.categoryId);
  const [pricingModels, setPricingModels] = useState(params.pricingModels);
  const [selectedFeatures, setSelectedFeatures] = useState(params.features);
  const [sortBy, setSortBy] = useState(params.sortBy);
  const [page, setPage] = useState(params.page);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: features } = trpc.search.features.useQuery();

  const { data: searchResults, isLoading } = trpc.search.tools.useQuery(
    {
      query: query || undefined,
      categoryId,
      pricingModels: pricingModels.length > 0 ? pricingModels : undefined,
      features: selectedFeatures.length > 0 ? selectedFeatures : undefined,
      sortBy,
      page,
      limit: 20,
    },
    { enabled: mounted }
  );

  const updateFilters = (newParams: any) => {
    const url = buildSearchUrl(newParams);
    setLocation(url);
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    updateFilters({
      query: value,
      categoryId,
      pricingModels,
      features: selectedFeatures,
      sortBy,
      page: 1,
    });
  };

  const togglePricingModel = (model: string) => {
    const newModels = pricingModels.includes(model)
      ? pricingModels.filter((m: string) => m !== model)
      : [...pricingModels, model];
    setPricingModels(newModels);
    updateFilters({
      query,
      categoryId,
      pricingModels: newModels,
      features: selectedFeatures,
      sortBy,
      page: 1,
    });
  };

  const toggleFeature = (feature: string) => {
    const newFeatures = selectedFeatures.includes(feature)
      ? selectedFeatures.filter(f => f !== feature)
      : [...selectedFeatures, feature];
    setSelectedFeatures(newFeatures);
    updateFilters({
      query,
      categoryId,
      pricingModels,
      features: newFeatures,
      sortBy,
      page: 1,
    });
  };

  const handleCategoryChange = (val: string) => {
    const newCategoryId = val && val !== "all" ? parseInt(val) : undefined;
    setCategoryId(newCategoryId);
    updateFilters({
      query,
      categoryId: newCategoryId,
      pricingModels,
      features: selectedFeatures,
      sortBy,
      page: 1,
    });
  };

  const handleSortChange = (val: string) => {
    setSortBy(val as any);
    updateFilters({
      query,
      categoryId,
      pricingModels,
      features: selectedFeatures,
      sortBy: val,
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateFilters({
      query,
      categoryId,
      pricingModels,
      features: selectedFeatures,
      sortBy,
      page: newPage,
    });
  };

  const handleReset = () => {
    setQuery("");
    setCategoryId(undefined);
    setPricingModels([]);
    setSelectedFeatures([]);
    setSortBy("newest");
    setPage(1);
    setLocation("/database/search");
  };

  const pricingOptions = [
    { value: "free", label: "Free" },
    { value: "freemium", label: "Freemium" },
    { value: "paid", label: "Paid" },
    { value: "enterprise", label: "Enterprise" },
    { value: "open_source", label: "Open Source" },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">AI Tools Database</h1>
          <p className="text-blue-100 text-lg">
            Search and discover the perfect AI tools for your workflow
          </p>
          {searchResults?.total && (
            <p className="text-blue-100 text-sm mt-2">
              {searchResults.total} tools available
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
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

              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <Select value={categoryId?.toString() || "all"} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

              <div>
                <label className="block text-sm font-semibold mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={handleSortChange}>
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

              <Button variant="outline" className="w-full" onClick={handleReset}>
                Reset Filters
              </Button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing {searchResults?.tools.length || 0} of {searchResults?.total || 0} tools
              </p>
            </div>

            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}

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

                {searchResults && searchResults.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      disabled={!searchResults.hasPreviousPage}
                      onClick={() => handlePageChange(page - 1)}
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
                            onClick={() => handlePageChange(pageNum)}
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
                      onClick={() => handlePageChange(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : !isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No tools found matching your criteria.</p>
                <Button variant="outline" className="mt-4" onClick={handleReset}>
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
