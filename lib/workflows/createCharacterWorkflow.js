import { buildUpContext, generateGmResponse } from "@/lib/gemini/createCharacterService";
import { fetchInfo, updateCharacterSheet } from "@/lib/workflows/toolsImpl";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

// Helper functions
const formatHistory = (history) => {
    return history.map(msg => ({
        role: msg.role,
        parts: [{
            text: msg.content
        }]
    }));
}

const performFunctionCall = async (functionName, functionArgs) => {
    if (functionName === "fetchInfo") {
        const query = functionArgs.query;
        console.log(`Fetching additional info for: ${query}`);
        const result = await fetchInfo(query);
        return result;
    } else if (functionName === "updateCharacterSheet") {
        const property = functionArgs.property;
        const value = functionArgs.value;
        console.log(`Updating character sheet property: ${property} to ${value}`);
        const result = await updateCharacterSheet(property, value);
        return result;
    }
}

// Node functions
async function processInput(state) {
    const playerInput = state.history[state.history.length - 1].parts[0].text
    console.log("Processing player input:", playerInput);
    
    return { history: state.history };
}

async function fetchAdditionalInfo(state) {
    const contextLoopCount = state.contextLoopCount + 1;
    // Check for potential infinite loop
    if (contextLoopCount > 6) {
        console.warn(`Detected potential infinite loop in context fetching after ${contextLoopCount} iterations. Breaking.`);
        return { contextLoopCount, next: "generateResponse" };
    }
    
    try {
        const result = await buildUpContext(state.history, state.character);
        
        // Process function calls
        if (result && result.functionCalls && result.functionCalls.length > 0) {
            const updatedHistory = [...state.history];
            
            for (const functionCall of result.functionCalls) {
                const functionName = functionCall.name;
                const functionArgs = functionCall.args;

                if (functionName === "continue") {
                    console.log("Continuing onto generateResponse() due to continue() function call.");
                    return { 
                        history: updatedHistory,
                        next: "generateResponse" 
                    };
                } else {
                    // Add function call to history
                    updatedHistory.push({
                        role: 'model',
                        parts: [{ functionCall: functionCall }]
                    });

                    const functionResult = await performFunctionCall(functionName, functionArgs);

                    // Add function result to history
                    updatedHistory.push({
                        role: 'function',
                        parts: [{
                            functionResponse: {
                                name: functionName,
                                response: { 
                                    content: functionResult
                                }
                            }
                        }]
                    });
                }
            }
            return { history: updatedHistory, contextLoopCount, next: "fetchAdditionalInfo" };
        }
        
        // If no function calls, move to generate response
        console.warn("No function calls returned by buildUpContext(), moving to generateResponse()");
        return { contextLoopCount, next: "generateResponse" };
    } catch (error) {
        console.error("Error in fetchAdditionalInfo(): ", error);
        return { contextLoopCount, next: "generateResponse" };
    }
}

async function generateResponse(state) {
    console.log("Generating final response");
        
    try {
        const response = await generateGmResponse(state.history, state.character);
        
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
    graph.addNode("fetchAdditionalInfo", fetchAdditionalInfo);
    graph.addNode("generateResponse", generateResponse);
    
    // Define edges
    graph.addEdge(START, "processInput");
    graph.addEdge("processInput", "fetchAdditionalInfo");
    graph.addConditionalEdges(
        "fetchAdditionalInfo",
        (state) => {
            return state.next || "generateResponse";
        }
    );
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
            history: formatHistory(messages),
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