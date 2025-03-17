import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { MiniAppWalletAuthSuccessPayload, verifySiweMessage } from '@worldcoin/minikit-js'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'

interface IRequestPayload {
	payload: MiniAppWalletAuthSuccessPayload
	nonce: string
}
// Mock implementation - replace with actual DB call
async function findOrCreateUser(walletAddress: string) {
	console.log(`Finding or creating user with wallet: ${walletAddress}`);

	return {
		id: crypto.randomUUID(),
		walletAddress,
		username: null,
		profilePictureUrl: null,
		isNewUser: true
	};
}

export const POST = async (req: NextRequest) => {
	const { payload, nonce } = (await req.json()) as IRequestPayload
	const cookieStore = await cookies()
	const siwe = cookieStore.get('siwe')

	if (nonce != siwe?.value) {
		return NextResponse.json({
			status: 'error',
			isValid: false,
		})
	}

	try {
		const validMessage = await verifySiweMessage(payload, nonce)

		if (!validMessage.isValid) {
			return NextResponse.json({
				status: 'error',
				isValid: false,
			})
		}

		const walletAddress = payload.address;
		const user = await findOrCreateUser(walletAddress);

		const token = await new SignJWT({
			userId: user.id,
			walletAddress
		})
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setExpirationTime('7d')
			.setJti(nanoid())
			.sign(new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_replace_in_production'));

		cookieStore.set('auth_token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: '/',
		});

		return NextResponse.json({
			status: 'success',
			isValid: true,
			user: {
				id: user.id,
				walletAddress: user.walletAddress,
				username: user.username,
				profilePictureUrl: user.profilePictureUrl,
				isNewUser: user.isNewUser
			}
		})
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		// Handle errors in validation or processing
		return NextResponse.json({
			status: 'error',
			isValid: false,
			message: error.message,
		})
	}
}
