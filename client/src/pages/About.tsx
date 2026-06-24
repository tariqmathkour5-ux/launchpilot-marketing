import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Users, Target, Award } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">About LaunchPilot AI</h1>
          <p className="text-lg text-slate-600">
            Empowering businesses with comprehensive AI tool discovery and guidance.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-slate-700 mb-4">
            LaunchPilot AI is dedicated to simplifying the discovery and evaluation of artificial intelligence tools and services. In a rapidly evolving AI landscape, we help businesses and individuals navigate the vast ecosystem of AI solutions to find the right tools for their specific needs.
          </p>
          <p className="text-lg text-slate-700">
            We believe that access to curated, verified information about AI tools should be free and accessible to everyone. Our platform provides comprehensive data, expert insights, and practical guidance to help you make informed decisions.
          </p>
        </section>

        {/* Values Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  We stay at the forefront of AI technology, continuously updating our database with the latest tools and innovations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  We believe in the power of community feedback and collaboration to build a better resource for everyone.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Every tool in our database is carefully verified for accuracy, reliability, and relevance to ensure quality information.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Accessibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  We make AI tool discovery accessible to everyone, regardless of technical expertise or budget constraints.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Our Team</h2>
          <p className="text-lg text-slate-700 mb-6">
            LaunchPilot AI is built by a passionate team of AI enthusiasts, developers, and researchers dedicated to making AI tool discovery easier.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4"></div>
                  <CardTitle>Team Member {i}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 text-sm">Role and expertise</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="text-center py-12 bg-slate-50 rounded-lg px-6">
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <p className="text-slate-600 mb-6">
            Have questions or suggestions? We'd love to hear from you!
          </p>
          <a href="/contact" className="text-blue-600 hover:text-blue-700 font-semibold">
            Contact Us →
          </a>
        </section>
      </div>
    </div>
  );
}
