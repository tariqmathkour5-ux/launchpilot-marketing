import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, ExternalLink } from "lucide-react";

export default function Database() {
  const { data: tools, isLoading } = trpc.tools.list.useQuery({ limit: 100 });

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case "free":
        return "bg-green-100 text-green-800";
      case "freemium":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-purple-100 text-purple-800";
      case "enterprise":
        return "bg-red-100 text-red-800";
      case "open_source":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Tools Database</h1>
          <p className="text-lg text-slate-600">
            Browse and compare verified AI tools and services.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : tools && tools.length > 0 ? (
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tool Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>API</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tools.map((tool) => (
                  <TableRow key={tool.id}>
                    <TableCell className="font-medium">{tool.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {tool.description}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPricingColor(tool.pricingModel)}>
                        {tool.pricingModel.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tool.rating ? `${tool.rating}/5` : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tool.apiAvailable ? "default" : "outline"}>
                        {tool.apiAvailable ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <a href={tool.website} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">No tools available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
