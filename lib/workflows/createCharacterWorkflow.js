import { generateGmResponse } from "@/lib/gemini/createCharacterService";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

// Node functions
async function processInput(state) {
    const playerInput = state.history[state.history.length - 1].content
    console.log("Processing player input:", playerInput);
    
    return { history: state.history };
}

async function generateResponse(state) {
    console.log("Generating final response");
    
    // Convert history to the format expected by generateGmResponse
    const formattedHistory = state.history.map(msg => ({
        role: msg.role,
        parts: [{
            text: msg.content
        }]
    }));
        
    try {
        const response = await generateGmResponse(formattedHistory, state.character);
        
        return { response: response.message, character: response.characterSheet };
    } catch (error) {
        console.error("Error in generateResponse:", error);
        return { response: { message: "Error generating response. Please try again." } };
    }
}

const stateSchema = Annotation.Root({
    sessionId: Annotation({
        default: () => ""
    }),
    character: Annotation({
        default: () => {}
    }),
    history: Annotation({
        default: () => []
    }),
    response: Annotation({
        default: () => ""
    }),
    contextLoopCount: Annotation({
        default: () => 0
    })
})

// Create the graph
export async function createGameGraph() {
    // Create a new StateGraph
    const graph = new StateGraph(stateSchema);
    
    // Define nodes
    graph.addNode("processInput", processInput);
    graph.addNode("generateResponse", generateResponse);
    
    // Define edges
    graph.addEdge(START, "processInput");
    graph.addEdge("processInput", "generateResponse");
    
    graph.addEdge("generateResponse", END);
    
    return graph.compile();
}

export async function processPlayerMessage(sessionId, messages, character) {
    try {
        const compiledGraph = await createGameGraph();
        
        // Create the initial state
        const initialState = {
            sessionId, 
            character, 
            history: messages,
            response: null,
            contextLoopCount: 0
        };
        
        // Run the graph
        const result = await compiledGraph.invoke(initialState);
        console.log("Result:", JSON.stringify(result, null, 2));

        return {
            message: result.response,
            character: result.character
        }

    } catch (error) {
        console.error("Error in workflow execution:", error);
        throw error;
    }
}