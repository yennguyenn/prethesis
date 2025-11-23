import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar activePage="home" />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 py-32 overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-6xl font-bold text-white mb-6">
            Discover Your IT Career Path
          </h1>
          <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
            Take our comprehensive career test to find the perfect IT specialization that matches your interests, skills, and aspirations
          </p>
          <Link
            to="/quiz"
            className="inline-block px-10 py-4 bg-white text-indigo-600 text-lg font-bold rounded-full hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            Take the free test →
          </Link>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">1. Take the Test</h3>
              <p className="text-gray-600">Answer 30 carefully designed questions about your interests, skills, and career preferences</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🤖</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">2. AI Analysis</h3>
              <p className="text-gray-600">Our advanced algorithm analyzes your responses to match you with the best IT specializations</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">3. Get Results</h3>
              <p className="text-gray-600">Receive personalized recommendations with detailed career paths and next steps</p>
            </div>
          </div>
        </div>
      </div>

      {/* IT Specializations Preview */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Explore IT Specializations</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Discover the diverse range of IT career paths available to you
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            {[
              { icon: "💻", name: "Computer Science" },
              { icon: "⚙️", name: "Software Engineering" },
              { icon: "📊", name: "Information Systems" },
              { icon: "🌐", name: "Computer Networks" },
              { icon: "🔒", name: "Cybersecurity" },
              { icon: "🤖", name: "Artificial Intelligence" },
              { icon: "📈", name: "Data Science" },
              { icon: "🎨", name: "Game Development" },
              { icon: "🔧", name: "Embedded Systems" },
              { icon: "📱", name: "Mobile Development" }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/careers" className="inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
              View All Careers
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-indigo-600">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">30+</div>
              <div className="text-indigo-200">Questions</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">10</div>
              <div className="text-indigo-200">IT Specializations</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <div className="text-indigo-200">Free Forever</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Find Your Path?</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of students who have discovered their ideal IT career through our assessment
          </p>
          <Link
            to="/quiz"
            className="inline-block px-10 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Start Your Assessment
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">IT Career Path</h3>
              <p className="text-gray-400">Helping students discover their perfect IT career path through intelligent assessment</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link to="/quiz" className="text-gray-400 hover:text-white">Take Test</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-white">Careers</Link></li>
                <li><Link to="/groups" className="text-gray-400 hover:text-white">Groups</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 IT Career Path. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
