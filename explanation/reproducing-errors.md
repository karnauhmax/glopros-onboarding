# Reproducing the errors

Every failure in the app is reachable from the UI with `pnpm dev`. There is no backend and no
network, so the triggers are hardcoded in the mocked service. They all live in one place,
`MOCK_TRIGGERS` in `src/features/onboarding/api/onboarding-service.ts`, and the tests read the same
constant.

Both API calls wait 700 ms before answering, which is long enough to watch the button and the upload
box go into their pending state.

## Step 1, sign up

**A field error.** Register with `taken@example.com`. The mock answers
`{ status: 'error', fieldErrors: { email: ... } }` and the message "This email is already registered"
lands under the e-mail field. The submit button stays disabled until you change that field, the same
as with a client-side error.

**A technical error.** Register with `outage@example.com`. The mock throws, so there is no field to
blame. A banner appears above the button, "Service is temporarily unavailable. Please try again.",
and the button itself is the retry. Change the address to anything else and submit again, and it
goes through.

Any other e-mail registers and issues a new `userId`.

## Step 2, CV upload

**A rejected upload.** Pick or drop a file whose name contains `fail` in any case, say
`fail-cv.pdf`. The request comes back with `status: 'error'` and the box turns into the error card
with "Upload failed. Please try again.". "Replace" is the only way out, and it is also the only one
that survives a reload.

Worth knowing: choosing a file clears the stored result before the request starts, so a failed
replace loses the CV that was already on file. That is deliberate, and
[reasoning.md](./reasoning.md) explains why.

**A rejected file, without a request.** `validateCvFile` runs first and three cases never reach the
mock: a name that does not end in `.pdf`, `.doc` or `.docx` ("Use a PDF, DOC or DOCX file."), a
0-byte file ("This file is empty."), and anything over 10 MB ("This file is larger than 10 MB."). The
last two need a file you make yourself:

```bash
touch empty.pdf
mkfile 11m big.pdf     # or: dd if=/dev/zero of=big.pdf bs=1m count=11
```

Dropping the file works the same as picking it. Since `accept` does not apply to a dropped file, a
`.txt` is the quickest way to see the format message.

Any other file uploads and gets a `fileId`.

## Validation errors

Client-side messages appear on blur and then update on every keystroke. The button is disabled while
the form is invalid, so there is no submit attempt that reveals them all at once. The phone field is
the interesting one: type a number that is too short for the selected country, blur, then switch the
country in the select and the field re-validates immediately.
