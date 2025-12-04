import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File size exceeds 100MB limit' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY not configured');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({ apiKey });

        // Convert File to Buffer for upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create a temporary file path for upload
        const mimeType = file.type || 'application/octet-stream';

        // Upload file to Gemini
        let uploadedFile = await ai.files.upload({
            file: new Blob([buffer], { type: mimeType }),
            config: { mimeType },
        });

        // Poll for video files until ACTIVE
        const isVideo = mimeType.startsWith('video/');
        if (isVideo && uploadedFile.state) {
            let attempts = 0;
            const maxAttempts = 60; // 5 minutes max wait

            while (uploadedFile.state && uploadedFile.state.toString() !== 'ACTIVE' && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                uploadedFile = await ai.files.get({ name: uploadedFile.name! });
                attempts++;
            }

            if (uploadedFile.state?.toString() !== 'ACTIVE') {
                return NextResponse.json(
                    { error: 'Video processing timed out' },
                    { status: 408 }
                );
            }
        }

        return NextResponse.json({
            uri: uploadedFile.uri,
            mime_type: mimeType,
            name: uploadedFile.name,
        });
    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
