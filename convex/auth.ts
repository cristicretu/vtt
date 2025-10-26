import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";
import { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET } from "./env";
import { ResendOTP } from "./otp/ResendOTP";

export const { auth, signIn, signOut, store } = convexAuth({
	providers: [
		ResendOTP,
		GitHub({
			authorization: {
				params: { scope: "user:email" },
			},
		}),
		Google({
			clientId: AUTH_GOOGLE_ID,
			clientSecret: AUTH_GOOGLE_SECRET,
			authorization: {
				params: {
					prompt: "consent",
					access_type: "offline",
					response_type: "code",
				},
			},
		}),
	],
});
