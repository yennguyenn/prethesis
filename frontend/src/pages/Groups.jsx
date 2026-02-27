import React from "react";
import { Link } from "react-router-dom";
// Navbar injected by Layout

const groups = [
  {
    name: "Khối A",
    subjects: ["Toán", "Lý", "Hóa"],
    color: "bg-primary-100 text-primary-700 border-primary-300",
    description: "Phù hợp cho các ngành kỹ thuật, công nghệ thông tin, khoa học tự nhiên",
    itCareers: ["Khoa học máy tính", "Kỹ thuật phần mềm", "Trí tuệ nhân tạo (AI)", "Khoa học dữ liệu", "Hệ thống nhúng"]
  },
  {
    name: "Khối A1",
    subjects: ["Toán", "Lý", "Tiếng Anh"],
    color: "bg-primary-100 text-primary-700 border-primary-300",
    description: "Kết hợp kỹ thuật với ngoại ngữ, phù hợp IT quốc tế",
    itCareers: ["Kỹ thuật phần mềm", "Phát triển ứng dụng di động", "Điện toán đám mây", "DevOps"]
  },
  {
    name: "Khối B",
    subjects: ["Toán", "Hóa", "Sinh"],
    color: "bg-purple-100 text-purple-700 border-purple-300",
    description: "Tập trung vào công nghệ sinh học, y tế số",
    itCareers: ["Tin sinh học", "CNTT y tế", "Khoa học dữ liệu"]
  },
  {
    name: "Khối C",
    subjects: ["Văn", "Sử", "Địa"],
    color: "bg-orange-100 text-orange-700 border-orange-300",
    description: "Phù hợp với các ngành xã hội, quản trị",
    itCareers: ["Hệ thống thông tin", "Phân tích kinh doanh", "Marketing số"]
  },
  {
    name: "Khối D",
    subjects: ["Toán", "Văn", "Tiếng Anh"],
    color: "bg-pink-100 text-pink-700 border-pink-300",
    description: "Kết hợp toán học và ngôn ngữ",
    itCareers: ["Viết UX", "Viết tài liệu kỹ thuật", "Hệ thống quản trị nội dung", "Hệ thống thông tin"]
  },
  {
    name: "Khối D1",
    subjects: ["Toán", "Văn", "Tiếng Anh (chuyên)"],
    color: "bg-primary-100 text-primary-700 border-primary-300",
    description: "Chuyên sâu về ngoại ngữ và toán học",
    itCareers: ["CNTT quốc tế", "Kỹ sư bản địa hóa", "Dịch thuật kỹ thuật"]
  }
];

const itMapping = {
  "A": ["Khoa học máy tính", "Kỹ thuật phần mềm", "Trí tuệ nhân tạo", "Khoa học dữ liệu", "Hệ thống nhúng", "Mạng máy tính"],
  "A1": ["Kỹ thuật phần mềm", "Phát triển ứng dụng di động", "Điện toán đám mây", "DevOps", "An toàn thông tin"],
  "B": ["Tin sinh học", "CNTT y tế", "Khoa học dữ liệu", "AI trong y tế"],
  "C": ["Hệ thống thông tin", "Phân tích kinh doanh", "Marketing số", "Thương mại điện tử"],
  "D": ["Thiết kế UX", "Quản trị nội dung", "Hệ thống thông tin", "Truyền thông số"],
  "D1": ["Dự án CNTT quốc tế", "Bản địa hóa", "Truyền thông kỹ thuật"]
};

export default function Groups() {
  return (
    <div className="">

      {/* Header */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Các khối thi đại học</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá nhóm nghề nghiệp IT phù hợp với khối thi của bạn. Mỗi khối mở ra những cơ hội khác nhau trong lĩnh vực CNTT.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-primary-100 border-l-4 border-primary-700 p-6 rounded-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-primary-500 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-semibold text-primary-900 mb-1">Về khối thi</h3>
              <p className="text-primary-900">
                Kỳ thi tuyển sinh đại học ở Việt Nam được chia theo các khối dựa trên tổ hợp môn. 
                Khối thi sẽ quyết định những chương trình/ngành CNTT bạn có thể đăng ký.
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
                <h3 className="font-semibold text-gray-900 mb-2">Nghề nghiệp IT:</h3>
                <ul className="space-y-1">
                  {group.itCareers.map((career) => (
                    <li key={career} className="text-sm text-gray-600 flex items-center">
                      <svg className="w-4 h-4 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Các khối thi phổ biến cho ngành IT</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-primary-100 rounded-xl">
              <div className="text-4xl font-bold text-primary-700 mb-2">Khối A</div>
              <p className="text-gray-700 font-medium mb-2">Phù hợp IT kỹ thuật</p>
              <p className="text-sm text-gray-600">Nền tảng tốt cho Khoa học máy tính, Kỹ thuật</p>
            </div>

            <div className="text-center p-6 bg-primary-100 rounded-xl">
              <div className="text-4xl font-bold text-primary-700 mb-2">Khối A1</div>
              <p className="text-gray-700 font-medium mb-2">Phù hợp IT quốc tế</p>
              <p className="text-sm text-gray-600">Lý tưởng cho phát triển phần mềm quốc tế</p>
            </div>

            <div className="text-center p-6 bg-orange-50 rounded-xl">
              <div className="text-4xl font-bold text-orange-600 mb-2">Khối C</div>
              <p className="text-gray-700 font-medium mb-2">Phù hợp quản trị CNTT</p>
              <p className="text-sm text-gray-600">Phù hợp Hệ thống thông tin, CNTT kinh doanh</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Chưa chắc nên chọn khối nào? Hãy làm bài đánh giá để tìm ra chuyên ngành IT phù hợp nhất!
            </p>
            <Link
              to="/quiz"
              className="inline-block px-10 py-4 bg-primary-700 text-white text-lg font-semibold rounded-lg hover:bg-primary-900 transition-colors"
            >
              Làm bài đánh giá
            </Link>
          </div>
        </div>
      </div>
      {/* Footer provided globally */}
    </div>
  );
}
