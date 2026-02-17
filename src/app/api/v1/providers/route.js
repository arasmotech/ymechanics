import { addProviderService, getProvidersService } from '@/app/services/providers_service';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const searchParams = new URL(request.url).searchParams;
        const status = searchParams.get('status');
        const providers = await getProvidersService(status);
        return NextResponse.json({
            statusCode: "200",
            message: "Providers fetched successfully",
            data: providers
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            statusCode: "500",
            message: error.message || "Failed to fetch providers"
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const providerData = await request.json();

        // Validate required fields
        const requiredFields = ['name', 'email', 'phone', 'password', 'address', 'state_id', 'city_id', 'service_distance', 'latitude', 'longitude'];
        const missingFields = requiredFields.filter(field => !providerData[field]);

        if (missingFields.length > 0) {
            return NextResponse.json({
                statusCode: "400",
                message: `Missing required fields: ${missingFields.join(', ')}`
            }, { status: 400 });
        }

        const newProvider = await addProviderService(providerData);

        return NextResponse.json({
            statusCode: "201",
            message: "Provider registered successfully",
            data: newProvider
        }, { status: 201 });
    } catch (error) {
        console.error('Provider registration error:', error);
        return NextResponse.json({
            statusCode: "500",
            message: error.message || "Failed to register provider"
        }, { status: 500 });
    }
}
