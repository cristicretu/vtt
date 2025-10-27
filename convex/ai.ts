import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { action } from "./_generated/server";

// The google() provider automatically reads from GOOGLE_GENERATIVE_AI_API_KEY env var
export const generateRecipe = action({
	handler: async () => {
		const { text } = await generateText({
			model: google("gemini-2.0-flash-exp"),
			prompt: "Write a vegetarian lasagna recipe for 4 people in 100 words.",
		});

		return text;
	},
});
