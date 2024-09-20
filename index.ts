import { BedrockClassifier, MultiAgentOrchestrator } from "multi-agent-orchestrator";
import { AnthropicClassifier } from "multi-agent-orchestrator";
import { BedrockLLMAgent } from "multi-agent-orchestrator";
import { LanggraphAgent } from "./langgraphAgent";

const customBedrockClassifier = new BedrockClassifier({
    modelId: 'anthropic.claude-v2',
    inferenceConfig: {
        maxTokens: 500,
        temperature: 0.7,
        topP: 0.9
    }
});

const anthropicClassifier = new AnthropicClassifier({
    apiKey: process.env.ANTHROPIC_API_KEY || "YOUR_API_KEY"
});

// Create a new orchestrator
const orchestrator = new MultiAgentOrchestrator({
    classifier: anthropicClassifier,
    config: {
        LOG_AGENT_CHAT: true,
        LOG_CLASSIFIER_CHAT: true,
        LOG_CLASSIFIER_RAW_OUTPUT: false,
        LOG_CLASSIFIER_OUTPUT: true,
        LOG_EXECUTION_TIMES: true,
    }
});

// Add agents to the orchestrator
orchestrator.addAgent(
    new BedrockLLMAgent({
        name: "Tech Agent",
        description: "Specializes in technology areas including software development, hardware, AI, cybersecurity, blockchain, cloud computing, emerging tech innovations, and pricing/costs related to technology products and services.",
        streaming: true
    })
);

orchestrator.addAgent(
    new BedrockLLMAgent({
        name: "Health Agent",
        description: "Focuses on health and medical topics such as general wellness, nutrition, diseases, treatments, mental health, fitness, healthcare systems, and medical terminology or concepts.",
    })
);

const langgraphAgent = new LanggraphAgent({
    name: 'LinkedIn Content Agent',
    description: 'An agent that creates LinkedIn posts',
});

orchestrator.addAgent(langgraphAgent);

// Initialize the orchestrator
const userId = "poc-aws-multi-agent-orchestrator-langchain-langgraph";
const sessionId = "poc-session-1";
const query = "Create an LinkedIn Post about the latest trends in AI?";
console.log(`\nUser Query: ${query}`);


async function main() {
    try {
        const response = await orchestrator.routeRequest(query, userId, sessionId);
        console.log("\n** RESPONSE ** \n");
        console.log(`> Agent ID: ${response.metadata.agentId}`);
        console.log(`> Agent Name: ${response.metadata.agentName}`);
        console.log(`> User Input: ${response.metadata.userInput}`);
        console.log(`> User ID: ${response.metadata.userId}`);
        console.log(`> Session ID: ${response.metadata.sessionId}`);
        console.log(
            `> Additional Parameters:`,
            response.metadata.additionalParams
        );
        console.log(`\n> Response: `);
        // Stream the content
        for await (const chunk of response.output) {
            if (typeof chunk === "string") {
                process.stdout.write(chunk);
            } else {
                console.error("Received unexpected chunk type:", typeof chunk);
            }
        }
        console.log();
    } catch (error) {
        console.error("An error occurred:", error);
        // Here you could also add more specific error handling if needed
    }
}

main();