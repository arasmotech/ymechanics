import * as providersDal from '@/app/dal/providers_dal';
import bcrypt from 'bcryptjs';
import { generateOTP } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/email';
import { updateUserPasswordDal } from '../dal/users_dal';

export const addProviderService = async (providerData) => {
    const existingProvider = await providersDal.getProviderByEmail(providerData.email);
    if (existingProvider) {
        return { message: "Provider with this email already exists", statusCode: "202" };
    }

    // Generate OTP
    const otp = generateOTP();

    // Hash password
    const hashedPassword = await bcrypt.hash(providerData.password, 10);

    const userData = {
        name: providerData.name,
        username: providerData.email,
        password: hashedPassword,
    };

    const newProviderData = {
        ...providerData,
        otp,
    };

    // Create provider with user
    const provider = await providersDal.addProviderWithUser(newProviderData, userData);

    // Send OTP email
    const emailResult = await sendOTPEmail({
        email: provider.email,
        name: provider.name,
        otp,
    });

    if (!emailResult.success) {
        return { message: "Failed to send OTP email", statusCode: "500" };
        console.error('Failed to send OTP email:', emailResult.error);
        // You might want to delete the provider here or handle this differently
    }

    // Remove sensitive data from response
    const { user, ...providerWithoutUser } = provider;
    return {
        ...providerWithoutUser,
        message: "Provider registered successfully. Please check your email for OTP verification.",
        statusCode: "201",
        data: {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
            is_active: user.is_active,
            emailSent: emailResult.success,
        },

    };
};

export const getProvidersService = async (status) => {
    const providers = await providersDal.getAllProviders(status);
    const formattedProviders = providers.map(provider => {
        const { user, state, city, providerDocuments, ...providerWithoutRelations } = provider;
        return {
            ...providerWithoutRelations,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
                is_active: user.is_active,
            },
            state: {
                id: state.id,
                name: state.name,
            },
            city: {
                id: city.id,
                name: city.name,
            },
            providerDocuments: providerDocuments.map(doc => ({
                id: doc.id,
                document_type: doc.document_type,
                document_url: doc.document_url,
            })),
        };
    });

    return formattedProviders;

};

export const getProviderService = async (id) => {
    return await providersDal.getProviderById(id);
};

export const verifyOTPService = async (email, otp) => {
    return await providersDal.verifyProviderOTP(email, otp);
};

export const updateProviderOTPService = async (email, otp) => {
    return await providersDal.updateProviderOTP(email, otp);
};

export const getProviderByEmailService = async (email) => {
    return await providersDal.getProviderByEmail(email);
}

export const resetPasswordService = async (email, otp, newPassword) => {
    const provider = await providersDal.getProviderByEmail(email);

    if (!provider) {
        return { success: false, message: 'Provider not found' };
    }

    // Verify OTP
    if (provider.otp !== otp) {
        return { success: false, message: 'Invalid or expired OTP' };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear OTP
    await updateUserPasswordDal(provider.user_id, hashedPassword);
    await providersDal.updateProviderOTP(provider.email, '');

    return {
        success: true,
        message: 'Password reset successfully',
    };
};