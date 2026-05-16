const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testKey() {
  const apiKey = "AIzaSyDaZW-YG3x7fr66HG_3fp70A9VP9VmwjvY";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    console.log("SUCCESS:", response.text());
  } catch (error) {
    console.error("FAILURE:", error.message);
    if (error.status) console.error("STATUS:", error.status);
  }
}

testKey();
