import { Agent, AgentOptions, ConversationMessage, ParticipantRole } from "multi-agent-orchestrator";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatAnthropic } from "@langchain/anthropic";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

export class LanggraphAgent extends Agent {
    agent: any;

    constructor(options: AgentOptions) {
        super(options);

        // Define the tools for the agent to use
        let agentTools = [new TavilySearchResults({ maxResults: 3 })];
        let agentModel = new ChatAnthropic({
            temperature: 0,
            model: "claude-3-5-sonnet-20240620",
        });

        // Initialize memory to persist state between graph runs
        const agentCheckpointer = new MemorySaver();
        this.agent = createReactAgent({
            llm: agentModel,
            tools: agentTools,
            checkpointSaver: agentCheckpointer,
        });
    }

    async processRequest(
        inputText: string,
        userId: string,
        sessionId: string,
        chatHistory: ConversationMessage[]
    ): Promise<{ role: ParticipantRole, content: { text: any; }[] }> {
        const agentFinalState = await this.agent.invoke(
            { messages: [new HumanMessage(inputText)] },
            { configurable: { thread_id: sessionId } },
        );

        return {
            role: ParticipantRole.ASSISTANT,
            content: [{ text: agentFinalState.messages[agentFinalState.messages.length - 1].content || 'ERROR in CUSTOM AGENT' }]
        };
    }
}