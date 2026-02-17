import { addProviderDocuments } from "../dal/provider_docs_dal";

export const addProviderDocumentsService = async (providerId, documents) => {
    try {
        const res = await addProviderDocuments(documents.map(doc => ({ ...doc, provider_id: providerId })));
        return res;
    } catch (error) {
        console.error("Error adding provider documents:", error);
        throw error;
    }
}