import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Support Career</h3>
            <p className="text-gray-400 text-sm">Helping students discover their perfect career direction through intelligent assessment.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/quiz" className="text-gray-400 hover:text-white transition-colors">Take Test</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/groups" className="text-gray-400 hover:text-white transition-colors">Groups</Link></li>
              <li><Link to="/results" className="text-gray-400 hover:text-white transition-colors">My Results</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-xs">
          <p>&copy; 2025 Support Career. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
