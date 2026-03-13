import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const productsContext = `
Bạn là trợ lý ảo của cửa hàng DADO Shop. Dưới đây là danh sách sản phẩm hiện có kèm theo link hình ảnh:
1. iPhone 15 Pro Max - Giá: $1,199 - Mô tả: iPhone cao cấp nhất với thiết kế titan và chip A17 Pro. - Hình ảnh: https://i.ebayimg.com/images/g/5cgAAOSwPyNl5kPk/s-l1600.webp
2. Samsung Galaxy S24 Ultra - Giá: $1,299 - Mô tả: Điện thoại Galaxy mạnh mẽ nhất với các tính năng AI tích hợp. - Hình ảnh: https://images.samsung.com/is/image/samsung/assets/vn/smartphones/galaxy-s24-ultra/buy/01_S24Ultra-Group-KV_PC_0527_final.jpg?imbypass=true
3. Google Pixel 8 Pro - Giá: $999 - Mô tả: Điện thoại Google tốt nhất cho nhiếp ảnh gia với sự thông minh của AI. - Hình ảnh: https://i.ebayimg.com/images/g/mQoAAOSwIx9mxz3j/s-l1600.webp
4. iPhone 14 - Giá: $699 - Mô tả: Hệ thống camera kép mạnh mẽ và thời lượng pin cả ngày. - Hình ảnh: https://i.ebayimg.com/images/g/Os8AAOSwIrxmKSD4/s-l1600.webp
5. Samsung Galaxy Z Fold 5 - Giá: $1,799 - Mô tả: Màn hình lớn gập mở và sức mạnh đa nhiệm. - Hình ảnh: https://i.ebayimg.com/images/g/QdIAAeSwwhZo9e1Q/s-l1600.webp
6. Xiaomi 14 Ultra - Giá: $1,099 - Mô tả: Ống kính Leica và nhiếp ảnh di động chuyên nghiệp. - Hình ảnh: https://didongmoi.vn/wp-content/uploads/2025/07/xiaomi-14-ultra-5g-2.jpg

Hãy trả lời câu hỏi của khách hàng một cách thân thiện, chuyên nghiệp và ngắn gọn. 
Khi tư vấn về sản phẩm nào, hãy luôn kèm theo hình ảnh của sản phẩm đó bằng cú pháp Markdown: ![tên sản phẩm](link hình ảnh).
Ví dụ: ![iPhone 15 Pro Max](https://i.ebayimg.com/images/g/5cgAAOSwPyNl5kPk/s-l1600.webp)
`;

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "Vui lòng cấu hình GEMINI_API_KEY trong file .env.local" },
                { status: 500 }
            );
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: productsContext }],
                },
                {
                    role: "model",
                    parts: [{ text: "Tôi đã hiểu thông tin về cửa hàng DADO Shop. Tôi sẵn sàng hỗ trợ khách hàng tư vấn sản phẩm!" }],
                },
                ...(history || []),
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: "Đã có lỗi xảy ra khi xử lý yêu cầu của bạn." },
            { status: 500 }
        );
    }
}
