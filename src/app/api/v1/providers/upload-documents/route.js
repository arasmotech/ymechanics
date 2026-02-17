import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { addProviderDocumentsService } from '@/app/services/provider_docs_service';

export async function POST(request) {
    try {
        const providerDocs = await request.json();
        console.log('Request:', providerDocs);
        const { provider_id, documents } = providerDocs;

        if (!provider_id || !documents || !Array.isArray(documents) || documents.length === 0) {
            return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }

        const provider = await prisma.providers.findUnique({ where: { id: provider_id } });
        if (!provider) {
            return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
        }

        const addProviderDocument = await addProviderDocumentsService(provider_id, documents);
        if (addProviderDocument === 0) {
            return NextResponse.json({ error: 'Failed to save document metadata' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Documents uploaded successfully',
            files: documents
        }, { status: 200 });

    } catch (error) {
        console.error('Document upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload documents' },
            { status: 500 }
        );
    }
}
