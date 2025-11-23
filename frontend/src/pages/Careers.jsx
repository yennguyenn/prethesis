import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const careers = [
  {
    id: "CS",
    name: "Computer Science",
    icon: "💻",
    description: "Study algorithms, data structures, and computational theory. Focus on theoretical foundations and problem-solving.",
    skills: ["Algorithm Design", "Data Structures", "Mathematics", "Logic", "Theory of Computation"],
    careers: ["Research Scientist", "Algorithm Engineer", "Computer Scientist", "Academic Professor"],
    salary: "$80,000 - $150,000"
  },
  {
    id: "SE",
    name: "Software Engineering",
    icon: "⚙️",
    description: "Design, develop, and maintain software applications. Focus on building scalable, reliable systems.",
    skills: ["Programming", "System Design", "Testing", "DevOps", "Agile Methodology"],
    careers: ["Software Developer", "Full-Stack Engineer", "Backend Developer", "DevOps Engineer"],
    salary: "$75,000 - $140,000"
  },
  {
    id: "IS",
    name: "Information Systems",
    icon: "📊",
    description: "Manage business information and technology infrastructure. Bridge IT and business operations.",
    skills: ["Database Management", "Business Analysis", "ERP Systems", "Project Management"],
    careers: ["Business Analyst", "IT Manager", "System Administrator", "Database Administrator"],
    salary: "$70,000 - $130,000"
  },
  {
    id: "NET",
    name: "Computer Networks",
    icon: "🌐",
    description: "Design and manage network infrastructure. Ensure reliable data communication and connectivity.",
    skills: ["Network Protocols", "Routing", "Switching", "Network Security", "Cloud Infrastructure"],
    careers: ["Network Engineer", "Network Administrator", "Cloud Architect", "Infrastructure Specialist"],
    salary: "$75,000 - $135,000"
  },
  {
    id: "CY",
    name: "Cybersecurity",
    icon: "🔒",
    description: "Protect systems and data from cyber threats. Focus on security architecture and threat prevention.",
    skills: ["Penetration Testing", "Encryption", "Security Auditing", "Incident Response", "Forensics"],
    careers: ["Security Analyst", "Penetration Tester", "Security Consultant", "CISO"],
    salary: "$85,000 - $160,000"
  },
  {
    id: "AI",
    name: "Artificial Intelligence",
    icon: "🤖",
    description: "Develop intelligent systems and machine learning models. Create AI-powered solutions.",
    skills: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Python/TensorFlow"],
    careers: ["ML Engineer", "AI Researcher", "Data Scientist", "NLP Engineer"],
    salary: "$90,000 - $170,000"
  },
  {
    id: "DS",
    name: "Data Science",
    icon: "📈",
    description: "Analyze large datasets to extract insights. Use statistics and ML for decision-making.",
    skills: ["Statistics", "Data Mining", "Visualization", "Big Data", "SQL/Python"],
    careers: ["Data Scientist", "Data Analyst", "Business Intelligence Analyst", "Data Engineer"],
    salary: "$85,000 - $155,000"
  },
  {
    id: "GD",
    name: "Graphic Design & Multimedia",
    icon: "🎨",
    description: "Create visual content and user interfaces. Design engaging digital experiences.",
    skills: ["UI/UX Design", "Adobe Suite", "Figma", "Visual Design", "User Research"],
    careers: ["UI/UX Designer", "Graphic Designer", "Product Designer", "Creative Director"],
    salary: "$60,000 - $120,000"
  },
  {
    id: "EMB",
    name: "Embedded Systems",
    icon: "🔧",
    description: "Develop hardware-software integrated systems. Work with IoT and microcontrollers.",
    skills: ["C/C++", "Microcontrollers", "RTOS", "Hardware Design", "IoT Protocols"],
    careers: ["Embedded Engineer", "IoT Developer", "Firmware Engineer", "Hardware Engineer"],
    salary: "$75,000 - $140,000"
  },
  {
    id: "MOB",
    name: "Mobile Development",
    icon: "📱",
    description: "Build mobile applications for iOS and Android. Create user-friendly mobile experiences.",
    skills: ["iOS/Android Dev", "React Native", "Flutter", "Mobile UI/UX", "App Store Optimization"],
    careers: ["Mobile Developer", "iOS Developer", "Android Developer", "App Developer"],
    salary: "$70,000 - $135,000"
  }
];

export default function Careers() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar activePage="careers" />

      {/* Header */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">IT Career Specializations</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore detailed information about each IT specialization, required skills, career paths, and salary ranges
          </p>
        </div>
      </div>

      {/* Careers Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {careers.map((career) => (
            <div key={career.id} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-start mb-4">
                <div className="text-5xl mr-4">{career.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{career.name}</h2>
                  <p className="text-gray-600">{career.description}</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Key Skills:</h3>
                <div className="flex flex-wrap gap-2">
                  {career.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Career Opportunities:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {career.careers.map((job) => (
                    <li key={job}>{job}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Average Salary:</span>
                  <span className="text-green-600 font-bold">{career.salary}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-indigo-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Find Your Perfect Match</h2>
          <p className="text-xl mb-8 opacity-90">
            Take our assessment to discover which specialization aligns with your interests and goals
          </p>
          <Link
            to="/quiz"
            className="inline-block px-10 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Start Assessment
          </Link>
        </div>
      </div>
    </div>
  );
}
