import prisma from '@/lib/prisma';

export const addProviderWithUser = async (providerData, userData) => {
    return await prisma.$transaction(async (tx) => {
        const user = await tx.users.create({
            data: {
                name: userData.name,
                username: userData.username,
                password: userData.password,
                role: 'MECHANIC',
                is_active: false, // Will be activated after OTP verification
            },
        });

        const provider = await tx.providers.create({
            data: {
                user_id: user.id,
                name: providerData.name,
                email: providerData.email,
                phone: providerData.phone,
                address: providerData.address,
                state_id: providerData.state_id,
                city_id: providerData.city_id,
                service_distance: providerData.service_distance,
                latitude: providerData.latitude,
                longitude: providerData.longitude,
                otp: providerData.otp,
            },
            include: {
                user: true,
                state: true,
                city: true,
            },
        });

        return provider;
    });
};

export const getAllProviders = async (status) => {
    console.log('Fetching providers with status:', status);
    const where = { status: status === 'ALL' ? undefined : status };
    return await prisma.providers.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    role: true,
                    is_active: true,
                },
            },
            state: true,
            city: true,
            providerDocuments: true
        },
    });
};

export const getProviderById = async (id) => {
    return await prisma.providers.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    role: true,
                    is_active: true,
                },
            },
            state: true,
            city: true,
        },
    });
};

export const getProviderByEmail = async (email) => {
    return await prisma.providers.findUnique({
        where: { email },
        include: {
            user: true,
        },
    });
};

export const updateProviderOTP = async (email, otp) => {
    const updatedProvider = await prisma.providers.update({
        where: { email },
        data: { otp, updated_at: new Date() },
        include: {
            user: true,
        },
    });
    return updatedProvider;
};

export const verifyProviderOTP = async (email, otp) => {
    const provider = await prisma.providers.findUnique({
        where: { email },
        include: { user: true },
    });

    if (!provider) {
        return { success: false, message: 'Provider not found' };
    }

    if (provider.otp !== otp) {
        return { success: false, message: 'Invalid OTP' };
    }

    // Update user to active
    await prisma.users.update({
        where: { id: provider.user_id },
        data: { is_active: true },
    });

    // Clear OTP after verification
    await prisma.providers.update({
        where: { id: provider.id },
        data: { otp: '', updated_at: new Date() },
    });

    return { success: true, message: 'Email verified successfully' };
};