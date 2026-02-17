import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getSignedUrlPutFunction(fileName) {
    console.log("Generating signed URL for", fileName);

    const s3 = new S3Client({
        region: process.env.AWS_S3_REGION ? process.env.AWS_S3_REGION : 'blr1',
        credentials: {
            accessKeyId: process.env.AWS_S3_ACCESS_KEY ? process.env.AWS_S3_ACCESS_KEY : 'DO801VUF7DJ2KNR9XDL7',
            secretAccessKey: process.env.AWS_S3_SECRET_KEY ? process.env.AWS_S3_SECRET_KEY : 'go8daNmwLELyJDVmsz9sD3eg/YgjW1d/CQz5pD3nHLI',
        },
        endpoint: process.env.AWS_S3_BUCKET_URL ? process.env.AWS_S3_BUCKET_URL : `https://sdhub.blr1.digitaloceanspaces.com`,
        forcePathStyle: false,
    });

    const params = {
        Key: fileName
    };

    try {
        console.log("S3 Client initialized, generating signed URL...");
        console.log("Params:", params);
        const command = new PutObjectCommand(params);
        const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes
        return url;
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw new Error("Could not generate signed URL");
    }
}

export async function uploadImageToS3(fileName, file) {

    const s3 = new S3Client({
        region: process.env.AWS_S3_REGION ? process.env.AWS_S3_REGION : 'blr1',
        credentials: {
            accessKeyId: process.env.AWS_S3_ACCESS_KEY ? process.env.AWS_S3_ACCESS_KEY : 'DO801VUF7DJ2KNR9XDL7',
            secretAccessKey: process.env.AWS_S3_SECRET_KEY ? process.env.AWS_S3_SECRET_KEY : 'go8daNmwLELyJDVmsz9sD3eg/YgjW1d/CQz5pD3nHLI',
        },
        endpoint: process.env.AWS_S3_BUCKET_URL ? process.env.AWS_S3_BUCKET_URL : `https://sdhub.blr1.digitaloceanspaces.com`,
        forcePathStyle: false,
    });

    const params = {
        Key: fileName, // Unique key for the object
        Body: await file.arrayBuffer(), // Convert File to ArrayBuffer
        ContentType: file.type,
    };

    const command = new PutObjectCommand(params);

    try {
        await s3.send(command);
        console.log("Image uploaded successfully!");
        return { success: true };
    } catch (error) {
        console.error("Error uploading image:", error);
        return { success: false, error: "Failed to upload image" };
    }
}

export async function uploadMultipleFilesToS3(files) {
    const uploadPromises = files.map(async (file) => {
        const fileName = file.name;
        const result = await uploadImageToS3(fileName, file);
        return { fileName, ...result };
    });

    const results = await Promise.all(uploadPromises);
    return results;
}

export async function getSignedUrlGetFunction(fileName) {
    console.log("Generating signed URL for", fileName);
    const s3 = new S3Client({
        region: process.env.AWS_S3_REGION ? process.env.AWS_S3_REGION : 'blr1',
        credentials: {
            accessKeyId: process.env.AWS_S3_ACCESS_KEY ? process.env.AWS_S3_ACCESS_KEY : 'DO801VUF7DJ2KNR9XDL7',
            secretAccessKey: process.env.AWS_S3_SECRET_KEY ? process.env.AWS_S3_SECRET_KEY : 'go8daNmwLELyJDVmsz9sD3eg/YgjW1d/CQz5pD3nHLI',
        },
        endpoint: process.env.AWS_S3_BUCKET_URL ? process.env.AWS_S3_BUCKET_URL : `https://sdhub.blr1.digitaloceanspaces.com`,
        forcePathStyle: false,
    });
    const params = {
        Key: fileName
    };
    try {
        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes
        return url;
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw new Error("Could not generate signed URL");
    }
}