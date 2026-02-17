import prisma from '../../lib/prisma';

export async function addProviderDocument(providerId, documentData) {
    return await prisma.provider_documents.create({
        data: {
            provider_id: providerId,
            document_type: documentData.document_type,
            document_url: documentData.document_url,
            status: 'PENDING'
        }
    });
}

export async function addProviderDocuments(documents) {
    return await prisma.$transaction(async (tx) => {
        const createdDocuments = [];
        for (const doc of documents) {
            const createdDoc = await tx.provider_documents.create({
                data: {
                    provider_id: doc.provider_id,
                    document_type: doc.document_type,
                    document_url: doc.document_url,
                }
            });
            createdDocuments.push(createdDoc);
        }
        return createdDocuments.length;
    });
}