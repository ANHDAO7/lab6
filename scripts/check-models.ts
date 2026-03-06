import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyA8aVmgR3-CMhetEqsSYMePSgZJAzjcYE8"; // Từ .env.local của bạn
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log("Đang truy vấn danh sách model khả dụng...");
        // API listModels không có trong SDK hiện tại một cách trực tiếp đơn giản như generateContent
        // Chúng ta sẽ dùng API fetch trực tiếp để kiểm tra nếu cần, 
        // nhưng hãy thử các tên model phổ biến khác trước.

        const commonModels = ["gemini-1.5-flash", "gemini-1.0-pro", "gemini-1.5-pro"];

        for (const m of commonModels) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("test");
                console.log(`✅ Model '${m}' hoạt động!`);
            } catch (e: any) {
                console.log(`❌ Model '${m}' lỗi: ${e.message}`);
            }
        }
    } catch (error: any) {
        console.error("Lỗi:", error.message);
    }
}

listModels();
