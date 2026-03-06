import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyA8aVmgR3-CMhetEqsSYMePSgZJAzjcYE8"; // Lấy từ .env.local của bạn
const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash",
    "gemini-exp-1206"
];

async function testModel(modelName: string) {
    console.log(`\n--- Testing model: ${modelName} ---`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Xin chào, bạn là model nào vậy?");
        const response = await result.response;
        console.log(`✅ Thành công: ${response.text().substring(0, 100)}...`);
        return true;
    } catch (error: any) {
        console.log(`❌ Thất bại: ${error.message || "Không rõ lỗi"}`);
        if (error.status === 404) {
            console.log("   (Lưu ý: Model này có thể chưa khả dụng với Key của bạn hoặc sai tên model)");
        }
        return false;
    }
}

async function runTests() {
    console.log("Bắt đầu kiểm tra các model Gemini khả dụng với API Key của bạn...");
    const results = [];
    for (const model of modelsToTest) {
        const res = await testModel(model);
        results.push({ model, success: res });
    }

    console.log("\n=== TỔNG KẾT KIỂM TRA ===");
    results.forEach(r => {
        console.log(`${r.success ? "✅" : "❌"} ${r.model}`);
    });
}

runTests();
