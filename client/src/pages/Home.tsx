import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Zap, Database, BookOpen, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
            Discover the Best AI Tools for Your Workflow
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            LaunchPilot AI is your comprehensive guide to cutting-edge artificial intelligence tools and services. Find, compare, and integrate the perfect AI solutions for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/categories">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Explore Tools <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/database">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Database
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose LaunchPilot AI?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Curated Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Handpicked AI tools verified for quality, reliability, and innovation. Stay updated with the latest solutions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Database className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Comprehensive Database</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Browse detailed information about pricing, features, integrations, and use cases for each tool.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Expert Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Read in-depth articles and guides to help you make informed decisions about AI tool selection.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Workflow?</h2>
          <p className="text-lg text-slate-600 mb-8">
            Start exploring AI tools today and discover how they can enhance your productivity and capabilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/categories">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Browse Categories
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
