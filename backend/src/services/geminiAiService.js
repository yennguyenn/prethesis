import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config(); // Đảm bảo biến môi trường được tải

// Lấy API Key từ biến môi trường
const apiKey = process.env.GEMINI_API_KEY;

let genAI = null;
if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
}

/**
 * Hàm chấm điểm câu trả lời ngắn bằng Gemini
 * @param {string} question - Câu hỏi tự luận
 * @param {string} correctAnswer - Đáp án chuẩn của giáo viên
 * @param {string} studentAnswer - Câu trả lời của sinh viên
 * @returns {Promise<{score: number, feedback: string}>}
 */
export const evaluateShortAnswer = async (question, correctAnswer, studentAnswer) => {
    if (!genAI) {
        throw new Error("Chưa cấu hình GEMINI_API_KEY trong file .env");
    }

    try {
        // Sử dụng mô hình gemini-1.5-flash (nhanh, nhẹ và có gói miễn phí)
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `Bạn là một chuyên gia chấm thi khó tính. 
Hãy chấm điểm câu trả lời ngắn của học sinh.

Câu hỏi: ${question}
Đáp án chuẩn cần có: ${correctAnswer}
Câu trả lời của học sinh: ${studentAnswer}

Hãy chấm điểm theo thang 10 dựa trên các quy tắc khắt khe sau:
1. Đọc thật kỹ ngữ cảnh và logic của câu. Nếu học sinh viết ngược nghĩa (ví dụ: dùng từ "không", "sai") so với đáp án chuẩn, lập tức cho 0 điểm.
2. Nếu câu trả lời quá mập mờ, chung chung, hãy trừ 50% số điểm.
3. Học sinh có thể dùng từ đồng nghĩa, nhưng phải đúng bản chất chuyên ngành.

Chỉ trả về định dạng JSON hợp lệ (không chứa thẻ markdown kiểu \`\`\`json) với đúng 2 trường dữ liệu sau:
- "score": (kiểu số) Điểm số từ 0 đến 10.
- "feedback": (kiểu chuỗi) Giải thích tại sao bị trừ điểm hoặc khen ngợi ngắn gọn.`;

        // Ép mô hình luôn trả về chuẩn JSON
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const responseText = result.response.text();
        
        // Parse kết quả JSON trả về
        const data = JSON.parse(responseText);
        
        return {
            score: typeof data.score === 'number' ? data.score : parseFloat(data.score),
            feedback: data.feedback || "Không có nhận xét."
        };
    } catch (error) {
        console.error("Lỗi khi gọi Gemini API:", error);
        throw new Error("Hệ thống chấm điểm tự động đang gặp sự cố. Vui lòng thử lại sau.");
    }
};
