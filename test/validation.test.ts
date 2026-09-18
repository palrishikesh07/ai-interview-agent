
import { validateInterviewInput } from "./../src/app/lib/validation";

describe("validateInterviewInput", () => {
    test("should return true for valid topic and answer", () => {
        const result = validateInterviewInput(
            "Node.js",
            "Node.js uses an event loop for handling asynchronous operations."
        );

        expect(result).toBe(true);
    });

    test("should return false when topic is empty", () => {
        const result = validateInterviewInput(
            "",
            "Node.js uses an event loop."
        );

        expect(result).toBe(false);
    });

    test("should return false when answer is empty", () => {
        const result = validateInterviewInput(
            "Node.js",
            ""
        );

        expect(result).toBe(false);
    });

    test("should return false when topic contains only spaces", () => {
        const result = validateInterviewInput(
            "   ",
            "Node.js uses an event loop."
        );

        expect(result).toBe(false);
    });

    test("should return false when answer contains only spaces", () => {
        const result = validateInterviewInput(
            "Node.js",
            "   "
        );

        expect(result).toBe(false);
    });

    test("should return true when topic and answer have surrounding spaces", () => {
        const result = validateInterviewInput(
            " Node.js ",
            " Node.js uses an event loop. "
        );

        expect(result).toBe(true);
    });
});
