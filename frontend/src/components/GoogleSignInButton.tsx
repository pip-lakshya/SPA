import { GoogleLogin } from "@react-oauth/google"
import type { Dispatch, SetStateAction } from "react"
import type { Page } from "../app/App"
import { GOOGLE_CLIENT_ID } from "../config/env"
import { completeGoogleSignIn } from "../lib/completeGoogleSignIn"

/** Inner content width for `w-96` card minus `p-10` horizontal padding (~384 − 80). */
const GOOGLE_BTN_WIDTH_PX = 304

type Props = {
  setPage: Dispatch<SetStateAction<Page>>
}

export default function GoogleSignInButton({ setPage }: Props) {
  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="mt-4 text-center text-xs text-amber-800">
        Google sign-in needs <code className="rounded bg-amber-100 px-1">VITE_GOOGLE_CLIENT_ID</code> in{" "}
        <code className="rounded bg-amber-100 px-1">frontend/.env</code>. In Google Cloud Console, add this
        site under <strong>Authorized JavaScript origins</strong> (e.g.{" "}
        <code className="rounded bg-amber-100 px-1">http://localhost:5173</code>).
      </p>
    )
  }

  return (
    <div className="mt-4 flex w-full justify-center">
      <div
        className="overflow-hidden rounded-lg leading-none"
        style={{ width: GOOGLE_BTN_WIDTH_PX, maxWidth: "100%" }}
      >
        <GoogleLogin
          onSuccess={(res) => {
            if (res.credential) {
              void completeGoogleSignIn(res.credential, setPage)
            }
          }}
          onError={() => alert("Google sign-in failed")}
          useOneTap={false}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          width={GOOGLE_BTN_WIDTH_PX}
        />
      </div>
    </div>
  )
}
