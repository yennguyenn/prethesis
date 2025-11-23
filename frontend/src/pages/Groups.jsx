import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const groups = [
  {
    name: "Khối A",
    subjects: ["Toán", "Lý", "Hóa"],
    color: "bg-blue-100 text-blue-700 border-blue-300",
    description: "Phù hợp cho các ngành kỹ thuật, công nghệ thông tin, khoa học tự nhiên",
    itCareers: ["Computer Science", "Software Engineering", "AI", "Data Science", "Embedded Systems"]
  },
  {
    name: "Khối A1",
    subjects: ["Toán", "Lý", "Tiếng Anh"],
    color: "bg-green-100 text-green-700 border-green-300",
    description: "Kết hợp kỹ thuật với ngoại ngữ, phù hợp IT quốc tế",
    itCareers: ["Software Engineering", "Mobile Development", "Cloud Computing", "DevOps"]
  },
  {
    name: "Khối B",
    subjects: ["Toán", "Hóa", "Sinh"],
    color: "bg-purple-100 text-purple-700 border-purple-300",
    description: "Tập trung vào công nghệ sinh học, y tế số",
    itCareers: ["Bioinformatics", "Health IT", "Data Science"]
  },
  {
    name: "Khối C",
    subjects: ["Văn", "Sử", "Địa"],
    color: "bg-orange-100 text-orange-700 border-orange-300",
    description: "Phù hợp với các ngành xã hội, quản trị",
    itCareers: ["Information Systems", "Business Analytics", "Digital Marketing"]
  },
  {
    name: "Khối D",
    subjects: ["Toán", "Văn", "Tiếng Anh"],
    color: "bg-pink-100 text-pink-700 border-pink-300",
    description: "Kết hợp toán học và ngôn ngữ",
    itCareers: ["UX Writing", "Technical Writing", "Content Management Systems", "Information Systems"]
  },
  {
    name: "Khối D1",
    subjects: ["Toán", "Văn", "Tiếng Anh (chuyên)"],
    color: "bg-indigo-100 text-indigo-700 border-indigo-300",
    description: "Chuyên sâu về ngoại ngữ và toán học",
    itCareers: ["International IT", "Localization Engineering", "Technical Translation"]
  }
];

const itMapping = {
  "A": ["Computer Science", "Software Engineering", "Artificial Intelligence", "Data Science", "Embedded Systems", "Computer Networks"],
  "A1": ["Software Engineering", "Mobile Development", "Cloud Computing", "DevOps", "Cybersecurity"],
  "B": ["Bioinformatics", "Health IT", "Data Science", "AI in Healthcare"],
  "C": ["Information Systems", "Business Analytics", "Digital Marketing", "E-commerce"],
  "D": ["UX Design", "Content Management", "Information Systems", "Digital Media"],
  "D1": ["International IT Projects", "Localization", "Technical Communication"]
};

export default function Groups() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar activePage="groups" />

      {/* Header */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">University Entrance Exam Groups</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover which IT careers match your exam group (Khối thi). Each group opens different opportunities in the IT field.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-500 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">About Exam Groups</h3>
              <p className="text-blue-800">
                Vietnamese university entrance exams are organized into groups (Khối) based on subject combinations. 
                Your group determines which IT programs you can apply to.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.name} className={`bg-white rounded-xl shadow-lg p-6 border-2 ${group.color.split(' ')[2]} hover:shadow-xl transition-shadow`}>
              <div className={`inline-block px-4 py-2 rounded-lg ${group.color} font-bold text-lg mb-4`}>
                {group.name}
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Môn thi:</h3>
                <div className="flex flex-wrap gap-2">
                  {group.subjects.map((subject) => (
                    <span key={subject} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-gray-600 mb-4">{group.description}</p>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">IT Careers:</h3>
                <ul className="space-y-1">
                  {group.itCareers.map((career) => (
                    <li key={career} className="text-sm text-gray-600 flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {career}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Most Common Groups for IT</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="text-4xl font-bold text-blue-600 mb-2">Khối A</div>
              <p className="text-gray-700 font-medium mb-2">Best for Technical IT</p>
              <p className="text-sm text-gray-600">Strongest foundation for Computer Science, Engineering</p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="text-4xl font-bold text-green-600 mb-2">Khối A1</div>
              <p className="text-gray-700 font-medium mb-2">Best for Global IT</p>
              <p className="text-sm text-gray-600">Ideal for international software development</p>
            </div>

            <div className="text-center p-6 bg-orange-50 rounded-xl">
              <div className="text-4xl font-bold text-orange-600 mb-2">Khối C</div>
              <p className="text-gray-700 font-medium mb-2">Best for IT Management</p>
              <p className="text-sm text-gray-600">Perfect for Information Systems, Business IT</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Not sure which group to choose? Take our assessment to find your perfect IT specialization!
            </p>
            <Link
              to="/quiz"
              className="inline-block px-10 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Take the Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
